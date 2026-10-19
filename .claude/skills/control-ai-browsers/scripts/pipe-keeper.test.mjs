// @ts-check
// Run: node --test .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { splitMessages } from './pipe-keeper.mjs';

test('splitMessages returns whole NUL-terminated messages and keeps a partial one', () => {
  assert.deepEqual(splitMessages('{"id":1}\0{"id":2}\0{"id"'), { messages: ['{"id":1}', '{"id":2}'], rest: '{"id"' });
  assert.deepEqual(splitMessages('{"id":3}'), { messages: [], rest: '{"id":3}' });
  assert.deepEqual(splitMessages('{"a":1}\0\0'), { messages: ['{"a":1}'], rest: '' });
});
