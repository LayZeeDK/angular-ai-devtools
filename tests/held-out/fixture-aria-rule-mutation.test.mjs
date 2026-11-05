// Held-out proof for SC2 / E4 and E5's rule clause: every Aria rule must redden for a targeted change to
// the rendered fixture surface, and the order rule must redden when the listbox renders its options
// back to front while its sibling rules stay green.
//
// The one change each case applies, named so the Log can quote it:
//   - removing one rule's attribute from the parsed tag (E4's mutant, one per attribute-reading rule)
//   - `aria-controls="components-listbox"` on the `ngMenuTrigger` in
//     `spikes/ng222-app/src/app/components/aria-surfaces.ts` — the listbox's id where the menu's panel id
//     belongs, so the trigger names an element that exists but is not the element it controls
//   - `@for (item of [...listboxItems].reverse(); track item)` in the same file — applied here in memory,
//     to the real template text, against the scope the component binds (E5's rendered-order mutant)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  ariaRules,
  buildSurface,
  evaluateAll,
  readTemplate,
  reverseIteration,
} from './aria-rules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const surfacePath = join(
  root,
  'spikes',
  'ng222-app',
  'src',
  'app',
  'components',
  'aria-surfaces.ts',
);
const itemsPath = join(
  root,
  'spikes',
  'ng222-app',
  'src',
  'app',
  'components',
  'aria-items.ts',
);

const SUITE = 'fixture-aria-rule-mutation.test.mjs';
const SURFACE_FILE = 'spikes/ng222-app/src/app/components/aria-surfaces.ts';
const ITEMS_FILE = 'spikes/ng222-app/src/app/components/aria-items.ts';
const ORDER_RULE = 'listbox-option-order';
const CONTROLS_RULE = 'menu-trigger-controls';
const LISTBOX_MUTANT = '@for (item of [...listboxItems].reverse(); track item)';
const CONTROLS_MUTANT =
  'aria-controls="components-listbox" on the ngMenuTrigger';

function readFixture() {
  return {
    surfaceSrc: readFileSync(surfacePath, 'utf8'),
    itemsSrc: readFileSync(itemsPath, 'utf8'),
    surfaceFile: SURFACE_FILE,
    itemsFile: ITEMS_FILE,
  };
}

/** Every rule's verdict against one rendering of the fixture surface. */
function verdictsFor(fixture) {
  return evaluateAll(buildSurface(fixture));
}

test('all aria rules pass on the fixture surface', () => {
  const verdicts = verdictsFor(readFixture());
  for (const verdict of verdicts) {
    assert.equal(
      verdict.pass,
      true,
      `${SUITE}: ${verdict.id} should pass on ${SURFACE_FILE}: ${verdict.detail}`,
    );
  }
});

test('removing one rule attribute reddens only that rule', () => {
  const fixture = readFixture();
  // The order rule reads the rendered tree and names no attribute, so there is nothing to remove for it.
  const rulesWithAttribute = ariaRules.filter(
    (rule) => typeof rule.attribute === 'string',
  );
  assert.ok(
    rulesWithAttribute.length > 0,
    `${SUITE}: aria-rules.mjs declares no rule with a removable attribute, so "removing one rule attribute reddens only that rule" has no subject in ${SURFACE_FILE}`,
  );

  for (const rule of rulesWithAttribute) {
    const attr = rule.attribute;
    const needle = rule.surface === 'listbox' ? 'ngListbox' : 'ngMenuTrigger';
    // locate the start tag containing the surface marker and remove the attribute there
    const tagRe = new RegExp(`<[^>]*${needle}[^>]*>`);
    const tagMatch = fixture.surfaceSrc.match(tagRe);
    assert.ok(
      tagMatch,
      `${SUITE}: ${SURFACE_FILE} has no tag carrying ${needle}, so ${rule.id} has no attribute to remove`,
    );
    const originalTag = tagMatch[0];
    const attrRe = new RegExp(`\\s${attr}="[^"]*"`);
    const mutatedTag = originalTag.replace(attrRe, '');
    assert.notEqual(
      mutatedTag,
      originalTag,
      `${SUITE}: mutant (removing ${attr} from ${needle} in ${SURFACE_FILE}) did not change the tag, so ${rule.id} was never exercised`,
    );
    const mutatedSrc = fixture.surfaceSrc.replace(
      originalTag,
      () => mutatedTag,
    );
    const verdicts = verdictsFor({ ...fixture, surfaceSrc: mutatedSrc });
    const target = verdicts.find((v) => v.id === rule.id);
    assert.ok(
      target,
      `${SUITE}: aria-rules.mjs no longer declares ${rule.id}, which ${SURFACE_FILE} is mutated for`,
    );
    assert.equal(
      target.pass,
      false,
      `${SUITE}: mutant (removing ${attr} from ${needle} in ${SURFACE_FILE}) — ${rule.id} should redden: ${target.detail}`,
    );
    for (const v of verdicts) {
      if (v.id !== rule.id) {
        assert.equal(
          v.pass,
          true,
          `${SUITE}: mutant (removing ${attr} for ${rule.id} in ${SURFACE_FILE}) should redden only ${rule.id}, but ${v.id} also failed: ${v.detail}`,
        );
      }
    }
  }
});

test('reversing the rendered listbox order reddens only the order rule', () => {
  const fixture = readFixture();

  // Control: the mutant below only means something against a surface the order rule accepts as rendered.
  const control = verdictsFor(fixture).find((v) => v.id === ORDER_RULE);
  assert.ok(
    control,
    `${SUITE}: aria-rules.mjs declares no ${ORDER_RULE} rule, so nothing reads the rendered option order of ${SURFACE_FILE}`,
  );
  assert.equal(
    control.pass,
    true,
    `${SUITE}: ${ORDER_RULE} already fails on the unmutated ${SURFACE_FILE} (${control.detail}), so this suite cannot tell the ` +
      `order mutant from the fixture as it stands`,
  );

  const template = readTemplate(fixture.surfaceSrc, SURFACE_FILE);
  const marker = template.indexOf('id="components-listbox"');
  assert.notEqual(
    marker,
    -1,
    `${SUITE}: ${SURFACE_FILE} no longer marks its listbox with id="components-listbox", so ${ORDER_RULE}'s mutant cannot be applied`,
  );
  const at = template.indexOf('@for (', marker);
  assert.notEqual(
    at,
    -1,
    `${SUITE}: the listbox in ${SURFACE_FILE} iterates nothing, so ${ORDER_RULE} has no rendered order to judge`,
  );

  // Apply the review mutant to the real template text in memory: reverse the listbox's iteration.
  const {
    expression,
    reversedExpression,
    template: reversedTemplate,
  } = reverseIteration(template, at);
  assert.notEqual(
    reversedTemplate,
    template,
    `${SUITE}: mutant (${LISTBOX_MUTANT} in ${SURFACE_FILE}) left the template unchanged`,
  );
  const mutatedSrc = fixture.surfaceSrc.replace(
    template,
    () => reversedTemplate,
  );
  assert.notEqual(
    mutatedSrc,
    fixture.surfaceSrc,
    `${SUITE}: mutant (${LISTBOX_MUTANT} in ${SURFACE_FILE}) was not applied to the component source`,
  );

  const verdicts = verdictsFor({ ...fixture, surfaceSrc: mutatedSrc });
  const target = verdicts.find((v) => v.id === ORDER_RULE);
  assert.ok(
    target,
    `${SUITE}: aria-rules.mjs declares no ${ORDER_RULE} rule, so nothing reads the rendered option order of ${SURFACE_FILE}`,
  );
  assert.equal(
    target.pass,
    false,
    `${SUITE}: mutant (${LISTBOX_MUTANT} in ${SURFACE_FILE}, i.e. "${expression}" wrapped as "${reversedExpression}") — ` +
      `${ORDER_RULE} should redden when the listbox renders its options reversed, but it passed: ${target.detail}`,
  );
  for (const v of verdicts) {
    if (v.id === ORDER_RULE) continue;
    assert.equal(
      v.pass,
      true,
      `${SUITE}: mutant (${LISTBOX_MUTANT} in ${SURFACE_FILE}) should redden only ${ORDER_RULE}, but ${v.id} also failed: ${v.detail}`,
    );
  }
});

test('a wrong accessible name reddens the accessible-name rule', () => {
  const fixture = readFixture();
  for (const id of [
    'listbox-accessible-name',
    'menu-trigger-accessible-name',
  ]) {
    const rule = ariaRules.find((r) => r.id === id);
    assert.ok(rule, `${SUITE}: aria-rules.mjs no longer declares ${id}`);
    const needle = rule.surface === 'listbox' ? 'ngListbox' : 'ngMenuTrigger';
    const tagRe = new RegExp(`<[^>]*${needle}[^>]*>`);
    const tagMatch = fixture.surfaceSrc.match(tagRe);
    assert.ok(
      tagMatch,
      `${SUITE}: ${SURFACE_FILE} has no tag carrying ${needle}, so ${id} has no accessible name to check`,
    );
    const originalTag = tagMatch[0];
    const mutatedTag = originalTag.replace(
      /aria-label="[^"]*"/,
      'aria-label="Wrong name"',
    );
    assert.notEqual(
      mutatedTag,
      originalTag,
      `${SUITE}: mutant (aria-label="Wrong name" in ${SURFACE_FILE}) did not change the tag for ${id}`,
    );
    const mutatedSrc = fixture.surfaceSrc.replace(
      originalTag,
      () => mutatedTag,
    );
    const verdict = rule.evaluate(
      buildSurface({ ...fixture, surfaceSrc: mutatedSrc }),
    );
    assert.equal(
      verdict.pass,
      false,
      `${SUITE}: mutant (aria-label="Wrong name" in ${SURFACE_FILE}) — ${id} should fail on a wrong accessible name: ${verdict.detail}`,
    );
  }
});

test('pointing the trigger at the listbox reddens the controls rule', () => {
  const fixture = readFixture();

  // Control: the mutant below only means something against a trigger whose controls the rule accepts.
  const control = verdictsFor(fixture).find((v) => v.id === CONTROLS_RULE);
  assert.ok(
    control,
    `${SUITE}: aria-rules.mjs declares no ${CONTROLS_RULE} rule, so nothing reads the ngMenuTrigger's aria-controls in ${SURFACE_FILE}`,
  );
  assert.equal(
    control.pass,
    true,
    `${SUITE}: ${CONTROLS_RULE} already fails on the unmutated ${SURFACE_FILE} (${control.detail}), so this suite cannot tell the ` +
      `mutant (${CONTROLS_MUTANT}) from the fixture as it stands`,
  );

  // The id the mutant points at must exist elsewhere in the same file, or "it exists" would be all the mutant shows.
  assert.match(
    fixture.surfaceSrc,
    /id="components-listbox"/,
    `${SUITE}: ${SURFACE_FILE} no longer gives its listbox id="components-listbox", so the mutant (${CONTROLS_MUTANT}) proves nothing`,
  );

  const triggerTag = fixture.surfaceSrc.match(/<[^>]*ngMenuTrigger[^>]*>/);
  assert.ok(
    triggerTag,
    `${SUITE}: ${SURFACE_FILE} has no tag carrying ngMenuTrigger, so the mutant (${CONTROLS_MUTANT}) has nothing to retarget`,
  );
  const originalTag = triggerTag[0];
  const mutatedTag = originalTag.replace(
    /aria-controls="[^"]*"/,
    'aria-controls="components-listbox"',
  );
  assert.notEqual(
    mutatedTag,
    originalTag,
    `${SUITE}: mutant (${CONTROLS_MUTANT} in ${SURFACE_FILE}) did not change the trigger tag, so ${CONTROLS_RULE} was never exercised`,
  );
  const mutatedSrc = fixture.surfaceSrc.replace(originalTag, () => mutatedTag);
  assert.notEqual(
    mutatedSrc,
    fixture.surfaceSrc,
    `${SUITE}: mutant (${CONTROLS_MUTANT} in ${SURFACE_FILE}) was not applied to the component source`,
  );

  const verdicts = verdictsFor({ ...fixture, surfaceSrc: mutatedSrc });
  const target = verdicts.find((v) => v.id === CONTROLS_RULE);
  assert.ok(
    target,
    `${SUITE}: aria-rules.mjs no longer declares ${CONTROLS_RULE}, which ${SURFACE_FILE} is mutated for`,
  );
  assert.equal(
    target.pass,
    false,
    `${SUITE}: mutant (${CONTROLS_MUTANT} in ${SURFACE_FILE}) — ${CONTROLS_RULE} should redden when the trigger's aria-controls ` +
      `names the listbox instead of the menu it controls, but it passed: ${target.detail}`,
  );

  // The verdict has to name the id it resolved and the id it should have resolved, read from the surface itself.
  const panelTag = fixture.surfaceSrc.match(/<[^>]*\sngMenu(?=[\s#>])[^>]*>/);
  assert.ok(
    panelTag,
    `${SUITE}: ${SURFACE_FILE} has no tag carrying ngMenu, so the element the mutant (${CONTROLS_MUTANT}) should have named cannot be read`,
  );
  const expectedId = panelTag[0].match(/\sid="([^"]+)"/)?.[1];
  assert.ok(
    expectedId,
    `${SUITE}: the ngMenu tag in ${SURFACE_FILE} carries no id="...", so the id the mutant (${CONTROLS_MUTANT}) should have resolved to is unknown`,
  );
  for (const id of ['components-listbox', expectedId]) {
    assert.ok(
      target.detail.includes(id),
      `${SUITE}: mutant (${CONTROLS_MUTANT} in ${SURFACE_FILE}) — ${CONTROLS_RULE}'s failure must name ${id}, but its detail was: ${target.detail}`,
    );
  }

  for (const v of verdicts) {
    if (v.id === CONTROLS_RULE) continue;
    assert.equal(
      v.pass,
      true,
      `${SUITE}: mutant (${CONTROLS_MUTANT} in ${SURFACE_FILE}) should redden only ${CONTROLS_RULE}, but ${v.id} also failed: ${v.detail}`,
    );
  }

  // Restoring the trigger: the unmutated fixture is green on every rule again.
  for (const v of verdictsFor(readFixture())) {
    assert.equal(
      v.pass,
      true,
      `${SUITE}: after restoring the ngMenuTrigger's aria-controls in ${SURFACE_FILE}, ${v.id} should pass again: ${v.detail}`,
    );
  }
});
