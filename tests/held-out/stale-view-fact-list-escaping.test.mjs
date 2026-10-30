import { test } from 'node:test';
import assert from 'node:assert/strict';

function shape(field, component, pattern) {
  if (typeof field !== 'string' || field.trim() === '') return null;
  if (typeof component !== 'string' || component.trim() === '') return null;
  if (pattern !== 'direct write in subscribe callback') return null;
  return { field, component, pattern };
}

test('field name needing escaping stays one plain-text value', () => {
  const tricky = 'a"b\\c<d>e\nf';
  const fl = shape(tricky, 'Comp', 'direct write in subscribe callback');
  assert.ok(fl);
  assert.equal(fl.field, tricky);
  assert.equal(fl.component, 'Comp');
  assert.equal(fl.pattern, 'direct write in subscribe callback');
  assert.deepEqual(Object.keys(fl).sort(), ['component', 'field', 'pattern']);
});

test('missing owning component is named and not shaped', () => {
  assert.equal(shape('x', null, 'direct write in subscribe callback'), null);
});
