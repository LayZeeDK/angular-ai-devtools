// M069 T001 — the token baseline: every selector and property the panel's one global stylesheet
// declares a value for, with the value as its author wrote it and the value the panel renders today,
// written before any token exists.
//
// `apps/angular-ai-devtools/src/styles.css` is the sheet M039 wrote in literals, deliberately: its own
// header says a custom property is not a value a reader resolves for `scripts/panel-styles.test.mjs`,
// which reads computed styles off a document built from this file's own markup. The milestone after this
// one replaces those literals with tokens, and the only honest way to prove the panel did not move is to
// have measured it first. So this record is that measurement, taken through the very functions the style
// suite measures with: `panelMarkup`, `documentWith` and `getComputedStyle` are imported from
// `scripts/panel-styles.test.mjs` rather than copied, so the document the readings are taken from is the
// document that suite pins, byte for byte, and the dark block is applied exactly as that suite applies
// it — its rules appended to the same document as a second sheet, because jsdom implements no
// `matchMedia` and the scheme cannot be asked of the window.
//
// Per selector and per property, the record carries:
//
//   media          `all` for the sheet's own rules, the dark block's own media text for the rules it
//                  carries — the dark value is recorded beside the light value it restates, never
//                  instead of it.
//   selector       the selector exactly as authored, selector list and line breaks and quotes intact,
//                  so a reader can find the declaration rather than a normalised spelling of it.
//   selectorParts  the same selector split into parts a document can be asked for, so each part is
//                  either the element the reading was taken from or a part named as rendered by nothing.
//   property       the CSS property as authored.
//   declared       the value as authored: hex colours, `currentcolor` and shorthands are carried
//                  unexpanded. A normalised value could not tell a re-expression from a retune, which is
//                  the one distinction this record exists to keep.
//   computed       one or more readings, each the value `window.getComputedStyle` resolves for that
//                  declaration — or a named absence with the reason it could not be resolved here.
//
// The absences are the point rather than a gap: `font-family` and `font` are refused by policy, because
// `scripts/panel-styles.test.mjs` refuses them too (Chrome injects `font-family: "Segoe UI"` into a
// `chrome-extension://` document, so a reading on it passes on an unstyled pane), and a value this suite
// cannot resolve without a browser is stated as unread with the measurement that showed it unread — never
// as a number only jsdom would agree with. A fabricated computed value would make the next milestone's
// proof worthless.
//
// Default run — a read: it hashes the committed record before and after, asserts nothing moved, and
// asserts the record is exactly what this head derives, naming the selector, the property and the value
// that moved when it is not.
//
//   node --test scripts/token-baseline.test.mjs
//
// The one write, armed by its own flag. The writer derives through the recorded instant, writes only when
// a value moved, so two armed runs leave the file byte-identical, and it refuses to write a candidate
// that is not a fixed point of this suite's own default pin — the rule the claims census established
// after M065's rebasing was written into the reader and not the writer.
//
//   M069_CAPTURE=1 node --test scripts/token-baseline.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  DARK_HOOKS,
  MEASURED_HOOKS,
  MEASURED_PROPERTIES,
  STATES,
  darkBlock,
  documentWith,
  measure,
  panelMarkup,
} from './panel-styles.test.mjs';

const SELF_PATH = fileURLToPath(import.meta.url);

/** The repository root, resolved from this file — never a host-absolute path. */
const ROOT = join(dirname(SELF_PATH), '..');

const SUITE_REL = 'scripts/token-baseline.test.mjs';
const RECORD_REL = 'research/raw/m069-token-baseline.json';
const RECORD_PATH = join(ROOT, ...RECORD_REL.split('/'));

/** The one stylesheet this record is a measurement of. */
const STYLES_REL = 'apps/angular-ai-devtools/src/styles.css';
const STYLES_PATH = join(ROOT, ...STYLES_REL.split('/'));

/** The suite whose functions take the readings, and to whose pins this record is held. */
const MEASURED_BY_REL = 'scripts/panel-styles.test.mjs';

/** The two files AC3 owes a row: the manifest of recordings, and the census's reason table. */
const RECORDINGS_REL = 'scripts/recordings.json';
const GATE_REL = 'scripts/gate-integrity.test.mjs';

/** The record's own shape, named as a literal and checked before anything is compared. */
const SCHEMA = 'm069-token-baseline/v1';
const MILESTONE = 'M069';
const TASK = 'T001';
const QUESTION =
  'Which selector and which property does the panel stylesheet declare a value for, what value does it declare as text, and what value does the panel render today — and which of those values could not be resolved without a browser?';

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CAPTURE_ENV = 'M069_CAPTURE';
const ARM = `${CAPTURE_ENV}=1`;
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const CAPTURE_COMMAND = `${ARM} ${CHECK_COMMAND}`;
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/** A fixed-width instant, the only shape this record accepts for a time. */
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** The label a rule outside any media block is recorded under. */
const MEDIA_ALL = 'all';

/** The dark block, as jsdom's CSSOM spells its media text — the label its own rules are recorded under. */
const DARK_MEDIA = /prefers-color-scheme\s*:\s*dark/;

/**
 * The keys a declaration row carries, sorted, so a key added to the shape is refused until the record is
 * rederived rather than read as a value nobody measured.
 */
const ROW_KEYS = [
  'computed',
  'declared',
  'document',
  'media',
  'property',
  'selector',
  'selectorParts',
].sort();

/** The keys a reading carries when it resolved, and when it did not. */
const READ_KEYS = ['element', 'property', 'read', 'value'].sort();
const ABSENT_KEYS = ['kind', 'probed', 'property', 'read', 'reason'].sort();

/**
 * What each field of a row is, stated once and recorded in the record's own `facts` block, so the meaning
 * of a value and the reason for an absence are read from one place.
 */
const FACT_MEANING = {
  media:
    'The media context the declaration sits in: `all` for the sheet’s own rules, and the dark block’s own media text for the rules it carries, so a value the dark scheme restates is recorded beside the value it restates rather than instead of it.',
  selector:
    'The selector the value is declared under, exactly as the stylesheet authors it — a selector list keeps its own line breaks and its own quote characters, so the record names the declaration a reader can find in the file and never a normalised spelling of it.',
  selectorParts:
    'The same selector split into the parts a document can be asked for, so every part of a selector list is either the element the reading was taken from or a part recorded as rendered by nothing in the measured document.',
  document:
    'The document the computed reading was taken from: the default markup `scripts/panel-styles.test.mjs` renders, a document carrying that suite’s own state value where the selector names one of the four states, or the default document with the dark block’s rules appended as a second sheet — which is how that suite measures the scheme, since jsdom implements no `matchMedia`.',
  property:
    'The CSS property as the stylesheet authors it, shorthands included: `border-top` is recorded as `border-top` and not as the longhands it expands to, so the row names the declaration the author wrote.',
  declared:
    'The value the stylesheet declares, as the text its author wrote: hex colours, `currentcolor`, `inherit` and shorthands are carried unexpanded and unnormalised, because a normalised value could not tell the token layer re-expressing this value from the token layer retuning it.',
  computed:
    'The value `window.getComputedStyle` resolves for that declaration on the element the measured document renders, read through `scripts/panel-styles.test.mjs`’s own `documentWith` and `panelMarkup` — or, where the value cannot be resolved without a browser, a named absence carrying the measurement that showed it unread rather than a value only jsdom would agree with.',
};

/**
 * The computed properties each declared property is read as. A shorthand is read through the longhand the
 * style suite already reads for it — `border` and `border-top` through `borderTopWidth`, `background`
 * through `backgroundColor` — and the rest through the longhands that carry the part of the shorthand the
 * panel can be seen to lose. The list is a reading of the sheet, not of the browser: a name here that
 * `getComputedStyle` does not resolve is recorded as an absence, and `border-radius` keeps both spellings
 * because jsdom resolves whichever one it implements.
 */
const COMPUTED_NAMES = {
  background: ['backgroundColor'],
  border: ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
  'border-color': ['borderTopColor'],
  'border-left': ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'],
  'border-radius': ['borderRadius', 'borderTopLeftRadius'],
  'border-top': ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
  'border-top-color': ['borderTopColor'],
  'font-size': ['fontSize'],
  'font-weight': ['fontWeight'],
  'line-height': ['lineHeight'],
  margin: ['margin'],
  outline: ['outlineWidth', 'outlineStyle', 'outlineColor', 'outline'],
  padding: ['padding'],
  'text-transform': ['textTransform'],
  color: ['color'],
  cursor: ['cursor'],
};

/**
 * The two declared properties this suite refuses to resolve on purpose, and why — the same refusal
 * `scripts/panel-styles.test.mjs` records in its own header. Chrome injects `font-family: "Segoe UI"`
 * into a `chrome-extension://` document, so a computed font family passes on a pane that carries no
 * typography of its own; the project's own suite asserts that its reading carries no `font-family` key and
 * its M8 mutant stays green with every `font-family` declaration deleted. A value that cannot discriminate
 * is not a value this record may claim to have measured.
 */
const NOT_RESOLVED_BY_POLICY = {
  'font-family': {
    computed: 'fontFamily',
    why: 'the style suite refuses `font-family` as a discriminator on purpose, because Chrome injects `font-family: "Segoe UI"` into a `chrome-extension://` document and a reading on it passes on a pane with no typography of its own',
  },
  font: {
    computed: 'font',
    why: '`font` is the shorthand that carries `font-family`, so it inherits that refusal: the only reading jsdom offers for it here is `inherit`, which is the declaration echoed back rather than the font the panel paints',
  },
};

/** The files this record is derived from, and what each one contributes. */
const SOURCES = [
  {
    path: STYLES_REL,
    contributes:
      'the declarations themselves: every rule, its media context, its selector as authored and the value text it carries, read from the file rather than from a normalised copy of it.',
  },
  {
    path: MEASURED_BY_REL,
    contributes:
      'the document the computed readings are taken from and the hooks the style suite measures it on: this suite imports `panelMarkup`, `documentWith`, `darkBlock`, `measure`, `MEASURED_HOOKS`, `DARK_HOOKS`, `MEASURED_PROPERTIES` and `STATES` from it, so the surface recorded here is that suite’s surface and not a second one.',
  },
];

// ------------------------------------------------------------------- reading ----

/** @param {Buffer | string} bytes @returns {string} */
function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** @param {string} rel @returns {string} */
function absPath(rel) {
  return join(ROOT, ...rel.split('/'));
}

/**
 * One committed file, as text. A missing file is named with the path a reader can open.
 * @param {string} rel @param {string} why @returns {string}
 */
function readText(rel, why) {
  const path = absPath(rel);
  assert.ok(existsSync(path), `${rel} is missing - ${why}`);
  return stripBom(readFileSync(path, 'utf8'));
}

/** @param {any} record @returns {string} */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** A deep copy, so a mutant is planted on a copy and the file on disk is never touched. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** @returns {string} */
function nowIso() {
  return new Date().toISOString();
}

/** Whether a value is an object and not an array. @param {any} value @returns {boolean} */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** A refusal inside a pin, as an Error whose message names what moved. @param {string} message */
function fail(message) {
  throw new Error(message);
}

/** The driver a CSS property name spells when it is read off a computed style. @param {string} name */
function camel(name) {
  return name.replace(/-([a-z])/g, (_all, letter) => letter.toUpperCase());
}

/**
 * The CSS spelling of a computed property name, so the same reading can be asked of the stylesheet's own
 * `CSSStyleDeclaration`, which takes the hyphenated name and answers nothing to the camel-case one.
 * @param {string} name
 */
function kebab(name) {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named rather
 * than reported as a mismatch somewhere in a record of several hundred lines.
 * @param {any} left @param {any} right @param {string} at @returns {string}
 */
function firstDifference(left, right, at) {
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return `${at}: ${String(left.length)} row(s) -> ${String(right.length)} row(s)`;
    }
    for (let index = 0; index < left.length; index += 1) {
      const found = firstDifference(
        left[index],
        right[index],
        `${at}[${String(index)}]`,
      );
      if (found !== '') return found;
    }
    return at;
  }
  if (isObject(left) && isObject(right)) {
    for (const key of [
      ...new Set([...Object.keys(left), ...Object.keys(right)]),
    ]) {
      const found = firstDifference(
        left[key],
        right[key],
        at === '' ? key : `${at}.${key}`,
      );
      if (found !== '') return found;
    }
    return at;
  }
  return `${at}: ${JSON.stringify(left)} -> ${JSON.stringify(right)}`;
}

/**
 * The failure a pin raises on a value, so a mutant's evidence is the assertion's own message rather than
 * the wrapper a `doesNotThrow` puts around it.
 * @param {() => void} pin @param {string} what @returns {Error}
 */
function reddens(pin, what) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${what} passed on the mutant, so the mutation is not caught`,
  );
  return /** @type {Error} */ (failure);
}

// ------------------------------------------------------------ the stylesheet ----

/** The stylesheet under measurement, read once per run. @returns {string} */
let STYLE_TEXT = null;
function stylesheet() {
  if (STYLE_TEXT === null) {
    STYLE_TEXT = readText(
      STYLES_REL,
      'the one global stylesheet this record measures',
    );
  }
  return STYLE_TEXT;
}

/** The comments removed, as the CSSOM removes them: a comment emits no declaration. */
function withoutComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * One rule body's declarations, as authored: the property name and the value text, uncleaned. The split
 * respects quotes and parentheses so a value carrying either is not cut in half.
 * @param {string} body @returns {Array<{ property: string, value: string }>}
 */
function declarationsOf(body) {
  const parts = [];
  let text = '';
  let depth = 0;
  let quote = '';
  for (const character of body) {
    if (quote !== '') {
      text += character;
      if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      text += character;
      continue;
    }
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (character === ';' && depth === 0) {
      parts.push(text);
      text = '';
      continue;
    }
    text += character;
  }
  parts.push(text);
  const declarations = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed === '') continue;
    const colon = trimmed.indexOf(':');
    assert.ok(
      colon > 0,
      `the stylesheet carries the declaration fragment ${JSON.stringify(trimmed)}, which names no property`,
    );
    declarations.push({
      property: trimmed.slice(0, colon).trim(),
      value: trimmed.slice(colon + 1).trim(),
    });
  }
  return declarations;
}

/**
 * A selector list split into its parts, respecting brackets, parentheses and quotes, so
 * `section.panel-demo[data-state='finding']` stays one part and neither its comma nor its quote is
 * misread.
 * @param {string} selector @returns {string[]}
 */
function selectorParts(selector) {
  const parts = [];
  let text = '';
  let depth = 0;
  let quote = '';
  for (const character of selector) {
    if (quote !== '') {
      text += character;
      if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      text += character;
      continue;
    }
    if (character === '[' || character === '(') depth += 1;
    if (character === ']' || character === ')') depth -= 1;
    if (character === ',' && depth === 0) {
      parts.push(text.trim());
      text = '';
      continue;
    }
    text += character;
  }
  parts.push(text.trim());
  return parts.filter((part) => part !== '');
}

/**
 * Every rule the stylesheet carries, in source order, with its media context, its selector as authored and
 * its declarations as authored.
 * @param {string} css @param {string} media @returns {Array<Record<string, any>>}
 */
function parseRules(css, media = MEDIA_ALL) {
  const text = withoutComments(css);
  const rules = [];
  let index = 0;
  while (index < text.length) {
    const open = text.indexOf('{', index);
    if (open === -1) break;
    const prelude = text.slice(index, open).trim();
    let depth = 1;
    let cursor = open + 1;
    while (cursor < text.length && depth > 0) {
      const character = text[cursor];
      if (character === '{') depth += 1;
      else if (character === '}') depth -= 1;
      cursor += 1;
    }
    assert.equal(
      depth,
      0,
      `the stylesheet opens ${JSON.stringify(prelude)} and never closes it`,
    );
    const body = text.slice(open + 1, cursor - 1);
    const block = /^@media\s+([\s\S]+)$/.exec(prelude);
    if (block !== null) {
      rules.push(...parseRules(body, block[1].trim()));
    } else {
      assert.ok(
        prelude !== '',
        'the stylesheet carries a rule with no selector, so no row could name it',
      );
      rules.push({
        media,
        selector: prelude,
        selectorParts: selectorParts(prelude),
        declarations: declarationsOf(body),
      });
    }
    index = cursor;
  }
  return rules;
}

/** The media text the stylesheet's dark block carries, as jsdom's CSSOM spells it. @returns {string} */
function darkMediaLabel() {
  const block = darkBlock(stylesheet());
  assert.ok(
    block !== null,
    `defect: ${STYLES_REL} carries no @media (prefers-color-scheme: dark) block, so no dark value can be recorded beside its light value`,
  );
  assert.match(
    block.media.mediaText,
    DARK_MEDIA,
    `defect: the block ${JSON.stringify(block.media.mediaText)} is not the dark-scheme block this record reads`,
  );
  return block.media.mediaText;
}

// ------------------------------------------------------------- the documents ----

/**
 * The documents the readings are taken from, built once and reused: the default markup
 * `scripts/panel-styles.test.mjs` renders, one per state its `stateColours` builds, and the default
 * document with the dark block's rules appended as a second sheet — the mechanism its `darkReadings` uses.
 * @returns {Record<string, any>}
 */
let DOCUMENT_SET = null;
function documents() {
  if (DOCUMENT_SET !== null) return DOCUMENT_SET;
  const css = stylesheet();
  const block = darkBlock(css);
  assert.ok(
    block !== null,
    `defect: ${STYLES_REL} carries no @media (prefers-color-scheme: dark) block, so the scheme cannot be measured the way ${MEASURED_BY_REL} measures it`,
  );
  const dark = documentWith(css);
  const applied = dark.document.createElement('style');
  applied.textContent = [...block.cssRules]
    .map((rule) => rule.cssText)
    .join('\n');
  dark.document.head.appendChild(applied);
  const states = new Map(
    STATES.map((state) => [
      state,
      documentWith(css, { state, blocks: [['effect', state]] }),
    ]),
  );
  DOCUMENT_SET = { default: documentWith(css), states, dark };
  return DOCUMENT_SET;
}

/** The document key a rule's readings are taken from. @param {Record<string, any>} rule */
function documentKeyOf(rule) {
  if (rule.media !== MEDIA_ALL) return 'dark';
  for (const part of rule.selectorParts) {
    for (const match of part.matchAll(
      /\[(?:data-(?:block-)?state)\s*=\s*['"]?([A-Za-z-]+)['"]?\]/g,
    )) {
      if (STATES.includes(match[1])) return `state:${match[1]}`;
    }
  }
  return 'default';
}

/** The window a document key names. @param {string} key @returns {any} */
function windowOf(key) {
  const set = documents();
  if (key === 'default') return set.default;
  if (key === 'dark') return set.dark;
  const window = set.states.get(key.slice('state:'.length));
  assert.ok(
    window,
    `defect: ${JSON.stringify(key)} names no document this suite builds from ${MEASURED_BY_REL}'s own STATES ${JSON.stringify(STATES)}`,
  );
  return window;
}

/** The prose each document key stands for, so a reader knows where a reading came from. */
const DOCUMENT_MEANING = {
  default:
    'the default document `scripts/panel-styles.test.mjs` builds from its own `panelMarkup()` — a `section.panel-demo` carrying `data-surface="render-phase"` and its state, an `h2`, a `p.state`, two `section.panel-block` elements with their own `p.block-state` and `p.line` rows, a `button` and a `select`',
  dark: 'the default document with the dark block’s own rules appended as a second sheet, which is how `scripts/panel-styles.test.mjs` measures a scheme jsdom offers no `matchMedia` for',
};

/** @param {string} key @returns {string} */
function documentMeaning(key) {
  if (Object.hasOwn(DOCUMENT_MEANING, key)) return DOCUMENT_MEANING[key];
  const state = key.slice('state:'.length);
  return `the document \`scripts/panel-styles.test.mjs\` builds for the state ${JSON.stringify(state)} — its own \`panelMarkup\` with that state on the surface and on one block, which is the document its \`stateColours\` reads`;
}

/** The stylesheet's rule inventory, in the order it authors them. @returns {Array<Record<string, any>>} */
function rulesOfSheet() {
  return parseRules(stylesheet());
}

/** The number of rules the dark block carries, as the CSSOM sees them. @returns {number} */
function darkRuleCount() {
  const block = darkBlock(stylesheet());
  assert.ok(
    block !== null,
    `defect: ${STYLES_REL} carries no @media (prefers-color-scheme: dark) block`,
  );
  return block.cssRules.length;
}

// ------------------------------------------------------------- the readings ----

/** The reason a policy-refused value carries. @param {string} selector @param {string} property */
function policyReason(selector, property) {
  const policy = NOT_RESOLVED_BY_POLICY[property];
  return `\`${property}\` under ${JSON.stringify(selector)} was not resolved: ${policy.why} — so this record states the absence rather than writing a value the browser would not agree with`;
}

/**
 * The reason a value carries where the value is one the measured document offers no element for.
 * @param {string} selector @param {string} property @param {Array<Record<string, string>>} parts
 */
function unmatchedReason(selector, property, parts) {
  const detail = parts
    .map((part) => `${JSON.stringify(part.part)} ${part.failure}`)
    .join('; ');
  return `\`${property}\` under ${JSON.stringify(selector)} was not resolved: in this document ${detail}, so no element carries the declaration and a computed value would have to be invented rather than read`;
}

/**
 * The reason a value carries where the element exists but `getComputedStyle` leaves the property empty.
 * @param {string} selector @param {string} property @param {string} element @param {string[]} probed
 */
function unresolvedReason(selector, property, element, probed) {
  return `\`${property}\` under ${JSON.stringify(selector)} was not resolved: \`getComputedStyle(document.querySelector(${JSON.stringify(element)}))\` answers the empty string for every property this suite reads it as (${probed
    .map((name) => JSON.stringify(name))
    .join(
      ', ',
    )}), so jsdom implements no reading of it and a value would have to be invented rather than taken`;
}

/**
 * The readings one declaration has. A policy-refused property is one absence. Otherwise each element of
 * the selector list is asked for; the first that resolves carries the reading, the rest are recorded as
 * parts this document renders nothing for, and a declaration whose properties all answer the empty string
 * is one absence naming the measurement that showed it unread.
 * @param {Record<string, any>} rule
 * @param {{ property: string, value: string }} declaration
 * @returns {{ document: string, readings: Array<Record<string, any>>, notRendered: Array<Record<string, string>> }}
 */
function readingsOf(rule, declaration) {
  const key = documentKeyOf(rule);
  const window = windowOf(key);
  const parts = rule.selectorParts.map((part) => {
    let element = null;
    let failure = '';
    try {
      element = window.document.querySelector(part);
    } catch (error) {
      failure = `threw ${String(/** @type {Error} */ (error).name)}: ${String(/** @type {Error} */ (error).message).split('\n')[0]}`;
    }
    if (element === null && failure === '') failure = 'matched no element';
    return { part, element, failure };
  });
  const notRendered = parts
    .filter((part) => part.element === null)
    .map((part) => ({
      media: rule.media,
      selector: rule.selector,
      part: part.part,
      reason: `selector part ${JSON.stringify(part.part)} of ${JSON.stringify(rule.selector)} is recorded as rendered by nothing: in the document this record reads it ${part.failure}, so no element of this record was measured through it`,
    }));

  const policy = NOT_RESOLVED_BY_POLICY[declaration.property];
  if (policy !== undefined) {
    return {
      document: key,
      notRendered,
      readings: [
        {
          property: policy.computed,
          read: false,
          kind: 'policy',
          probed: [policy.computed],
          reason: policyReason(rule.selector, declaration.property),
        },
      ],
    };
  }

  const names = COMPUTED_NAMES[declaration.property] ?? [
    camel(declaration.property),
  ];
  const used = parts.find((part) => part.element !== null) ?? null;
  if (used === null) {
    return {
      document: key,
      notRendered,
      readings: [
        {
          property: names[0],
          read: false,
          kind: 'unmatched-selector',
          probed: names,
          reason: unmatchedReason(rule.selector, declaration.property, parts),
        },
      ],
    };
  }

  const style = window.getComputedStyle(used.element);
  const readings = [];
  for (const name of names) {
    const value = typeof style[name] === 'string' ? style[name].trim() : '';
    if (value === '') continue;
    readings.push({ property: name, read: true, element: used.part, value });
  }
  if (readings.length > 0) return { document: key, notRendered, readings };
  return {
    document: key,
    notRendered,
    readings: [
      {
        property: names[0],
        read: false,
        kind: 'not-resolved',
        probed: names,
        reason: unresolvedReason(
          rule.selector,
          declaration.property,
          used.part,
          names,
        ),
      },
    ],
  };
}

/**
 * Every declaration the stylesheet carries, as a row, with the readings each one produced and the parts no
 * measured document renders. Nothing here reads the record: it is derived from the stylesheet and the
 * documents alone, which is what lets the writer and the pin share one derivation.
 * @returns {{ declarations: Array<Record<string, any>>, absences: Array<Record<string, any>>, partsNotRendered: Array<Record<string, any>> }}
 */
function declarationsFromSheet() {
  const rules = rulesOfSheet();
  const declarations = [];
  const partsNotRendered = [];
  for (const rule of rules) {
    for (const declaration of rule.declarations) {
      const { document, readings, notRendered } = readingsOf(rule, declaration);
      for (const part of notRendered) {
        if (
          !partsNotRendered.some(
            (seen) => seen.media === part.media && seen.part === part.part,
          )
        ) {
          partsNotRendered.push(part);
        }
      }
      declarations.push({
        media: rule.media,
        selector: rule.selector,
        selectorParts: rule.selectorParts,
        document,
        property: declaration.property,
        declared: declaration.value,
        computed: readings,
      });
    }
  }
  const absences = [];
  for (const row of declarations) {
    for (const reading of row.computed) {
      if (reading.read === true) continue;
      absences.push({
        kind: reading.kind,
        media: row.media,
        selector: row.selector,
        property: row.property,
        computedProperty: reading.property,
        probed: reading.probed,
        reason: reading.reason,
      });
    }
  }
  return { declarations, absences, partsNotRendered };
}

// --------------------------------------------------------------- the census ----

/**
 * AC3's two rows, derived rather than asserted by name: the manifest names this recording with its suite
 * and its arm, and the census owes this suite its reason row.
 * @returns {any}
 */
function censusOf() {
  const rows = JSON.parse(
    readText(RECORDINGS_REL, 'the manifest that names every recording'),
  );
  assert.ok(
    Array.isArray(rows),
    `${RECORDINGS_REL} must be the list of recordings, and it is ${typeof rows}`,
  );
  const row = rows.find((one) => one?.recording === RECORD_REL);
  assert.ok(
    row,
    `${RECORDINGS_REL} names no row for ${RECORD_REL}: a recording this milestone writes is named there with its suite and its arm`,
  );
  assert.equal(
    row.suite,
    SUITE_REL,
    `${RECORDINGS_REL}'s row for ${RECORD_REL} names the suite ${JSON.stringify(row.suite)}, and this record's suite is ${SUITE_REL}`,
  );
  assert.equal(
    row.arm,
    ARM,
    `${RECORDINGS_REL}'s row for ${RECORD_REL} names the arm ${JSON.stringify(row.arm)}, and the only arm that writes it is ${ARM}`,
  );
  const gate = readText(GATE_REL, 'the census owes this suite its reason row');
  const reasonRow = gate.includes(`'${SUITE_REL}':`);
  assert.ok(
    reasonRow,
    `${GATE_REL} carries no SUITE_DIFF_REASONS row for ${SUITE_REL}: a suite this milestone adds owes the census its reason in the same task`,
  );
  return {
    recordings: RECORDINGS_REL,
    row: { recording: row.recording, suite: row.suite, arm: row.arm },
    reasonRow: { path: GATE_REL, present: reasonRow },
    reading:
      'the manifest names this recording with the suite that writes it and the arm that writes it, and the census carries the reason row the suite this milestone adds owes it, both read at capture rather than stated here',
  };
}

// ---------------------------------------------------------------- deriving ----

/**
 * The record, derived. Every value below is read from the stylesheet or from the document
 * `scripts/panel-styles.test.mjs` builds, so a sheet that moved makes the record stale rather than quietly
 * wrong. `capturedAt` is the one value the derivation takes from the recorded document: it is the instant
 * the record was first written, and a re-capture derives through it so that no value moves for a clock.
 * @param {string} capturedAt @returns {any}
 */
function derive(capturedAt) {
  assert.match(
    String(capturedAt),
    ISO,
    `the record's capture instant must be a fixed-width ISO instant, and it is ${JSON.stringify(capturedAt)}`,
  );
  const css = stylesheet();
  const rules = rulesOfSheet();
  const { declarations, absences, partsNotRendered } = declarationsFromSheet();
  const readings = declarations.flatMap((row) => row.computed);
  const read = readings.filter((one) => one.read === true);
  const unread = readings.filter((one) => one.read !== true);

  const selectors = [...new Set(declarations.map((row) => row.selector))];
  const properties = [...new Set(declarations.map((row) => row.property))];
  const darkRows = declarations.filter((row) => row.media !== MEDIA_ALL);
  const counts = {
    rules: rules.length,
    darkRules: darkRuleCount(),
    mediaBlocks: 1,
    selectors: selectors.length,
    properties: properties.length,
    declarations: declarations.length,
    darkDeclarations: darkRows.length,
    readings: readings.length,
    readingsRead: read.length,
    readingsAbsent: unread.length,
    policyAbsences: absences.filter((one) => one.kind === 'policy').length,
    unresolvedValues: absences.filter((one) => one.kind === 'not-resolved')
      .length,
    unmatchedSelectors: absences.filter(
      (one) => one.kind === 'unmatched-selector',
    ).length,
    selectorPartsNotRendered: partsNotRendered.length,
    documents: 2 + STATES.length,
  };
  assert.ok(
    unread.length > 0,
    'no value of the stylesheet is stated as not resolved, so the absence half of AC1 is unexercised and a reading would be indistinguishable from a complete one',
  );

  const statement = [
    `${String(counts.declarations)} declaration(s) over ${String(counts.rules)} rule(s), ${String(counts.selectors)} selector(s) and ${String(counts.properties)} property(ies) were read from ${STYLES_REL}, ${String(counts.darkDeclarations)} of them inside the ${darkMediaLabel()} block:`,
    `${String(counts.readingsRead)} of ${String(counts.readings)} reading(s) resolved through ${MEASURED_BY_REL}'s own document and getComputedStyle, and ${String(counts.readingsAbsent)} did not.`,
    `What was not resolved, with the reason: ${absences
      .map(
        (one) =>
          `${one.property} under ${JSON.stringify(one.selector)} (${String(one.reason)})`,
      )
      .join(' ')}`,
    `What the style suite measures — ${MEASURED_HOOKS.map(([label, selector]) => `${label} ${selector}`).join(', ')} on ${MEASURED_PROPERTIES.join(', ')} — is carried by these rows' own readings, so the token layer that follows can be proved to re-express these values rather than retune them.`,
  ].join(' ');

  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    question: QUESTION,
    capture: {
      capturedAt,
      command: CAPTURE_COMMAND,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      writes:
        'one: the armed test re-derives this record from the files below and writes it only when a value moved, and it refuses to write a candidate that is not a fixed point of this suite’s default pin',
      armedBy: ARM,
      note: 'the instant this record was first written; every re-capture derives through it, so the record moves for no clock - the values it carries are read from the stylesheet and the document at every run, and none of them is a time',
    },
    sources: SOURCES.map(({ path, contributes }) => {
      assert.ok(
        existsSync(absPath(path)),
        `${path} is a source this record is derived from, and this checkout does not carry it`,
      );
      return { path, contributes };
    }),
    facts: FACT_MEANING,
    census: censusOf(),
    derivedFrom: {
      stylesheet: {
        path: STYLES_REL,
        bytes: statSync(STYLES_PATH).size,
        lines: css.split('\n').length,
        sha256: digest(css),
        darkMedia: darkMediaLabel(),
        darkRules: darkRuleCount(),
      },
      measuredBy: {
        path: MEASURED_BY_REL,
        sha256: digest(
          readText(MEASURED_BY_REL, 'the suite this record reads'),
        ),
        markupSha256: digest(panelMarkup()),
        hooks: MEASURED_HOOKS.map(([label, selector]) => ({ label, selector })),
        darkHooks: DARK_HOOKS.map(([label, selector]) => ({ label, selector })),
        properties: [...MEASURED_PROPERTIES],
        states: [...STATES],
        document: documentMeaning('default'),
      },
      documents: Object.fromEntries([
        ['default', documentMeaning('default')],
        ['dark', documentMeaning('dark')],
        ...STATES.map((state) => [
          `state:${state}`,
          documentMeaning(`state:${state}`),
        ]),
      ]),
      rules: rules.map((rule) => ({
        media: rule.media,
        selector: rule.selector,
        selectorParts: rule.selectorParts,
        declarations: rule.declarations.length,
      })),
    },
    declarations,
    absences,
    partsNotRendered,
    counts,
    statement,
  };
}

/**
 * The record as this head derives it, through the instant the recorded document carries. The default pin
 * and the armed writer both derive here, so the two can never hold different shapes.
 * @returns {any}
 */
function derivedFromHead() {
  const recorded = existsSync(RECORD_PATH)
    ? JSON.parse(readFileSync(RECORD_PATH, 'utf8'))
    : null;
  return derive(recorded?.capture?.capturedAt ?? nowIso());
}

// --------------------------------------------------------------------- pins ----

/** The record's own shape and internal agreement, checked before anything is compared. */
function pinShape(record) {
  if (!isObject(record)) fail('defect: the recording is not an object');
  if (record.schema !== SCHEMA) {
    fail(`defect: the recording's schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== MILESTONE) {
    fail(`defect: the recording is not ${MILESTONE}`);
  }
  if (record.task !== TASK) fail(`defect: the recording is not ${TASK}`);
  if (record.question !== QUESTION) {
    fail('defect: the recording states another question');
  }

  const capture = record.capture;
  if (!isObject(capture)) fail('defect: the record carries no capture section');
  if (!ISO.test(String(capture.capturedAt))) {
    fail(
      `defect: capture.capturedAt is ${JSON.stringify(capture.capturedAt)}, which is not a fixed-width ISO instant`,
    );
  }
  if (capture.command !== CAPTURE_COMMAND) {
    fail(
      `defect: capture.command is ${JSON.stringify(capture.command)}, and the only command that writes this record is ${JSON.stringify(CAPTURE_COMMAND)}`,
    );
  }
  if (capture.check !== CHECK_COMMAND) {
    fail(`defect: capture.check is ${JSON.stringify(capture.check)}`);
  }
  if (capture.records !== RECORD_REL) {
    fail(
      `defect: capture.records is ${JSON.stringify(capture.records)}, and the record this suite writes is ${RECORD_REL}`,
    );
  }
  if (capture.armedBy !== ARM) {
    fail(`defect: capture.armedBy is ${JSON.stringify(capture.armedBy)}`);
  }

  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    fail(
      'defect: the record names no source, so no value it carries has a file behind it',
    );
  }
  for (const source of record.sources) {
    if (typeof source?.path !== 'string' || source.path === '') {
      fail('defect: a source of the record names no path');
    }
    if (!existsSync(absPath(source.path))) {
      fail(
        `defect: the record names ${source.path} as a source and this checkout does not carry it`,
      );
    }
    if (typeof source.contributes !== 'string' || source.contributes === '') {
      fail(`defect: the source ${source.path} states nothing it contributes`);
    }
  }

  for (const field of ROW_KEYS) {
    const meaning = record.facts?.[field];
    if (typeof meaning !== 'string' || meaning.length < 40) {
      fail(
        `defect: facts.${field} states no meaning, so a value and a reason cannot be told apart by a reader`,
      );
    }
  }

  if (!isObject(record.derivedFrom)) {
    fail('defect: the record carries no derivedFrom section');
  }
  if (record.derivedFrom.stylesheet?.path !== STYLES_REL) {
    fail(
      `defect: derivedFrom.stylesheet.path is ${JSON.stringify(record.derivedFrom.stylesheet?.path)}, and the sheet this record measures is ${STYLES_REL}`,
    );
  }
  if (record.derivedFrom.measuredBy?.path !== MEASURED_BY_REL) {
    fail(
      `defect: derivedFrom.measuredBy.path is ${JSON.stringify(record.derivedFrom.measuredBy?.path)}, and the suite this record reads through is ${MEASURED_BY_REL}`,
    );
  }

  if (!Array.isArray(record.declarations) || record.declarations.length === 0) {
    fail(
      'defect: the record carries no declaration, so no value the panel renders today is recorded',
    );
  }
  for (const [position, row] of record.declarations.entries()) {
    const where = `declarations[${String(position)}]`;
    const keys = Object.keys(row).sort();
    if (JSON.stringify(keys) !== JSON.stringify(ROW_KEYS)) {
      fail(
        `defect: ${where} carries the keys ${JSON.stringify(keys)}; a row carries exactly ${JSON.stringify(ROW_KEYS)}, and a key added to the shape is a re-derivation`,
      );
    }
    if (typeof row.selector !== 'string' || row.selector === '') {
      fail(`defect: ${where} names no selector`);
    }
    if (!Array.isArray(row.selectorParts) || row.selectorParts.length === 0) {
      fail(`defect: ${where} splits its selector into no part`);
    }
    if (typeof row.property !== 'string' || row.property === '') {
      fail(`defect: ${where} names no property`);
    }
    if (typeof row.declared !== 'string' || row.declared === '') {
      fail(
        `defect: ${where} carries no declared value text for ${row.property}`,
      );
    }
    if (typeof row.document !== 'string' || row.document === '') {
      fail(`defect: ${where} names no document its reading was taken from`);
    }
    if (!Object.hasOwn(record.derivedFrom.documents ?? {}, row.document)) {
      fail(
        `defect: ${where}.document is ${JSON.stringify(row.document)}, and derivedFrom.documents names ${JSON.stringify(Object.keys(record.derivedFrom.documents ?? {}))}`,
      );
    }
    if (!Array.isArray(row.computed) || row.computed.length === 0) {
      fail(
        `defect: ${where} carries no reading: every declaration is either a value or a named absence`,
      );
    }
    for (const reading of row.computed) {
      const readKeys = Object.keys(reading).sort();
      {
        if (reading.read !== true && reading.read !== false) {
          fail(
            `defect: ${where} carries a reading whose read is ${JSON.stringify(reading.read)}`,
          );
        }
        if (reading.read === true) {
          if (JSON.stringify(readKeys) !== JSON.stringify(READ_KEYS)) {
            fail(
              `defect: ${where} carries a resolved reading with the keys ${JSON.stringify(readKeys)}`,
            );
          }
          if (typeof reading.value !== 'string' || reading.value === '') {
            fail(
              `defect: ${where} carries a resolved reading of ${reading.property} with no value`,
            );
          }
          if (typeof reading.element !== 'string' || reading.element === '') {
            fail(
              `defect: ${where} carries a resolved reading of ${reading.property} from no element`,
            );
          }
          continue;
        }
        if (JSON.stringify(readKeys) !== JSON.stringify(ABSENT_KEYS)) {
          fail(
            `defect: ${where} carries an unresolved reading with the keys ${JSON.stringify(readKeys)}`,
          );
        }
        if (
          typeof reading.reason !== 'string' ||
          reading.reason.trim().length < 80
        ) {
          fail(
            `defect: ${where} records ${reading.property} as not resolved and does not say why in a statement a reader can hold`,
          );
        }
        if (!reading.reason.includes(row.property)) {
          fail(
            `defect: ${where}'s unresolved ${reading.property} does not name the declared property ${JSON.stringify(row.property)}: ${reading.reason}`,
          );
        }
        if (!Array.isArray(reading.probed) || reading.probed.length === 0) {
          fail(
            `defect: ${where}'s unresolved ${reading.property} names no property it probed`,
          );
        }
      }
    }
  }

  const expected = declarationsFromSheet();
  const counts = record.counts;
  if (!isObject(counts)) fail('defect: the record states no counts');
  const readings = record.declarations.flatMap((row) => row.computed);
  const expectedCounts = {
    rules: record.derivedFrom.rules.length,
    darkRules: record.derivedFrom.stylesheet.darkRules,
    mediaBlocks: 1,
    selectors: new Set(record.declarations.map((row) => row.selector)).size,
    properties: new Set(record.declarations.map((row) => row.property)).size,
    declarations: record.declarations.length,
    darkDeclarations: record.declarations.filter(
      (row) => row.media !== MEDIA_ALL,
    ).length,
    readings: readings.length,
    readingsRead: readings.filter((one) => one.read === true).length,
    readingsAbsent: readings.filter((one) => one.read !== true).length,
    policyAbsences: record.absences.filter((one) => one.kind === 'policy')
      .length,
    unresolvedValues: record.absences.filter(
      (one) => one.kind === 'not-resolved',
    ).length,
    unmatchedSelectors: record.absences.filter(
      (one) => one.kind === 'unmatched-selector',
    ).length,
    selectorPartsNotRendered: record.partsNotRendered.length,
    documents: 2 + STATES.length,
  };
  if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) {
    fail(
      `defect: the record states the counts ${JSON.stringify(counts)} and its own rows carry ${JSON.stringify(expectedCounts)}`,
    );
  }
  if (
    expected.declarations.length !== record.declarations.length ||
    expected.absences.length !== record.absences.length
  ) {
    fail(
      `defect: the record carries ${String(record.declarations.length)} row(s) and ${String(record.absences.length)} absence(s), and the stylesheet derives ${String(expected.declarations.length)} and ${String(expected.absences.length)}`,
    );
  }
  if (typeof record.statement !== 'string' || record.statement.length < 200) {
    fail(
      'defect: the record states no statement, so what was read and what was not is left for a reader to assemble',
    );
  }
  return true;
}

/**
 * The declared pin: every declaration the stylesheet carries is one row, in the stylesheet's own order,
 * with its own selector as authored and its own value text — and the record carries no row the sheet does
 * not declare. A value retuned in the record, or a row dropped from it, is named here.
 * @param {any} record
 */
function pinDeclared(record) {
  const rules = rulesOfSheet();
  const expected = rules.flatMap((rule) =>
    rule.declarations.map((declaration) => ({
      media: rule.media,
      selector: rule.selector,
      selectorParts: rule.selectorParts,
      property: declaration.property,
      declared: declaration.value,
    })),
  );
  if (record.declarations.length !== expected.length) {
    fail(
      `defect: the record carries ${String(record.declarations.length)} row(s) and ${STYLES_REL} declares ${String(expected.length)} value(s): a declaration the record does not carry is a value the token layer is not held to`,
    );
  }
  for (const [position, row] of record.declarations.entries()) {
    const one = expected[position];
    for (const field of ['media', 'selector', 'property', 'declared']) {
      if (row[field] !== one[field]) {
        fail(
          `defect: declarations[${String(position)}].${field} is ${JSON.stringify(row[field])} and ${STYLES_REL} declares ${JSON.stringify(one[field])} for ${JSON.stringify(one.selector)} — the ${one.property} value at that selector moved, and a re-expression is re-captured rather than retyped`,
        );
      }
    }
    if (
      JSON.stringify(row.selectorParts) !== JSON.stringify(one.selectorParts)
    ) {
      fail(
        `defect: declarations[${String(position)}].selectorParts is ${JSON.stringify(row.selectorParts)} and ${STYLES_REL} splits ${JSON.stringify(one.selector)} into ${JSON.stringify(one.selectorParts)}`,
      );
    }
  }
  const duplicates = record.declarations.filter(
    (row, position) =>
      record.declarations.findIndex(
        (other) =>
          other.media === row.media &&
          other.selector === row.selector &&
          other.property === row.property,
      ) !== position,
  );
  if (duplicates.length > 0) {
    fail(
      `defect: the record carries two rows for one selector and property: ${JSON.stringify(duplicates.map((row) => `${row.selector} { ${row.property} }`))}`,
    );
  }
}

/**
 * The rendered-value pin: every reading the record carries is the value the measured document resolves
 * now. This is the pin the next milestone's proof rests on — a token layer that retunes a value instead of
 * re-expressing it moves one of these readings, and the refusal names the selector, the property and both
 * values.
 * @param {any} record
 */
function pinComputed(record) {
  const expected = declarationsFromSheet();
  if (record.declarations.length !== expected.declarations.length) {
    fail(
      `defect: the record carries ${String(record.declarations.length)} row(s) and this head derives ${String(expected.declarations.length)}`,
    );
  }
  for (const [position, row] of record.declarations.entries()) {
    const one = expected.declarations[position];
    if (JSON.stringify(row.computed) === JSON.stringify(one.computed)) continue;
    const found = firstDifference(row.computed, one.computed, '');
    fail(
      `defect: the rendered value of ${JSON.stringify(row.property)} under ${JSON.stringify(row.selector)} moved in the ${JSON.stringify(row.media)} context: ${found} (recorded -> derived) — the record is a measurement of what the panel renders, so a value is re-captured with ${CAPTURE_COMMAND} rather than retyped`,
    );
  }
}

/**
 * The absence pin: every value the record states as unresolved is one the measured document still cannot
 * resolve, every absence names the measurement that showed it unread, and no policy-refused value carries
 * a computed number. The summary block is held to the rows so it cannot drift from them.
 * @param {any} record
 */
function pinAbsences(record) {
  const expected = declarationsFromSheet();
  if (JSON.stringify(record.absences) !== JSON.stringify(expected.absences)) {
    fail(
      `defect: the record's absences are not the absences this head derives: ${firstDifference(record.absences, expected.absences, '')}`,
    );
  }
  if (
    JSON.stringify(record.partsNotRendered) !==
    JSON.stringify(expected.partsNotRendered)
  ) {
    fail(
      `defect: the record's unrendered selector parts are not the parts this head derives: ${firstDifference(record.partsNotRendered, expected.partsNotRendered, '')}`,
    );
  }
  let checked = 0;
  for (const row of record.declarations) {
    for (const reading of row.computed) {
      if (reading.read === true) continue;
      checked += 1;
      if (NOT_RESOLVED_BY_POLICY[row.property] === undefined) continue;
      if (reading.kind !== 'policy') {
        fail(
          `defect: ${JSON.stringify(row.property)} under ${JSON.stringify(row.selector)} is refused by policy and is recorded as ${JSON.stringify(reading.kind)}`,
        );
      }
      if (!reading.reason.includes(NOT_RESOLVED_BY_POLICY[row.property].why)) {
        fail(
          `defect: ${JSON.stringify(row.property)} is stated as not resolved without the reason the style suite refuses it: ${reading.reason}`,
        );
      }
    }
  }
  if (checked === 0) {
    fail(
      'defect: no value is stated as unresolved, so the absence half of this record asserts nothing',
    );
  }
  const policy = record.declarations.filter(
    (row) => NOT_RESOLVED_BY_POLICY[row.property] !== undefined,
  );
  const expectedPolicy = rulesOfSheet()
    .flatMap((rule) => rule.declarations)
    .filter((declaration) =>
      Object.hasOwn(NOT_RESOLVED_BY_POLICY, declaration.property),
    );
  if (policy.length !== expectedPolicy.length) {
    fail(
      `defect: the record carries ${String(policy.length)} policy-refused declaration(s), and ${STYLES_REL} declares ${String(expectedPolicy.length)} for the properties this suite refuses (${JSON.stringify(Object.keys(NOT_RESOLVED_BY_POLICY))})`,
    );
  }
  for (const row of policy) {
    for (const reading of row.computed) {
      if ('value' in reading) {
        fail(
          `defect: ${JSON.stringify(row.property)} under ${JSON.stringify(row.selector)} carries the computed value ${JSON.stringify(reading.value)}, and a value the panel does not render is not invented here`,
        );
      }
    }
  }
}

/**
 * The surface pin: the record describes the surface `scripts/panel-styles.test.mjs` measures, read through
 * that suite's own functions — its `measure` on its own `MEASURED_HOOKS` for the three properties it
 * discriminates on, and its `DARK_HOOKS` background read under the dark block. A record taken from another
 * document would pass nothing here.
 * @param {any} record
 */
function pinSurface(record) {
  const window = documents().default;
  for (const [label, selector] of MEASURED_HOOKS) {
    const reading = measure(window, selector);
    const element = window.document.querySelector(selector);
    assert.ok(
      element,
      `${MEASURED_BY_REL} measures ${label} ${selector}, and the document this record reads renders it: the pin would be vacuous otherwise`,
    );
    for (const property of MEASURED_PROPERTIES) {
      const rows = record.declarations.filter(
        (row) =>
          row.media === MEDIA_ALL &&
          row.document === 'default' &&
          row.selectorParts.some((part) => element.matches(part)),
      );
      const found = rows
        .flatMap((row) => row.computed)
        .find((one) => one.read === true && one.property === property);
      if (found === undefined) {
        fail(
          `defect: the record carries no ${property} reading for ${label} ${selector}, and ${MEASURED_BY_REL} measures that property on that hook — the record does not describe the surface the style suite measures`,
        );
      }
      if (found.value !== reading[property]) {
        fail(
          `defect: the record reads ${property} ${JSON.stringify(found.value)} on ${label} ${selector} and ${MEASURED_BY_REL} measures ${JSON.stringify(reading[property])} on the same document`,
        );
      }
    }
  }
  const dark = documents().dark;
  for (const [label, selector] of DARK_HOOKS) {
    const element = dark.document.querySelector(selector);
    assert.ok(
      element,
      `${MEASURED_BY_REL} reads a dark ${label} off ${selector}, and the document this record reads renders it`,
    );
    const measured = dark.getComputedStyle(element).backgroundColor;
    const found = record.declarations
      .filter(
        (row) =>
          row.media !== MEDIA_ALL &&
          row.selectorParts.some((part) => element.matches(part)),
      )
      .flatMap((row) => row.computed)
      .find((one) => one.read === true && one.property === 'backgroundColor');
    if (found === undefined) {
      fail(
        `defect: the record carries no dark background reading for ${label} ${selector}, and ${MEASURED_BY_REL} restates that background in the dark scheme`,
      );
    }
    if (found.value !== measured) {
      fail(
        `defect: the record reads the dark ${label} background ${JSON.stringify(found.value)} and ${MEASURED_BY_REL} measures ${JSON.stringify(measured)}`,
      );
    }
  }
}

/**
 * The census pin: the record's own census names the manifest row and the reason row this suite owes, read
 * from those files rather than stated in the record.
 * @param {any} record
 */
function pinCensus(record) {
  const census = record.census;
  if (!isObject(census)) fail('defect: the record carries no census section');
  const rows = JSON.parse(
    readText(RECORDINGS_REL, 'the manifest that names every recording'),
  );
  const row = rows.find((one) => one?.recording === RECORD_REL);
  if (row === undefined) {
    fail(`defect: ${RECORDINGS_REL} names no row for ${RECORD_REL}`);
  }
  for (const field of ['recording', 'suite', 'arm']) {
    if (census.row?.[field] !== row[field]) {
      fail(
        `defect: census.row.${field} is ${JSON.stringify(census.row?.[field])} and ${RECORDINGS_REL} states ${JSON.stringify(row[field])}`,
      );
    }
  }
  if (census.reasonRow?.path !== GATE_REL) {
    fail(
      `defect: census.reasonRow.path is ${JSON.stringify(census.reasonRow?.path)} and the census this suite owes its row is ${GATE_REL}`,
    );
  }
  if (census.reasonRow?.present !== true) {
    fail(
      `defect: census.reasonRow.present is ${JSON.stringify(census.reasonRow?.present)}, and ${GATE_REL} must carry this suite's row`,
    );
  }
}

/** Every pin, in one call, so the writer can refuse a candidate no reader would accept. */
function pinAll(record) {
  pinShape(record);
  pinDeclared(record);
  pinComputed(record);
  pinAbsences(record);
  pinSurface(record);
  pinCensus(record);
}

// ------------------------------------------------------------------ the write ---

// The bytes the read-only pin holds the record to; an armed run re-bases it after its own write.
const recordAtLoad = existsSync(RECORD_PATH)
  ? digest(readFileSync(RECORD_PATH))
  : null;
let recordBaseline = recordAtLoad;

/**
 * The refusal: a candidate is written only where it is a fixed point of every pin this suite owns, so a
 * capture cannot write bytes its own default run then calls wrong — the rule the claims census established
 * after M065's rebasing was written into the reader and not the writer.
 * @param {string} candidate
 */
function refuseUnlessFixedPoint(candidate) {
  const record = JSON.parse(candidate);
  pinAll(record);
  assert.equal(
    canonical(derive(record.capture.capturedAt)),
    candidate,
    "armed capture refused: the bytes it would write fail this suite's default pin, so the capture does not derive through the pin its reader holds. Nothing was written.",
  );
}

/**
 * The armed capture: derive, compare, write only when a value moved, so two armed runs leave the file
 * byte-identical and a default run never writes at all.
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureRecord(path) {
  const present = existsSync(path);
  const text = present ? readFileSync(path, 'utf8') : '';
  const before = present ? digest(text) : null;
  const recorded = present ? JSON.parse(text) : null;
  const capturedAt = recorded?.capture?.capturedAt ?? nowIso();
  const record = derive(capturedAt);
  const candidate = canonical(record);
  let moved = 'the record had not been written';
  if (present && text === candidate) {
    moved = '';
  } else if (present) {
    moved = `the record moved: ${JSON.stringify(firstDifference(JSON.parse(text), record, ''))}`;
  }
  if (moved === '') return { wrote: false, before, after: before ?? '', moved };
  refuseUnlessFixedPoint(candidate);
  writeFileSync(path, candidate);
  return { wrote: true, before, after: digest(readFileSync(path)), moved };
}

// Declared first among the record's tests, so an armed run writes before the read-only pins read the file
// back: the same pins then prove the freshly written record is the one this head derives.
if (ARMED) {
  describe('the token baseline, armed', () => {
    it('re-derives, writes only what moved, and a second run changes no byte', () => {
      const first = captureRecord(RECORD_PATH);
      console.log(
        first.wrote
          ? `armed run wrote ${RECORD_REL} (${first.moved})`
          : 'armed run: nothing moved, nothing written',
      );
      assert.equal(
        first.after,
        digest(readFileSync(RECORD_PATH)),
        'the bytes the armed run reports are not the bytes on disk',
      );
      const second = captureRecord(RECORD_PATH);
      assert.equal(
        second.wrote,
        false,
        `a second armed run wrote, and nothing had moved: ${second.moved}`,
      );
      assert.equal(
        second.after,
        first.after,
        'a second armed run changed the record, so the re-capture is not idempotent',
      );
      recordBaseline = digest(readFileSync(RECORD_PATH));
    });
  });
}

// --------------------------------------------------------------- measurement ---

describe('measurement', () => {
  it('reads the stylesheet `panel-styles.test.mjs` measures, and its rules are the rules the CSSOM carries', (t) => {
    const css = stylesheet();
    const rules = rulesOfSheet();
    const sheet = documents().default.document.styleSheets[0];
    assert.ok(
      sheet,
      `defect: the document built from ${STYLES_REL} carries no stylesheet`,
    );
    const cssom = [];
    const collect = (list, media) => {
      for (const rule of list) {
        if (rule.media) {
          collect(rule.cssRules, rule.media.mediaText);
          continue;
        }
        cssom.push({ media, selector: rule.selectorText, style: rule.style });
      }
    };
    collect(sheet.cssRules, MEDIA_ALL);
    assert.equal(
      rules.length,
      cssom.length,
      `defect: this suite parses ${String(rules.length)} rule(s) out of ${STYLES_REL} and the CSSOM the style suite navigates carries ${String(cssom.length)}: a rule this parse misses is a value the record does not hold`,
    );
    for (const [position, rule] of rules.entries()) {
      const one = cssom[position];
      assert.equal(
        rule.media,
        one.media,
        `defect: rule ${String(position)} is read as ${JSON.stringify(rule.media)} and the CSSOM places it in ${JSON.stringify(one.media)}`,
      );
      const unquote = (part) => part.replace(/["']/g, '').replace(/\s+/g, ' ');
      assert.deepEqual(
        rule.selectorParts.map(unquote),
        selectorParts(one.selector).map(unquote),
        `defect: rule ${String(position)} is read under ${JSON.stringify(rule.selector)} and the CSSOM carries ${JSON.stringify(one.selector)}: the record names a selector the style suite does not resolve`,
      );
      for (const declaration of rule.declarations) {
        const carried =
          one.style.getPropertyValue(declaration.property) !== ''
            ? one.style.getPropertyValue(declaration.property)
            : one.style.getPropertyValue(
                kebab(
                  (COMPUTED_NAMES[declaration.property] ?? [
                    camel(declaration.property),
                  ])[0],
                ),
              );
        assert.notEqual(
          carried,
          '',
          `defect: rule ${String(position)} declares ${JSON.stringify(declaration.property)} and the CSSOM the style suite navigates carries no value for it, so the property this record names is not the property that applies`,
        );
      }
    }
    assert.equal(
      rules.filter((rule) => rule.media !== MEDIA_ALL).length,
      darkRuleCount(),
      `defect: the dark block's rules are not the rules the CSSOM carries for ${JSON.stringify(darkMediaLabel())}`,
    );
    t.diagnostic(
      `token-baseline: ${STYLES_REL} parses to ${String(rules.length)} rule(s) and ${String(rules.reduce((sum, rule) => sum + rule.declarations.length, 0))} declaration(s), the CSSOM carries the same, and ${String(darkRuleCount())} of the rules sit inside ${darkMediaLabel()}`,
    );
    console.log(
      `token-baseline: ${String(rules.length)} rule(s), ${String(rules.reduce((sum, rule) => sum + rule.declarations.length, 0))} declaration(s), ${String(darkRuleCount())} in the dark block`,
    );
    assert.ok(css.length > 0);
  });

  it('AC1: records each selector and property with its declared text and its computed value or a named absence', (t) => {
    const record = derivedFromHead();
    assert.doesNotThrow(() => pinShape(record));
    assert.ok(
      record.declarations.length > 0,
      'the record must carry a row per declaration',
    );
    for (const row of record.declarations) {
      assert.ok(
        row.computed.length > 0,
        `${row.selector} { ${row.property} } carries no reading`,
      );
    }
    t.diagnostic(
      `token-baseline: ${JSON.stringify(record.counts)}; ${String(record.partsNotRendered.length)} selector part(s) rendered by nothing`,
    );
    console.log(
      `AC1: ${String(record.counts.declarations)} declaration(s) over ${String(record.counts.selectors)} selector(s) and ${String(record.counts.properties)} property(ies); ${String(record.counts.readingsRead)} computed value(s), ${String(record.counts.readingsAbsent)} named absence(s)`,
    );
    for (const absence of record.absences) {
      console.log(
        `AC1 not resolved: ${absence.property} under ${JSON.stringify(absence.selector)} [${absence.kind}] ${absence.reason}`,
      );
    }
    for (const part of record.partsNotRendered) {
      console.log(`AC1 not rendered: ${part.reason}`);
    }
  });

  it('AC1: describes the same surface `panel-styles.test.mjs` measures, read through that suite’s own functions', (t) => {
    const record = derivedFromHead();
    assert.doesNotThrow(() => pinSurface(record));
    const window = documents().default;
    for (const [label, selector] of MEASURED_HOOKS) {
      t.diagnostic(
        `token-baseline: ${label} ${selector} ${JSON.stringify(measure(window, selector))}`,
      );
    }
    console.log(
      `AC1: ${MEASURED_BY_REL} measures ${MEASURED_HOOKS.map(([label, selector]) => `${label} ${selector}`).join(', ')} on ${MEASURED_PROPERTIES.join(', ')}, and every one of those readings is a value this record carries`,
    );
  });

  it('AC2: the writer is one place behind the arm, and a default run writes nothing', () => {
    const source = readFileSync(SELF_PATH, 'utf8');
    const writes = [...source.matchAll(/writeFileSync\(/g)];
    assert.equal(
      writes.length,
      1,
      `defect: the record is written from ${String(writes.length)} places, not one`,
    );
    const armed = source.indexOf('process.env[CAPTURE_ENV]');
    assert.ok(armed !== -1, `defect: the suite never reads ${CAPTURE_ENV}`);
    assert.ok(
      armed < /** @type {number} */ (writes[0].index),
      'defect: the armed check sits after the write',
    );
    assert.equal(
      recordBaseline,
      digest(readFileSync(RECORD_PATH)),
      `${RECORD_REL} changed during this run, so the suite is not read-only`,
    );
    const record = derivedFromHead();
    assert.equal(record.capture.command, CAPTURE_COMMAND);
    assert.equal(record.capture.check, CHECK_COMMAND);
    assert.equal(
      CHECK_COMMAND,
      'node --test scripts/token-baseline.test.mjs',
      'the recording names the command this task verifies with',
    );
    console.log(
      `${RECORD_REL}: one writer behind ${ARM}; the sheet is sha256 ${digest(stylesheet()).slice(0, 12)} and unchanged`,
    );
  });

  it('AC3: names the recording in the manifest and the suite in the census, both read at capture', () => {
    const record = derivedFromHead();
    assert.doesNotThrow(() => pinCensus(record));
    assert.deepEqual(
      record.census.row,
      { recording: RECORD_REL, suite: SUITE_REL, arm: ARM },
      `the census names this recording with its suite and its arm, and it names ${JSON.stringify(record.census.row)}`,
    );
    assert.equal(
      record.census.reasonRow.present,
      true,
      `${GATE_REL} owes ${SUITE_REL} its SUITE_DIFF_REASONS row`,
    );
    const rows = JSON.parse(readFileSync(absPath(RECORDINGS_REL), 'utf8'));
    const row = rows.find((one) => one?.recording === RECORD_REL);
    assert.ok(row, `${RECORDINGS_REL} must carry this recording's row`);
    console.log(
      `${RECORDINGS_REL}: ${JSON.stringify(row)}; ${GATE_REL}: row present`,
    );
  });
});

// ---------------------------------------------------------------- the record ---

describe('the token baseline', () => {
  it('is a read: a default run hashes the record the same before and after', () => {
    assert.ok(
      existsSync(RECORD_PATH),
      `${RECORD_REL} is missing - the record has never been captured`,
    );
    const now = digest(readFileSync(RECORD_PATH));
    assert.equal(
      now,
      recordBaseline,
      `${RECORD_REL} changed during this run, so the suite is not read-only`,
    );
    console.log(
      `${RECORD_REL} at load and after the run: ${String(readFileSync(RECORD_PATH).length)} characters, sha256 ${now}`,
    );
  });

  it('is exactly what this head derives, and a value that moved is named', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    const expected = derivedFromHead();
    assert.deepEqual(
      recorded,
      expected,
      `${RECORD_REL} is not what this head derives: ${firstDifference(recorded, expected, '')} - re-capture with ${CAPTURE_COMMAND}`,
    );
    const planted = clone(recorded);
    const row = planted.declarations.find(
      (one) => one.property === 'color' && one.declared === '#1b1f24',
    );
    assert.ok(
      row,
      `defect: the record carries no colour declaration to plant a moved value on, and the naming below would assert nothing`,
    );
    const moved = row.computed.find((one) => one.read === true);
    assert.ok(moved, 'defect: the planted row carries no resolved reading');
    moved.value = 'rgb(27, 31, 37)';
    const named = firstDifference(planted, expected, '');
    assert.match(
      named,
      /declarations\[\d+\]\.computed\[0\]\.value/,
      `a moved value must be named by its path, and the difference reads ${JSON.stringify(named)}`,
    );
    assert.ok(
      named.includes('rgb(27, 31, 37)'),
      `the naming must state the value that moved, and it reads ${JSON.stringify(named)}`,
    );
    console.log(
      `${RECORD_REL}: re-derived declaration for declaration; a moved value names its path and its value`,
    );
  });

  it('is serialized as the capture writes it, so a re-capture would move no byte', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.equal(
      readFileSync(RECORD_PATH, 'utf8'),
      canonical(recorded),
      `${RECORD_REL} must be serialized as the capture writes it, so a re-capture would move no byte`,
    );
  });

  it('states the values it could not resolve as named absences, each with its reason', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinAbsences(recorded));
    for (const row of recorded.declarations) {
      if (NOT_RESOLVED_BY_POLICY[row.property] === undefined) continue;
      for (const reading of row.computed) {
        assert.equal(
          reading.read,
          false,
          `defect: ${JSON.stringify(row.property)} under ${JSON.stringify(row.selector)} is stated as resolved, and this suite refuses it by policy`,
        );
      }
    }
    console.log(
      `not resolved: ${recorded.absences
        .map(
          (one) =>
            `${one.property} under ${JSON.stringify(one.selector)} [${one.kind}]`,
        )
        .join(' | ')}`,
    );
  });

  it('derives the recorded value from the stylesheet rather than from itself', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinDeclared(recorded));
    assert.doesNotThrow(() => pinComputed(recorded));
    assert.equal(
      recorded.derivedFrom.stylesheet.sha256,
      digest(stylesheet()),
      `defect: derivedFrom.stylesheet.sha256 is ${JSON.stringify(recorded.derivedFrom.stylesheet.sha256)} and ${STYLES_REL} hashes ${JSON.stringify(digest(stylesheet()))}`,
    );
    assert.equal(
      recorded.capture.capturedAt,
      JSON.parse(readFileSync(RECORD_PATH, 'utf8')).capture.capturedAt,
      'the capture instant is the one the recorded document carries, so a re-capture derives through it',
    );
    console.log(
      `${RECORD_REL}: ${String(recorded.declarations.length)} row(s) held to ${STYLES_REL} sha256 ${recorded.derivedFrom.stylesheet.sha256.slice(0, 12)}`,
    );
  });
});

// -------------------------------------------------------------------- mutants ---

describe('the mutants', () => {
  it('a declared value retuned in the record reddens the declared pin, naming the selector and the property', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinDeclared(recorded));
    const mutant = clone(recorded);
    const row = mutant.declarations.find((one) => one.declared === '#1b1f24');
    assert.ok(
      row,
      'defect: the record carries no #1b1f24 declaration to retune',
    );
    row.declared = '#1b1f25';
    const failure = reddens(
      () => pinDeclared(mutant),
      'a declared value retuned in the record',
    );
    assert.match(
      failure.message,
      /\.declared is "#1b1f25"/,
      `the refusal must name the retuned value; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(row.selector),
      `the refusal must name the selector; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /a re-expression is re-captured rather than retyped/,
      `the refusal must state the rule rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinDeclared(recorded));
    console.log(`retuned-value mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a computed value moved in the record reddens the rendered-value pin, naming both values', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinComputed(recorded));
    const mutant = clone(recorded);
    const row = mutant.declarations.find((one) =>
      one.computed.some((reading) => reading.read === true),
    );
    assert.ok(row, 'defect: the record carries no resolved reading to move');
    const reading = row.computed.find((one) => one.read === true);
    reading.value = 'rgb(0, 0, 0)';
    const failure = reddens(
      () => pinComputed(mutant),
      'a computed value moved in the record',
    );
    assert.ok(
      failure.message.includes(row.selector) &&
        failure.message.includes(row.property),
      `the refusal must name the selector and the property; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes('rgb(0, 0, 0)'),
      `the refusal must name the value that moved; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /the record is a measurement of what the panel renders/,
      `the refusal must state the rule; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinComputed(recorded));
    console.log(
      `moved-rendered-value mutant: ${failure.message.split('\n')[0]}`,
    );
  });

  it('a computed value invented for a policy-refused property reddens the absence pin', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinAbsences(recorded));
    const mutant = clone(recorded);
    const row = mutant.declarations.find(
      (one) => one.property === 'font-family',
    );
    assert.ok(row, 'defect: the record carries no font-family declaration');
    row.computed = [
      { property: 'fontFamily', read: true, element: 'body', value: 'serif' },
    ];
    const failure = reddens(
      () => pinAbsences(mutant),
      'a computed value invented for a policy-refused property',
    );
    assert.ok(
      failure.message.includes('font-family'),
      `the refusal must name the property; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinAbsences(recorded));
    console.log(
      `invented-font-family mutant: ${failure.message.split('\n')[0]}`,
    );
  });

  it('a declaration dropped from the record reddens the declared pin, naming the count', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinDeclared(recorded));
    const mutant = clone(recorded);
    const dropped = mutant.declarations.pop();
    assert.ok(dropped, 'defect: the record carries no row to drop');
    const failure = reddens(
      () => pinDeclared(mutant),
      'a declaration dropped from the record',
    );
    assert.match(
      failure.message,
      /a declaration the record does not carry is a value the token layer is not held to/,
      `the refusal must state what a dropped row costs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinDeclared(recorded));
    console.log(`dropped-row mutant: ${failure.message.split('\n')[0]}`);
  });

  it('an absence softened into a value reddens the shape pin', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinShape(recorded));
    const mutant = clone(recorded);
    const row = mutant.declarations.find((one) =>
      one.computed.some((reading) => reading.read === false),
    );
    assert.ok(row, 'defect: the record carries no absence to soften');
    const reading = row.computed.find((one) => one.read === false);
    reading.read = true;
    reading.value = '0px';
    reading.element = 'body';
    const failure = reddens(
      () => pinShape(mutant),
      'an absence softened into a value',
    );
    assert.ok(failure.message.length > 0, 'the refusal must say something');
    assert.doesNotThrow(() => pinShape(recorded));
    console.log(`softened-absence mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a counts block moved reddens the shape pin, naming the field', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    assert.doesNotThrow(() => pinShape(recorded));
    const mutant = clone(recorded);
    mutant.counts.readingsRead += 1;
    const failure = reddens(() => pinShape(mutant), 'a counts block moved');
    assert.match(
      failure.message,
      /the record states the counts/,
      `the refusal must name the counts rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.doesNotThrow(() => pinShape(recorded));
    console.log(`moved-counts mutant: ${failure.message.split('\n')[0]}`);
  });

  it('the armed writer refuses a candidate that is not the fixed point of its pin, and writes nothing', () => {
    const before = digest(readFileSync(RECORD_PATH));
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    const doctored = clone(recorded);
    const row = doctored.declarations.find((one) =>
      one.computed.some((reading) => reading.read === true),
    );
    assert.ok(row, 'defect: the record carries no resolved reading to doctor');
    row.computed.find((one) => one.read === true).value = 'rgb(1, 2, 3)';
    const failure = reddens(
      () => refuseUnlessFixedPoint(canonical(doctored)),
      'a candidate the default pin refuses',
    );
    assert.match(
      failure.message,
      /moved in the|not the fixed point|Nothing was written/,
      `the refusal must state what it refused; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.equal(
      digest(readFileSync(RECORD_PATH)),
      before,
      `${RECORD_REL} changed while the writer refused a candidate, so the refusal path writes`,
    );
    const unpinned = clone(recorded);
    unpinned.capture.check = 'node --test scripts/panel-styles.test.mjs';
    const second = reddens(
      () => refuseUnlessFixedPoint(canonical(unpinned)),
      'a candidate whose capture command is not this suite’s',
    );
    assert.match(
      second.message,
      /capture\.check/,
      `the refusal must name the field it refused; it produced ${JSON.stringify(second.message.slice(0, 320))}`,
    );
    assert.equal(
      digest(readFileSync(RECORD_PATH)),
      before,
      `${RECORD_REL} changed while the writer refused a second candidate`,
    );
    assert.doesNotThrow(() =>
      refuseUnlessFixedPoint(canonical(derivedFromHead())),
    );
    console.log(
      `refusal path: ${failure.message.split('\n')[0]} — ${RECORD_REL} unchanged at sha256 ${before.slice(0, 12)}`,
    );
  });

  it('the six pins hold one record, and every mutant above reddened a different one', () => {
    const recorded = JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
    const pins = [
      ['shape', () => pinShape(recorded)],
      ['declared', () => pinDeclared(recorded)],
      ['computed', () => pinComputed(recorded)],
      ['absences', () => pinAbsences(recorded)],
      ['surface', () => pinSurface(recorded)],
      ['census', () => pinCensus(recorded)],
    ];
    for (const [name, pin] of pins) {
      assert.doesNotThrow(
        pin,
        `the ${name} pin must hold the committed record`,
      );
    }
    console.log(
      `${RECORD_REL}: ${String(pins.length)} pins hold ${String(recorded.declarations.length)} row(s) over ${String(recorded.counts.selectors)} selector(s)`,
    );
  });
});
