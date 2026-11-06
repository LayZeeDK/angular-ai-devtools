// Held-out proof for SC1 / E1 (HAR-1): content inside the component root is included and content outside
// it is excluded.
//
// The harness that would mount a page does not exist yet (the A8 ruling defers it) and the fixture offers no
// test seam, so this suite mounts the fixture itself. It reads the component's own `template`, keeps the
// page's own `app-harness-probe` element as the component root, and projects the caller content the page
// wrote between that host's tags into the probe's `<ng-content>` slot the way Angular does: in the slot's own
// position, in document order, honouring `select`, and dropping whatever no slot claims. Caller content that
// sits outside the host can never reach the root, because the only nodes offered to a slot are that host's
// own children.
//
// The assertions read the *rendered* result — the caller's `span.projected` markers, counted inside and
// outside the rendered probe roots — never the source text of a marker.
//
// Mutants this suite must redden for, each seen failing and passing again (see the task Log):
//   - `<ng-content select=".none">` in `harness-probe.ts` — a projection point that projects nothing;
//   - `<ng-content>` moved after the probe's own `<ul>` — the projection point in the wrong place;
//   - the caller's marker hard-coded into the probe's template — inclusion that does not come from the caller.
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
const probePath = join(
  root,
  'spikes',
  'ng222-app',
  'src',
  'app',
  'components',
  'harness-probe.ts',
);
const SUITE = 'fixture-harness-root-boundary.test.mjs';

const PROBE_HOST = 'app-harness-probe';
/** The class the page's caller content marks its projected blocks with. */
const PROJECTED = '.projected';
/** The text the page's caller writes inside those blocks. */
const MARKER_TEXT = 'projected content';

/** The template literal a component declares, read out of its own source. */
function readTemplate(source, path) {
  const match = /template:\s*`([\s\S]*?)`/.exec(source);
  assert.ok(
    match,
    `${SUITE}: ${path} declares no template literal, so there is no rendered result to observe`,
  );
  return match[1];
}

/** A slot's `select` list, or `null` for the wildcard slot that takes everything no other slot claimed. */
function selectorsOf(slot) {
  if (!slot.hasAttribute('select')) return null;
  return slot
    .getAttribute('select')
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean);
}

function matchesSelector(element, selector) {
  try {
    return element.matches(selector);
  } catch {
    assert.fail(
      `${SUITE}: the projection point's select="${selector}" is not a selector this mount can evaluate, so what it projects cannot be observed`,
    );
  }
}

/**
 * Render one probe instance into the host element that is its component root.
 *
 * `host.childNodes` at mount time is exactly the caller content the page wrote inside this root; it is the
 * only thing offered to the slots, which is why content outside the host cannot be projected into it.
 */
function instantiate(host, template, document) {
  const caller = [...host.childNodes];
  const holder = document.createElement('div');
  holder.innerHTML = template;

  const slots = [...holder.querySelectorAll('ng-content')].map((slot) => ({
    slot,
    selectors: selectorsOf(slot),
    nodes: [],
  }));
  const wildcard = slots.findIndex(({ selectors }) => selectors === null);

  for (const node of caller) {
    const claimed = slots.find(
      ({ selectors }) =>
        selectors !== null &&
        node.nodeType === 1 /* Element */ &&
        selectors.some((selector) => matchesSelector(node, selector)),
    );
    if (claimed) claimed.nodes.push(node);
    else if (wildcard !== -1) slots[wildcard].nodes.push(node);
    // No slot claims it: Angular does not render it, and neither does this mount.
  }

  for (const { slot, nodes } of slots) slot.replaceWith(...nodes);
  host.replaceChildren(...holder.childNodes);
  return host;
}

/** Mount the page: every `app-harness-probe` element in it becomes a rendered component root. */
function mountPage() {
  const pageTemplate = readTemplate(readFileSync(pagePath, 'utf8'), pagePath);
  const probeTemplate = readTemplate(
    readFileSync(probePath, 'utf8'),
    probePath,
  );
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="page">${pageTemplate}</div></body></html>`,
  );
  const { document } = dom.window;
  const page = document.getElementById('page');
  const roots = [...page.querySelectorAll(PROBE_HOST)];
  assert.equal(
    roots.length,
    2,
    `${SUITE}: the page must mount two <${PROBE_HOST}> roots for the boundary to have an inside and an outside, found ${roots.length}`,
  );
  for (const host of roots) instantiate(host, probeTemplate, document);
  return { dom, document, page, roots };
}

/** Mount a single probe around `callerHtml`, with no page around it. */
function mountProbe(callerHtml) {
  const probeTemplate = readTemplate(
    readFileSync(probePath, 'utf8'),
    probePath,
  );
  const dom = new JSDOM(
    `<!doctype html><html><body><${PROBE_HOST} id="probe-solo">${callerHtml}</${PROBE_HOST}></body></html>`,
  );
  const { document } = dom.window;
  const host = document.getElementById('probe-solo');
  assert.ok(
    host,
    `${SUITE}: the mount could not build a <${PROBE_HOST}> root to project into`,
  );
  return { document, root: instantiate(host, probeTemplate, document) };
}

function label(root, index) {
  return `<${PROBE_HOST}${root.getAttribute('id') ? ` id="${root.getAttribute('id')}"` : ` #${index + 1}`}>`;
}

test('probe projects caller content through ng-content', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(
    src,
    /<ng-content\b/,
    `${SUITE}: mutant (remove projection point) — probe must project via <ng-content`,
  );
});

test('probe places ng-content before its own list so projected content lands inside the root', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(
    src,
    /<ng-content\b[\s\S]*?<ul>/,
    `${SUITE}: mutant (move projection point) — <ng-content> must precede <ul> inside probe root`,
  );
});

test('page places projected content inside both probes and once outside', () => {
  const src = readFileSync(pagePath, 'utf8');
  // content inside probe roots
  const inside = [
    ...src.matchAll(/<app-harness-probe\b[^>]*>[\s\S]*?<\/app-harness-probe>/g),
  ]
    .map((m) => (m[0].match(/projected content/g) || []).length)
    .reduce((a, b) => a + b, 0);
  // content outside any probe
  const stripped = src.replace(
    /<app-harness-probe\b[^>]*>[\s\S]*?<\/app-harness-probe>/g,
    '',
  );
  const outside = (stripped.match(/projected content/g) || []).length;
  assert.equal(
    inside,
    2,
    `${SUITE}: mutant (move projection point) — expected 2 projected inside probe roots, got ${inside}`,
  );
  assert.equal(
    outside,
    1,
    `${SUITE}: mutant (move projection point) — expected 1 projected outside probe roots, got ${outside}`,
  );
});

test('each probe root renders the caller content written inside it, where its projection point is', () => {
  const { dom, roots } = mountPage();
  const { DOCUMENT_POSITION_FOLLOWING } = dom.window.Node;

  for (const [index, root] of roots.entries()) {
    const markers = [...root.querySelectorAll(PROJECTED)];
    const note =
      markers.length < 1
        ? `the projection point dropped the caller's content, so "${MARKER_TEXT}" was not projected`
        : `the root shows markers the page did not write inside it`;
    assert.equal(
      markers.length,
      1,
      `${SUITE}: mutant (projection point does not render the caller's content) — ${label(root, index)} rendered ${markers.length} "${MARKER_TEXT}" marker(s) inside its root, expected exactly the 1 the page wrote there: ${note}`,
    );
    assert.equal(
      markers[0].textContent.trim(),
      MARKER_TEXT,
      `${SUITE}: mutant (projected content changed) — ${label(root, index)} rendered the caller's marker as "${markers[0].textContent.trim()}", not "${MARKER_TEXT}", so the caller's own content did not reach the root`,
    );

    const list = root.querySelector('ul');
    assert.ok(
      list,
      `${SUITE}: mutant (probe lost its own list) — ${label(root, index)} rendered no <ul>, so where the projection point sits cannot be observed`,
    );
    assert.ok(
      markers[0].compareDocumentPosition(list) & DOCUMENT_POSITION_FOLLOWING,
      `${SUITE}: mutant (move projection point) — in ${label(root, index)} the projected "${MARKER_TEXT}" marker rendered after the probe's own <ul>, so the projection point is not where the E1 ruling puts it`,
    );
  }
});

test('the caller content written outside the probes is not projected into any probe root', () => {
  const { page, roots } = mountPage();
  const isInsideARoot = (marker) => roots.some((root) => root.contains(marker));
  const all = [...page.querySelectorAll(PROJECTED)];
  const inside = all.filter(isInsideARoot);
  const outside = all.filter((marker) => !isInsideARoot(marker));

  const insideNote =
    inside.length < 2
      ? `the probes' projection points dropped what the page wrote inside them, so "${MARKER_TEXT}" was not projected into ${2 - inside.length} of the 2 roots`
      : `the roots show more "${MARKER_TEXT}" markers than the page writes inside them, so content from outside a probe root was projected into one`;
  assert.equal(
    inside.length,
    2,
    `${SUITE}: mutant (the probes do not project exactly their own caller content) — the rendered page shows ${inside.length} "${MARKER_TEXT}" markers inside the two probe roots, expected 2: ${insideNote}`,
  );
  assert.equal(
    outside.length,
    1,
    `${SUITE}: mutant (content outside the probe root was pulled into a root) — the rendered page shows ${outside.length} "${MARKER_TEXT}" markers outside the probe roots, expected 1 (the third block the page writes after both probes)`,
  );
  assert.ok(
    roots.every((root) => !root.contains(outside[0])),
    `${SUITE}: mutant (content outside the probe root was pulled into a root) — the third "${MARKER_TEXT}" block the page writes outside both probes rendered as a descendant of a probe root, so exclusion is not observed`,
  );
});

test('a probe root with no caller content projects nothing, so the marker comes from the caller', () => {
  const { root } = mountProbe('');
  assert.equal(
    root.querySelectorAll(PROJECTED).length,
    0,
    `${SUITE}: mutant (caller marker hard-coded into the probe template) — a <${PROBE_HOST}> root mounted with no caller content rendered ${root.querySelectorAll(PROJECTED).length} "${MARKER_TEXT}" marker(s), so the marker does not come from the caller through the projection point`,
  );
  assert.equal(
    root.querySelectorAll('ul > li[data-kind]').length,
    3,
    `${SUITE}: the probe's own content must still render when it projects nothing, otherwise the empty root proves nothing`,
  );
  assert.equal(
    root.querySelectorAll('ng-content').length,
    0,
    `${SUITE}: the mount left the <ng-content> placeholder in the rendered result, so what was projected cannot be read off it`,
  );
});
