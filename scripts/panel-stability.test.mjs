// Tests for apps/angular-ai-devtools/src/app/panel-stability.ts — the display half of M043 T003
// (INTENT.md SC5, held-out E9; prohibitions N2, N3, N4, N5). The join itself is
// `extension/stability-narrator.js` (T002, landed `e4421832`), and this suite runs that join over
// records built from T001's recording (`research/raw/m043-stability.json`) and feeds its answers
// straight into the pane, so the two halves are pinned against each other rather than against a
// hand-written copy of an answer.
//
// The fixture is the recording, and it is read, never written. The sections it measured are the
// subjects this pane is written for:
//
//   record.frame        `isStable` emitted `true` at 1008 with the page's attach reading at 1001, so
//                       the answer is `stable` with a settle reading 7 ms after attach.
//   record.snapshot     the initial snapshot's `isStable` emitted `false` at 1001 and no settle
//                       reading was observed, so the answer is `unstable` with `no-settle-observed`.
//   record.silentFrame  a reachable stream that emitted nothing: `idle`, no reading, no settle.
//   record.absentFrame  a page whose records carry no `ApplicationRef`: `cannot-tell` with
//                       `no-stability-observable`.
//   repeats             one frame's own `events`: two `TemplateUpdate` pairs over `app-root` and two
//                       `ChangeDetection` pairs carrying no instance at all.
//   transition.alreadyStableAtAttach
//                       the one measured `0`: the subject that was already stable at attach settled
//                       at its own attach reading, which is a reading and not a clock.
//
// The pane's job is separation (SC5). The answer's three readings become their own blocks — the state
// and its emission, the settle reading or its named absence, the repeated work — and each block
// renders its own text and no other block's (N5: no block is anything but one of the three readings or
// one of the four named absences). Every named absence renders in a sentence of its own: asked for a
// cause, an outstanding item, an owner or a first item to settle, the pane states the absence and
// never an empty list, a dash or a count (E9, N4).
//
// A page the pane has no stability answer for renders `no-stability-observable` — never an empty
// table, never an em dash — and a state word the pane was not written for is rendered as the word it
// was given. Nothing here is derived: the pane reads no clock, subtracts no readings and touches no
// DOM, which is measured in its source as well as in its answers (N1, N2).
//
// Every criterion is proven non-vacuously: the pin runs against the untouched module first, then the
// same pin runs against a copy of the module source carrying one anchored mutation which is asserted
// to exhibit the defect the pin hunts, and it must redden with a failure message that names the
// defect by string. A mutant that survives its pin, or reddens with a message that does not name the
// defect, fails this suite.
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-stability.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/stability-narrator.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m043-stability.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------------ measured fixture ----

/** The recording's own `stability` sections, each a subject this pane is written for. */
const SECTION = {
  settled: RECORDING.record.frame,
  snapshot: RECORDING.record.snapshot,
  silent: RECORDING.record.silentFrame,
  absent: RECORDING.record.absentFrame,
  afterReset: RECORDING.record.afterReset,
};

/**
 * The frame's own `events` list, rebuilt from the four pairs the recording counts. `frameKeys` holds
 * the recorded labels in arrival order; each pair's entries alternate start and end in the order the
 * recording measured (`checkRowEvents` is start, end, start, end), so every pair yields exactly the
 * `starts` passes the recording counts; the component each pair was attributed to is the one the
 * recording measured — `app-root` for `TemplateUpdate`, and none at all for `ChangeDetection`.
 */
function recordedEvents() {
  const seen = new Map();
  const events = [];
  for (const pair of RECORDING.repeats.frameKeys) {
    const index = seen.get(pair) ?? 0;
    seen.set(pair, index + 1);
    const attributed =
      pair === RECORDING.repeats.templateUpdate.pair
        ? (RECORDING.repeats.templateUpdate.componentNames[0] ?? null)
        : null;
    events.push({
      pair,
      end: index % 2 === 1,
      at: null,
      componentName: attributed,
    });
  }
  return events;
}

/** The frame the recording measured, in the shape the page agent dispatches it. */
function recordedFrame() {
  return { stability: SECTION.settled, events: recordedEvents() };
}

/** One subject's record: its own `stability` section beside the same frame's `events`. */
function recordOf(section, events = recordedEvents()) {
  return { stability: section, events };
}

/**
 * The page the recording measured as already stable at attach: it settled *at* its attach reading,
 * so its interval is a measured `0`. Both readings are the recording's — `attachAt` from the snapshot
 * it took at attach, `settle.at` from the same subject's own settle reading.
 */
function stableAtAttach() {
  const attachAt = SECTION.snapshot.attachAt;
  const at = RECORDING.transition.alreadyStableAtAttach.settle.at;
  return recordOf({
    reachedBy: SECTION.settled.reachedBy,
    absence: null,
    attachAt,
    reading: { value: true, at },
    settle: { state: 'settled', at },
    version: SECTION.settled.version,
    coreVersion: SECTION.settled.coreVersion,
  });
}

/** A frame that recorded no paired work at all: readable, empty, and not a count of zero. */
function frameWithNoPairedWork() {
  return recordOf(SECTION.settled, []);
}

// --------------------------------------------------------------------------- the join ----

/** `extension/stability-narrator.js` run in a bare context, publishing its own namespace. */
function joinApi() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiStabilityNarrator;
  assert.ok(api, 'extension/stability-narrator.js must publish its namespace');
  assert.equal(typeof api.stability, 'function');
  return api;
}

const JOIN = joinApi();

/** A value from the vm context carries that context's own prototypes, so it is copied here first. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The join's own answer for one record, copied into this realm. */
function answerOf(record) {
  return clone(JOIN.stability(record));
}

/** The words the join publishes, read from the join rather than restated here. */
const STABLE = JOIN.STABLE;
const UNSTABLE = JOIN.UNSTABLE;
const CANNOT_TELL = JOIN.CANNOT_TELL;
const IDLE = JOIN.IDLE;
const SETTLED = JOIN.SETTLED;
const NO_SETTLE_OBSERVED = JOIN.NO_SETTLE_OBSERVED;
const NO_STABILITY_OBSERVABLE = JOIN.NO_STABILITY_OBSERVABLE;
const NO_CAUSE_REPORTED = JOIN.NO_CAUSE_REPORTED;
const NO_OUTSTANDING_INVENTORY = JOIN.NO_OUTSTANDING_INVENTORY;
const NO_SETTLE_ORDER = JOIN.NO_SETTLE_ORDER;

// ---------------------------------------------------------------------- mutant plumbing ----

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the surface source with one anchored replacement applied, and the source beside it. The
 * anchor must occur exactly once, so a mutation cannot silently rewrite a different branch, and the
 * result must differ from the source, so a no-op mutation is a failure rather than a green mutant.
 */
async function loadMutant(anchor, replacement) {
  assert.ok(
    SURFACE_SRC.includes(anchor),
    `mutation anchor not found in panel-stability.ts: ${JSON.stringify(anchor)}`,
  );
  assert.equal(
    SURFACE_SRC.split(anchor).length - 1,
    1,
    `mutation anchor must occur exactly once: ${JSON.stringify(anchor)}`,
  );
  const source = SURFACE_SRC.replace(anchor, () => replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `the mutation must change the source: ${JSON.stringify(anchor)}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-stability-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return { module: await import(pathToFileURL(file).href), source };
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/**
 * Three phases of a non-vacuous pin, with the untouched module's pass asserted by the caller: the
 * mutated copy is run through the same pin, the pin reddens, and the failure names the defect.
 */
function reddens(name, render) {
  let failure = null;
  try {
    render();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${name}: the mutated copy must redden the pin`,
  );
  assert.match(
    failure.message,
    new RegExp(name),
    `${name}: the pin must fail by name, got: ${failure.message}`,
  );
  console.log(
    `mutant ${name} reddens: ${failure.message.replace(/\s+/g, ' ').trim()}`,
  );
  return failure;
}

// ------------------------------------------------------------- the pane's own answer ----

/** The reading blocks, in the order the pane hands them over. */
const READING_KINDS = ['state', 'settle', 'repeats'];

/** The block of one kind, or a named failure: a surface without it has lost a reading (N5). */
function blockOf(surface, kind) {
  const block = surface.blocks.find((candidate) => candidate.kind === kind);
  assert.ok(
    block,
    `three-blocks: the pane must render a ${kind} block; it rendered ${JSON.stringify(
      surface.blocks.map((candidate) => candidate.kind),
    )}`,
  );
  return block;
}

/**
 * SC5/N5: the three readings are three blocks in a fixed order, and every other block is one of the
 * four named absences — no editorial block, no count, no column of anything else.
 */
function pinThreeBlocks(surface, answer) {
  const kinds = surface.blocks.map((block) => block.kind);
  assert.ok(
    kinds.length >= 3,
    `three-blocks: the pane renders the state, the settle reading and the repeated work as three blocks; it rendered ${JSON.stringify(kinds)}`,
  );
  assert.deepEqual(
    kinds.slice(0, 3),
    READING_KINDS,
    `three-blocks: the three readings come first, in the order state, settle, repeats; the pane rendered ${JSON.stringify(kinds)}`,
  );
  const carried = [answer.absence, ...answer.absences].filter(
    (absence) => typeof absence === 'string',
  );
  for (const kind of kinds.slice(3)) {
    assert.ok(
      SURFACE.ABSENCES.includes(kind),
      `three-blocks: a block past the three readings must be one of the four named absences; the pane rendered ${JSON.stringify(kind)}`,
    );
    assert.ok(
      carried.includes(kind),
      `three-blocks: the pane rendered ${JSON.stringify(kind)}, which the answer did not carry (${JSON.stringify(carried)})`,
    );
  }
  for (const kind of READING_KINDS) {
    assert.equal(
      kinds.filter((candidate) => candidate === kind).length,
      1,
      `three-blocks: exactly one ${kind} block; the pane rendered ${JSON.stringify(kinds)}`,
    );
  }
}

/**
 * SC1/N1: each state renders its own text and no other's. The cell the answer's state owns holds the
 * sentence its block prints, no other state's sentence reaches the pane, and the emission line is the
 * answer's own reading — printed only where the answer carried one, so a silent stream prints no time
 * and no value at all.
 */
function pinStateOwnText(surface, answer) {
  assert.equal(
    surface.state,
    answer.state,
    `state-own-text: the pane reports the state the answer carried (${answer.state}); it reported ${surface.state}`,
  );
  assert.equal(
    surface.kind,
    answer.state,
    'state-own-text: the kind is the word',
  );
  const block = blockOf(surface, 'state');
  assert.equal(
    block.state,
    answer.state,
    `state-own-text: the state block carries the answer's own word (${answer.state}); it carried ${block.state}`,
  );
  assert.equal(
    block.lines[0],
    `state: ${answer.state}`,
    `state-own-text: the block prints the word it was given; it printed ${JSON.stringify(block.lines[0])}`,
  );
  assert.ok(
    block.lines.length >= 2,
    `state-own-text: the block prints the state's own sentence; it printed ${JSON.stringify(block.lines)}`,
  );
  const sentence = block.lines[1];
  assert.equal(
    surface.cells[answer.state],
    sentence,
    `state-own-text: the ${answer.state} cell holds the sentence the ${answer.state} block prints; it held ${JSON.stringify(surface.cells[answer.state])}`,
  );
  for (const other of [UNSTABLE, STABLE, CANNOT_TELL, IDLE]) {
    if (other === answer.state) continue;
    assert.equal(
      surface.text.includes(SURFACE.STATE_TEXTS[other]),
      false,
      `state-own-text: the pane answered ${answer.state} and may not print ${other}'s sentence; it printed: ${surface.text}`,
    );
  }
  const emissions = block.lines.filter((line) => line.startsWith('emission: '));
  if (answer.reading === null) {
    assert.deepEqual(
      emissions,
      [],
      `state-own-text: a stream that emitted nothing carries no reading, so the pane prints no emission line; it printed ${JSON.stringify(emissions)}`,
    );
    return;
  }
  assert.equal(
    emissions.length,
    1,
    `state-own-text: the answer carried one emission, so the pane prints one line for it; it printed ${JSON.stringify(emissions)}`,
  );
  assert.equal(
    emissions[0],
    `emission: isStable ${String(answer.reading.value)} at ${answer.reading.at} ms`,
    `state-own-text: the emission line is the answer's own value and reading; the pane printed ${JSON.stringify(emissions[0])}`,
  );
}

/** SC2: the settle reading's own time and interval, printed as the answer carries them. */
function pinSettleReading(surface, answer) {
  const block = blockOf(surface, 'settle');
  assert.equal(
    block.state,
    SETTLED,
    `settle-own-reading: the settle block's own word is ${SETTLED}; it carried ${block.state}`,
  );
  const expected = `settle: settled at ${answer.settle.at} ms, ${answer.settle.sinceAttachMs} ms after attach`;
  assert.deepEqual(
    [...block.lines],
    [expected],
    `settle-own-reading: the block prints the settle time and the interval the answer carried; it printed ${JSON.stringify(block.lines)}`,
  );
  assert.equal(
    surface.cells[SETTLED],
    expected,
    `settle-own-reading: the settled cell holds the reading's own line; it held ${JSON.stringify(surface.cells[SETTLED])}`,
  );
  assert.equal(
    surface.cells[NO_SETTLE_OBSERVED],
    '',
    'settle-own-reading: a settled answer establishes no settle absence, so that cell stays empty',
  );
  assert.equal(
    surface.text.includes(NO_SETTLE_OBSERVED),
    false,
    `settle-own-reading: the answer observed a settle reading, so the pane may not print ${NO_SETTLE_OBSERVED}; it printed: ${surface.text}`,
  );
}

/**
 * SC2/N2/E3: a settle the answer named absent renders that absence with no time and no duration
 * beside it, and the cell that names it is never empty — an absence is a field with a sentence in it,
 * not a blank a reader could read as a missing number.
 */
function pinSettleAbsence(surface, answer) {
  const block = blockOf(surface, 'settle');
  assert.equal(
    block.state,
    NO_SETTLE_OBSERVED,
    `settle-absence: the settle block's own word is ${NO_SETTLE_OBSERVED}; it carried ${block.state}`,
  );
  assert.equal(
    block.lines[0],
    `settle: ${NO_SETTLE_OBSERVED}`,
    `settle-absence: the block names the absence it was given; it printed ${JSON.stringify(block.lines[0])}`,
  );
  assert.ok(
    block.lines.length > 1,
    `settle-absence: the absence renders its own sentence, never a bare word; it printed ${JSON.stringify(block.lines)}`,
  );
  for (const line of block.lines) {
    assert.equal(
      /\d/.test(line),
      false,
      `settle-absence: no time and no duration appear beside an absence the answer named (${NO_SETTLE_OBSERVED}); the pane printed ${JSON.stringify(line)}`,
    );
  }
  const cell = surface.cells[NO_SETTLE_OBSERVED];
  assert.equal(
    typeof cell === 'string' && cell.length > 0,
    true,
    `settle-absence: the ${NO_SETTLE_OBSERVED} cell holds the absence's own sentence, never the empty string; it held ${JSON.stringify(cell)}`,
  );
  assert.equal(
    cell,
    block.lines[1],
    `settle-absence: the cell and the block print the same sentence; the cell held ${JSON.stringify(cell)}`,
  );
  assert.equal(
    surface.cells[SETTLED],
    '',
    'settle-absence: an answer that observed no settle reading establishes no settled cell',
  );
  assert.equal(
    surface.text.includes('settle: settled at'),
    false,
    `settle-absence: the answer observed no settle time, so the pane may print none; it printed: ${surface.text}`,
  );
  assert.equal(
    answer.settle.state,
    NO_SETTLE_OBSERVED,
    'settle-absence: this fixture answer must name the settle absence',
  );
}

/**
 * SC3/N3/AC4: one line per pass the answer carried and nothing beside it — no per-view cycle count,
 * no outstanding-work count, no duration and no settle time — and a frame with no paired work prints
 * the reading it has rather than a zero.
 */
function pinRepeatsOwnLines(surface, answer) {
  const block = blockOf(surface, 'repeats');
  assert.equal(
    block.kind,
    'repeats',
    'repeats-own-lines: the repeated-work block is its own block',
  );
  assert.equal(
    /\b(settle|ms\b|cost|duration|cycles?|outstanding)\b/.test(block.text),
    false,
    `repeats-own-lines: the repeated work is passes and nothing else — no duration, no cycle count, no outstanding count and no column ordered by settle time; the block printed: ${block.text}`,
  );
  if (answer.repeats.length === 0) {
    assert.deepEqual(
      [...block.lines],
      [SURFACE.NO_PAIRED_WORK_TEXT],
      `repeats-own-lines: a frame that recorded no paired work prints the reading it has; it printed ${JSON.stringify(block.lines)}`,
    );
    assert.equal(
      /(^|\D)0(\D|$)/.test(block.text),
      false,
      `repeats-own-lines: no paired work is a reading, never a zero a reader could take for a count; the block printed: ${block.text}`,
    );
    return;
  }
  const expected = answer.repeats.map(
    (repeat) =>
      `${repeat.pair} ${repeat.componentName ?? 'no component'}: ${repeat.passes} ${
        repeat.passes === 1 ? 'pass' : 'passes'
      }`,
  );
  assert.deepEqual(
    [...block.lines],
    expected,
    `repeats-own-lines: one line per pass the answer carried, in its order; the pane printed ${JSON.stringify(block.lines)} for ${JSON.stringify(answer.repeats)}`,
  );
  assert.equal(
    new Set(block.lines).size,
    block.lines.length,
    `repeats-own-lines: no two passes share a line, so no pass is a duplicate of another; the block printed ${JSON.stringify(block.lines)}`,
  );
}

/**
 * SC4/N4/E9: every named absence the answer carried renders in a sentence of its own — its own name,
 * its own statement, and no cause, no task id, no owner, no item count and no order. Asked for a
 * cause, an outstanding item, an owner or a first item to settle, the pane states the absence rather
 * than printing an empty list or a dash.
 */
function pinAbsencesOwnSentence(surface, answer) {
  const carried = [answer.absence, ...answer.absences].filter(
    (absence) => typeof absence === 'string',
  );
  const rendered = surface.blocks.slice(3);
  assert.equal(
    rendered.length,
    new Set(carried).size,
    `absences-own-sentence: one block per named absence the answer carried, once each; the answer carried ${JSON.stringify([...new Set(carried)])} and the pane rendered ${JSON.stringify(rendered.map((block) => block.kind))}`,
  );
  for (const block of rendered) {
    assert.equal(
      block.lines.length,
      1,
      `absences-own-sentence: ${block.kind} renders one sentence of its own; it printed ${JSON.stringify(block.lines)}`,
    );
    const sentence = block.lines[0];
    assert.ok(
      sentence.startsWith(`${block.kind}: `),
      `absences-own-sentence: the ${block.kind} sentence opens with its own name; it read ${JSON.stringify(sentence)}`,
    );
    assert.ok(
      sentence.length > `${block.kind}: `.length,
      `absences-own-sentence: the ${block.kind} sentence states its own fact, and is never an empty list; it read ${JSON.stringify(sentence)}`,
    );
    assert.equal(
      surface.cells[block.kind],
      sentence,
      `absences-own-sentence: the ${block.kind} cell holds that absence's own sentence; it held ${JSON.stringify(surface.cells[block.kind])}`,
    );
  }
  const sentences = rendered.map((block) => block.lines[0]);
  assert.equal(
    new Set(sentences).size,
    sentences.length,
    `absences-own-sentence: no absence borrows another's text; the pane printed ${JSON.stringify(sentences)}`,
  );
  // Not one absence states a cause, a task, an owner, a count or an order.
  const written = sentences.join('\n');
  for (const pattern of [
    /\bthe cause is\b/i,
    /\bcaused by\b/i,
    /\bbecause\b/i,
    /\bdue to\b/i,
    /\btask\s+\d/i,
    /\bowned by\b/i,
    /^owner: /m,
    /^\s*[-*•]\s/m,
    /\b\d+\s+(outstanding|items?|tasks?)\b/i,
    /\b[A-Z][A-Za-z]*Component\b/,
    /app-root/,
  ]) {
    assert.equal(
      pattern.test(written),
      false,
      `absences-own-sentence: an absence names its own absence and nothing beside it — the ${pattern} pattern matched the absence sentences; the pane printed: ${written}`,
    );
  }
  // The four absences stay four different texts, and none of them is a dash or a zero.
  const cells = SURFACE.ABSENCES.map((name) => surface.cells[name]).filter(
    (cell) => typeof cell === 'string' && cell.length > 0,
  );
  assert.equal(
    new Set(cells).size,
    cells.length,
    `absences-own-sentence: no two absences share a text; the pane held ${JSON.stringify(cells)}`,
  );
}

/** SC5/N5: the blocks keep their own text — no block prints another's first line. */
function pinBlocksApart(surface) {
  const texts = surface.blocks.map((block) => block.text);
  assert.equal(
    new Set(texts).size,
    texts.length,
    `blocks-apart: no two blocks may hold the same text, so no block can render another's reading; the pane rendered ${JSON.stringify(surface.blocks.map((block) => [block.kind, block.text]))}`,
  );
  for (const block of surface.blocks) {
    assert.ok(
      block.text.trim() !== '',
      `blocks-apart: every block states something; the ${block.kind} block is blank`,
    );
    for (const line of block.lines) {
      assert.ok(
        line.trim() !== '',
        `blocks-apart: no block prints an empty line; the ${block.kind} block printed ${JSON.stringify(block.lines)}`,
      );
    }
  }
  for (const block of surface.blocks) {
    for (const other of surface.blocks) {
      if (other === block) continue;
      const first = other.lines[0];
      if (first === undefined) continue;
      assert.equal(
        block.lines.includes(first),
        false,
        `blocks-apart: the ${block.kind} block may not print the ${other.kind} block's line ${JSON.stringify(first)}; it printed ${JSON.stringify(block.lines)}`,
      );
    }
  }
  // The flat rendering is every block's lines, in order, and the text is those lines.
  const flat = [];
  for (const block of surface.blocks)
    for (const line of block.lines) flat.push(line);
  assert.deepEqual(
    [...surface.lines],
    flat,
    `blocks-apart: the pane's flat lines are its blocks' lines in order; it printed ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    surface.text,
    flat.join('\n'),
    'blocks-apart: the text is the lines',
  );
}

/** SC4: each cell holds its own word's text, and two cells never hold the same text. */
function pinCellsApart(surface) {
  const held = [];
  for (const name of SURFACE.CELL_NAMES) {
    const cell = surface.cells[name];
    if (typeof cell !== 'string' || cell === '') continue;
    const own =
      cell.startsWith(`${name}: `) ||
      (name === SETTLED && cell.startsWith('settle: settled at '));
    assert.ok(
      own,
      `cells-own-text: the ${name} cell holds ${name}'s own sentence; it held ${JSON.stringify(cell)}`,
    );
    held.push(cell);
  }
  assert.equal(
    new Set(held).size,
    held.length,
    `cells-own-text: no two cells hold the same text; the pane held ${JSON.stringify(held)}`,
  );
}

/** SC5: a page the pane has no stability answer for renders `no-stability-observable`, never a dash. */
function pinNoAnswerNamed(surface) {
  assert.equal(
    surface.state,
    NO_STABILITY_OBSERVABLE,
    `no-stability-observable: a page the pane has no stability answer for renders ${NO_STABILITY_OBSERVABLE}; it rendered ${surface.state}`,
  );
  assert.equal(
    surface.kind,
    NO_STABILITY_OBSERVABLE,
    'no-stability-observable: the kind is the word',
  );
  assert.ok(
    surface.lines.length > 0 && surface.text.trim() !== '',
    `no-stability-observable: never an empty table and never an em dash — the pane states the one absence it can state; it rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.deepEqual(
    surface.blocks.map((block) => block.kind),
    [NO_STABILITY_OBSERVABLE],
    `no-stability-observable: the pane renders the absence in a block of its own, never an empty table; it rendered ${JSON.stringify(surface.blocks.map((block) => block.kind))}`,
  );
  for (const line of surface.lines) {
    assert.equal(
      /^[-–—]+$/.test(line.trim()),
      false,
      `no-stability-observable: never an em dash standing in for an answer; the pane printed ${JSON.stringify(line)}`,
    );
    assert.ok(
      line.trim() !== '',
      `no-stability-observable: never a blank line; the pane printed ${JSON.stringify(surface.lines)}`,
    );
  }
  assert.equal(
    surface.text.includes(`state: ${STABLE}`),
    false,
    `no-stability-observable: a page nobody read is never reported stable; the pane printed: ${surface.text}`,
  );
  assert.equal(
    surface.cells[NO_STABILITY_OBSERVABLE],
    surface.blocks[0].lines[0],
    'no-stability-observable: the cell holds the absence sentence the block prints',
  );
}

/** SC5: a state word the pane was not written for is rendered as the word it was given, and alone. */
function pinGivenState(surface, word) {
  assert.equal(
    surface.state,
    word,
    `given-state-rendered: the word the answer carried, got ${surface.state}`,
  );
  assert.equal(
    surface.kind,
    word,
    'given-state-rendered: the kind is the word',
  );
  assert.deepEqual(
    surface.blocks.map((block) => block.kind),
    ['state'],
    `given-state-rendered: a word the pane was not written for renders no settle reading, no repeated work and no absence sentence; the pane rendered ${JSON.stringify(surface.blocks.map((block) => block.kind))}`,
  );
  assert.deepEqual(
    [...surface.lines],
    [`state: ${word}`],
    `given-state-rendered: the pane prints the word and nothing else; it printed ${JSON.stringify(surface.lines)}`,
  );
  for (const other of [UNSTABLE, STABLE, CANNOT_TELL, IDLE]) {
    assert.equal(
      surface.text.includes(SURFACE.STATE_TEXTS[other]),
      false,
      `given-state-rendered: the pane must not relabel ${word} as ${other}; it printed: ${surface.text}`,
    );
  }
}

/** E8: the same answer rendered twice is byte-identical, and a record is never mistaken for an answer. */
function pinByteIdentical(render) {
  const once = render();
  const twice = render();
  assert.equal(once.text, twice.text, 'byte-identical: the text of two reads');
  assert.deepEqual(
    [...once.lines],
    [...twice.lines],
    'byte-identical: the lines',
  );
  assert.deepEqual(
    once.blocks.map((block) => block.text),
    twice.blocks.map((block) => block.text),
    'byte-identical: the blocks',
  );
}

/** N1, N2, N6: the pane reads no clock, derives no time, joins nothing and touches no DOM. */
function pinDerivesNothing(source) {
  const forbidden = [
    ["the page's attach reading", "['attachAt']"],
    ['a wall clock', 'Date.now('],
    ["the page's clock", 'performance.now('],
    ['a fresh date', 'new Date('],
    ['the document', 'document.'],
    ['a query', 'querySelector'],
    ['a record to join', "['events']"],
    ['the record section', "['stability']"],
  ];
  for (const [what, needle] of forbidden) {
    assert.equal(
      source.includes(needle),
      false,
      `reads-no-derived-value: the pane must not read ${what}; its source names ${needle}`,
    );
  }
  assert.equal(
    /^import\s/m.test(source),
    false,
    'reads-no-derived-value: the pane imports nothing at runtime, so its suite executes it',
  );
}

// -------------------------------------------------------------------------- the cases ----

describe('the measurement this pane renders', () => {
  it('the recording measures the emission, the settle reading, the one measured zero and the passes', () => {
    assert.equal(SECTION.settled.reading.value, true);
    assert.equal(SECTION.settled.reading.at, 1008);
    assert.equal(SECTION.settled.attachAt, 1001);
    assert.equal(SECTION.settled.settle.state, 'settled');
    assert.equal(SECTION.settled.settle.at, 1008);
    assert.equal(SECTION.snapshot.reading.value, false);
    assert.equal(SECTION.silent.reading, null);
    assert.equal(SECTION.absent.absence, NO_STABILITY_OBSERVABLE);
    assert.equal(
      RECORDING.transition.alreadyStableAtAttach.settle.sinceAttachMs,
      0,
      'the recording carries one measured zero: a page already stable at attach settled at its own attach reading',
    );
    assert.equal(RECORDING.repeats.templateUpdate.starts, 2);
    assert.equal(RECORDING.repeats.changeDetection.starts, 2);
    assert.equal(
      RECORDING.repeats.changeDetection.nullComponentNames,
      4,
      'every change-detection entry recorded no component at all',
    );
    console.log(
      `stability fixture: settled ${SECTION.settled.reading.at} ms over attach ${SECTION.settled.attachAt} ms, pairs ${JSON.stringify(RECORDING.repeats.frameKeys)}`,
    );
  });

  it('the join answers each recorded subject the pane is written for', () => {
    assert.equal(answerOf(recordedFrame()).state, STABLE);
    assert.equal(answerOf(recordOf(SECTION.snapshot)).state, UNSTABLE);
    assert.equal(answerOf(recordOf(SECTION.silent)).state, IDLE);
    assert.equal(answerOf(recordOf(SECTION.absent)).state, CANNOT_TELL);
    assert.equal(
      answerOf(recordOf(SECTION.absent)).absence,
      NO_STABILITY_OBSERVABLE,
    );
    assert.equal(
      answerOf(stableAtAttach()).settle.sinceAttachMs,
      0,
      'the page already stable at attach settles at its own attach reading, and 0 is that measurement',
    );
  });
});

describe('the pane renders the join’s answer (SC5, E9)', () => {
  it('AC1: the state, the settle reading and the repeated work as three blocks, apart', () => {
    const answer = answerOf(recordedFrame());
    const surface = SURFACE.stabilityPanel(answer);

    pinThreeBlocks(surface, answer);
    pinStateOwnText(surface, answer);
    pinSettleReading(surface, answer);
    pinRepeatsOwnLines(surface, answer);
    pinAbsencesOwnSentence(surface, answer);
    pinBlocksApart(surface);
    pinCellsApart(surface);

    // The blocks the fixture pins, spelled out, so a reader sees the panel the demo shows.
    assert.deepEqual(
      surface.blocks.map((block) => [block.kind, block.lines]),
      [
        [
          'state',
          [
            `state: ${STABLE}`,
            SURFACE.STATE_TEXTS[STABLE],
            'emission: isStable true at 1008 ms',
          ],
        ],
        ['settle', ['settle: settled at 1008 ms, 7 ms after attach']],
        [
          'repeats',
          [
            'ChangeDetection no component: 2 passes',
            'TemplateUpdate app-root: 2 passes',
          ],
        ],
        [NO_CAUSE_REPORTED, [SURFACE.ABSENCE_TEXTS[NO_CAUSE_REPORTED]]],
        [
          NO_OUTSTANDING_INVENTORY,
          [SURFACE.ABSENCE_TEXTS[NO_OUTSTANDING_INVENTORY]],
        ],
        [NO_SETTLE_ORDER, [SURFACE.ABSENCE_TEXTS[NO_SETTLE_ORDER]]],
      ],
      'the pane renders the state, the settle reading, the repeated work and each absence as their own blocks',
    );
    console.log(`stability blocks: ${JSON.stringify(surface.blocks)}`);
  });

  it('E9: asked for a cause, an outstanding item, an owner or an order, the pane states that absence', () => {
    const answer = answerOf(recordedFrame());
    const surface = SURFACE.stabilityPanel(answer);

    // The four questions a page cannot answer, each with its own sentence and nothing beside it.
    for (const absence of [
      NO_CAUSE_REPORTED,
      NO_OUTSTANDING_INVENTORY,
      NO_SETTLE_ORDER,
    ]) {
      assert.ok(
        answer.absences.includes(absence),
        `every answer carries ${absence}`,
      );
      const sentence = surface.cells[absence];
      assert.equal(
        typeof sentence === 'string' && sentence.length > 0,
        true,
        `E9: ${absence} renders in its own sentence, never an empty list; the pane held ${JSON.stringify(sentence)}`,
      );
      assert.ok(
        surface.lines.includes(sentence),
        `E9: the ${absence} sentence is a line of the pane; the pane printed ${JSON.stringify(surface.lines)}`,
      );
    }
    // A cause is never named, an outstanding item is never listed, an owner is never named and no
    // order is ever claimed — the four answers that would be guesses.
    for (const pattern of [
      /\bthe cause is\b/i,
      /\bcaused by\b/i,
      /\bbecause\b/i,
      /\bdue to\b/i,
      /\btask\s+\d/i,
      /\bowned by\b/i,
      /\bfirst to settle\b/i,
      /\bin that order\b/i,
    ]) {
      assert.equal(
        pattern.test(surface.text),
        false,
        `E9: the pane must not answer ${pattern}; it printed: ${surface.text}`,
      );
    }
    // A dash is not an answer, and neither is an empty list.
    for (const line of surface.lines) {
      assert.notEqual(line.trim(), '');
      assert.equal(/^[-–—]+$/.test(line.trim()), false);
    }
    pinAbsencesOwnSentence(surface, answer);
  });

  it('AC2: each state renders its own text and no other’s', () => {
    const cases = [
      [recordedFrame(), STABLE],
      [recordOf(SECTION.snapshot), UNSTABLE],
      [recordOf(SECTION.silent), IDLE],
      [recordOf(SECTION.absent), CANNOT_TELL],
    ];
    for (const [record, state] of cases) {
      const answer = answerOf(record);
      assert.equal(
        answer.state,
        state,
        'the fixture must answer the state this pin describes',
      );
      const surface = SURFACE.stabilityPanel(answer);
      pinThreeBlocks(surface, answer);
      pinStateOwnText(surface, answer);
      pinBlocksApart(surface);
      pinCellsApart(surface);
      pinAbsencesOwnSentence(surface, answer);
    }
  });

  it('AC3: an absent settle renders its absence with no time and no duration; a measured 0 renders 0', () => {
    // The recording's snapshot emitted `false` and observed no settle reading at all.
    const unstable = answerOf(recordOf(SECTION.snapshot));
    assert.equal(unstable.state, UNSTABLE);
    assert.equal(unstable.settle.state, NO_SETTLE_OBSERVED);
    const absentSurface = SURFACE.stabilityPanel(unstable);
    pinSettleAbsence(absentSurface, unstable);
    pinThreeBlocks(absentSurface, unstable);

    // The page already stable at attach settled at its own attach reading: a measured `0`, printed as
    // a number and never as the absence.
    const zero = answerOf(stableAtAttach());
    assert.equal(zero.settle.state, SETTLED);
    assert.equal(zero.settle.sinceAttachMs, 0);
    const zeroSurface = SURFACE.stabilityPanel(zero);
    pinSettleReading(zeroSurface, zero);
    assert.ok(
      zeroSurface.lines.includes(
        'settle: settled at 1001 ms, 0 ms after attach',
      ),
      `AC3: a measured zero is a measurement and renders 0; the pane printed ${JSON.stringify(zeroSurface.lines)}`,
    );
    assert.equal(
      zeroSurface.text.includes(`settle: ${NO_SETTLE_OBSERVED}`),
      false,
      'AC3: a measured zero is never the settle absence',
    );

    // The pane never re-derives the interval: handed a settle reading whose interval is not the
    // distance between the two readings beside it, it prints the answer's own number.
    const rederived = SURFACE.stabilityPanel({
      state: STABLE,
      absence: null,
      reading: { value: true, at: 1008 },
      settle: { state: SETTLED, at: 1008, sinceAttachMs: 3 },
      repeats: [],
      absences: [],
    });
    assert.ok(
      rederived.lines.includes('settle: settled at 1008 ms, 3 ms after attach'),
      `AC3: the pane prints the interval the answer carried, not one it computed; it printed ${JSON.stringify(rederived.lines)}`,
    );
    assert.equal(
      rederived.text.includes('7 ms after attach'),
      false,
      'AC3: no interval is re-derived from the readings beside it',
    );

    // An answer that carried a settle time but no attach interval prints no interval at all.
    const noAttach = SURFACE.stabilityPanel({
      state: STABLE,
      reading: { value: true, at: 1008 },
      settle: { state: SETTLED, at: 1008 },
      repeats: [],
      absences: [],
    });
    assert.ok(
      noAttach.lines.includes(
        'settle: settled at 1008 ms (the answer carries no attach interval, so none is printed)',
      ),
      `AC3: no interval the answer did not carry is ever printed; the pane printed ${JSON.stringify(noAttach.lines)}`,
    );
    assert.equal(/after attach/.test(noAttach.text), false);
  });

  it('AC4: the repeated work is one line per pass, and a frame with no paired work prints no zero', () => {
    const silent = answerOf(frameWithNoPairedWork());
    assert.deepEqual(
      silent.repeats,
      [],
      'a frame that recorded no paired work reports no pass at all',
    );
    const noWork = SURFACE.stabilityPanel(silent);
    pinRepeatsOwnLines(noWork, silent);
    assert.deepEqual(
      [...blockOf(noWork, 'repeats').lines],
      [SURFACE.NO_PAIRED_WORK_TEXT],
    );

    // A frame with one pair reports one pass; a frame with two reports two, and the pair is what
    // distinguishes them — never a cycle count.
    const one = SURFACE.stabilityPanel({
      state: STABLE,
      reading: { value: true, at: 4 },
      settle: { state: SETTLED, at: 4, sinceAttachMs: 0 },
      repeats: [
        { pair: 'TemplateUpdate', componentName: 'app-root', passes: 1 },
      ],
      absences: [],
    });
    assert.deepEqual(
      [...blockOf(one, 'repeats').lines],
      ['TemplateUpdate app-root: 1 pass'],
    );
    const two = SURFACE.stabilityPanel({
      state: STABLE,
      reading: { value: true, at: 4 },
      settle: { state: SETTLED, at: 4, sinceAttachMs: 0 },
      repeats: [
        { pair: 'TemplateUpdate', componentName: 'app-root', passes: 2 },
        { pair: 'ChangeDetection', componentName: null, passes: 2 },
      ],
      absences: [],
    });
    assert.deepEqual(
      [...blockOf(two, 'repeats').lines],
      [
        'TemplateUpdate app-root: 2 passes',
        'ChangeDetection no component: 2 passes',
      ],
    );
  });

  it('AC2: a page the pane has no stability answer for renders no-stability-observable', () => {
    for (const input of [
      undefined,
      null,
      {},
      [],
      'stability',
      7,
      { loading: true },
      { assembling: true },
      { state: '', absence: null },
    ]) {
      pinNoAnswerNamed(SURFACE.stabilityPanel(input));
    }

    // A record is not an answer: handed the frame the join reads, the pane answers
    // `no-stability-observable` rather than joining it itself.
    pinNoAnswerNamed(SURFACE.stabilityPanel(recordedFrame()));
    pinNoAnswerNamed(
      SURFACE.stabilityPanel({ stability: SECTION.absent, events: [] }),
    );

    // And the joined answer for the page whose records carry no `ApplicationRef` names the same
    // absence, in a block of its own, beside the repeated work the frame still recorded.
    const absent = answerOf(recordOf(SECTION.absent));
    assert.equal(absent.state, CANNOT_TELL);
    const surface = SURFACE.stabilityPanel(absent);
    assert.equal(
      surface.blocks[0].kind,
      'state',
      'cannot-tell is a state the pane was written for: it renders a state block',
    );
    const block = blockOf(surface, NO_STABILITY_OBSERVABLE);
    assert.deepEqual(
      [...block.lines],
      [SURFACE.ABSENCE_TEXTS[NO_STABILITY_OBSERVABLE]],
    );
    assert.equal(
      surface.cells[NO_STABILITY_OBSERVABLE],
      SURFACE.ABSENCE_TEXTS[NO_STABILITY_OBSERVABLE],
    );
    assert.equal(
      surface.text.includes(`state: ${STABLE}`),
      false,
      'a page whose stream was never reached is never stable',
    );
  });

  it('AC2/SC6: never stable on a quiet interval, an empty finding set or the record’s silence', () => {
    for (const record of [
      recordOf(SECTION.silent),
      recordOf(SECTION.absent),
      recordOf(SECTION.absent, []),
    ]) {
      const answer = answerOf(record);
      const surface = SURFACE.stabilityPanel(answer);
      assert.notEqual(
        surface.state,
        STABLE,
        `SC6: the pane may not report stable for a page whose state is ${answer.state}; the answer read ${JSON.stringify(answer)}`,
      );
      assert.equal(
        surface.text.includes(`state: ${STABLE}`),
        false,
        `SC6: silence is never stable; the pane printed: ${surface.text}`,
      );
    }
    // Nothing has arrived: no answer is not a stable page either.
    assert.equal(
      SURFACE.stabilityPanel(undefined).state,
      NO_STABILITY_OBSERVABLE,
    );
  });

  it('AC2: a state the pane was not written for still renders the word it was given', () => {
    pinGivenState(
      SURFACE.stabilityPanel({
        state: 'wedged',
        settle: { state: SETTLED, at: 3, sinceAttachMs: 1 },
        repeats: [
          { pair: 'TemplateUpdate', componentName: 'app-root', passes: 4 },
        ],
        absences: [NO_CAUSE_REPORTED],
      }),
      'wedged',
    );
    // A second word, so the pass-through is a rule rather than one string that happens to work.
    pinGivenState(
      SURFACE.stabilityPanel({ state: 'not-yet-named', repeats: [] }),
      'not-yet-named',
    );
  });

  it('AC3/AC5: the pane derives nothing — no clock, no subtraction, no DOM, no join', () => {
    pinDerivesNothing(SURFACE_SRC);
    assert.equal(
      SURFACE_SRC.includes('- attachAt'),
      false,
      'reads-no-derived-value: the pane subtracts no readings; the join measured the interval',
    );
  });

  it('E8: the same answer rendered twice is byte-identical', () => {
    const answer = answerOf(recordedFrame());
    pinByteIdentical(() => SURFACE.stabilityPanel(answer));

    // The same values in a different key order render the same bytes: nothing here reads an object's
    // own key order, and nothing is accumulated between reads.
    const reordered = {};
    for (const key of Object.keys(answer).reverse())
      reordered[key] = answer[key];
    assert.equal(
      SURFACE.stabilityPanel(reordered).text,
      SURFACE.stabilityPanel(answer).text,
    );
    pinByteIdentical(() => SURFACE.stabilityPanel(answer));
  });

  it('AC5: the pane adds no global stylesheet and no DOM — it is a function and a value', () => {
    for (const needle of [
      'createElement',
      'appendChild',
      'innerHTML',
      'className',
      'style=',
      '@Component',
      'template:',
      'styles:',
    ]) {
      assert.equal(
        SURFACE_SRC.includes(needle),
        false,
        `no-global-css: the pane renders no markup and adds no rule of its own; its source names ${JSON.stringify(needle)}`,
      );
    }
  });
});

describe('panel-stability mutants', () => {
  it('M1: another state’s text in a cell reddens the cell pin, naming it', async () => {
    const mutant = await loadMutant(
      '  cells[read.state] = sentence;',
      "  cells[UNSTABLE] = STATE_TEXTS[STABLE] ?? '';",
    );
    const answer = answerOf(recordedFrame());
    pinStateOwnText(SURFACE.stabilityPanel(answer), answer);
    pinCellsApart(SURFACE.stabilityPanel(answer));
    const surface = mutant.module.stabilityPanel(answer);
    // The mutant really writes the stable sentence into the unstable cell and leaves the stable one
    // empty.
    assert.equal(surface.cells[UNSTABLE], SURFACE.STATE_TEXTS[STABLE]);
    assert.equal(surface.cells[STABLE], '');
    let failure = reddens('cells-own-text', () => pinCellsApart(surface));
    assert.match(
      failure.message,
      /unstable cell holds unstable's own sentence/,
    );
    failure = reddens('state-own-text', () => pinStateOwnText(surface, answer));
    assert.match(failure.message, /stable cell holds the sentence/);
  });

  it('M2: a cause named in prose reddens the absence pin, naming it', async () => {
    const mutant = await loadMutant(
      "'no-cause-reported: isStable is a boolean stream and carries no reason, so no cause is reported'",
      "'no-cause-reported: the cause is the pending router navigation in AppComponent, so no cause is reported'",
    );
    const answer = answerOf(recordedFrame());
    pinAbsencesOwnSentence(SURFACE.stabilityPanel(answer), answer);
    const surface = mutant.module.stabilityPanel(answer);
    assert.ok(
      surface.text.includes('the cause is the pending router navigation'),
      'the mutant really names the cause the page cannot report',
    );
    const failure = reddens('absences-own-sentence', () =>
      pinAbsencesOwnSentence(surface, answer),
    );
    assert.match(failure.message, /the cause is/);
  });

  it('M3: an outstanding item listed reddens the absence pin, naming it', async () => {
    const mutant = await loadMutant(
      "'no-outstanding-inventory: the pending-task set holds bare task ids with no owner, no kind and no count, so no outstanding item is listed'",
      "'no-outstanding-inventory: the outstanding item is task 7, owned by AppComponent, so no further item is listed'",
    );
    const answer = answerOf(recordedFrame());
    pinAbsencesOwnSentence(SURFACE.stabilityPanel(answer), answer);
    const surface = mutant.module.stabilityPanel(answer);
    assert.ok(
      surface.text.includes('task 7') && surface.text.includes('owned by'),
      'the mutant really lists the item and its owner',
    );
    const failure = reddens('absences-own-sentence', () =>
      pinAbsencesOwnSentence(surface, answer),
    );
    assert.match(failure.message, /task\s+\d|owned by/);
  });

  it('M4: the settle absence rendered as an empty field reddens the absence pin, naming it', async () => {
    const mutant = await loadMutant(
      '      cells[NO_SETTLE_OBSERVED] = NO_SETTLE_TEXT;',
      "      cells[NO_SETTLE_OBSERVED] = '';",
    );
    const answer = answerOf(recordOf(SECTION.snapshot));
    pinSettleAbsence(SURFACE.stabilityPanel(answer), answer);
    const surface = mutant.module.stabilityPanel(answer);
    assert.equal(
      surface.cells[NO_SETTLE_OBSERVED],
      '',
      'the mutant really leaves the settle absence as an empty field',
    );
    const failure = reddens('settle-absence', () =>
      pinSettleAbsence(surface, answer),
    );
    assert.match(failure.message, /empty string/);
  });

  it('M5: the repeated-work block omitted reddens the three-block pin, naming it', async () => {
    const mutant = await loadMutant('    repeatsBlock(read.repeats),\n', '');
    const answer = answerOf(recordedFrame());
    pinThreeBlocks(SURFACE.stabilityPanel(answer), answer);
    const surface = mutant.module.stabilityPanel(answer);
    assert.deepEqual(
      surface.blocks.map((block) => block.kind).slice(0, 2),
      ['state', 'settle'],
      'the mutant really drops the repeated-work block',
    );
    const failure = reddens('three-blocks', () =>
      pinThreeBlocks(surface, answer),
    );
    assert.match(failure.message, /state, settle, repeats/);
  });

  it('M6: a wall clock read for the interval reddens the derive pin, naming it', async () => {
    const mutant = await loadMutant(
      "  const since = measured(settle['sinceAttachMs']);",
      "  const since = measured(settle['sinceAttachMs']) ?? Date.now();",
    );
    pinDerivesNothing(SURFACE_SRC);
    const failure = reddens('reads-no-derived-value', () =>
      pinDerivesNothing(mutant.source),
    );
    assert.match(failure.message, /wall clock/);
  });

  it('M7: an interval taken from the settle time itself reddens the settle pin, naming it', async () => {
    const mutant = await loadMutant(
      '      : `settle: settled at ${at} ms, ${since} ms after attach`;',
      '      : `settle: settled at ${at} ms, ${at} ms after attach`;',
    );
    const answer = answerOf(stableAtAttach());
    pinSettleReading(SURFACE.stabilityPanel(answer), answer);
    const surface = mutant.module.stabilityPanel(answer);
    assert.ok(
      surface.text.includes('settle: settled at 1001 ms, 1001 ms after attach'),
      'the mutant really prints the settle time as its own interval',
    );
    const failure = reddens('settle-own-reading', () =>
      pinSettleReading(surface, answer),
    );
    assert.match(failure.message, /interval the answer carried/);
  });

  it('M8: an empty pane for a page nobody read reddens the absence pin, naming it', async () => {
    const mutant = await loadMutant(
      '  return assemble(NO_STABILITY_OBSERVABLE, cells, [\n    absenceBlock(NO_STABILITY_OBSERVABLE),\n  ]);',
      '  return assemble(NO_STABILITY_OBSERVABLE, cells, []);',
    );
    pinNoAnswerNamed(SURFACE.stabilityPanel(undefined));
    const failure = reddens('no-stability-observable', () =>
      pinNoAnswerNamed(mutant.module.stabilityPanel(undefined)),
    );
    assert.match(failure.message, /never an empty table/);
    assert.deepEqual(mutant.module.stabilityPanel(undefined).blocks, []);
  });

  it('M9: stable claimed for a page nobody read reddens the absence pin, naming it', async () => {
    const mutant = await loadMutant(
      '  if (read === null) return noStabilityObservable();',
      [
        '  if (read === null) {',
        '    const silent = emptyCells();',
        "    silent[STABLE] = STATE_TEXTS[STABLE] ?? '';",
        '    return assemble(STABLE, silent, [stateBlock(STABLE, null)]);',
        '  }',
      ].join('\n'),
    );
    pinNoAnswerNamed(SURFACE.stabilityPanel(undefined));
    const failure = reddens('no-stability-observable', () =>
      pinNoAnswerNamed(mutant.module.stabilityPanel(undefined)),
    );
    assert.match(failure.message, /it rendered stable/);
    assert.equal(mutant.module.stabilityPanel(undefined).state, STABLE);
  });
});
