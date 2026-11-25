// @ts-check
//
// M069 T003 — the token layer's own suite: `apps/angular-ai-devtools/src/styles.css` read as text,
// so the layer cannot decay into a convention again (SC3, SC4).
//
// `scripts/token-baseline.test.mjs` owns the *rendered* reading of the same sheet: it resolves every
// `var()` through the document seam, asserts that a dropped token leaves the property that reads it
// unresolved, that the reduced-motion block restates the motion tokens, and that the motion tokens
// are the only ones nothing consumes. None of that is repeated here. What a rendering cannot see is
// the arithmetic of the text itself — a token spelled twice, a literal creeping back beside a token,
// an exemption list growing to admit it, a rule hoisted above the block that feeds it — so that is
// what this suite pins:
//
//   the block       the sheet opens with one `:root` token block, every custom property the sheet
//                   declares is declared inside a `:root` block, and every token is a
//                   `--ds-<density|color|type|motion>-...` name in one of those four groups.
//   declared once   every token a rule reads is declared exactly once in the block. A token declared
//                   twice reddens naming both of its lines; a rule reading a token no block declares
//                   reddens naming the token, the selector, the property and the line. Two names may
//                   carry one value, which is not a duplicate: the duplicate rule keys on the name,
//                   and a mutant gives two names one value to prove the pin does not confuse the two.
//   the order       the block precedes every rule that reads it. A rule hoisted above the block
//                   reddens naming the rule.
//   the literals    no colour, spacing, type or duration literal is *declared* outside the block,
//                   apart from the three declarations a mutant in `scripts/panel-styles.test.mjs`
//                   anchors. A literal in a comment is not a declaration, and the scan reports the
//                   comment spellings it saw rather than counting them. A fourth literal reddens
//                   naming the selector, the property and the line.
//
// The three declarations that stay literal, each with the reason it stays, and each exemption
// non-vacuous in both directions — an exemption that no longer matches a declaration reddens as
// stale, a literal that no exemption holds reddens as a fourth, and an exemption whose anchor the
// style suite no longer carries reddens as a literal admitted without a reason:
//
//   color: #6b5200;                      mutant M5 substitutes the finding colour for it and expects
//                                        the two states to collide
//   background: #14171c;                 mutant M7 substitutes white for it and expects the dark
//                                        failure to name a white slab
//   font-family: system-ui, sans-serif;  mutant M8 deletes it and expects the pin to stay green, so
//                                        typography is anchored rather than tokenised
//
// The one re-declaration the sheet carries is the reduced-motion `:root`, which restates the three
// motion tokens. That is an exemption of the same kind — declared here with its reason, matched in
// both directions — so a fourth restatement, or one that stopped being made, reddens rather than
// passing as a duplicate or as a gap.
//
// Every mutant is planted on a copy of the sheet held in memory, and every pin is asserted against
// the untouched sheet first, so a pin that is already red cannot be credited with catching anything.
// No file is written by this suite: it is a read.
//
//   node --test scripts/ds-tokens.test.mjs
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const SELF_PATH = fileURLToPath(import.meta.url);

/** The repository root, resolved from this file — never a host-absolute path. */
const ROOT = join(dirname(SELF_PATH), '..');

/** This suite, by the name the census owes its reason row under. */
const SELF_REL = 'scripts/ds-tokens.test.mjs';

/** The one stylesheet this suite reads: the token layer itself. */
const STYLES_REL = 'apps/angular-ai-devtools/src/styles.css';

/** The tree a second stylesheet would appear under, and the directories a scan does not descend. */
const APP_REL = 'apps';
const SKIPPED_DIRS = new Set([
  '.angular',
  '.git',
  'build',
  'coverage',
  'dist',
  'node_modules',
]);

/** The suite whose mutant anchors keep the three literal declarations where they are. */
const ANCHOR_SUITE_REL = 'scripts/panel-styles.test.mjs';

/** The census that owes this suite its reason row, in the same task that adds it. */
const GATE_REL = 'scripts/gate-integrity.test.mjs';

/** The label a rule outside any media block is read under. */
const MEDIA_ALL = 'all';

/** The only selector a token block may carry. */
const ROOT_SELECTOR = ':root';

/** The four groups the layer is organised into, and the name shape a token must carry. */
const TOKEN_GROUPS = ['density', 'color', 'type', 'motion'];
const TOKEN_NAME = /^--ds-(?:density|color|type|motion)-[a-z0-9-]+$/;

/**
 * The three declarations that stay literal, each named by the media context, the selector as
 * authored, the property and the value — the declaration itself, never a search for a string that
 * happens to match — beside the mutant anchor that keeps it, and why tokenising it would be worse
 * than the literal it duplicated.
 */
const LITERAL_EXEMPTIONS = [
  {
    id: 'M5',
    media: MEDIA_ALL,
    selector:
      "section.panel-demo[data-state='cannot-tell'], section.panel-block[data-block-state='cannot-tell']",
    property: 'color',
    value: '#6b5200',
    why: 'the anchor of `scripts/panel-styles.test.mjs` mutant M5, which substitutes the finding state colour for this exact declaration and expects the two state colours to collide; a token here would let one retune keep the mutant green while the state went on looking like a finding',
  },
  {
    id: 'M7',
    media: /prefers-color-scheme\s*:\s*dark/,
    selector: 'body',
    property: 'background',
    value: '#14171c',
    why: 'the anchor of `scripts/panel-styles.test.mjs` mutant M7, which substitutes white for this exact declaration and expects the dark failure to name a white slab; the declaration is the reading that proves the panel is not one',
  },
  {
    id: 'M8',
    media: MEDIA_ALL,
    selector: 'body',
    property: 'font-family',
    value: 'system-ui, sans-serif',
    why: 'the anchor of `scripts/panel-styles.test.mjs` mutant M8, which deletes this declaration and expects the pin to stay green, because Chrome injects a font family into an extension document and typography is not a discriminator; a token would make the deletion a token change and move an anchor that proves a refusal',
  },
];

/**
 * The one re-declaration the sheet may carry: the reduced-motion `:root` restates the three motion
 * tokens, so a reader who asks for less motion is handed the contract instead of the value. Declared
 * here with its reason, matched in both directions, because an exemption list that silently grows is
 * the failure mode this suite exists to prevent.
 */
const RESTATEMENT_EXEMPTIONS = [
  {
    token: '--ds-motion-duration-fast',
    media: /prefers-reduced-motion\s*:\s*reduce/,
    why: 'the reduced-motion block restates the fast duration as `0ms`, which is the whole of what a reader asking for less motion is told',
  },
  {
    token: '--ds-motion-duration-base',
    media: /prefers-reduced-motion\s*:\s*reduce/,
    why: 'the reduced-motion block restates the base duration as `0ms`, beside the fast one, so neither declaration is left with a duration the reader refused',
  },
  {
    token: '--ds-motion-easing-standard',
    media: /prefers-reduced-motion\s*:\s*reduce/,
    why: 'the reduced-motion block restates the easing curve as `linear`, which is the curve that carries no acceleration to remove',
  },
];

/**
 * The shapes a literal value carries, by the family this suite names it under. A colour is a hex
 * spelling, a colour function, one of the sixteen CSS 2.1 colour names or `transparent` — `#ffffff`
 * is what M7 substitutes and `white` is the word the sheet's own comment says it substitutes, so
 * both are shapes the scan has to see. A length is a number with a unit, and `0` is a spacing
 * literal too: the flush token's value is `0`, so a rule that writes `margin: 0` writes it a second
 * time. A type literal is a numeric weight, a unitless leading or a family name. A duration is a
 * time or an easing keyword.
 *
 * `currentcolor` is deliberately in none of them: it names the inherited colour rather than a value,
 * and the state word's rule reads it exactly as the cascade intends.
 */
const LITERAL_FAMILIES = [
  {
    family: 'colour',
    shapes: [
      { shape: 'hex colour', pattern: /#[0-9a-fA-F]{3,8}\b/g },
      {
        shape: 'colour function',
        pattern: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g,
      },
      {
        shape: 'named colour',
        pattern:
          /(?:^|[\s,;(])(?:aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|transparent)\b/g,
      },
    ],
  },
  {
    family: 'spacing',
    shapes: [
      {
        shape: 'length',
        pattern:
          /(?:^|[\s,;(])\d*\.?\d+(?:px|rem|em|ex|ch|pt|pc|in|cm|mm|q|vw|vh|vmin|vmax|%)\b/g,
      },
      { shape: 'zero', pattern: /(?:^|[\s,(])(0)(?=[\s,)]|$)/g },
    ],
  },
  {
    family: 'type',
    shapes: [
      {
        shape: 'numeric weight',
        pattern: /(?:^|[\s,;(])(?:[1-9]00)(?=[\s,;)]|$)/g,
      },
      {
        shape: 'unitless leading',
        pattern: /(?:^|[\s,;(])\d+\.\d+(?=[\s,;)]|$)/g,
      },
      {
        shape: 'font family name',
        pattern:
          /(?:^|[\s,;(])(?:system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|sans-serif|serif|monospace|cursive|fantasy|-apple-system|BlinkMacSystemFont|Helvetica|Arial|Verdana|Tahoma|Roboto|Georgia|Courier)\b/g,
      },
    ],
  },
  {
    family: 'duration',
    shapes: [
      { shape: 'time', pattern: /(?:^|[\s,;(])\d*\.?\d+m?s\b/g },
      {
        shape: 'easing',
        pattern:
          /\b(?:linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)\b|(?:cubic-bezier|steps)\(/g,
      },
    ],
  },
];

// ------------------------------------------------------------------- reading ----

/** @param {string} text @param {number} index @returns {number} */
function lineOfIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

/**
 * A selector as one line, so a rule authored over three lines is named the way a reader would say
 * it and an exemption's selector can be compared with it.
 * @param {string} selector @returns {string}
 */
function oneLine(selector) {
  return selector.replace(/\s+/g, ' ').trim();
}

/**
 * Whether a rule sits in the media context an exemption names.
 * @param {string | RegExp} media @param {string} mediaText @returns {boolean}
 */
function mediaMatches(media, mediaText) {
  return media instanceof RegExp ? media.test(mediaText) : media === mediaText;
}

/**
 * One committed file, as text. A missing file is named with the path a reader can open.
 * @param {string} rel @param {string} why @returns {string}
 */
function readText(rel, why) {
  const path = join(ROOT, ...rel.split('/'));
  assert.ok(existsSync(path), `${rel} is missing - ${why}`);
  return readFileSync(path, 'utf8');
}

/** The stylesheet under pin, read once per run. @returns {string} */
let STYLE_TEXT = null;
function sheet() {
  if (STYLE_TEXT === null) {
    STYLE_TEXT = readText(
      STYLES_REL,
      'the one global stylesheet the panel renders',
    );
  }
  return STYLE_TEXT;
}

/**
 * The sheet with every comment blanked, character for character, and every comment recorded with the
 * lines it spans. Newlines are kept, so an index into the masked text is an index into the sheet; and
 * nothing else of a comment survives, so a value spelled in a comment cannot be read as a declaration
 * — which is the difference between `background: #14171c;` and a note about the colour M7 substitutes.
 * @param {string} css
 * @returns {{ masked: string, comments: Array<{ start: number, line: number, endLine: number, text: string }> }}
 */
function maskComments(css) {
  const characters = css.split('');
  const comments = [];
  for (const match of css.matchAll(/\/\*[\s\S]*?\*\//g)) {
    const start = match.index ?? 0;
    const text = match[0];
    for (let at = start; at < start + text.length; at += 1) {
      if (characters[at] !== '\n') characters[at] = ' ';
    }
    comments.push({
      start,
      line: lineOfIndex(css, start),
      endLine: lineOfIndex(css, start + text.length - 1),
      text,
    });
  }
  const masked = characters.join('');
  assert.ok(
    !masked.includes('/*'),
    `${STYLES_REL} carries a comment this reader could not close, so a literal inside it would be read as a declaration rather than as prose`,
  );
  return { masked, comments };
}

/**
 * One rule body's declarations, as authored: the property, the value text, and the line each begins
 * on. The split respects quotes and parentheses, so a value carrying either is not cut in half.
 * @param {string} masked @param {number} from @param {number} to @param {string} css
 * @param {string} selector
 * @returns {Array<{ property: string, value: string, line: number, at: number }>}
 */
function declarationsOf(masked, from, to, css, selector) {
  const spans = [];
  let start = from;
  let depth = 0;
  let quote = '';
  for (let at = from; at < to; at += 1) {
    const character = masked[at];
    if (quote !== '') {
      if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '(') depth += 1;
    else if (character === ')') depth -= 1;
    else if (character === ';' && depth === 0) {
      spans.push([start, at]);
      start = at + 1;
    }
  }
  spans.push([start, to]);

  const declarations = [];
  for (const [open, close] of spans) {
    const text = masked.slice(open, close);
    const trimmed = text.trim();
    if (trimmed === '') continue;
    const at = open + (text.length - text.trimStart().length);
    const colon = trimmed.indexOf(':');
    assert.ok(
      colon > 0,
      `${STYLES_REL}:${String(lineOfIndex(css, at))}: ${JSON.stringify(trimmed)} under ${JSON.stringify(oneLine(selector))} names no property, so no declaration can be read from it`,
    );
    declarations.push({
      property: trimmed.slice(0, colon).trim(),
      value: trimmed.slice(colon + 1).trim(),
      line: lineOfIndex(css, at),
      at,
    });
  }
  return declarations;
}

/**
 * Every rule the sheet carries, in source order, with the media context it sits in, its selector as
 * authored, the line its selector begins on and its declarations. A nested rule is refused rather
 * than misread: this reader follows `@media` and one level of rule body, and nothing else.
 * @param {string} css
 * @returns {{ masked: string, comments: Array<{ line: number, endLine: number, text: string }>, rules: Array<Record<string, any>> }}
 */
function scanSheet(css) {
  const { masked, comments } = maskComments(css);
  /** @type {Array<Record<string, any>>} */
  const rules = [];

  /** @param {number} from @param {number} to @param {string} media */
  const walk = (from, to, media) => {
    let index = from;
    while (index < to) {
      const open = masked.indexOf('{', index);
      if (open === -1 || open >= to) break;
      const prelude = masked.slice(index, open);
      const selector = oneLine(prelude);
      let depth = 1;
      let cursor = open + 1;
      while (cursor < to && depth > 0) {
        const character = masked[cursor];
        if (character === '{') depth += 1;
        else if (character === '}') depth -= 1;
        cursor += 1;
      }
      assert.equal(
        depth,
        0,
        `${STYLES_REL}:${String(lineOfIndex(css, open))} opens ${JSON.stringify(selector)} and never closes it, so no declaration inside it can be named`,
      );
      const closeAt = cursor - 1;
      const block = /^@media\s+([\s\S]+)$/.exec(selector);
      if (block !== null) {
        walk(open + 1, closeAt, (block[1] ?? '').trim());
      } else {
        assert.notEqual(
          selector,
          '',
          `${STYLES_REL}:${String(lineOfIndex(css, open))} carries a rule with no selector, so no rule can be named`,
        );
        assert.ok(
          !masked.slice(open + 1, closeAt).includes('{'),
          `${STYLES_REL}:${String(lineOfIndex(css, open))} nests a rule inside ${JSON.stringify(selector)}, which this reader does not follow, so its declarations would be read as the outer rule's`,
        );
        const at = index + (prelude.length - prelude.trimStart().length);
        rules.push({
          media,
          selector,
          line: lineOfIndex(css, at),
          at,
          closeAt,
          declarations: declarationsOf(
            masked,
            open + 1,
            closeAt,
            css,
            selector,
          ),
        });
      }
      index = cursor;
    }
    const rest = masked.slice(index, to).trim();
    assert.equal(
      rest,
      '',
      `${STYLES_REL}:${String(lineOfIndex(css, index))}: ${JSON.stringify(rest.slice(0, 60))} sits outside any rule, so the sheet carries text this reader cannot attribute`,
    );
  };

  walk(0, masked.length, MEDIA_ALL);
  return { masked, comments, rules };
}

// -------------------------------------------------------------------- tokens ----

/** The `:root` rules the sheet carries, in source order. @param {Array<Record<string, any>>} rules */
function tokenBlocksOf(rules) {
  return rules.filter((rule) => rule.selector === ROOT_SELECTOR);
}

/**
 * The first `:root` block: the one token block the layer is written in, and the one every reader of
 * a token comes after.
 * @param {Array<Record<string, any>>} rules @returns {Record<string, any>}
 */
function primaryBlockOf(rules) {
  const blocks = tokenBlocksOf(rules);
  assert.ok(
    blocks.length > 0,
    `${STYLES_REL} declares no \`${ROOT_SELECTOR}\` block, so the sheet carries no token layer to pin`,
  );
  return blocks[0];
}

/**
 * The tokens one value reads, in the order it names them.
 * @param {string} value @returns {string[]}
 */
function tokenReads(value) {
  const found = [];
  for (const match of value.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
    const token = match[1];
    if (token !== undefined && !found.includes(token)) found.push(token);
  }
  return found;
}

/**
 * Every custom property the sheet declares, with the rule it sits in and the index of the `:root`
 * block that holds it — `null` when it sits in a rule body, which is where no token belongs.
 * @param {string} css
 * @returns {Array<Record<string, any>>}
 */
function customPropertyEntries(css) {
  const { rules } = scanSheet(css);
  const blocks = tokenBlocksOf(rules);
  /** @type {Array<Record<string, any>>} */
  const entries = [];
  for (const rule of rules) {
    const block = blocks.indexOf(rule);
    for (const declaration of rule.declarations) {
      if (!declaration.property.startsWith('--')) continue;
      entries.push({
        token: declaration.property,
        value: declaration.value,
        line: declaration.line,
        media: rule.media,
        selector: rule.selector,
        block: block === -1 ? null : block,
      });
    }
  }
  return entries;
}

/**
 * The duplicate rule: a token is declared exactly once, and the only re-declarations the sheet may
 * carry are the restatements a declared exemption holds. A second declaration under one name reddens
 * naming both of its lines — the name is what is duplicated, never the value.
 * @param {string} css @returns {string[]}
 */
function duplicateFailures(css) {
  /** @type {Map<string, Array<Record<string, any>>>} */
  const byName = new Map();
  for (const entry of customPropertyEntries(css)) {
    // A custom property in a rule body is not a token declaration at all: that is the
    // outside-the-block pin's defect, and reporting it here would name it twice.
    if (entry.block === null) continue;
    // The reduced-motion restatement is a declared exemption, matched in both directions by
    // `restatementFailures`, so it is not the duplicate this rule refuses.
    if (entry.block !== 0 && isRestatement(entry)) continue;
    byName.set(entry.token, [...(byName.get(entry.token) ?? []), entry]);
  }
  const failures = [];
  for (const [token, list] of byName) {
    if (list.length < 2) continue;
    const where = list
      .map(
        (entry) =>
          `line ${String(entry.line)} as ${JSON.stringify(entry.value)} in ${entry.media === MEDIA_ALL ? 'the token block' : JSON.stringify(entry.media)}`,
      )
      .join(' and ');
    failures.push(
      `${STYLES_REL}: the token \`${token}\` is declared ${String(list.length)} times, at ${where} — a token is declared exactly once, so a second spelling is a value the cascade takes instead of the first and no reader can tell which one the layer means`,
    );
  }
  return failures;
}

/**
 * Whether a declaration outside the first `:root` block is one the reduced-motion exemption holds.
 * @param {Record<string, any>} entry @returns {boolean}
 */
function isRestatement(entry) {
  return RESTATEMENT_EXEMPTIONS.some(
    (one) => one.token === entry.token && mediaMatches(one.media, entry.media),
  );
}

/**
 * The restatement exemption, matched in both directions: every re-declaration outside the block is
 * one a declared exemption holds, and every declared exemption is made exactly once. A second
 * restatement, or one that stopped being made, reddens naming the token.
 * @param {string} css @returns {string[]}
 */
function restatementFailures(css) {
  const failures = [];
  /** @type {Map<string, number>} */
  const matched = new Map(RESTATEMENT_EXEMPTIONS.map((one) => [one.token, 0]));
  for (const entry of customPropertyEntries(css)) {
    if (entry.block === 0) continue;
    if (entry.block === null) continue;
    const exemption = RESTATEMENT_EXEMPTIONS.find(
      (one) =>
        one.token === entry.token && mediaMatches(one.media, entry.media),
    );
    if (exemption === undefined) {
      failures.push(
        `${STYLES_REL}:${String(entry.line)}: \`${entry.token}\` is declared a second time in ${JSON.stringify(entry.media)} as ${JSON.stringify(entry.value)}, and no declared restatement holds it — the only re-declarations this sheet may carry are the three the reduced-motion block makes, each with its reason`,
      );
      continue;
    }
    matched.set(exemption.token, (matched.get(exemption.token) ?? 0) + 1);
  }
  for (const exemption of RESTATEMENT_EXEMPTIONS) {
    const count = matched.get(exemption.token) ?? 0;
    if (count === 1) continue;
    failures.push(
      `${STYLES_REL}: the \`${exemption.token}\` restatement is declared ${String(count)} time(s) outside the token block, and it is the exemption for exactly one: ${exemption.why} — a restatement nobody makes is an exemption the duplicate rule no longer needs`,
    );
  }
  return failures;
}

/**
 * The read rule: every token a rule reads is declared in a `:root` block. A read of a name no block
 * declares reddens naming the token, the selector, the property and the line.
 * @param {string} css @returns {string[]}
 */
function readFailures(css) {
  const { rules } = scanSheet(css);
  const blocks = tokenBlocksOf(rules);
  const declared = new Set(
    blocks.flatMap((block) =>
      block.declarations
        .map((declaration) => declaration.property)
        .filter((property) => property.startsWith('--')),
    ),
  );
  const blockLine = blocks.length === 0 ? 0 : (blocks[0]?.line ?? 0);
  const failures = [];
  for (const rule of rules) {
    if (blocks.includes(rule)) continue;
    for (const declaration of rule.declarations) {
      for (const token of tokenReads(declaration.value)) {
        if (declared.has(token)) continue;
        failures.push(
          `${STYLES_REL}:${String(declaration.line)}: \`${declaration.property}\` under ${JSON.stringify(rule.selector)} in ${JSON.stringify(rule.media)} reads \`${token}\`, and no \`${ROOT_SELECTOR}\` block declares it (the block at line ${String(blockLine)} declares ${String(declared.size)} token(s)) — a rule reading a token the block never declares resolves to nothing`,
        );
      }
    }
  }
  return failures;
}

/**
 * The order rule: the token block precedes every rule that reads one. A rule hoisted above the block
 * reddens naming the rule, and a sheet with no block at all reddens naming that.
 * @param {string} css @returns {string[]}
 */
function orderFailures(css) {
  const { rules } = scanSheet(css);
  const blocks = tokenBlocksOf(rules);
  if (blocks.length === 0) {
    return [
      `${STYLES_REL} declares no \`${ROOT_SELECTOR}\` token block, so no rule can read a token the sheet's own block precedes`,
    ];
  }
  const primary = /** @type {Record<string, any>} */ (blocks[0]);
  const failures = [];
  for (const rule of rules) {
    if (blocks.includes(rule)) continue;
    const reads = [
      ...new Set(
        rule.declarations.flatMap((declaration) =>
          tokenReads(declaration.value),
        ),
      ),
    ];
    if (reads.length === 0) continue;
    if (rule.at > primary.closeAt) continue;
    failures.push(
      `${STYLES_REL}:${String(rule.line)}: the rule ${JSON.stringify(rule.selector)} reads ${reads.join(', ')} and begins at line ${String(rule.line)}, before the token block that declares them closes at line ${String(lineOfIndex(css, primary.closeAt))} — the block precedes every rule that reads it`,
    );
  }
  return failures;
}

/**
 * The block rule: every custom property the sheet declares sits inside a `:root` block, so no rule
 * body holds a value only the elements that match it would render.
 * @param {string} css @returns {string[]}
 */
function outsideBlockFailures(css) {
  const failures = [];
  for (const entry of customPropertyEntries(css)) {
    if (entry.block !== null) continue;
    failures.push(
      `${STYLES_REL}:${String(entry.line)}: \`${entry.token}\` is declared inside the rule ${JSON.stringify(entry.selector)} in ${JSON.stringify(entry.media)}, and a token belongs in a \`${ROOT_SELECTOR}\` block — a value declared in a rule body is carried by the elements that match it and by nothing else, which is the drift the block exists to prevent`,
    );
  }
  return failures;
}

/**
 * The token naming rule: every token is a `--ds-<group>-...` name in one of the four groups.
 * @param {string} css @returns {string[]}
 */
function namingFailures(css) {
  const failures = [];
  for (const entry of customPropertyEntries(css)) {
    if (entry.block === null) continue;
    if (TOKEN_NAME.test(entry.token)) continue;
    failures.push(
      `${STYLES_REL}:${String(entry.line)}: the token \`${entry.token}\` is not a \`--ds-<group>-<name>\` name; the four groups are ${TOKEN_GROUPS.join(', ')}, so a reader grouping the layer by prefix would not find this one`,
    );
  }
  return failures;
}

// ------------------------------------------------------------------ literals ----

/**
 * The literal shapes one value carries, each under the family it belongs to and with the offset it
 * begins at, so a spelling inside a comment can be reported by its own line.
 * @param {string} value
 * @returns {Array<{ family: string, shape: string, text: string, at: number }>}
 */
function literalHits(value) {
  /** @type {Array<{ family: string, shape: string, text: string, at: number }>} */
  const hits = [];
  for (const { family, shapes } of LITERAL_FAMILIES) {
    for (const { shape, pattern } of shapes) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(value)) !== null) {
        hits.push({
          family,
          shape,
          text: match[0].trim(),
          at: match.index,
        });
      }
    }
  }
  return hits;
}

/**
 * The literal rule, in both directions: no declaration outside a `:root` block carries a literal any
 * of the four families names, apart from a declared exemption — and every declared exemption matches
 * exactly one declaration, because an exemption that no longer matches is a literal the scan stopped
 * seeing rather than a value that moved.
 * @param {string} css @returns {string[]}
 */
function literalViolations(css) {
  const { rules } = scanSheet(css);
  const blocks = tokenBlocksOf(rules);
  const failures = [];
  /** @type {Map<string, number>} */
  const matched = new Map(LITERAL_EXEMPTIONS.map((one) => [one.id, 0]));
  for (const rule of rules) {
    if (blocks.includes(rule)) continue;
    for (const declaration of rule.declarations) {
      if (declaration.property.startsWith('--')) continue;
      const hits = literalHits(declaration.value);
      if (hits.length === 0) continue;
      const exemption = LITERAL_EXEMPTIONS.find(
        (one) =>
          one.property === declaration.property &&
          one.value === declaration.value &&
          one.selector === rule.selector &&
          mediaMatches(one.media, rule.media),
      );
      if (exemption !== undefined) {
        matched.set(exemption.id, (matched.get(exemption.id) ?? 0) + 1);
        continue;
      }
      const hit =
        /** @type {{ family: string, shape: string, text: string }} */ (
          hits[0]
        );
      failures.push(
        `${STYLES_REL}:${String(declaration.line)}: \`${declaration.property}\` under ${JSON.stringify(rule.selector)} in ${JSON.stringify(rule.media)} declares ${JSON.stringify(declaration.value)}, which carries the ${hit.family} literal ${JSON.stringify(hit.text)} (a ${hit.shape}) — a value the token block declares nowhere, and no declared exemption holds it literal, so it is a value rendered outside the layer`,
      );
    }
  }
  for (const exemption of LITERAL_EXEMPTIONS) {
    const count = matched.get(exemption.id) ?? 0;
    if (count === 1) continue;
    failures.push(
      `${STYLES_REL}: the ${exemption.id} exemption (${exemption.property} ${JSON.stringify(exemption.value)} under ${JSON.stringify(exemption.selector)}) matches ${String(count)} declaration(s) and it is the exemption for exactly one: ${exemption.why} — a stale exemption is a literal the scan no longer sees`,
    );
  }
  return failures;
}

/**
 * The literal spellings the sheet's comments carry, each with the line it sits on — the line the
 * spelling is written on, not the line the comment opened on, so a reader can be sent to the prose
 * itself. They are none of them declarations — a comment emits nothing — and they are reported
 * rather than counted so a reader can see which prose the scan walked past.
 * @param {string} css
 * @returns {Array<{ line: number, family: string, shape: string, text: string }>}
 */
function commentLiterals(css) {
  const { comments } = maskComments(css);
  /** @type {Array<{ line: number, family: string, shape: string, text: string }>} */
  const found = [];
  for (const comment of comments) {
    for (const hit of literalHits(comment.text)) {
      found.push({
        line: lineOfIndex(css, comment.start + hit.at),
        family: hit.family,
        shape: hit.shape,
        text: hit.text,
      });
    }
  }
  return found;
}

/**
 * The exemption's reason, read from the suite that holds the anchor: the declaration text a mutant
 * there matches is what makes the literal a proof rather than a value nobody tokenised. A fourth
 * exemption would have no anchor in that suite, and reddens here.
 * @returns {string[]}
 */
function anchorFailures() {
  const suite = readText(
    ANCHOR_SUITE_REL,
    'the suite whose mutant anchors keep three declarations literal',
  );
  const failures = [];
  for (const exemption of LITERAL_EXEMPTIONS) {
    const anchor = `${exemption.property}: ${exemption.value};`;
    const occurrences = suite.split(`'${anchor}'`).length - 1;
    if (occurrences !== 1) {
      failures.push(
        `${ANCHOR_SUITE_REL}: the ${exemption.id} exemption claims ${JSON.stringify(anchor)} is anchored there, and the suite carries it ${String(occurrences)} time(s) — an exemption is a declaration a mutant holds literal, and one no mutant anchors is a literal admitted without a reason`,
      );
    }
    if (!suite.includes(`name: '${exemption.id} `)) {
      failures.push(
        `${ANCHOR_SUITE_REL} carries no mutant named ${JSON.stringify(exemption.id)}, and the ${exemption.id} exemption cites it as the anchor of its literal`,
      );
    }
  }
  return failures;
}

/**
 * The values more than one token name carries, so the reading the suite reports says that a shared
 * value exists rather than leaving a reader to wonder what a duplicate would look like.
 * @param {string} css
 * @returns {Array<{ value: string, names: string[] }>}
 */
function sharedValues(css) {
  /** @type {Map<string, string[]>} */
  const byValue = new Map();
  for (const entry of customPropertyEntries(css)) {
    if (entry.block !== 0) continue;
    byValue.set(entry.value, [
      ...(byValue.get(entry.value) ?? []),
      entry.token,
    ]);
  }
  const groups = [];
  for (const [value, names] of byValue) {
    if (names.length < 2) continue;
    groups.push({ value, names: [...names].sort() });
  }
  return groups;
}

// ------------------------------------------------------------- other sheets ----

/**
 * Every stylesheet under one tree, skipping the directories a build writes into.
 * @param {string} rel @returns {string[]}
 */
function cssFilesUnder(rel) {
  /** @type {string[]} */
  const found = [];
  /** @param {string} dir */
  const walk = (dir) => {
    for (const entry of readdirSync(join(ROOT, ...dir.split('/')), {
      withFileTypes: true,
    })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) walk(path);
        continue;
      }
      if (entry.name.endsWith('.css')) found.push(path);
    }
  };
  walk(rel);
  return found.sort();
}

/**
 * The one-block rule, across the app: no stylesheet but the layer's own declares a `--ds-` token or
 * reads one, so the layer cannot acquire a second home beside it.
 * @returns {string[]}
 */
function foreignTokenFailures() {
  const failures = [];
  const sheets = cssFilesUnder(APP_REL);
  assert.ok(
    sheets.includes(STYLES_REL),
    `${STYLES_REL} is not among the stylesheets under ${APP_REL}/, so this scan is reading a tree the panel no longer renders`,
  );
  for (const sheet of sheets) {
    if (sheet === STYLES_REL) continue;
    const text = readText(sheet, 'a stylesheet this scan bounds');
    for (const match of text.matchAll(/(^|[\s;{])(--ds-[a-z0-9-]+)\s*:/g)) {
      failures.push(
        `${sheet}:${String(lineOfIndex(text, match.index ?? 0))}: declares the token \`${match[2] ?? ''}\` outside ${STYLES_REL} — the token layer has one home, and a second one is a value no reader of the block can find`,
      );
    }
    for (const match of text.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)) {
      failures.push(
        `${sheet}:${String(lineOfIndex(text, match.index ?? 0))}: reads the token \`${match[1] ?? ''}\` from ${STYLES_REL}, so a second stylesheet renders the layer's values — the panel is styled once, in the block and the rules below it`,
      );
    }
  }
  return failures;
}

// ------------------------------------------------------------------ mutants ----

/**
 * The sheet with one anchored edit applied. The anchor is asserted present exactly as often as the
 * mutation expects, so a sheet that moved makes the mutant fail loudly instead of mutating nothing
 * and the pin read as proof.
 * @param {string} css @param {string} from @param {string} to @param {number} [once]
 * @returns {string}
 */
function mutate(css, from, to, once = 1) {
  const occurrences = css.split(from).length - 1;
  assert.equal(
    occurrences,
    once,
    `the mutant's anchor ${JSON.stringify(from)} sits in ${STYLES_REL} ${String(occurrences)} time(s) and the mutation expects ${String(once)}; the anchor is stale`,
  );
  return css.replace(from, () => to);
}

/**
 * The sheet with one rule moved above the token block: the mutant the order rule exists for.
 * @param {string} css @param {string} selector @param {string | RegExp} media
 * @returns {string}
 */
function moveRule(css, selector, media) {
  const { rules } = scanSheet(css);
  const rule = rules.find(
    (one) => one.selector === selector && mediaMatches(media, one.media),
  );
  assert.ok(
    rule,
    `the mutant's anchor rule ${JSON.stringify(selector)} in ${JSON.stringify(media)} is not in ${STYLES_REL}; the anchor is stale`,
  );
  const text = css.slice(rule.at, rule.closeAt + 1);
  const without = css.slice(0, rule.at) + css.slice(rule.closeAt + 1);
  const block = without.indexOf(`${ROOT_SELECTOR} {`);
  assert.ok(
    block > 0,
    `the mutant could not find the token block it moves ${JSON.stringify(selector)} above; the anchor is stale`,
  );
  return `${without.slice(0, block)}${text}\n\n${without.slice(block)}`;
}

// -------------------------------------------------------------------- tests ----

describe('the token block', () => {
  it('AC3: the sheet opens with one :root token block, and every rule that reads a token comes after it', (t) => {
    const css = sheet();
    const { rules } = scanSheet(css);
    const primary = primaryBlockOf(rules);
    const blocks = tokenBlocksOf(rules);
    for (const block of blocks) {
      for (const declaration of block.declarations) {
        assert.ok(
          declaration.property.startsWith('--'),
          `${STYLES_REL}:${String(declaration.line)}: the \`${ROOT_SELECTOR}\` block declares \`${declaration.property}\`, and a block of tokens declares custom properties and nothing else`,
        );
      }
    }
    assert.equal(
      primary,
      rules[0],
      `${STYLES_REL}:${String(primary.line)}: the token block is not the sheet's first rule, and the rule ${JSON.stringify(rules[0]?.selector ?? '')} at line ${String(rules[0]?.line ?? 0)} precedes it`,
    );
    assert.equal(
      primary.media,
      MEDIA_ALL,
      `${STYLES_REL}:${String(primary.line)}: the token block sits in ${JSON.stringify(primary.media)}, and the layer is declared once, for every context`,
    );
    assert.deepEqual(
      orderFailures(css),
      [],
      'the token block must precede every rule that reads a token',
    );
    const readers = rules.filter(
      (rule) =>
        !blocks.includes(rule) &&
        rule.declarations.some(
          (declaration) => tokenReads(declaration.value).length > 0,
        ),
    );
    assert.ok(
      readers.length > 0,
      `defect: no rule of ${STYLES_REL} reads a token, so the order rule asserts nothing`,
    );
    t.diagnostic(
      `ds-tokens: the block at line ${String(primary.line)} declares ${String(primary.declarations.length)} token(s) and ${String(readers.length)} rule(s) read one, the first at line ${String(readers[0]?.line ?? 0)}`,
    );
    console.log(
      `AC3: ${STYLES_REL} opens with the token block at line ${String(primary.line)}, ${String(readers.length)} of ${String(rules.length)} rule(s) read a token, and every one of them comes after it`,
    );
  });

  it('AC2: every custom property is declared inside a :root block, and every token names one of the four groups', (t) => {
    const css = sheet();
    assert.deepEqual(
      outsideBlockFailures(css),
      [],
      'a token declared in a rule body is a value only the elements that match it render',
    );
    assert.deepEqual(
      namingFailures(css),
      [],
      `every token is a \`--ds-<group>-<name>\` name in the groups ${TOKEN_GROUPS.join(', ')}`,
    );
    const csEntries = customPropertyEntries(css);
    assert.ok(
      csEntries.length > 0,
      `defect: ${STYLES_REL} declares no custom property, so nothing here is pinned`,
    );
    // The four groups are counted over the token block: the reduced-motion restatements repeat three
    // names the block already declares, so counting them again would report a layer that has six
    // motion tokens where it has three.
    const declared = csEntries.filter((entry) => entry.block === 0);
    assert.ok(
      declared.length > 0,
      `defect: the first \`${ROOT_SELECTOR}\` block declares no token, so the block is not the layer`,
    );
    /** @type {Record<string, number>} */
    const groups = {};
    for (const group of TOKEN_GROUPS) {
      groups[group] = declared.filter((entry) =>
        entry.token.startsWith(`--ds-${group}-`),
      ).length;
      assert.ok(
        groups[group] > 0,
        `defect: the layer declares no \`--ds-${group}-\` token, so one of its four groups is empty and a reader would find no ${group} layer at all`,
      );
    }
    t.diagnostic(
      `ds-tokens: ${String(declared.length)} token(s) in the token block, ${JSON.stringify(groups)}; ${String(csEntries.length - declared.length)} restatement(s) beside it`,
    );
    console.log(
      `AC2: ${String(declared.length)} token(s), all inside a \`${ROOT_SELECTOR}\` block: ${TOKEN_GROUPS.map((group) => `${String(groups[group])} ${group}`).join(', ')}`,
    );
  });

  it('AC2: every token a rule reads is declared exactly once, and a token declared twice reddens naming both lines', (t) => {
    const css = sheet();
    assert.deepEqual(
      duplicateFailures(css),
      [],
      `no token of ${STYLES_REL} is declared twice`,
    );
    assert.deepEqual(
      readFailures(css),
      [],
      'every token a rule reads is declared in a token block',
    );
    const scan = scanSheet(css);
    const blocks = tokenBlocksOf(scan.rules);
    const declared = new Set(
      blocks.flatMap((block) =>
        block.declarations
          .map((declaration) => declaration.property)
          .filter((property) => property.startsWith('--')),
      ),
    );
    const reads = new Set(
      scan.rules
        .filter((rule) => !blocks.includes(rule))
        .flatMap((rule) =>
          rule.declarations.flatMap((declaration) =>
            tokenReads(declaration.value),
          ),
        ),
    );
    const unread = [...declared].filter((token) => !reads.has(token)).sort();
    assert.ok(
      declared.size > 0 && reads.size > 0,
      `defect: the layer declares ${String(declared.size)} token(s) and its rules read ${String(reads.size)}, so the one-to-one rule asserts nothing`,
    );
    t.diagnostic(
      `ds-tokens: ${String(reads.size)} token(s) read by the rules of ${STYLES_REL}, all of them declared; ${String(unread.length)} declared and read by no rule (${unread.join(', ') || 'none'})`,
    );
    console.log(
      `AC2: ${String(reads.size)} distinct token(s) are read by the sheet's rules, each declared exactly once in the block; declared and unread: ${unread.join(', ') || 'none'}`,
    );
  });

  it('AC2: the only re-declarations are the three reduced-motion restatements, each made once', (t) => {
    const css = sheet();
    assert.deepEqual(
      restatementFailures(css),
      [],
      'the reduced-motion block restates exactly the three motion tokens, once each, and nothing else is declared a second time',
    );
    const restated = customPropertyEntries(css).filter(
      (entry) => entry.block !== 0 && entry.block !== null,
    );
    assert.equal(
      restated.length,
      RESTATEMENT_EXEMPTIONS.length,
      `the sheet carries ${String(restated.length)} re-declaration(s) outside the token block and this suite declares ${String(RESTATEMENT_EXEMPTIONS.length)}: ${JSON.stringify(restated.map((entry) => `${entry.token} at line ${String(entry.line)}`))}`,
    );
    t.diagnostic(
      `ds-tokens: restatements ${JSON.stringify(restated.map((entry) => `${entry.token} at line ${String(entry.line)} in ${entry.media}`))}`,
    );
    console.log(
      `AC2: ${String(restated.length)} re-declaration(s), all in the reduced-motion block: ${restated.map((entry) => entry.token).join(', ')}`,
    );
  });

  it('AC2: two tokens may carry one value, which is not a duplicate', (t) => {
    const css = sheet();
    assert.deepEqual(
      duplicateFailures(css),
      [],
      'a value two names carry is not a duplicate, and the duplicate rule keys on the name',
    );
    const groups = sharedValues(css);
    assert.ok(
      groups.length > 0,
      `defect: ${STYLES_REL} carries no value two tokens share, so this suite cannot show the duplicate rule is not a value rule`,
    );
    for (const group of groups) {
      assert.ok(
        group.names.length > 1,
        `defect: the shared-value reading carries ${JSON.stringify(group)} as one name`,
      );
    }
    t.diagnostic(
      `ds-tokens: ${String(groups.length)} value(s) carried by more than one name: ${groups.map((group) => `${group.value} = ${group.names.join(' + ')}`).join('; ')}`,
    );
    console.log(
      `AC2: ${String(groups.length)} value(s) are carried by more than one token name and none of them is a duplicate: ${groups.map((group) => `${group.value} (${String(group.names.length)} names)`).join(', ')}`,
    );
  });

  it('AC3: no second stylesheet under apps/ declares or reads a --ds- token', (t) => {
    assert.deepEqual(
      foreignTokenFailures(),
      [],
      `the token layer has one home: ${STYLES_REL}`,
    );
    const sheets = cssFilesUnder(APP_REL);
    t.diagnostic(
      `ds-tokens: stylesheets under ${APP_REL}/: ${sheets.join(', ')}`,
    );
    console.log(
      `AC3: ${String(sheets.length)} stylesheet(s) under ${APP_REL}/ (${sheets.join(', ')}), and only ${STYLES_REL} carries the layer`,
    );
  });

  it('AC3: the census carries this suite’s reason row in the same task that adds it', () => {
    const gate = readText(
      GATE_REL,
      'the census that owes this suite its reason row',
    );
    const row = `'${SELF_REL}':`;
    assert.ok(
      gate.includes(row),
      `${GATE_REL} carries no SUITE_DIFF_REASONS row for ${SELF_REL}: a suite this task adds owes the census its reason in the same task, and the block it is missing is\n\nObject.assign(SUITE_DIFF_REASONS, {\n  ${row} '<what the suite is, what it reads, what it refuses>',\n});`,
    );
    assert.ok(
      SELF_PATH.split(/[\\/]/).slice(-1)[0] === 'ds-tokens.test.mjs',
      `this suite is ${SELF_PATH}, and the row the census owes it names ${SELF_REL}`,
    );
    console.log(
      `${GATE_REL}: SUITE_DIFF_REASONS carries ${row} for this suite`,
    );
  });
});

describe('the literals', () => {
  it('AC1: no colour, spacing, type or duration literal is declared outside the block, apart from the three exemptions', (t) => {
    const css = sheet();
    assert.deepEqual(
      literalViolations(css),
      [],
      `the only literals ${STYLES_REL} declares outside the token block are the three ${LITERAL_EXEMPTIONS.map((one) => one.id).join(', ')} hold`,
    );
    const { rules } = scanSheet(css);
    const blocks = tokenBlocksOf(rules);
    const rendering = rules
      .filter((rule) => !blocks.includes(rule))
      .flatMap((rule) =>
        rule.declarations.filter(
          (declaration) => !declaration.property.startsWith('--'),
        ),
      );
    const tokenised = rendering.filter(
      (declaration) => tokenReads(declaration.value).length > 0,
    );
    assert.ok(
      rendering.length > 0 && tokenised.length > 0,
      `defect: ${STYLES_REL} carries no rendering declaration that reads a token, so the literal scan asserts nothing`,
    );
    assert.equal(
      rendering.length - tokenised.length,
      LITERAL_EXEMPTIONS.length,
      `${STYLES_REL} declares ${String(rendering.length - tokenised.length)} rendering declaration(s) that read no token, and this suite holds exactly ${String(LITERAL_EXEMPTIONS.length)} literal: ${JSON.stringify(rendering.filter((declaration) => tokenReads(declaration.value).length === 0).map((declaration) => `${declaration.property}: ${declaration.value}`))}`,
    );
    t.diagnostic(
      `ds-tokens: ${String(tokenised.length)} of ${String(rendering.length)} rendering declaration(s) read a token; ${String(LITERAL_EXEMPTIONS.length)} stay literal at ${LITERAL_EXEMPTIONS.map((one) => one.id).join(', ')}`,
    );
    console.log(
      `AC1: ${String(tokenised.length)} of ${String(rendering.length)} rendering declaration(s) read a token, and ${String(LITERAL_EXEMPTIONS.length)} are declared literal by ${LITERAL_EXEMPTIONS.map((one) => one.id).join(', ')}`,
    );
  });

  it('AC1: the scan sees all four families where the block declares them, so an unmatched shape cannot pass for a clean sheet', (t) => {
    const css = sheet();
    const { rules } = scanSheet(css);
    const blocks = tokenBlocksOf(rules);
    const seen = new Set();
    let declarations = 0;
    for (const block of blocks) {
      for (const declaration of block.declarations) {
        declarations += 1;
        for (const hit of literalHits(declaration.value)) seen.add(hit.family);
      }
    }
    assert.ok(
      declarations > 0,
      `defect: the token block declares no value, so no family can be seen in it`,
    );
    assert.deepEqual(
      [...seen].sort(),
      LITERAL_FAMILIES.map((one) => one.family).sort(),
      `the scan finds the ${JSON.stringify([...seen].sort())} families among the ${String(declarations)} value(s) the token block declares, and this suite's families are ${JSON.stringify(LITERAL_FAMILIES.map((one) => one.family))}: a family the shapes do not see would read as a sheet that declares none`,
    );
    t.diagnostic(
      `ds-tokens: the four families are seen in the block itself: ${JSON.stringify([...seen].sort())}`,
    );
    console.log(
      `AC1: the scan recognises ${[...seen].sort().join(', ')} literals in the ${String(declarations)} value(s) the block declares, so a clean sheet is a reading rather than an unread one`,
    );
  });

  it('AC1: the three exemptions are the three declarations the style suite anchors, and no fourth is admitted', (t) => {
    const css = sheet();
    assert.deepEqual(
      anchorFailures(),
      [],
      `each exemption cites a declaration a mutant in ${ANCHOR_SUITE_REL} matches`,
    );
    assert.equal(
      LITERAL_EXEMPTIONS.length,
      3,
      `this suite admits ${String(LITERAL_EXEMPTIONS.length)} literal exemption(s); the sheet carries exactly three declarations a mutant anchors, so a fourth exemption would be a literal admitted without an anchor`,
    );
    for (const exemption of LITERAL_EXEMPTIONS) {
      const anchor = `${exemption.property}: ${exemption.value};`;
      assert.equal(
        css.split(anchor).length - 1,
        1,
        `${STYLES_REL} carries ${JSON.stringify(anchor)} ${String(css.split(anchor).length - 1)} time(s), and the ${exemption.id} exemption names exactly one declaration`,
      );
    }
    t.diagnostic(
      `ds-tokens: exemptions ${LITERAL_EXEMPTIONS.map((one) => `${one.id} -> ${one.property}: ${one.value}`).join('; ')}`,
    );
    console.log(
      `AC1: ${String(LITERAL_EXEMPTIONS.length)} exemptions, each anchored by a mutant in ${ANCHOR_SUITE_REL}: ${LITERAL_EXEMPTIONS.map((one) => `${one.id} ${one.property}: ${one.value}`).join('; ')}`,
    );
  });

  it('AC1: a literal in a comment is not a declaration, and the scan names the one it saw', (t) => {
    const css = sheet();
    const seen = commentLiterals(css);
    assert.ok(
      seen.length > 0,
      `defect: no comment of ${STYLES_REL} spells a value the scan recognises, so nothing here shows that a comment emits no declaration`,
    );
    assert.deepEqual(
      literalViolations(css),
      [],
      'a comment is not a declaration, so the values its prose spells do not redden the scan',
    );
    for (const hit of seen) {
      const line = (css.split('\n')[hit.line - 1] ?? '').trim();
      assert.ok(
        line !== '',
        `${STYLES_REL}:${String(hit.line)}: the scan reports the comment literal ${JSON.stringify(hit.text)} on a line that is empty`,
      );
    }
    t.diagnostic(
      `ds-tokens: comment literals ${JSON.stringify(seen.map((hit) => `${hit.text} (${hit.family}) at line ${String(hit.line)}`))}`,
    );
    console.log(
      `AC1: ${STYLES_REL} spells ${String(seen.length)} literal(s) in its comments (${seen.map((hit) => `${hit.text} at line ${String(hit.line)}`).join(', ')}), and a comment emits no declaration`,
    );
  });
});

describe('the mutants', () => {
  it('AC2 mutant: a token declared twice reddens naming both lines', (t) => {
    const css = sheet();
    assert.deepEqual(duplicateFailures(css), []);
    const raw = '--ds-color-ink: #1b1f24;';
    const line = customPropertyEntries(css).find(
      (entry) => entry.token === '--ds-color-ink',
    )?.line;
    assert.equal(
      typeof line,
      'number',
      'the anchor token must be declared once',
    );
    const mutant = mutate(css, raw, `${raw}\n  --ds-color-ink: #10151b;`);
    const failures = duplicateFailures(mutant);
    assert.equal(
      failures.length,
      1,
      `a second declaration of one token must redden once: ${JSON.stringify(failures)}`,
    );
    const failure = failures[0] ?? '';
    assert.ok(
      failure.includes(STYLES_REL) &&
        failure.includes('--ds-color-ink') &&
        failure.includes(`line ${String(line)}`) &&
        failure.includes(`line ${String(line + 1)}`),
      `the refusal must name the file, the token and both lines; it read ${JSON.stringify(failure)}`,
    );
    assert.deepEqual(duplicateFailures(css), []);
    t.diagnostic(`ds-tokens: duplicate -> ${failure}`);
    console.log(`AC2 mutant: ${failure}`);
  });

  it('AC2 mutant: a token read and never declared reddens naming the token, the rule and the line', (t) => {
    const css = sheet();
    assert.deepEqual(readFailures(css), []);
    const line = (css.split('\n') ?? []).findIndex((one) =>
      one.includes('background: var(--ds-color-canvas-heading);'),
    );
    assert.ok(line >= 0, `the anchor declaration must be in ${STYLES_REL}`);
    const mutant = mutate(
      css,
      'background: var(--ds-color-canvas-heading);',
      'background: var(--ds-color-canvas-bottom);',
    );
    const failures = readFailures(mutant);
    assert.equal(failures.length, 1, JSON.stringify(failures));
    const failure = failures[0] ?? '';
    assert.ok(
      failure.includes('--ds-color-canvas-bottom') &&
        failure.includes('"h1, h2, h3"') &&
        failure.includes('background') &&
        failure.includes(`:${String(line + 1)}:`),
      `the refusal must name the token, the rule, the property and the line; it read ${JSON.stringify(failure)}`,
    );
    assert.deepEqual(readFailures(css), []);
    t.diagnostic(`ds-tokens: undeclared read -> ${failure}`);
    console.log(`AC2 mutant: ${failure}`);
  });

  it('AC2 mutant: a token declared in a rule body reddens naming the rule', (t) => {
    const css = sheet();
    assert.deepEqual(outsideBlockFailures(css), []);
    const anchor = 'p.line {\n  margin: var(--ds-density-flush);';
    const mutant = mutate(
      css,
      anchor,
      'p.line {\n  --ds-line-ink: #1b1f24;\n  margin: var(--ds-density-flush);',
    );
    const failures = outsideBlockFailures(mutant);
    assert.equal(failures.length, 1, JSON.stringify(failures));
    const failure = failures[0] ?? '';
    assert.ok(
      failure.includes('--ds-line-ink') &&
        failure.includes('"p.line"') &&
        failure.includes(STYLES_REL),
      `the refusal must name the token, the rule and the file; it read ${JSON.stringify(failure)}`,
    );
    assert.deepEqual(outsideBlockFailures(css), []);
    t.diagnostic(`ds-tokens: token outside the block -> ${failure}`);
    console.log(`AC2 mutant: ${failure}`);
  });

  it('AC2 mutant: a restatement that is no longer made reddens naming the token', (t) => {
    const css = sheet();
    assert.deepEqual(restatementFailures(css), []);
    const mutant = mutate(css, '--ds-motion-easing-standard: linear;\n', '');
    const failures = restatementFailures(mutant);
    assert.equal(failures.length, 1, JSON.stringify(failures));
    const failure = failures[0] ?? '';
    assert.ok(
      failure.includes('--ds-motion-easing-standard') &&
        failure.includes('exemption for exactly one'),
      `the refusal must name the restatement the exemption no longer finds; it read ${JSON.stringify(failure)}`,
    );
    assert.deepEqual(restatementFailures(css), []);
    t.diagnostic(`ds-tokens: stale restatement -> ${failure}`);
    console.log(`AC2 mutant: ${failure}`);
  });

  it('AC2 mutant: a token given another token’s value does not redden the duplicate pin', (t) => {
    const css = sheet();
    assert.deepEqual(duplicateFailures(css), []);
    const before = sharedValues(css).find((group) => group.value === '#ffffff');
    assert.ok(
      before,
      'the anchor value must be carried by more than one name before the mutant is planted',
    );
    const mutant = mutate(
      css,
      '--ds-color-canvas-raised: #fbfcfd;',
      '--ds-color-canvas-raised: #ffffff;',
    );
    assert.notEqual(mutant, css, 'the mutant changed nothing');
    const after = sharedValues(mutant).find(
      (group) => group.value === '#ffffff',
    );
    assert.ok(after, 'the mutant must leave two names carrying one value');
    assert.ok(
      after.names.length === before.names.length + 1,
      `the mutant must add one name to the ${JSON.stringify(before.names)} group; it read ${JSON.stringify(after.names)}`,
    );
    assert.deepEqual(
      duplicateFailures(mutant),
      [],
      'two names carrying one value is not a duplicate, and the duplicate rule keys on the name',
    );
    t.diagnostic(
      `ds-tokens: shared value ${JSON.stringify(after)} reddens no duplicate`,
    );
    console.log(
      `AC2 mutant: ${after.names.length} names carry ${after.value} (${after.names.join(', ')}) and the duplicate pin stays green`,
    );
  });

  it('AC3 mutant: a rule moved above the token block reddens naming the rule', (t) => {
    const css = sheet();
    assert.deepEqual(orderFailures(css), []);
    const mutant = moveRule(css, 'body', MEDIA_ALL);
    assert.notEqual(mutant, css, 'the mutant changed nothing');
    const failures = orderFailures(mutant);
    assert.ok(
      failures.length > 0,
      'moving the body rule above the token block must redden the order pin',
    );
    const failure = failures[0] ?? '';
    assert.ok(
      failure.includes('"body"') &&
        failure.includes('before the token block') &&
        failure.includes(STYLES_REL),
      `the refusal must name the rule it found above the block; it read ${JSON.stringify(failure)}`,
    );
    assert.deepEqual(orderFailures(css), []);
    t.diagnostic(`ds-tokens: rule hoisted -> ${failure}`);
    console.log(`AC3 mutant: ${failure}`);
  });

  it('AC1 mutant: a fourth literal reddens naming the selector, the property and the line', (t) => {
    const css = sheet();
    assert.deepEqual(literalViolations(css), []);
    const anchor = 'p.line {\n  margin: var(--ds-density-flush);';
    const line = css.split('\n').indexOf('p.line {') + 2;
    const mutant = mutate(
      css,
      anchor,
      'p.line {\n  padding: 4px;\n  margin: var(--ds-density-flush);',
    );
    const failures = literalViolations(mutant);
    assert.equal(failures.length, 1, JSON.stringify(failures));
    const failure = failures[0] ?? '';
    assert.ok(
      failure.includes(STYLES_REL) &&
        failure.includes('"p.line"') &&
        failure.includes('`padding`') &&
        failure.includes('"4px"') &&
        failure.includes('spacing') &&
        failure.includes(`:${String(line)}:`),
      `the refusal must name the file, the selector, the property, the value and the line; it read ${JSON.stringify(failure)}`,
    );
    assert.deepEqual(literalViolations(css), []);
    t.diagnostic(`ds-tokens: fourth literal -> ${failure}`);
    console.log(`AC1 mutant: ${failure}`);
  });

  it('AC1 mutant: a named colour reddens where a hex colour would', (t) => {
    const css = sheet();
    assert.deepEqual(literalViolations(css), []);
    const anchor = 'p.state {\n  margin: var(--ds-density-state-margin);';
    const mutant = mutate(
      css,
      anchor,
      'p.state {\n  color: white;\n  margin: var(--ds-density-state-margin);',
    );
    const failures = literalViolations(mutant);
    assert.equal(failures.length, 1, JSON.stringify(failures));
    const failure = failures[0] ?? '';
    assert.ok(
      failure.includes('"white"') &&
        failure.includes('colour') &&
        failure.includes('"p.state"') &&
        failure.includes('`color`'),
      `a named colour must redden as a colour literal; it read ${JSON.stringify(failure)}`,
    );
    t.diagnostic(`ds-tokens: named colour -> ${failure}`);
    console.log(`AC1 mutant: ${failure}`);
  });

  it('AC1 mutant: an exemption that no longer matches a declaration reddens as stale', (t) => {
    const css = sheet();
    assert.deepEqual(literalViolations(css), []);
    const mutant = mutate(
      css,
      'color: #6b5200;',
      'color: var(--ds-color-state-finding);',
    );
    const failures = literalViolations(mutant);
    assert.equal(
      failures.length,
      1,
      `a stale exemption is one failure and not a literal as well: ${JSON.stringify(failures)}`,
    );
    const failure = failures[0] ?? '';
    assert.ok(
      failure.includes('M5') &&
        failure.includes('exemption for exactly one') &&
        failure.includes('"#6b5200"'),
      `the refusal must name the stale exemption and the value it no longer finds; it read ${JSON.stringify(failure)}`,
    );
    assert.deepEqual(literalViolations(css), []);
    t.diagnostic(`ds-tokens: stale exemption -> ${failure}`);
    console.log(`AC1 mutant: ${failure}`);
  });

  it('AC1 mutant: a literal planted in a comment leaves the scan green and is named as a comment', (t) => {
    const css = sheet();
    const before = commentLiterals(css);
    assert.deepEqual(literalViolations(css), []);
    const anchor = 'p.line {\n  margin: var(--ds-density-flush);';
    const line = css.split('\n').indexOf('p.line {') + 2;
    const mutant = mutate(
      css,
      anchor,
      'p.line {\n  /* a note that spells 4px and #ffffff */\n  margin: var(--ds-density-flush);',
    );
    assert.deepEqual(
      literalViolations(mutant),
      [],
      'a comment emits no declaration, so the literals it spells do not redden the scan',
    );
    const after = commentLiterals(mutant);
    const planted = after.filter((hit) => hit.line === line);
    assert.equal(
      planted.length,
      2,
      `the two literals the comment spells must be named on line ${String(line)}: ${JSON.stringify(after)}`,
    );
    assert.ok(
      planted.some((hit) => hit.family === 'colour') &&
        planted.some((hit) => hit.family === 'spacing'),
      `the scan must name both the colour and the spacing literal it walked past: ${JSON.stringify(planted)}`,
    );
    assert.ok(
      (css.split('\n')[line - 1] ?? '').includes('4px') === false,
      'the planted line must not be a declaration of the sheet it was planted on',
    );
    assert.ok(after.length > before.length, 'the comment reading must grow');
    t.diagnostic(
      `ds-tokens: comment literals planted at line ${String(line)} -> ${JSON.stringify(planted.map((hit) => `${hit.text} (${hit.family})`))}`,
    );
    console.log(
      `AC1 mutant: a comment spelling ${planted.map((hit) => hit.text).join(' and ')} at line ${String(line)} reddens nothing, and the scan names it as a comment`,
    );
  });
});
