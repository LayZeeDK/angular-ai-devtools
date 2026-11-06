import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchDirectWrites } from '../../src/main-world/stale-view-scan.ts';

test('matches this.field = with arbitrary whitespace and newlines', () => {
  const src = 'subscribe(() => {\n  this . foo\n    =\n  1;\n})';
  assert.deepEqual(matchDirectWrites(src), ['foo']);
});

test('matches .set( and .update( forms', () => {
  const src =
    'subscribe(() => { this.a.set(1); this.b . update ( x => x + 1 ); })';
  assert.deepEqual(matchDirectWrites(src), ['a', 'b']);
});

test('identifier is whole, never substring', () => {
  const src = 'subscribe(() => { this.foobar = 1; this.foo = 2; })';
  assert.deepEqual(matchDirectWrites(src), ['foobar', 'foo']);
});
