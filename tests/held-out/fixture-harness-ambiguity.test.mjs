// Held-out proof for SC1 / E2 (HAR-3): the two `app-harness-probe` hosts are identical in every attribute
// the harness matches on, so neither can be told from the other and HAR-3's ambiguity case stays ambiguous.
//
// Prohibition N1 binds here: giving one host an attribute the harness matches on makes the case resolvable,
// and a resolvable fixture passes for the wrong reason.
//
// The M023 final gap review (`final-gap-2.md`, finding 2) proved both halves of the defect this suite
// used to carry. Its `readAttrs` matched only bare `name="value"` literals, so:
//   - a distinguishing *binding* — `[attr.data-slot]="'one'"` on probe-a against `[attr.data-slot]="'two'"`
//     on probe-b — left the suite green, a live prohibition-N1 violation it could not see; and
//   - a *harmless* literal on one host (`aria-label="probe a"`, an attribute the harness does not match on)
//     reddened it, forbidding the fixture work E2 never forbade.
// So the old reader was blind where it had to see and brittle where it had to not care.
//
// This suite parses the hosts with jsdom (the parser its sibling harness suites already use), reads literals
// and bindings alike, and compares only the attributes the declared match set covers — never every
// attribute present.
//
// Mutants this suite must redden for, each seen failing and passing again (see the task Log):
//   - `[attr.data-slot]="'one'"` on probe-a against `[attr.data-slot]="'two'"` on probe-b — a distinguishing
//     binding, the live prohibition-N1 violation the gap review proved this suite could not see;
//   - `data-slot="extra"` on probe-a only — a distinguishing literal;
//   - both hosts given the same `id` — the one attribute the hosts are allowed to differ in;
//   - the reader reverted to literals only, and the declared match set widened to cover `id`;
//   - the `id` exclusion dropped from the declaration, and `isMatchedName` re-hardcoded so it no longer
//     agrees with the declaration it derives from.
// And it must stay green for:
//   - `aria-label="probe a"` on probe-a only — a literal the harness does not match on.
//
// It must also pass with the milestone's own bookkeeping absent, which is why nothing below reads it.
//
// RULING — the match set, and why `id` is outside it. The suite owns this declaration; it does not read it.
//
// What: the attributes a HAR-3 predicate can match on are `class` and `data-*` on the host element. Every
// other attribute the page writes on a host — `id`, `aria-*`, `style`, an interpolation, an `(event)`
// binding, a template reference — is outside the set, so a difference in one of those cannot make the case
// resolvable and must not redden this suite.
//
// Why: the fixture's authoring contract declares the hosts "rendered twice with the same class list and the
// same data attributes; only the DOM `id` differs, because duplicate ids are invalid markup and an `id` is
// not an attribute a harness matches on." That is the only written declaration of the harness surface in
// this repository: the harness itself does not exist (the A8 ruling defers `@angular/cdk/testing` to the
// harness family), so there is no shipped match set to derive from. The suite therefore states that
// declaration as constants it owns — `DECLARED_HARNESS_SURFACE` below — and asserts against them.
//
// PROVENANCE — recorded here, not read from where it was written. The declaration belongs to task T002,
// "Add the deliberately ambiguous harness target page to the counter fixture", and is the source text of
// commit 7f54505baf516adf52f56c9fb8a2c72ff55937c1 (M023 plan approval), which created that task file. The
// sentences it quoted are:
//   "`HarnessProbe` (`app-harness-probe`) is rendered twice with the same class list and the same data
//    attributes; only the DOM `id` differs, because duplicate ids are invalid markup and an `id` is not an
//    attribute a harness matches on."
// They live in `DECLARED_HARNESS_SURFACE.provenance.quoted`, so the next reader can re-derive the match set
// without a file that may no longer be there.
//
// Why provenance and not a read: this suite is held-out, and the milestone's own bookkeeping is not stable
// across the milestone's lifecycle — the ship flow archives `tasks/`, every review cycle regenerates
// `review/`, and both move under the archive tree. A suite that read them for its contract went ENOENT the
// moment the milestone shipped; the M023 final panel reproduced exactly that. So the contract sits with the
// fixture's tests, and the origin is named in words.
//
// Recorded as a ruling rather than derived from code because it is not yet true of any code: when HAR-3
// ships, replace `isMatchedName` with the harness's own match set, keep the `id` row only if the harness
// keeps `id` outside it, and keep the mutants above. Until then this is the assumption, stated with its
// reason and its re-derivation condition, instead of an unexplained `!== 'id'` in the comparison.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const pagePath = join(
  root,
  'spikes',
  'ng222-app',
  'src',
  'app',
  'components',
  'components-page.ts',
);
const SUITE = 'fixture-harness-ambiguity.test.mjs';
const PROBE_HOST = 'app-harness-probe';

/**
 * The declared harness surface — the whole fixture contract this suite rests on, held here rather than read
 * from the milestone's own bookkeeping (the ruling at the top of this file names the origin: task T002,
 * commit 7f54505baf516adf52f56c9fb8a2c72ff55937c1, and the sentences quoted).
 *
 * `matched` is the source of truth and `isMatchedName` derives from it, so widening the set to `id` — the
 * prohibition-N1 self-violation this suite exists to catch — changes the predicate every comparison below
 * runs on, and the declaration test reddens.
 */
const DECLARED_HARNESS_SURFACE = {
  matched: ['class', 'data-*'],
  excluded: ['id'],
  whyMatched:
    'a HAR-3 predicate names an attribute on the host element, and the hosts are rendered with the same class list and the same data attributes, so class and data-* are the whole of what such a predicate can tell them apart by',
  whyExcluded: [
    'duplicate ids are invalid markup, so two hosts cannot share an id and the fixture is allowed to differ there',
    'an id is not an attribute a harness matches on, so a difference in it cannot make the ambiguity case resolvable',
  ],
  provenance: {
    task: 'T002 — Add the deliberately ambiguous harness target page to the counter fixture',
    commit: '7f54505baf516adf52f56c9fb8a2c72ff55937c1',
    quoted: [
      'rendered twice with the same class list and the same data attributes',
      'only the DOM `id` differs, because duplicate ids are invalid markup and an `id` is not an attribute a harness matches on',
    ],
  },
};

/**
 * The declared match set of the ruling above: `class` and `data-*`, and nothing else. One entry ending in
 * `*` covers its prefix; every other entry is an exact name, so `class.active` binds `class` and no entry
 * can match `id` by accident.
 */
function isMatchedName(name) {
  return DECLARED_HARNESS_SURFACE.matched.some((entry) =>
    entry.endsWith('*') ? name.startsWith(entry.slice(0, -1)) : name === entry,
  );
}

/** An attribute name the HTML parser keeps verbatim, i.e. a literal the page wrote as `name="value"`. */
const LITERAL_NAME = /^[A-Za-z_:][\w:.-]*$/;

function label(host) {
  const id = host.getAttribute('id');
  return id ? `<${PROBE_HOST} id="${id}">` : `<${PROBE_HOST}>`;
}

/** The template literal the page component declares, mounted the way the page would render it. */
function probeHosts() {
  const source = readFileSync(pagePath, 'utf8');
  const template = /template:\s*`([\s\S]*?)`/.exec(source);
  assert.ok(
    template,
    `${SUITE}: ${pagePath} declares no template literal, so the probe hosts cannot be read`,
  );
  const dom = new JSDOM(
    `<!doctype html><html><body>${template[1]}</body></html>`,
  );
  return [...dom.window.document.querySelectorAll(PROBE_HOST)];
}

/**
 * Every attribute a host start tag writes, in source order, with the name the harness would match on.
 *
 * `[attr.x]` and `[x]` bind an attribute the DOM carries once Angular renders, so they are read like a
 * literal. `(event)` bindings, two-way `[(x)]` bindings and `#ref` template references set no DOM
 * attribute at all — an attribute-matching harness cannot see them — so they are read and set aside.
 * A form this reader cannot classify fails loudly rather than becoming a blind spot.
 */
function readAttributes(host) {
  const who = label(host);
  const records = [];
  for (const written of host.getAttributeNames()) {
    const value = host.getAttribute(written) ?? '';

    if (/^\([\s\S]*\)$/.test(written) || written.startsWith('on-')) {
      records.push({ written, kind: 'event', name: null, value });
      continue;
    }
    if (
      written.startsWith('#') ||
      written.startsWith('let-') ||
      written.startsWith('ref-')
    ) {
      records.push({ written, kind: 'reference', name: null, value });
      continue;
    }

    const binding =
      /^\[([\s\S]*)\]$/.exec(written) ?? /^bind-([\s\S]*)$/.exec(written);
    if (binding) {
      const target = binding[1].trim();
      if (/^\([\s\S]*\)$/.test(target)) {
        records.push({ written, kind: 'event', name: null, value });
      } else if (target.startsWith('attr.')) {
        records.push({
          written,
          kind: 'binding',
          name: target.slice('attr.'.length).trim(),
          value,
        });
      } else {
        // `[class.active]` and `[style.width.px]` add to the attribute named before the first dot.
        const name = (
          target.includes('.') ? target.split('.')[0] : target
        ).trim();
        records.push({ written, kind: 'binding', name, value });
      }
      continue;
    }

    if (!LITERAL_NAME.test(written)) {
      assert.fail(
        `${SUITE}: ${who} carries ${written}, a template form this suite cannot classify, so it cannot tell whether the hosts differ in an attribute the harness matches on — teach readAttributes this form, or record it in the ruling above`,
      );
    }
    records.push({ written, kind: 'literal', name: written, value });
  }
  return records;
}

/**
 * The value a host writes for one matched attribute, reduced to what two hosts can be compared on: a
 * literal's own text, or a binding's value when the binding is a single quoted string
 * (`[attr.data-slot]="'two'"` renders as `data-slot="two"`, so it must compare equal to that literal).
 * Any other expression is compared as written, because only the source exists.
 */
function describe(record) {
  if (record.kind === 'literal') return record.value;
  const quoted = /^(['"])([\s\S]*)\1$/.exec(record.value.trim());
  return quoted ? quoted[2] : `${record.written}="${record.value}"`;
}

/** The attributes of one host the declared match set covers, names sorted, values in source order. */
function matchedOf(host) {
  const records = readAttributes(host).filter(
    (record) => record.name !== null && isMatchedName(record.name),
  );
  const names = [...new Set(records.map((record) => record.name))].sort();
  const values = new Map(
    names.map((name) => [
      name,
      records.filter((record) => record.name === name).map(describe),
    ]),
  );
  const writtenFor = (name) =>
    records
      .filter((record) => record.name === name)
      .map((record) => `${record.written}="${record.value}"`)
      .join(' and ');
  return { records, names, values, writtenFor };
}

test('components page renders two app-harness-probe hosts', () => {
  const hosts = probeHosts();
  assert.equal(
    hosts.length,
    2,
    `${SUITE}: expected 2 probe hosts, found ${hosts.length} — HAR-3's ambiguity case needs two hosts to be ambiguous between`,
  );
});

test('the declared match set is class and data-*, and id stays outside it, as this suite declares', () => {
  const { matched, excluded, whyMatched, whyExcluded, provenance } =
    DECLARED_HARNESS_SURFACE;

  // The declaration is pinned, not assumed: narrowing or widening it is a contract change that has to be
  // made here, with its reason, rather than drifting with an edit the rest of the suite would follow.
  assert.deepEqual(
    matched,
    ['class', 'data-*'],
    `${SUITE}: mutant (the declared match set lost its declaration) — the suite's declaration of the hosts' harness surface is ${JSON.stringify(matched)}, not class and data-*, so comparing class and data-* would rest on an assumption: re-derive the match set from HAR-3's own and update the ruling`,
  );
  assert.deepEqual(
    excluded,
    ['id'],
    `${SUITE}: mutant (the id exclusion lost its declaration) — the suite's declaration no longer keeps id outside the match set, so excluding id would be an assumption: re-derive it from HAR-3's own match set`,
  );
  assert.ok(
    whyMatched.trim().length > 0 &&
      whyExcluded.length > 0 &&
      whyExcluded.every((reason) => reason.trim().length > 0),
    `${SUITE}: mutant (the declaration lost its reasoning) — the match set and the id exclusion must carry why they hold, or the next reader cannot tell a declaration from a blind spot`,
  );

  // Provenance, asserted as shape and as the sentences themselves: without it the match set is an
  // unexplained `!== 'id'`, and a quoted sentence that disappears is a rationale gone.
  assert.match(
    provenance.task,
    /\bT002\b/,
    `${SUITE}: mutant (the declaration lost its provenance) — the match set must name the task it came from (T002), so it can be re-derived from that task's own words`,
  );
  assert.match(
    provenance.commit,
    /^[0-9a-f]{40}$/,
    `${SUITE}: mutant (the declaration lost its provenance) — the commit that wrote the declaration is recorded as "${provenance.commit}", not a full 40-character SHA, so no reader can resolve it`,
  );
  assert.ok(
    provenance.quoted.some((sentence) =>
      sentence.includes('same class list and the same data attributes'),
    ),
    `${SUITE}: mutant (the declared match set lost its declaration) — the quoted sentence the match set derives from ("the same class list and the same data attributes") is gone, so comparing class and data-* rests on nothing written`,
  );
  assert.ok(
    provenance.quoted.some((sentence) =>
      sentence.includes('is not an attribute a harness matches on'),
    ),
    `${SUITE}: mutant (the id exclusion lost its declaration) — the quoted sentence the exclusion derives from ("an id is not an attribute a harness matches on") is gone, so excluding id rests on nothing written`,
  );

  // The predicate is the declaration's, not a second copy of it: change one and the other is wrong.
  for (const entry of matched) {
    const sample = entry.endsWith('*') ? `${entry.slice(0, -1)}probe` : entry;
    assert.ok(
      isMatchedName(sample),
      `${SUITE}: mutant (isMatchedName disagrees with the declaration) — the declaration matches "${entry}" but isMatchedName("${sample}") does not, so the comparison below runs on a set the declaration does not describe`,
    );
  }

  assert.ok(
    isMatchedName('class') && isMatchedName('data-probe'),
    `${SUITE}: the declared match set must cover class and data-*, the attributes both hosts carry and a HAR-3 predicate would name`,
  );
  assert.ok(
    !isMatchedName('id'),
    `${SUITE}: mutant (id inside the declared match set) — id is the one attribute the hosts are allowed to differ in; with id inside the match set the fixture's own markup is a prohibition-N1 violation`,
  );
  assert.ok(
    !isMatchedName('aria-label'),
    `${SUITE}: mutant (declared match set widened to every attribute present) — an attribute outside class and data-* must stay out, or a harmless literal added to one host reddens the suite again`,
  );
});

test('the reader reads bindings as well as literals, and compares only what the match set covers', () => {
  const dom = new JSDOM(
    `<!doctype html><html><body><app-harness-probe id="reader" class="harness-probe" data-probe="host" [attr.data-slot]="'two'" [data-role]="role" (click)="go()" disabled aria-label="probe a"></app-harness-probe></body></html>`,
  );
  const host = dom.window.document.querySelector(PROBE_HOST);
  assert.ok(
    host,
    `${SUITE}: the reader check could not build a probe host to parse`,
  );

  const records = readAttributes(host);

  const bound = records.find((record) => record.written === '[attr.data-slot]');
  assert.ok(
    bound,
    `${SUITE}: mutant (reader blind to [attr.x] bindings) — the reader did not read [attr.data-slot], so a distinguishing binding is invisible to it`,
  );
  assert.equal(
    bound.name,
    'data-slot',
    `${SUITE}: mutant (binding target misread) — [attr.data-slot] is matched as "${bound.name}", not "data-slot"`,
  );
  assert.equal(
    describe(bound),
    'two',
    `${SUITE}: mutant (binding value not resolved) — [attr.data-slot]="'two'" is read as "${describe(bound)}", so a literal and the binding that renders the same value would not compare equal`,
  );

  const matched = matchedOf(host);
  assert.deepEqual(
    matched.names,
    ['class', 'data-probe', 'data-role', 'data-slot'],
    `${SUITE}: mutant (match set wrong) — the reader matched ${JSON.stringify(matched.names)}; only class and data-* are in the declared match set, and every form that binds one of them must be read`,
  );
  assert.equal(
    records.length,
    host.getAttributeNames().length,
    `${SUITE}: mutant (the reader drops an attribute it cannot classify) — the reader returned ${records.length} of the ${host.getAttributeNames().length} attributes written on the host, so an attribute could hide from the comparison`,
  );
  for (const outside of ['id', 'disabled', 'aria-label']) {
    assert.ok(
      !matched.names.includes(outside),
      `${SUITE}: ${outside} is outside the declared match set and must not be compared, so a harmless ${outside} on one host leaves the suite green`,
    );
  }
});

test('the two probe hosts match in every attribute the harness matches on, bindings included (id excluded)', () => {
  const [a, b] = probeHosts();
  assert.ok(
    a && b,
    `${SUITE}: the page must render two probe hosts, so one host has another to be ambiguous with`,
  );
  const left = matchedOf(a);
  const right = matchedOf(b);

  // A comparison over nothing passes for the wrong reason: the reader must find the harness surface.
  for (const [host, matched] of [
    [a, left],
    [b, right],
  ]) {
    for (const required of ['class', 'data-probe']) {
      assert.ok(
        matched.names.includes(required),
        `${SUITE}: mutant (reader blind to ${required} on a host) — the reader found no ${required} attribute on ${label(host)}, so the comparison below cannot see a distinguishing attribute`,
      );
    }
  }

  const onlyLeft = left.names.filter((name) => !right.names.includes(name));
  const onlyRight = right.names.filter((name) => !left.names.includes(name));
  const oneSided = [
    ...onlyLeft.map((name) => `${left.writtenFor(name)} on ${label(a)} only`),
    ...onlyRight.map((name) => `${right.writtenFor(name)} on ${label(b)} only`),
  ];
  assert.deepEqual(
    oneSided,
    [],
    `${SUITE}: mutant (distinguishing attribute added to one host) — a HAR-3 predicate can tell the hosts apart: ${oneSided.join('; ')}; the matched attribute sets are [${left.names.join(', ')}] and [${right.names.join(', ')}]. Prohibition N1 forbids a resolvable ambiguity case.`,
  );

  for (const name of left.names) {
    const mine = left.values.get(name).join(' + ');
    const theirs = (right.values.get(name) ?? []).join(' + ');
    assert.equal(
      theirs,
      mine,
      `${SUITE}: mutant (distinguishing attribute value on the two hosts) — matched attribute ${name} differs: ${label(a)} writes ${left.writtenFor(name)} and ${label(b)} writes ${right.writtenFor(name)}, so a HAR-3 predicate on ${name} tells the hosts apart (prohibition N1)`,
    );
  }

  // The excluded attribute, read and not assumed: the reader sees `id` on both hosts, and the declared match
  // set is what keeps it out of the comparison — the exclusion is the declaration's, not the reader's
  // blindness (see the ruling in the header).
  assert.ok(
    !left.names.includes('id') && !right.names.includes('id'),
    `${SUITE}: id must stay outside the declared match set, or the hosts' own markup is a prohibition-N1 violation`,
  );
  const idLeft = readAttributes(a).find((record) => record.written === 'id');
  const idRight = readAttributes(b).find((record) => record.written === 'id');
  assert.ok(
    idLeft && idRight,
    `${SUITE}: mutant (a host lost its id) — both hosts must carry an id, because id is the only attribute it is legitimate for them to differ in`,
  );
  assert.notEqual(
    idLeft.value,
    idRight.value,
    `${SUITE}: mutant (the hosts share an id) — ${label(a)} and ${label(b)} both carry id="${idLeft.value}", so the one difference HAR-3's ambiguity case is allowed has gone: either the case lost one of its two hosts' identity or the exclusion must be re-derived`,
  );
});
