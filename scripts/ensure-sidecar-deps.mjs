import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { bridge } from './sidecar-deps-bridge.mjs';

const cwd = process.cwd();

if (existsSync(join(cwd, 'node_modules'))) {
  process.exit(0);
}

let commonDir;

try {
  commonDir = execFileSync('git', ['rev-parse', '--git-common-dir'], {
    cwd,
    encoding: 'utf8',
  }).trim();
} catch {
  process.exit(0);
}

const gitDir = resolve(cwd, commonDir);
const primary = dirname(gitDir);

if (
  !existsSync(join(primary, 'package.json')) ||
  !existsSync(join(primary, 'node_modules'))
) {
  process.exit(0);
}

bridge(cwd, primary);

const FIXTURE = ['spikes', 'ng222-app'];
const fixturePrimary = join(primary, ...FIXTURE);
const fixtureSidecar = join(cwd, ...FIXTURE);

if (
  existsSync(join(fixturePrimary, 'package.json')) &&
  existsSync(join(fixturePrimary, 'node_modules')) &&
  !existsSync(join(fixtureSidecar, 'node_modules'))
) {
  mkdirSync(fixtureSidecar, { recursive: true });
  // A copy, not a bridge: the fixture's own resolution is what several suites measure, and a
  // junction would make every path below it resolve into the primary checkout instead.
  cpSync(
    join(fixturePrimary, 'node_modules'),
    join(fixtureSidecar, 'node_modules'),
    {
      recursive: true,
      dereference: false,
    },
  );

  // cpSync preserves a symlink but rewrites its target to an absolute path, which breaks the fixture's
  // relative link into packages/. Recreate every copied link from the source's own target string: the
  // relative target is part of what the fixture's suites measure.
  const sourceInstall = join(fixturePrimary, 'node_modules');
  const copiedInstall = join(fixtureSidecar, 'node_modules');

  for (const entry of readdirSync(sourceInstall)) {
    const sourcePath = join(sourceInstall, entry);

    if (!lstatSync(sourcePath).isSymbolicLink()) {
      continue;
    }

    const target = readlinkSync(sourcePath);
    const copiedPath = join(copiedInstall, entry);

    rmSync(copiedPath, { recursive: true, force: true });
    symlinkSync(target, copiedPath, 'dir');
  }
}
