// Tests for apps/angular-ai-devtools/src/app/panel-sanitizer.ts — the panel surface that renders the
// sanitizer finding from a fact list it is given, or the state that names why it cannot (M029 T003;
// INTENT.md SC4, held-out E4).
//
// Run: node --test scripts/panel-sanitizer.test.mjs
//
// Every fact list the surface renders is produced by the shipped triage module, not by a fixture: the
// join from T002 (`extension/sanitizer-triage.js`) runs in a bare `node:vm` context over T001's real
// recording (`research/raw/m029-sanitizer-warning.json`), exactly as scripts/sanitizer-triage.test.mjs
// runs it, and the object its `join()` returns is what the surface is handed. The surface itself is
// imported and executed, so nothing here stands in for behaviour by scanning a source file.
//
//   opening  the first render's strip warns at page-clock 1401 ms, before the profiler subscription
//            lands at 1426.7 ms, so that warning has no covering record: the surface renders
//            `cannot-tell` and names no component — never the nearest one.
//            the later write shares cycle 2's window, and that record names `app-root` and
//            `app-trust-bypass-page` with events [2,3] and carries no binding, so the surface renders
//            those two components, that cycle and the warning's own time, and no binding.
//
//   E4 — the surface renders `loading` rather than an empty fact list; `none` as an absence and never
//        as clean, safe or ok (N3); `stripped` with the components and the time and no binding the fact
//        list did not carry; `cannot-tell` as the named absence with no component; `deliberate` for a
//        `bypassSecurityTrust*` binding that produced no warning; and `error` when the capture could
//        not be read. No state's text names a tag, an attribute, a removed substring or a cause (N4).
//
// Three mutants, one per pin the task names, each applied to an in-memory copy of the surface's source:
//
//   M1  the stripped pane names a tag            -> the no-tag/no-attribute pin must redden
//   M2  the cannot-tell pane is blanked          -> the absence pin must redden
//   M3  the none state calls the page "clean"    -> the N3 pin must redden
//
// The surface on disk is never written: each mutant is loaded from its own file in the OS temp
// directory (node strips the types of a `.ts` file wherever it lives), and the directory is removed
// when the suite ends. After each mutation the untouched module is loaded again and the same pin is
// shown passing, so a mutant that reddens proves the pin, not the loader.
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createContext, runInContext } from "node:vm";

const TRIAGE_SRC = readFileSync(new URL("../extension/sanitizer-triage.js", import.meta.url), "utf8");
const RECORDING = JSON.parse(
  readFileSync(new URL("../research/raw/m029-sanitizer-warning.json", import.meta.url), "utf8"),
);
const SURFACE_URL = new URL("../apps/angular-ai-devtools/src/app/panel-sanitizer.ts", import.meta.url);
const SURFACE_SRC = readFileSync(SURFACE_URL, "utf8");
const SURFACE = await import(SURFACE_URL.href);

// The sanitizer's one signal, matched exactly as T001's capture matched it. Matching it here is how
// the warnings are picked out of the recorded list; the surface never sees the message text.
const SANITIZER_WARNING = /WARNING: sanitizing HTML stripped some content/;

/** The recorded strip warnings, on the page clock — the clock the profiler records use. */
const WARNINGS = RECORDING.pageTap.messages.filter(
  (message) => message.type === "warn" && SANITIZER_WARNING.test(message.text),
);

/** The profiler records the page agent dispatched in the same page load. */
const RECORDS = RECORDING.profiler.records;

/** The record that covers the later write, and the components it names — read from the recording. */
const COVERING_RECORD = RECORDS[1];
const COVERING_COMPONENTS = COVERING_RECORD.checks
  .filter((check) => check.events.includes(2) && check.events.includes(3))
  .map((check) => check.componentName);

/** The first render's warning: the one no profiler record covers. */
const UNCOVERED_WARNING = WARNINGS[0];

/** Every component name any record in the recording carries, so the absence can be shown to dodge them. */
const RECORDED_COMPONENTS = [
  ...new Set(RECORDS.flatMap((record) => record.checks.map((check) => check.componentName))),
];

/** A value built inside the vm context carries that context's prototypes; this copies it here. */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The triage module in a bare context, its join the only thing used — T002's own answer, copied. */
function loadTriage() {
  const context = createContext({});
  runInContext(TRIAGE_SRC, context);
  const api = context.angularAiSanitizerTriage;
  assert.ok(api, "the triage module must publish its namespace on the global object it runs in");
  return {
    join: (warnings, records) => host(api.join(warnings, records)),
    NO_COVERING_RECORD: api.NO_COVERING_RECORD,
  };
}

const TRIAGE = loadTriage();

/** The measured load: one warning with no covering record and one placed on cycle 2. */
const MEASURED = TRIAGE.join(WARNINGS, RECORDS);

/** The first render's strip alone: a warning with no covering record, and no component to name. */
const UNATTRIBUTABLE = TRIAGE.join([UNCOVERED_WARNING], []);

/** A page that produced no warning at all: the absence, which is not a clean result (N3). */
const NO_WARNING = TRIAGE.join([], RECORDS);

/**
 * A fact list that carries the extra things no pane may name — a tag, an attribute, the warning's own
 * text and a cause — attached beside a well-formed stripped finding. The surface renders the finding
 * and none of the extras: nothing a fact list carries reaches a pane unless it is a named fact.
 */
const WITH_EXTRAS = {
  state: "stripped",
  findings: [
    {
      state: "stripped",
      at: 2000,
      components: ["app-card"],
      cycleIds: [3],
      tag: "div",
      attribute: "innerHtml",
      removedSubstring: "onerror=alert(1)",
      text: "WARNING: sanitizing HTML stripped some content",
      cause: "the binding was untrusted",
    },
  ],
};

/** A well-formed stripped finding whose covering record carries a binding: the surface names it. */
const WITH_BINDING = {
  state: "stripped",
  findings: [
    { state: "stripped", at: 2500, components: ["app-card"], cycleIds: [4], binding: "cardHtml" },
  ],
};

/** A deliberate bypass: the `bypassSecurityTrust*` binding that produced no warning. */
const DELIBERATE = { state: "deliberate", binding: "bypassSecurityTrustHtml", at: 2600 };

/**
 * The wording no state may carry: a tag, an attribute, a removed substring or a cause (N2, N4). The
 * component names the recording carries pass through untouched, and none of them matches these.
 */
const UNSUPPORTED = [
  [/<\/?[a-z]/i, "a markup tag"],
  [/\bdiv\b/i, "a tag name"],
  [/\bscript\b/i, "a tag name"],
  [/\biframe\b/i, "a tag name"],
  [/\bonerror\b/i, "an attribute"],
  [/\binnerhtml\b/i, "an attribute"],
  [/\bhref\b/i, "an attribute"],
  [/\battribute\b/i, "the word attribute"],
  [/\btag\b/i, "the word tag"],
  [/\bsome content\b/i, "the removed substring"],
  [/\bcause\b/i, "a cause"],
  [/\bbecause\b/i, "a cause"],
];

/** The words N3 forbids in an absence: a page with no warning is not certified as anything. */
const CERTIFYING = [/\bclean\b/i, /\bsafe\b/i, /\bsecure\b/i, /\bok\b/i, /\bokay\b/i, /\bfine\b/i];

/** The one wording the absence state must carry, so a blank pane cannot pass as it. */
const ABSENCE = /no covering record/i;

/** The one wording the error state must carry. */
const UNREADABLE = /could not be read/i;

// ---------------------------------------------------------------------------
// The pins, written once so each mutant is run through the very assertion the case makes
// ---------------------------------------------------------------------------

/** E4's no-unsupported-wording pin: the pane and its message, over the words N2 and N4 forbid. */
function assertNothingUnsupported(surface) {
  const rendered = `${surface.message}\n${surface.text}`;
  for (const [pattern, what] of UNSUPPORTED) {
    assert.ok(
      !pattern.test(rendered),
      `the ${surface.state} state must not name ${what}: ${JSON.stringify(rendered)}`,
    );
  }
}

/** E4's loading pin: the finding is being assembled, and the pane is never an empty fact list. */
function assertLoading(surface) {
  assert.equal(surface.state, "loading", "a fact list with no finding yet must render as loading");
  assert.equal(surface.kind, "loading");
  assert.ok(surface.lines.length > 0, "the loading state must render lines, not an empty fact list");
  assert.ok(surface.text.trim().length > 0, "the loading pane must not be blank");
  assert.match(surface.message, /assembl/i, "the loading state says the finding is being assembled");
  assert.doesNotMatch(surface.message, ABSENCE, "a loading finding is not the cannot-tell state");
  assertNothingUnsupported(surface);
}

/** E4's N3 pin: no warning says so as an absence, and never as clean, safe or ok. */
function assertNone(surface) {
  assert.equal(surface.state, "none", "a fact list with no warning must render as none");
  assert.equal(surface.kind, "none");
  assert.ok(surface.lines.length > 0, "the absence renders as a pane, not as nothing");
  assert.ok(surface.text.trim().length > 0, "the pane's text must not be blank");
  // The N3 prohibition first, so a pane that certifies the page fails on that and not on its wording.
  const rendered = `${surface.message}\n${surface.text}`;
  for (const pattern of CERTIFYING) {
    assert.ok(
      !pattern.test(rendered),
      `none must not certify the page (${pattern}): ${JSON.stringify(rendered)}`,
    );
  }
  assert.match(surface.message, /no sanitizer warning was captured/i, "the absence is stated");
  assert.match(surface.text, /no sanitizer warning was captured/i, "the rendered pane states it too");
  assert.equal("findings" in surface, false, "the absence carries no finding to read a strip out of");
  assertNothingUnsupported(surface);
}

/** E4's stripped pin: the components and the time the fact list carried, and the binding it did not. */
function assertStripped(surface, expected) {
  assert.equal(surface.state, "stripped", "a placed warning must render as stripped");
  assert.equal(surface.kind, "stripped");
  const placed = surface.findings.filter((finding) => finding.state === "stripped");
  assert.ok(placed.length > 0, "the stripped pane carries the placed finding it rendered");
  assert.deepEqual(
    [...new Set(placed.flatMap((finding) => finding.components))],
    expected.components,
    "the component(s) the covering record names reach the pane, in the record's own order",
  );
  for (const name of expected.components) {
    assert.ok(
      surface.text.includes(`component ${name}`),
      `the pane names the component on its own line: ${surface.text}`,
    );
  }
  assert.ok(
    surface.text.includes(`at ${expected.at}`),
    `the pane carries the warning's own time: ${surface.text}`,
  );
  assert.equal(surface.binding ?? null, expected.binding ?? null, "the binding is the fact list's own");
  assert.equal(
    surface.text
      .split("\n")
      .filter((line) => line.startsWith("binding "))
      .length,
    expected.binding === null ? 0 : 1,
    "a binding line appears only when the fact list carried one",
  );
  assertNothingUnsupported(surface);
}

/** E4's absence pin: the unattributable warning, its absence named, and no component anywhere. */
function assertCannotTell(surface) {
  assert.equal(surface.state, "cannot-tell", "a warning with no covering record must not be stripped");
  assert.equal(surface.kind, "cannot-tell");
  assert.match(surface.message, ABSENCE, "the message names the missing covering record");
  assert.match(surface.text, ABSENCE, "and the rendered pane says the same thing");
  assert.ok(surface.lines.length > 0, "the absence must render as a pane, not as nothing");
  assert.ok(surface.text.trim().length > 0, "the pane's text must not be blank");
  assert.equal(
    surface.reason,
    TRIAGE.NO_COVERING_RECORD,
    "the absence is named with the constant the triage module exports",
  );
  assert.ok(surface.findings.length > 0, "the unattributable warning is carried, not dropped");
  for (const finding of surface.findings) {
    assert.deepEqual(finding.components, [], "the absence names no component");
    assert.equal(finding.binding, null, "the absence names no binding");
  }
  for (const name of RECORDED_COMPONENTS) {
    assert.ok(
      !surface.text.includes(name),
      `the absence must not borrow the nearest component (${name}): ${surface.text}`,
    );
  }
  assertNothingUnsupported(surface);
}

/** E4's deliberate pin: the bypass binding, reported as deliberate, and no warning claimed. */
function assertDeliberate(surface, binding) {
  assert.equal(surface.state, "deliberate", "a bypass binding with no warning is a state of its own");
  assert.equal(surface.kind, "deliberate");
  assert.equal(surface.binding, binding, "the pane names the binding the fact list carried");
  assert.match(surface.message, /deliberate/i, "the bypass is reported as deliberate");
  assert.ok(surface.text.includes(binding), "the rendered pane names the binding");
  assert.match(surface.message, /no warning/i, "and says the capture recorded no warning for it");
  const rendered = `${surface.message}\n${surface.text}`;
  for (const pattern of CERTIFYING) {
    assert.ok(
      !pattern.test(rendered),
      `deliberate must not certify the page (${pattern}): ${JSON.stringify(rendered)}`,
    );
  }
  assertNothingUnsupported(surface);
}

/** E4's error pin: the capture could not be read, said so, and no reason rendered as a cause. */
function assertError(surface) {
  assert.equal(surface.state, "error", "a capture that could not be read is its own state");
  assert.equal(surface.kind, "error");
  assert.match(surface.message, UNREADABLE, "the message says the capture could not be read");
  assert.match(surface.text, UNREADABLE, "the rendered pane says the same thing");
  assert.ok(surface.lines.length > 0, "the error must render as a pane, not as nothing");
  assert.ok(
    surface.reason === "not-a-sanitizer-fact-list" ||
      surface.reason === "deliberate-without-a-bypass-binding",
    `the error carries this surface's own reason token, never a caller's text: ${surface.reason}`,
  );
  assertNothingUnsupported(surface);
}

// ---------------------------------------------------------------------------
// The mutants
// ---------------------------------------------------------------------------

let mutantDir = null;
let mutantCount = 0;

/**
 * A mutant: one textual change to an in-memory copy of the surface's source, loaded from a file in
 * the OS temp directory so it goes through the same type stripping the surface on disk does. The
 * anchor must change the source, or the mutation would be vacuous and the case would prove nothing.
 */
async function loadMutant(anchor, replacement) {
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(source, SURFACE_SRC, `the mutation must change the surface: ${JSON.stringify(anchor)}`);
  mutantDir ??= mkdtempSync(join(tmpdir(), "panel-sanitizer-"));
  mutantCount += 1;
  const file = join(mutantDir, `surface-mutant-${mutantCount}.ts`);
  writeFileSync(file, source, "utf8");
  return import(pathToFileURL(file).href);
}

after(() => {
  if (mutantDir !== null) rmSync(mutantDir, { recursive: true, force: true });
});

/** The failure a pin raises on a mutant; a failing assertion when the mutant slips past it. */
function reddens(pin, what) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(failure instanceof Error, `${what} passed on the mutant, so the mutation is not caught`);
  return failure;
}

// ---------------------------------------------------------------------------
// The six states
// ---------------------------------------------------------------------------

describe("the sanitizer panel surface (E4)", () => {
  it("renders the loading state rather than an empty fact list", () => {
    assertLoading(SURFACE.sanitizerPanel({ loading: true }));
    assertLoading(SURFACE.sanitizerPanel({ assembling: true }));
    assertLoading(SURFACE.sanitizerPanel({ state: "loading" }));
    // The E4 defect: a finding that has not arrived renders as the fact list it has, not as nothing.
    assertLoading(SURFACE.sanitizerPanel({ state: "stripped", findings: [] }));
    assertLoading(SURFACE.sanitizerPanel({ state: "cannot-tell", findings: [] }));
    // Loading is its own state, never the absence of a warning.
    assert.notEqual(SURFACE.sanitizerPanel({ state: "stripped", findings: [] }).state, "none");
  });

  it("renders none as an absence, and never as clean, safe or ok (N3)", () => {
    assert.equal(NO_WARNING.state, "none", "the recording's silence is the triage's none state");
    assertNone(SURFACE.sanitizerPanel(NO_WARNING));
    // The word `none` is the state's name, not a certificate: it renders its own sentence.
    const surface = SURFACE.sanitizerPanel(NO_WARNING);
    assert.equal(surface.text, [surface.message, "the absence of a capture is not a measurement of the page"].join("\n"));
    // A page with no warning is not a deliberate bypass either: the two absences are different facts.
    assert.notEqual(surface.state, "deliberate", "a page with no warning is not a deliberate bypass");
  });

  it("renders the stripped finding: the components and the time, and no binding it did not carry", () => {
    assert.equal(MEASURED.state, "stripped", "the measured load placed one warning on cycle 2");
    const surface = SURFACE.sanitizerPanel(MEASURED);

    assertStripped(surface, {
      components: COVERING_COMPONENTS,
      at: WARNINGS[1].t,
      binding: null,
    });

    // The whole pane, in the order the fact list carries it: the unattributable warning first, then
    // the placed one. The measured record carries no binding, so the pane names none and says so.
    assert.deepEqual(surface.lines, [
      `at ${UNCOVERED_WARNING.t}: no covering record (no-covering-profiler-record)`,
      `component ${COVERING_COMPONENTS[0]}`,
      `component ${COVERING_COMPONENTS[1]}`,
      `cycle ${COVERING_RECORD.cycleId}`,
      `at ${WARNINGS[1].t}`,
    ]);
    assert.match(surface.message, /1 warning placed on a covering record/);
    assert.match(surface.message, /1 warning could not be placed/, "one warning's answer never stands in for another's");
    assert.match(surface.message, /no single binding was carried/, "no binding is invented for the join");
    assert.equal(surface.text, surface.lines.join("\n"), "the pane's text is the rendered lines");
  });

  it("names a binding only when the fact list carries one", () => {
    const surface = SURFACE.sanitizerPanel(WITH_BINDING);
    assertStripped(surface, { components: ["app-card"], at: 2500, binding: "cardHtml" });
    assert.ok(surface.text.includes("binding cardHtml"), "the carried binding reaches the pane");
    assert.match(surface.message, /binding cardHtml/);
  });

  it("renders cannot-tell as the named absence, with no component and never the nearest one", () => {
    assert.equal(UNATTRIBUTABLE.state, "cannot-tell", "the first render's strip has no covering record");
    assertCannotTell(SURFACE.sanitizerPanel(UNATTRIBUTABLE));
    // A warning with no page-clock time is the same absence: no window can cover a time never recorded.
    assertCannotTell(SURFACE.sanitizerPanel({ state: "cannot-tell", findings: [{ state: "cannot-tell", at: null }] }));
    // A finding that arrived carrying a component anyway is still rendered with none: the surface
    // names no component an unattributable warning did not earn.
    assertCannotTell(
      SURFACE.sanitizerPanel({
        state: "cannot-tell",
        findings: [{ state: "cannot-tell", at: 1401, components: ["app-root"], binding: "cardHtml" }],
      }),
    );
  });

  it("reports a bypassSecurityTrust* binding that produced no warning as deliberate", () => {
    assertDeliberate(SURFACE.sanitizerPanel(DELIBERATE), "bypassSecurityTrustHtml");
    assertDeliberate(SURFACE.sanitizerPanel({ deliberate: true, binding: "bypassSecurityTrustUrl" }), "bypassSecurityTrustUrl");
    // A deliberate state that names no vetted bypass is the unreadable case, not a bypass claim.
    assertError(SURFACE.sanitizerPanel({ state: "deliberate", binding: "innerHtml" }));
    assertError(SURFACE.sanitizerPanel({ state: "deliberate" }));
  });

  it("renders the error state when the capture could not be read", () => {
    assertError(SURFACE.sanitizerPanel({ state: "error" }));
    // A capture that arrived with its own reason: the pane does not render it as a cause.
    const surface = SURFACE.sanitizerPanel({ state: "error", reason: "the console tap threw a TypeError" });
    assertError(surface);
    assert.ok(!surface.text.includes("console tap"), `the reason is data, not prose: ${surface.text}`);
    assert.ok(!surface.text.includes("TypeError"), `the reason is data, not prose: ${surface.text}`);
    // Nothing handed over, or something that is not a fact list at all: the capture could not be read.
    assertError(SURFACE.sanitizerPanel());
    assertError(SURFACE.sanitizerPanel(null));
    assertError(SURFACE.sanitizerPanel("no fact list"));
    assertError(SURFACE.sanitizerPanel({}));
    assertError(SURFACE.sanitizerPanel({ state: "something-else" }));
  });

  it("renders six distinct states, each reachable from the fact list it is given", () => {
    const states = [
      SURFACE.sanitizerPanel({ loading: true }),
      SURFACE.sanitizerPanel(NO_WARNING),
      SURFACE.sanitizerPanel(MEASURED),
      SURFACE.sanitizerPanel(UNATTRIBUTABLE),
      SURFACE.sanitizerPanel(DELIBERATE),
      SURFACE.sanitizerPanel({ state: "error" }),
    ].map((surface) => surface.state);
    assert.deepEqual(states, ["loading", "none", "stripped", "cannot-tell", "deliberate", "error"]);
    // No two states share a sentence: each pane's message is its own.
    const messages = new Set(
      [
        SURFACE.sanitizerPanel({ loading: true }),
        SURFACE.sanitizerPanel(NO_WARNING),
        SURFACE.sanitizerPanel(MEASURED),
        SURFACE.sanitizerPanel(UNATTRIBUTABLE),
        SURFACE.sanitizerPanel(DELIBERATE),
        SURFACE.sanitizerPanel({ state: "error" }),
      ].map((surface) => surface.message),
    );
    assert.equal(messages.size, 6, "six states, six sentences, none borrowed");
  });

  it("names no tag, attribute, removed substring or cause in any state", () => {
    const surfaces = [
      SURFACE.sanitizerPanel({ loading: true }),
      SURFACE.sanitizerPanel(NO_WARNING),
      SURFACE.sanitizerPanel(MEASURED),
      SURFACE.sanitizerPanel(UNATTRIBUTABLE),
      SURFACE.sanitizerPanel(DELIBERATE),
      SURFACE.sanitizerPanel({ state: "error" }),
      // A fact list carrying all four of the things no pane may name: none of them gets through.
      SURFACE.sanitizerPanel(WITH_EXTRAS),
    ];
    for (const surface of surfaces) assertNothingUnsupported(surface);
    const extras = SURFACE.sanitizerPanel(WITH_EXTRAS);
    for (const leaked of ["div", "innerHtml", "onerror", "some content", "untrusted"]) {
      assert.ok(
        !`${extras.message}\n${extras.text}`.toLowerCase().includes(leaked.toLowerCase()),
        `the fact list's ${leaked} must not reach the pane: ${extras.text}`,
      );
    }
    assert.ok(extras.text.includes("component app-card"), "the finding itself still renders");
  });

  it("renders the same text twice and does not write to the fact list it is handed", () => {
    const list = JSON.parse(JSON.stringify(MEASURED));
    const snapshot = JSON.parse(JSON.stringify(list));
    const once = SURFACE.sanitizerPanel(list);
    const twice = SURFACE.sanitizerPanel(JSON.parse(JSON.stringify(MEASURED)));
    assert.deepEqual(once, twice, "two calls over equal fact lists must render byte-identically");
    assert.deepEqual(list, snapshot, "rendering a fact list must not write to it");
    assert.deepEqual(
      Object.keys(once).sort(),
      ["binding", "findings", "kind", "lines", "message", "state", "text"],
      "the stripped state carries the finding and no field that reads as a cause",
    );
  });
});

// ---------------------------------------------------------------------------
// The mutants
// ---------------------------------------------------------------------------

describe("the mutants each redden the pin they must", () => {
  it("M1 — naming a stripped tag reddens the no-tag/no-attribute pin", async (t) => {
    const mutant = await loadMutant(
      "  const lines = finding.components.map((name) => `component ${name}`);",
      '  const lines = ["tag div", ...finding.components.map((name) => `component ${name}`)];',
    );
    const failure = reddens(
      () => assertNothingUnsupported(mutant.sanitizerPanel(MEASURED)),
      "the no-tag/no-attribute pin",
    );
    t.diagnostic(`M1 tag in the stripped pane failure: ${failure.message}`);
    // The untouched module still passes the same pin, so the pin is what M1 reddened.
    assertNothingUnsupported(SURFACE.sanitizerPanel(MEASURED));
  });

  it("M2 — a blank cannot-tell pane reddens the absence pin", async (t) => {
    const mutant = await loadMutant(
      "    ...pane(CANNOT_TELL_MESSAGE, lines),",
      "    ...pane('', []),",
    );
    const failure = reddens(
      () => assertCannotTell(mutant.sanitizerPanel(UNATTRIBUTABLE)),
      "the absence pin",
    );
    t.diagnostic(`M2 blank cannot-tell pane failure: ${failure.message}`);
    assertCannotTell(SURFACE.sanitizerPanel(UNATTRIBUTABLE));
  });

  it("M3 — calling none clean reddens the N3 pin", async (t) => {
    const mutant = await loadMutant(
      "'none: no sanitizer warning was captured for this page'",
      "'none: the page is clean'",
    );
    const failure = reddens(() => assertNone(mutant.sanitizerPanel(NO_WARNING)), "the N3 pin");
    t.diagnostic(`M3 none reported as clean failure: ${failure.message}`);
    assertNone(SURFACE.sanitizerPanel(NO_WARNING));
  });
});
