/**
 * The envelope pin — E3 (M018, T006).
 *
 * SC2 says two tools are added in two separate commits without touching the envelope, "proving the
 * declaration record is the only extension point". A claim like that decays into a reviewer's
 * impression unless something measures it, so this file records the SHA-256 of the registry core
 * (`apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts`) and fails when those bytes
 * change. The second added tool's commit must leave this pin green.
 *
 * Three properties this check is built to keep:
 *
 * 1. **It is falsifiable.** A pin that only ever compares a hard-coded constant with itself proves
 *    nothing, so the test copies the module to `os.tmpdir()`, flips exactly one byte of the copy and
 *    asserts the same comparison fails for it. An untouched copy of the same bytes passes, so the
 *    failure is the edit and not the path.
 * 2. **It names what failed.** The failure message carries the module path (absolute, plus the
 *    repo-relative form when it is inside the checkout), the expected hash and the actual hash, and
 *    it says what the fix is not: an edit to the registry core is allowed only in a plan that says
 *    so, and never in a commit that adds a tool.
 * 3. **It writes nothing into the checkout.** The repository root is resolved from `import.meta.url`
 *    (never a host-absolute path), the module is read as bytes, and every fixture lives under
 *    `os.tmpdir()` and is removed in a `finally`.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The repository root, resolved from this file — never a host-absolute path. */
export const REPO_ROOT = resolve(here, '..');

/** The envelope's own module, relative to a root. */
const ENVELOPE_MODULE_RELATIVE = [
  'apps',
  'angular-ai-devtools',
  'src',
  'app',
  'tool-registry',
  'tool-registry.ts',
];

/**
 * The pinned SHA-256 of the registry core.
 *
 * Recorded when `panel_environment` was added (T006) — the first of the two tools that prove the
 * declaration record is the only extension point. The second addition must leave these bytes
 * identical; only a plan that explicitly authorises an edit to the registry core may change this
 * constant, and such a plan changes it alongside that edit.
 */
export const PINNED_ENVELOPE_SHA256 =
  'ce1404bfecf0a7a6a620009207187294a14ef8fbe0c05a82643c1cc9bfb214d0';

// Deliberate edit, recorded as the pin requires: `tool-registry.ts` carried its own
// private copy of `isRecord`, byte-identical to the one in nine other modules. The copy
// was removed and the predicate imported from `record-guard.ts`. No tool was added, no
// declaration changed, and the guard's body is unchanged — this is a de-duplication of a
// helper the envelope happened to contain, not an edit to the envelope's behaviour.

/** The pinned module's path under `root`. */
export function envelopeModulePath(root = REPO_ROOT) {
  return join(root, ...ENVELOPE_MODULE_RELATIVE);
}

/** The SHA-256 of a byte buffer, as lowercase hex. */
export function sha256Of(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * One comparison, as a function of a path — so the real module, an untouched copy in `os.tmpdir()`
 * and a one-byte-changed copy all run the identical check.
 */
export function checkEnvelopePin(
  modulePath,
  expected = PINNED_ENVELOPE_SHA256,
) {
  const exists = existsSync(modulePath);
  const actual = exists ? sha256Of(readFileSync(modulePath)) : null;
  return {
    modulePath,
    exists,
    expected,
    actual,
    ok: exists && actual === expected,
  };
}

/** A path a human can act on: the absolute path, plus the repo-relative form when it has one. */
function pathLabel(modulePath) {
  const relativePath = relative(REPO_ROOT, modulePath).split(sep).join('/');
  const insideRepo =
    relativePath.length > 0 &&
    !relativePath.startsWith('..') &&
    !isAbsolute(relativePath);
  return insideRepo
    ? `${modulePath} (repo-relative: ${relativePath})`
    : modulePath;
}

/**
 * The failure message. It names the module, both hashes, and what the fix is *not*, because a bare
 * "hash mismatch" invites the reader to update the constant in whatever commit is at hand.
 */
export function describePinFailure(result) {
  return [
    `registry-envelope-pin: ${pathLabel(result.modulePath)} changed.`,
    `  expected sha256: ${result.expected}`,
    `  actual   sha256: ${result.actual ?? '<missing: the file is not there>'}`,
    '  The registry core is the envelope. A tool is added by declaring it in its own module and registering it with provideTools — never by editing this file (INTENT N6).',
    '  What the fix is not: an edit to the registry core is allowed only in a plan that says so, and never in a commit that adds a tool.',
    '  If a plan does authorise an edit to the registry core, that plan updates PINNED_ENVELOPE_SHA256 in scripts/registry-envelope-pin.test.mjs alongside the edit, and says why.',
  ].join('\n');
}

test('E3 the registry core hash is pinned and any edit to it fails the pin', () => {
  assert.match(
    PINNED_ENVELOPE_SHA256,
    /^[0-9a-f]{64}$/,
    'the pinned constant must be a lowercase SHA-256 digest',
  );

  const modulePath = envelopeModulePath(REPO_ROOT);
  const pinned = checkEnvelopePin(modulePath);
  assert.ok(
    pinned.exists,
    `${modulePath} must exist for this pin to mean anything; a missing module is not a pass`,
  );
  console.log(`registry-envelope-pin: ${pathLabel(modulePath)}`);
  console.log(`registry-envelope-pin: pinned sha256 ${PINNED_ENVELOPE_SHA256}`);
  console.log(`registry-envelope-pin: actual sha256 ${pinned.actual}`);
  assert.ok(pinned.ok, describePinFailure(pinned));

  const temporary = mkdtempSync(join(tmpdir(), 'registry-envelope-pin-'));
  try {
    const original = readFileSync(modulePath);

    // The green side: the same bytes at a different path still satisfy the pin, so a failure below
    // is the byte that moved and not the place the file was copied to.
    const untouchedCopy = join(temporary, 'tool-registry.ts');
    writeFileSync(untouchedCopy, original);
    const copyPin = checkEnvelopePin(untouchedCopy);
    assert.ok(
      copyPin.ok,
      `an untouched copy must satisfy the pin:\n${describePinFailure(copyPin)}`,
    );

    // The red side: exactly one byte changes, and the same comparison must report it.
    const mutated = Buffer.from(original);
    const offset = mutated.indexOf(
      Buffer.from('angular-ai-devtools:tool-registry'),
    );
    assert.ok(
      offset >= 0,
      'the fixture must change a byte of the module it copied',
    );
    mutated[offset] = mutated[offset] ^ 0x01;
    assert.notEqual(
      mutated[offset],
      original[offset],
      'the mutation must change the byte',
    );
    assert.equal(
      mutated.length,
      original.length,
      'the mutation must not add or remove bytes',
    );
    assert.notEqual(
      sha256Of(mutated),
      PINNED_ENVELOPE_SHA256,
      'one changed byte must change the hash',
    );

    const mutatedCopy = join(temporary, 'tool-registry.mutated.ts');
    writeFileSync(mutatedCopy, mutated);
    const mutatedPin = checkEnvelopePin(mutatedCopy);
    assert.equal(
      mutatedPin.ok,
      false,
      'a one-byte edit to the registry core must fail the pin',
    );
    assert.equal(mutatedPin.actual, sha256Of(mutated));

    const message = describePinFailure(mutatedPin);
    assert.ok(
      message.includes(mutatedCopy),
      'the failure must name the module that changed',
    );
    assert.ok(
      message.includes(PINNED_ENVELOPE_SHA256),
      'the failure must name the expected hash',
    );
    assert.ok(
      message.includes(mutatedPin.actual),
      'the failure must name the actual hash',
    );
    assert.match(
      message,
      /never in a commit that adds a tool/,
      'the failure must say what the fix is not',
    );

    // The checkout was only read: after the mutation run the real module is still pinned, and its
    // bytes are the ones read before the fixture was built.
    assert.ok(
      checkEnvelopePin(modulePath).ok,
      'the pin must not write into the checkout',
    );
    assert.deepEqual(readFileSync(modulePath), original);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
