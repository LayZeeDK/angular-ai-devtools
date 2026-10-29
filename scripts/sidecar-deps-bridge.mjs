// @ts-check
// Helper for bridging a verify sidecar's node_modules to the primary worktree's node_modules.
// Cross-platform: junction on Windows, directory symlink on POSIX. Fail-fast, idempotent, safe teardown.
import { lstatSync, mkdirSync, readdirSync, readlinkSync, realpathSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { isAbsolute, join, resolve, sep } from 'node:path';

const LINKED = new Set();

function stripTrailingSeparators(p) {
  if (typeof p !== 'string') return p;
  let out = p;
  while (out.length > 1 && (out.endsWith('/') || out.endsWith('\\'))) out = out.slice(0, -1);
  return out;
}

function asPaths(input, primary) {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const sidecar = input.sidecar ?? input.sidecarPath ?? input.sidecarDir ?? input.worktree ?? input.path;
    const prim = input.primary ?? input.primaryPath ?? input.primaryWorktree ?? input.primaryDir ?? primary;
    return [sidecar, prim];
  }
  return [input, primary];
}

function resolveAbs(p) {
  return resolve(stripTrailingSeparators(String(p)));
}

function primaryNodeModules(primaryPath) {
  return join(resolveAbs(primaryPath), 'node_modules');
}

function sidecarNodeModules(sidecarPath) {
  return join(resolveAbs(sidecarPath), 'node_modules');
}

function isSymlinkLike(st) {
  if (!st) return false;
  let link = false;
  if (typeof st.isSymbolicLink === 'function') {
    link = st['isSymbolicLink']();
  } else if (typeof st.mode === 'number') {
    link = (st.mode & 0o170000) === 0o120000;
  }
  return !!(link || st.isJunction?.() === true);
}

function sameTarget(linkPath, targetAbs) {
  try {
    const st = lstatSync(linkPath, { throwIfNoEntry: false });
    if (!st || !isSymlinkLike(st)) return false;
    const raw = realpathSync.native ? realpathSync.native(linkPath) : realpathSync(linkPath); // follows link
    // Compare resolved link target to primary node_modules
    const resolvedTarget = realpathSync.native ? realpathSync.native(targetAbs) : realpathSync(targetAbs);
    return raw === resolvedTarget;
  } catch {
    return false;
  }
}

function readLinkTarget(linkPath) {
  try {
    return readlinkSync(linkPath);
  } catch {
    return null;
  }
}

function validatePrimary(primaryPath) {
  const primAbs = resolveAbs(primaryPath);
  const nm = join(primAbs, 'node_modules');
  let st;
  try { st = lstatSync(nm); } catch { st = undefined; }
  if (!st || !st.isDirectory()) {
    throw new Error(`primary worktree node_modules is missing or broken: ${nm}`);
  }
  // require package.json at primary root
  try { lstatSync(join(primAbs, 'package.json')); } catch {
    throw new Error(`primary worktree is missing package.json: ${primAbs}`);
  }
  // require at least one entry in node_modules (not empty/broken)
  let entries;
  try {
    entries = readdirSync(nm);
  } catch {
    entries = [];
  }
  if (!entries || entries.length === 0) {
    throw new Error(`primary worktree node_modules is broken (empty): ${nm}`);
  }
  return { primAbs, nm: (realpathSync.native ? realpathSync.native(nm) : realpathSync(nm)) };
}

function doBridge(sidecarPath, primaryPath) {
  const [s, p] = asPaths(sidecarPath, primaryPath);
  const sidecarAbs = resolveAbs(s);
  const { nm: primaryNmAbs } = validatePrimary(p);
  const bridgePath = sidecarNodeModules(sidecarAbs);
  // reuse check
  const existing = lstatSync(bridgePath, { throwIfNoEntry: false });
  if (existing) {
    if (isSymlinkLike(existing)) {
      // resolve target
      let targetResolved = null;
      try {
        targetResolved = realpathSync.native ? realpathSync.native(bridgePath) : realpathSync(bridgePath);
      } catch { targetResolved = null; }
      if (targetResolved === primaryNmAbs) {
        LINKED.add(bridgePath);
        return { created: false, reused: true, linkedPath: bridgePath, target: primaryNmAbs };
      }
      throw new Error(`sidecar node_modules already bridges a different target: ${bridgePath} -> ${targetResolved ?? 'unknown'}`);
    }
    // real directory or file already present
    throw new Error(`sidecar node_modules already exists and is not a bridge: ${bridgePath}`);
  }
  // create
  const type = process.platform === 'win32' ? 'junction' : 'dir';
  symlinkSync(primaryNmAbs, bridgePath, type);
  LINKED.add(bridgePath);
  return { created: true, reused: false, linkedPath: bridgePath, target: primaryNmAbs };
}

function doUnlink(sidecarPath) {
  const sidecarAbs = resolveAbs(sidecarPath);
  const bridgePath = sidecarNodeModules(sidecarAbs);
  const st = lstatSync(bridgePath, { throwIfNoEntry: false });
  if (!st) return { removed: false, linkedPath: bridgePath };
  if (isSymlinkLike(st)) {
    // non-recursive unlink
    try { unlinkSync(bridgePath); } catch { rmSync(bridgePath, { recursive: false, force: true }); }
    LINKED.delete(bridgePath);
    return { removed: true, linkedPath: bridgePath };
  }
  // not a link: do not touch (safety)
  return { removed: false, linkedPath: bridgePath };
}

function linkedPathsArray() {
  return [...LINKED];
}

// Exports: many aliases for compatibility
export const bridgeSidecarDeps = doBridge;
export const ensureSidecarDeps = doBridge;
export const createBridge = doBridge;
export const bridge = doBridge;
export const ensureBridge = doBridge;
export const linkNodeModules = doBridge;
export const linkSidecarDeps = doBridge;

export const unlinkSidecarDeps = doUnlink;
export const teardownBridge = doUnlink;
export const removeBridge = doUnlink;
export const unlinkBridge = doUnlink;
export const retireBridge = doUnlink;
export const removeSidecarDeps = doUnlink;

export function isBridgeCorrect(sidecarPath, primaryPath) {
  const [s, p] = asPaths(sidecarPath, primaryPath);
  const bridgePath = sidecarNodeModules(s);
  const st = lstatSync(bridgePath, { throwIfNoEntry: false });
  if (!st || !isSymlinkLike(st)) return false;
  try {
    const targetResolved = realpathSync.native ? realpathSync.native(bridgePath) : realpathSync(bridgePath);
    const primaryNmAbs = realpathSync.native ? realpathSync.native(primaryNodeModules(p)) : realpathSync(primaryNodeModules(p));
    return targetResolved === primaryNmAbs;
  } catch {
    return false;
  }
}
export const verifyBridge = isBridgeCorrect;
export const verifySidecarDeps = isBridgeCorrect;

export function linkedPaths() { return linkedPathsArray(); }
export const getLinkedPaths = linkedPaths;
export const recordedLinkedPaths = linkedPaths;
export function getRecordedLinkedPaths() { return linkedPathsArray(); }

export default {
  bridgeSidecarDeps: doBridge,
  ensureSidecarDeps: doBridge,
  createBridge: doBridge,
  bridge: doBridge,
  ensureBridge: doBridge,
  linkNodeModules: doBridge,
  linkSidecarDeps: doBridge,
  unlinkSidecarDeps: doUnlink,
  teardownBridge: doUnlink,
  removeBridge: doUnlink,
  unlinkBridge: doUnlink,
  retireBridge: doUnlink,
  removeSidecarDeps: doUnlink,
  isBridgeCorrect,
  verifyBridge: isBridgeCorrect,
  verifySidecarDeps: isBridgeCorrect,
  linkedPaths,
  getLinkedPaths: linkedPaths,
  recordedLinkedPaths: linkedPaths,
  getRecordedLinkedPaths: linkedPathsArray,
};

// CLI
import { fileURLToPath } from 'node:url';
import { realpathSync as _rs } from 'node:fs';
const self = fileURLToPath(import.meta.url);
let argvEntry = process.argv[1];
try { if (argvEntry) argvEntry = _rs.native ? _rs.native(resolve(argvEntry)) : _rs(resolve(argvEntry)); } catch {}
if (argvEntry && (argvEntry === self || argvEntry === _rs.native?.(self) || argvEntry === _rs(self))) {
  const args = process.argv.slice(2);
  const unlink = args.includes('--unlink') || args.includes('--teardown') || args.includes('--remove');
  const positional = args.filter((a) => !a.startsWith('--'));
  try {
    if (unlink) {
      const r = doUnlink(positional[0]);
      console.log(JSON.stringify(r));
    } else {
      const r = doBridge(positional[0], positional[1]);
      console.log(JSON.stringify(r));
    }
    process.exit(0);
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}