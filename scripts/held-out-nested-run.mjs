// @ts-check
// The nested run a held-out guard drives, and the sentence its red prints about it.
//
// `tests/held-out/e3-zero-skipped.test.mjs` and `tests/held-out/e4-idempotent-checks.test.mjs` each
// spawn `npm test`, which runs the whole gate, which runs `npm run test:held-out`, which runs these
// two suites again. The corpus already carries the marker that bounds that recursion
// (`scripts/held-out-corpus.mjs`), and the two guards used to inherit it only by accident of
// environment. This module owns what both guards and `scripts/held-out-nested-run.test.mjs` share, so
// the bound, the tail and the message cannot drift apart:
//
//   - the marker, the depth arithmetic and the bounded child the guards spawn through;
//   - the last lines of a failing child, so a red names its own failures instead of a number;
//   - the legs of `package.json`'s `test` chain, derived from that script rather than from a list, with
//     what each announced and the evidence of finishing it left, and the first leg that left none;
//   - E3's refusal to run outside an owning corpus, because bounding alone would let a `ℹ skipped 1`
//     behind the cut `test:held-out` leg pass unobserved in the suite whose subject is zero skips;
//   - the source contract the pin enforces over both guard files, so "no threshold widened, no
//     assertion deleted" is a mechanical claim at this head rather than a promise.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Nesting marker. Spelled exactly as `scripts/held-out-corpus.mjs` spells it: a nested corpus run
 * reports the marker and returns 0, because the outer run owns and reports every suite.
 */
export const DEPTH_ENV = 'HELD_OUT_CORPUS_DEPTH';

/** How many lines of a failing child's output a message carries. */
const TAIL_LIMIT = 40;

/** The repository this module ships in, so `package.json` is read beside the module and not the cwd. */
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The corpus runner whose nesting notice the bound is proven by, and whose per-suite refusal of a skip holds behind it. */
const CORPUS_SCRIPT = 'scripts/held-out-corpus.mjs';

/**
 * The evidence a leg of `npm test` is expected to leave, keyed by kind. `pattern` counts occurrences in
 * the run's own output, in order, so a leg is judged by what the output proves rather than by what the
 * chain was supposed to do.
 */
const EVIDENCE = {
  summary: {
    label: 'a node --test `ℹ pass` summary',
    pattern: /ℹ pass (\d+)/g,
  },
  vitest: {
    label: "vitest's own `Tests … passed` line",
    pattern: /Tests\s+(\d+) passed/g,
  },
  corpus: {
    label: "the corpus runner's own `held-out corpus:` line",
    pattern: /held-out corpus:[^\n]*/g,
  },
  unknown: {
    label: 'no summary line this module knows how to look for',
    pattern: null,
  },
};

/**
 * The literals each guard must keep, with the claim a missing or duplicated literal reports. `once`
 * entries must appear exactly once: a second copy means an assertion was duplicated rather than kept,
 * and no copy means it was deleted or widened.
 */
const GUARD_CONTRACTS = {
  e3: {
    literals: [
      {
        text: '/ℹ pass (\\d+)/g',
        claim: 'the block-count regex is `/ℹ pass (\\d+)/g`',
      },
      {
        text: 'passMatches.length >= 3',
        claim: 'the block-count threshold is `passMatches.length >= 3`',
      },
      {
        text: 'totalPass >= 500',
        claim: 'the total-pass threshold is `totalPass >= 500`',
      },
      {
        text: 'E3: expected at least 3 pass summary blocks, got ',
        claim: 'the block-count sentence is kept character for character',
      },
      {
        text: 'E3: no node --test summary lines found',
        claim: 'the no-summary assertion is kept',
      },
      {
        text: 'assert.deepEqual(bad, []',
        claim: 'the zero-skip / zero-todo assertion is kept',
      },
      {
        text: 'timeout: 20 * 60 * 1000',
        claim: 'the nested run keeps its 20-minute timeout',
      },
      {
        text: 'env: boundedChild(env)',
        claim:
          'the nested run is bounded — the spawn environment is `boundedChild(env)`, which sets HELD_OUT_CORPUS_DEPTH to max(parent + 1, 1)',
      },
      {
        text: 'ownerRefusal(env)',
        claim: 'E3 refuses a run no outer corpus owns (`ownerRefusal(env)`)',
      },
      {
        text: 'nestingNotice(childDepth(env))',
        claim:
          'E3 requires the corpus nesting notice for the depth it set (`nestingNotice(childDepth(env))`)',
      },
      {
        text: 'blockCountMessage(',
        claim:
          'the block-count message carries the leg report (`blockCountMessage(`)',
      },
    ],
    counts: [
      {
        text: 'exitStatusMessage(',
        expected: 1,
        claim:
          "the exit-status assertion carries the child's own tail (`exitStatusMessage(`)",
      },
    ],
    order: [
      {
        earlier: 'result.status',
        later: 'passMatches.length >= 3',
        claim: 'the exit-status assertion is evaluated before the block count',
      },
      {
        earlier: 'result.status',
        later: 'totalPass >= 500',
        claim:
          'the exit-status assertion is evaluated before the total pass count',
      },
    ],
  },
  e4: {
    literals: [
      {
        text: '/ℹ pass (\\d+)/g',
        claim: 'the block-count regex is `/ℹ pass (\\d+)/g`',
      },
      {
        text: 'passCount(out1) > 0',
        claim: 'the first run keeps its non-zero pass floor',
      },
      {
        text: 'passCount(out2) > 0',
        claim: 'the second run keeps its non-zero pass floor',
      },
      {
        text: 'E4: pass counts differ between runs',
        claim: 'the pass-count idempotence claim is kept',
      },
      {
        text: 'E4: tracked files changed during first run',
        claim: 'the first run keeps its worktree claim',
      },
      {
        text: 'E4: tracked files changed during second run',
        claim: 'the second run keeps its worktree claim',
      },
      {
        text: 'E4: baseline git status changed between runs',
        claim: 'the runs keep their shared-baseline claim',
      },
      {
        text: 'timeout: 20 * 60 * 1000',
        claim: 'the nested runs keep their 20-minute timeout',
      },
      {
        text: 'env: boundedChild(env)',
        claim:
          'the nested runs are bounded — the spawn environment is `boundedChild(env)`, which sets HELD_OUT_CORPUS_DEPTH to max(parent + 1, 1)',
      },
    ],
    counts: [
      {
        text: 'exitStatusMessage(',
        expected: 4,
        claim:
          "each of the four status assertions carries its child's own tail (`exitStatusMessage(`)",
      },
    ],
    order: [],
  },
};

/**
 * The `scripts` map from the `package.json` beside this module. A missing or unreadable file yields an
 * empty map, which makes the leg report say it derived nothing rather than fail the guard it serves.
 * @returns {Record<string, string>}
 */
function readScripts() {
  try {
    const parsed = JSON.parse(
      readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'),
    );
    const scripts = parsed?.scripts;
    return scripts && typeof scripts === 'object' ? scripts : {};
  } catch {
    return {};
  }
}

/**
 * The `test` script of the `package.json` beside this module, or an empty string when it is unreadable.
 * @returns {string}
 */
function defaultTestScript() {
  const test = readScripts().test;
  return typeof test === 'string' ? test : '';
}

/**
 * The depth `env` states, as an integer. Absent, unreadable or non-positive markers all read as 0: an
 * unbounded run is the absence the refusal names, never a depth of its own.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [env]
 * @returns {number}
 */
export function parentDepth(env = process.env) {
  const depth = Number.parseInt(String(env?.[DEPTH_ENV] ?? ''), 10);
  return Number.isFinite(depth) && depth > 0 ? depth : 0;
}

/**
 * The depth a bounded child is given: `max(parentDepth(env) + 1, 1)`, the same arithmetic
 * `scripts/held-out-corpus.mjs` applies to its own children.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [env]
 * @returns {number}
 */
export function childDepth(env = process.env) {
  return Math.max(parentDepth(env) + 1, 1);
}

/**
 * A copy of `env` carrying the marker set to `childDepth(env)`. The argument is never mutated, and a
 * depth already present is never lowered: the child is always one step deeper than its parent.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [env]
 * @returns {NodeJS.ProcessEnv}
 */
export function boundedChild(env = process.env) {
  return { ...env, [DEPTH_ENV]: String(childDepth(env)) };
}

/**
 * The corpus runner's own nesting line for `depth`, as the substring a guard looks for in its nested
 * output. The pin holds this string to the words `scripts/held-out-corpus.mjs` actually prints.
 * @param {number} depth
 * @returns {string}
 */
export function nestingNotice(depth) {
  return (
    `held-out corpus: nested run (${DEPTH_ENV}=${depth}) — the outer corpus run owns and reports ` +
    'these suites, so nothing is re-run here'
  );
}

/**
 * Null when an outer corpus owns this run, otherwise the text E3 refuses with. The refusal names the
 * marker, the bound and the corpus runner: bounding alone would cut the `test:held-out` leg and let a
 * real skip behind it pass unobserved, so a run no corpus owns is refused rather than bounded.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [env]
 * @returns {string | null}
 */
export function ownerRefusal(env = process.env) {
  const depth = parentDepth(env);
  if (depth > 0) return null;
  return (
    `E3: refuses a run no outer corpus owns — ${DEPTH_ENV} is absent or 0, so the nested run cannot be ` +
    `bounded at max(parent + 1, 1) and the held-out suite behind the test:held-out leg could skip unobserved. ` +
    `Run this guard under ${CORPUS_SCRIPT} (npm run test:held-out), which owns the corpus and sets ` +
    `${DEPTH_ENV} for every suite it runs.`
  );
}

/**
 * The last `limit` lines of a child's output, with a marker naming how many earlier lines were dropped.
 * Output shorter than the limit is returned unchanged.
 * @param {string | null | undefined} output
 * @param {number} [limit]
 * @returns {string}
 */
export function tailLines(output, limit = TAIL_LIMIT) {
  const lines = String(output ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n');
  if (lines.length <= limit) return lines.join('\n');
  const dropped = lines.length - limit;
  return `... ${dropped} earlier line(s) omitted ...\n${lines.slice(-limit).join('\n')}`;
}

/**
 * The message a status assertion carries: `label`, the child's exit status and signal, then the tail of
 * its output. `label` is the guard's own sentence and it stays the message's first line, so a red is
 * still greppable by the sentence the blocked build recorded.
 * @param {string} label
 * @param {{ status?: number | null, signal?: string | null } | null | undefined} result
 * @param {string | null | undefined} output
 * @returns {string}
 */
export function exitStatusMessage(label, result, output) {
  const status = result?.status ?? null;
  const signal = result?.signal ?? null;
  const head = `${label} exited ${status}${signal ? ` on signal ${signal}` : ''}`;
  return `${head}\n${tailLines(output)}`;
}

/**
 * The evidence kind a leg's command is expected to leave, resolved through `npm run` so the answer
 * comes from `package.json` rather than from a list this module would have to keep in step.
 * @param {string} command
 * @param {Record<string, string>} scripts
 * @param {number} [depth]
 * @returns {keyof typeof EVIDENCE}
 */
function evidenceKind(command, scripts, depth = 0) {
  const text = String(command).trim();
  const npmRun = /^npm run ([\w:.-]+)$/.exec(text);
  if (npmRun && depth < 4) {
    const expanded = scripts[npmRun[1]];
    if (typeof expanded === 'string') {
      return evidenceKind(expanded, scripts, depth + 1);
    }
    return 'unknown';
  }
  if (text.includes(CORPUS_SCRIPT)) return 'corpus';
  if (/\bnx\s+run\b/.test(text)) return 'vitest';
  if (/\s--test\b/.test(text)) return 'summary';
  // A repo script that re-enters `node --test` with inherited stdio leaves that run's summary. Asked of
  // the script's own text, so a wrapper that stops running tests stops being counted as one.
  const nodeScript = /^\S*node\S*\s+["']?([^\s"']+\.mjs)["']?$/.exec(text);
  if (nodeScript) {
    try {
      if (
        readFileSync(join(REPO_ROOT, nodeScript[1]), 'utf8').includes('--test')
      ) {
        return 'summary';
      }
    } catch {
      return 'unknown';
    }
  }
  return 'unknown';
}

/**
 * The legs of the `test` script, in chain order, each with its index, its command and the evidence it is
 * expected to leave. Derived by splitting the script on `&&`, so a chain that gains or loses a leg
 * changes this list instead of describing a chain that no longer exists.
 * @param {string} [testScript]
 * @returns {{ index: number, command: string, evidence: keyof typeof EVIDENCE, expected: string }[]}
 */
export function nestedLegs(testScript = defaultTestScript()) {
  const scripts = readScripts();
  return String(testScript ?? '')
    .split('&&')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((command, position) => {
      const evidence = evidenceKind(command, scripts);
      return {
        index: position + 1,
        command,
        evidence,
        expected: EVIDENCE[evidence].label,
      };
    });
}

/**
 * The `npm notice run …` line that announced `command`, or null. npm announces a whole chain once, so a
 * leg inside a compound announcement is announced by it: the announcement says the chain started, and
 * the evidence column says how far it got.
 * @param {string} output
 * @param {string} command
 * @returns {string | null}
 */
function announcementFor(output, command) {
  const notices = [...output.matchAll(/npm notice run ([^\n]+)/g)].map(
    (match) => match[1].trim(),
  );
  const normalized = command.replace(/\s+/g, ' ').trim();
  for (const notice of notices) {
    const candidate = notice.replace(/\s+/g, ' ').trim();
    if (candidate === normalized) return notice;
    if (
      candidate.includes('&&') &&
      candidate.split('&&').some((leg) => leg.trim() === normalized)
    ) {
      return notice;
    }
  }
  return null;
}

/**
 * The legs of `testScript` judged against a run's own output: what each announced, the summary or other
 * evidence it left, and the first leg that left none. Evidence is taken from the output in chain order,
 * so a leg is credited only with a summary the run actually printed before the next leg's.
 * @param {string | null | undefined} output
 * @param {string} [testScript]
 * @returns {{
 *   legs: { index: number, command: string, expected: string, announced: string | null, left: string | null }[],
 *   firstMissing: { index: number, command: string, expected: string } | null,
 *   text: string,
 * }}
 */
export function legReport(output, testScript = defaultTestScript()) {
  const text = String(output ?? '');
  const legs = nestedLegs(testScript);
  /** @type {Record<string, string[]>} */
  const pools = {};
  /** @type {Record<string, number>} */
  const taken = {};
  for (const [kind, spec] of Object.entries(EVIDENCE)) {
    if (spec.pattern === null) continue;
    pools[kind] = [...text.matchAll(spec.pattern)].map((match) =>
      match[0].trim(),
    );
    taken[kind] = 0;
  }
  const judged = legs.map((leg) => {
    const pool = pools[leg.evidence] ?? [];
    const served = taken[leg.evidence] ?? 0;
    const left = pool[served] ?? null;
    if (left !== null) taken[leg.evidence] = served + 1;
    return {
      index: leg.index,
      command: leg.command,
      expected: leg.expected,
      announced: announcementFor(text, leg.command),
      left,
    };
  });
  const missing = judged.find((leg) => leg.left === null);
  const firstMissing = missing
    ? {
        index: missing.index,
        command: missing.command,
        expected: missing.expected,
      }
    : null;
  return {
    legs: judged,
    firstMissing,
    text: renderLegReport(judged, firstMissing),
  };
}

/**
 * The leg report as lines. Each leg names its command, what announced it and what it left; the first leg
 * that left nothing is marked, so a red names the leg that stopped the chain instead of a count.
 * @param {{ index: number, command: string, expected: string, announced: string | null, left: string | null }[]} legs
 * @param {{ index: number, command: string, expected: string } | null} firstMissing
 * @returns {string}
 */
function renderLegReport(legs, firstMissing) {
  if (legs.length === 0) {
    return '`npm test` legs: none derived from package.json — the test script could not be read';
  }
  const lines = [
    `\`npm test\` legs (${legs.length}), in chain order; announced by: ${announcementsOf(legs)}`,
  ];
  for (const leg of legs) {
    const outcome =
      leg.left === null
        ? `left: nothing (expected ${leg.expected})`
        : `left: ${leg.left}`;
    const stopped =
      firstMissing && firstMissing.index === leg.index
        ? ' ← the first leg that left no evidence — the chain stopped here'
        : '';
    lines.push(
      `  leg ${leg.index}/${legs.length} \`${leg.command}\` — announced: ${
        leg.announced ? 'yes' : 'no'
      }; ${outcome}${stopped}`,
    );
  }
  return lines.join('\n');
}

/**
 * The distinct `npm notice run …` lines the legs were announced by, as one compact summary.
 * @param {{ announced: string | null }[]} legs
 * @returns {string}
 */
function announcementsOf(legs) {
  const seen = [];
  for (const leg of legs) {
    if (leg.announced && !seen.includes(leg.announced))
      seen.push(leg.announced);
  }
  if (seen.length === 0) return 'nothing';
  return seen
    .map(
      (notice) =>
        `\`${notice.length > 80 ? `${notice.slice(0, 77)}...` : notice}\``,
    )
    .join(', ');
}

/**
 * The message a block-count assertion carries: `firstLine` unchanged, then the leg-by-leg report, then
 * the tail. The guard passes its own sentence, so the threshold is never restated here.
 * @param {string} firstLine
 * @param {string | null | undefined} output
 * @param {string} [testScript]
 * @returns {string}
 */
export function blockCountMessage(
  firstLine,
  output,
  testScript = defaultTestScript(),
) {
  const report = legReport(output, testScript);
  return `${firstLine}\n${report.text}\n${tailLines(output)}`;
}

/**
 * How many times `literal` occurs in `source`.
 * @param {string} source
 * @param {string} literal
 * @returns {number}
 */
function countOf(source, literal) {
  return literal.length === 0 ? 0 : source.split(literal).length - 1;
}

/**
 * The problems a guard source has against its contract, as problem strings. Empty means the guard keeps
 * the exact threshold literals and exactly one of each, keeps the `ℹ pass` regex, asserts the exit
 * status ahead of any count, spawns through `boundedChild`, carries the leg report on the block-count
 * message, carries the tail on every status message and — for E3 — refuses an unowned run and requires
 * the nesting notice for the depth it set.
 * @param {string} text
 * @param {'e3' | 'e4'} role
 * @returns {string[]}
 */
export function guardSourceProblems(text, role) {
  const source = String(text ?? '');
  const contract = GUARD_CONTRACTS[/** @type {'e3' | 'e4'} */ (role)] ?? null;
  if (!contract) {
    return [`no guard contract is defined for role '${role}'`];
  }
  /** @type {string[]} */
  const problems = [];
  for (const { text: literal, claim } of contract.literals) {
    const count = countOf(source, literal);
    if (count === 0) {
      problems.push(`${role}: ${claim} — \`${literal}\` is missing`);
    } else if (count > 1) {
      problems.push(
        `${role}: ${claim} — \`${literal}\` appears ${count} times, and exactly one is required`,
      );
    }
  }
  for (const { text: literal, expected, claim } of contract.counts) {
    const count = countOf(source, literal);
    if (count !== expected) {
      problems.push(
        `${role}: ${claim} — \`${literal}\` appears ${count} times, expected ${expected}`,
      );
    }
  }
  for (const { earlier, later, claim } of contract.order) {
    const earlierAt = source.indexOf(earlier);
    const laterAt = source.indexOf(later);
    if (earlierAt === -1) continue; // reported by the literal it belongs to
    if (laterAt !== -1 && earlierAt > laterAt) {
      problems.push(
        `${role}: ${claim} — \`${earlier}\` appears after \`${later}\``,
      );
    }
  }
  return problems;
}

export default {
  DEPTH_ENV,
  parentDepth,
  childDepth,
  boundedChild,
  nestingNotice,
  ownerRefusal,
  tailLines,
  exitStatusMessage,
  nestedLegs,
  legReport,
  blockCountMessage,
  guardSourceProblems,
};
