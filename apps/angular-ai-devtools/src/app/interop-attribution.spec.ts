import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attributeFieldToNode, INFERRED_UNTESTED } from './interop.service.ts';

test('value collision lists every candidate and keeps inferred wording', () => {
  const nodes = [
    { id: 'n1', value: 42 },
    { id: 'n2', value: 42 },
  ];
  const res = attributeFieldToNode(42, nodes);
  assert.equal(res.wording, 'inferred, untested');
  assert.deepEqual(res.candidates, ['n1', 'n2']);
});

test('single candidate still inferred untested', () => {
  const nodes = [{ id: 'n1', value: 7 }];
  const res = attributeFieldToNode(7, nodes);
  assert.equal(res.wording, 'inferred, untested');
  assert.deepEqual(res.candidates, ['n1']);
});