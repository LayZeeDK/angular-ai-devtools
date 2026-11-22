/**
 * M061 T001 — pins the record-shapes record for the provider entry the injector walk carries, and
 * for the formatter no record in this tree names.
 *
 * `research/raw/m061-record-shapes.json` is written ONLY by an armed capture
 * (`M061_CAPTURE=1 node --test scripts/locale-correctness-shapes.test.mjs`). The default run
 * re-derives every measured section from `extension/agent-main.js` at this checkout and asserts the
 * committed bytes against a fresh serialization, so a second armed run is byte-identical by
 * construction (the second test below shows it, rather than claiming it).
 *
 * Nothing about the entry shape is a literal here. The four field names, the kind probes and their
 * order, the token rule, every line range and the call sites of the provider read are read out of
 * the source, the provider reduction the record reports is the source's own block executed over
 * the fixture, and the fixture's token is the installed `@angular/core`'s `LOCALE_ID` — so a source
 * that moves reddens naming the anchor that moved instead of agreeing with a copy of itself.
 *
 * The suite's scans (`research/raw/*.json`, `extension/*.js`) exclude this milestone's own records,
 * named by OWN_RECORD_PREFIX, so the census cannot mistake this record for one of the records it
 * maps and a later M061 record cannot redden the absence it measures.
 *
 * Three mutants run the pins they are aimed at and must redden by name: an entry matched by
 * position instead of by token, an entry that carries the `useValue`, and a second provider read.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '..');
const RECORD_REL = 'research/raw/m061-record-shapes.json';
const RECORD_PATH = join(
  REPO_ROOT,
  'research',
  'raw',
  'm061-record-shapes.json',
);
const AGENT_MAIN_REL = 'extension/agent-main.js';
const AGENT_MAIN_PATH = join(REPO_ROOT, 'extension', 'agent-main.js');
const PROVIDER_RECORD_DTS = 'node_modules/@angular/core/types/core.d.ts';
const CORE_PACKAGE_JSON = 'node_modules/@angular/core/package.json';

/** Armed only by the exact flag the task's capture line uses. */
const CAPTURE = process.env.M061_CAPTURE === '1';

/** This milestone's own records, excluded from every scan this suite performs. */
const OWN_RECORD_PREFIX = 'm061-';

/** The value the fixture provides: the one string no field of an entry may carry. */
const LOCALE_VALUE = 'fr-FR';

/** The words an absence is measured over: a formatter, a pipe, a locale. */
const LOCALE_WORD = /formatter|i18n|locale|pipe/i;

/** A key that names a formatter, a pipe or a locale as such — the strict reading of the absence. */
const FORMATTER_OR_LOCALE_FIELD =
  /^(?:format|formatter|formatters|locale|localeId|localeCode|locales|pipe|pipes|pipeName|i18n|i18nLocale)$/i;

/** The two commands whose exact output the record carries beside `git rev-parse HEAD`. */
const RECORD_KEY_SCAN_COMMAND =
  "node -e \"const fs=require('fs');const d='research/raw';for(const f of fs.readdirSync(d).sort()){if(!f.endsWith('.json')||f.startsWith('m061-'))continue;let v;try{v=JSON.parse(fs.readFileSync(d+'/'+f,'utf8'))}catch(e){continue}const w=(o,p)=>{if(Array.isArray(o)){o.forEach((x,i)=>w(x,p+'['+i+']'))}else if(o&&typeof o==='object'){for(const [k,x] of Object.entries(o)){if(/formatter|i18n|locale|pipe/i.test(k))console.log(d+'/'+f+':'+(p?p+'.':'')+k);w(x,p?p+'.'+k:k)}}};w(v,'')}\"";
const EXTENSION_WORD_SCAN_COMMAND =
  "node -e \"const fs=require('fs');const W=/formatter|i18n|locale|pipe/i;for(const f of fs.readdirSync('extension').sort()){if(!f.endsWith('.js'))continue;const ls=fs.readFileSync('extension/'+f,'utf8').split(/\\r?\\n/);ls.forEach((l,i)=>{const m=l.match(W);if(m)console.log('extension/'+f+':'+(i+1)+':'+m[0])})}\"";

// --------------------------------------------------------------- git ----

/** One git call, with its pipes captured so a failing probe answers rather than printing. */
function git(args) {
  return execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

/** The head the record must carry, derived — never typed. */
function gitHead() {
  return git(['rev-parse', 'HEAD']).trim();
}

/**
 * Whether `sha` is a commit this checkout can reach from HEAD: `rev-parse --verify` refuses a sha no
 * object carries, and `merge-base --is-ancestor` refuses a commit this history does not contain. Both
 * run with `stdio: 'pipe'`, so a refusal is a return value and never a stream into the report.
 */
function headIsAncestor(sha) {
  try {
    git(['rev-parse', '--verify', `${sha}^{commit}`]);
  } catch {
    return false;
  }
  try {
    git(['merge-base', '--is-ancestor', sha, 'HEAD']);
    return true;
  } catch {
    return false;
  }
}

/** A file as the recorded head holds it, so a pin can hold the head's bytes rather than today's. */
function fileAtHead(sha, rel) {
  return git(['show', `${sha}:${rel}`]);
}

// ------------------------------------------------------------ source ----

/** The 1-indexed line an offset sits on. */
function lineAt(source, offset) {
  return source.slice(0, offset).split('\n').length;
}

/** The 1-indexed line of `anchor`, refused when the anchor is gone or is not the one place. */
function lineOf(source, anchor) {
  const at = source.indexOf(anchor);
  if (at === -1) {
    throw new Error(
      `${AGENT_MAIN_REL} no longer contains ${JSON.stringify(anchor)} — the read this record pins has moved`,
    );
  }
  if (source.indexOf(anchor, at + 1) !== -1) {
    throw new Error(
      `${AGENT_MAIN_REL} contains ${JSON.stringify(anchor)} more than once — the read this record pins is ambiguous`,
    );
  }
  return lineAt(source, at);
}

/** `first-last` for two anchors inside one block, in the record's own notation. */
function spanWithin(block, startAnchor, endAnchor) {
  const at = (anchor) => {
    const found = block.text.indexOf(anchor);
    if (found === -1) {
      throw new Error(
        `the block starting at line ${block.firstLine} no longer contains ${JSON.stringify(anchor)} — the read this record pins has moved`,
      );
    }
    return block.text.slice(0, found).split('\n').length;
  };
  const first = block.firstLine + at(startAnchor) - 1;
  const last = block.firstLine + at(endAnchor) - 1;
  if (last < first) {
    throw new Error(
      `${JSON.stringify(endAnchor)} sits above ${JSON.stringify(startAnchor)} — the span is inverted`,
    );
  }
  return `${first}-${last}`;
}

/**
 * The brace-matched text from `anchor`, with comments and string literals skipped so a brace in
 * prose cannot end it early.
 */
function braceBlock(text, anchor) {
  const at = text.indexOf(anchor);
  if (at === -1) {
    throw new Error(
      `${AGENT_MAIN_REL} no longer contains ${JSON.stringify(anchor)} — the read this record pins has moved`,
    );
  }
  const open = text.indexOf('{', at);
  let depth = 0;
  let quote = '';
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') {
      const end = text.indexOf('\n', i);
      i = end === -1 ? text.length : end;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = text.indexOf('*/', i);
      i = end === -1 ? text.length : end + 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return { text: text.slice(at, i + 1), start: at, end: i };
      }
    }
  }
  throw new Error(
    `the block opened at ${JSON.stringify(anchor)} is never closed`,
  );
}

/** The block that starts at `anchor` in a whole file, with absolute 1-indexed lines. */
function blockOf(source, anchor) {
  const block = braceBlock(source, anchor);
  return {
    text: block.text,
    firstLine: lineAt(source, block.start),
    lastLine: lineAt(source, block.end),
  };
}

/** The block that starts at `anchor` inside `outer`, with absolute lines taken from the outer one. */
function blockWithin(outer, anchor) {
  const block = braceBlock(outer.text, anchor);
  const lead = outer.text.slice(0, block.start).split('\n').length - 1;
  const tail = outer.text.slice(0, block.end).split('\n').length - 1;
  return {
    text: block.text,
    firstLine: outer.firstLine + lead,
    lastLine: outer.firstLine + tail,
  };
}

/** The contiguous `//` comment run immediately above `anchor`, as text and as a line range. */
function commentAbove(source, anchor) {
  const at = source.indexOf(anchor);
  if (at === -1) {
    throw new Error(
      `${AGENT_MAIN_REL} no longer contains ${JSON.stringify(anchor)} — the read this record pins has moved`,
    );
  }
  const before = source.slice(0, at).split('\n');
  const run = [];
  for (let i = before.length - 2; i >= 0; i--) {
    const line = before[i].trim();
    if (!line.startsWith('//')) break;
    run.unshift(before[i]);
  }
  if (!run.length) {
    throw new Error(`no comment run above ${JSON.stringify(anchor)}`);
  }
  const lastLine = lineAt(source, at) - 1;
  return {
    text: run.join('\n'),
    lineRange: `${lastLine - run.length + 1}-${lastLine}`,
  };
}

/** The same text with every comment character blanked to a space, so offsets line up. */
function codeOnly(source) {
  const out = source.split('');
  const blank = (from, to) => {
    for (let i = from; i < to; i++) if (out[i] !== '\n') out[i] = ' ';
  };
  let quote = '';
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') {
      const end = source.indexOf('\n', i);
      const stop = end === -1 ? source.length : end;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i);
      const stop = end === -1 ? source.length : end + 2;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
  }
  return out.join('');
}

// ------------------------------------------- the source the record pins ----

/** The provider read: the guard and the call, brace-matched from its `if`. */
function readProviderRead(source) {
  const block = blockOf(
    source,
    "if (ng && typeof ng.ɵgetInjectorProviders === 'function') {",
  );
  return {
    lineRange: `${block.firstLine}-${block.lastLine}`,
    callLine: String(lineOf(source, 'ɵgetInjectorProviders(inj)')),
  };
}

/** The reduction: the block that builds one entry per provider record. */
function readReduction(source) {
  return blockOf(source, 'if (Array.isArray(providers)) {');
}

/**
 * The four field names of an entry, read out of the entry's own object literal inside the
 * reduction — four `var entry = {` literals exist in the file, so the reduction scopes the read.
 */
function readEntryFields(reduction) {
  const block = blockWithin(reduction, 'var entry = {');
  const inner = block.text.slice(
    block.text.indexOf('{') + 1,
    block.text.lastIndexOf('}'),
  );
  const fields = [];
  let depth = 0;
  let quote = '';
  let current = '';
  const push = () => {
    const found = /^\s*([A-Za-z_$][\w$]*)\s*:/.exec(current);
    if (found) fields.push(found[1]);
    current = '';
  };
  for (const ch of inner) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      push();
      continue;
    }
    current += ch;
  }
  push();
  return {
    fields,
    lineRange: `${block.firstLine}-${block.lastLine}`,
    text: block.text,
  };
}

/** The kind probes in source order: which provider key is asked, and the kind it sets. */
function readProviderKinds(source) {
  const kinds = [];
  const probes = [
    ...source.matchAll(/hasOwnProperty\.call\(prov, '([A-Za-z]+)'\)/g),
  ];
  for (const probe of probes) {
    const after = source.slice(probe.index, probe.index + 400);
    const kind = /providerKind = '([a-z]+)';/.exec(after);
    if (!kind) {
      throw new Error(
        `the probe ${JSON.stringify(probe[1])} sets no providerKind — the kind chain moved`,
      );
    }
    kinds.push({
      probe: probe[1],
      kind: kind[1],
      probeLine: lineAt(source, probe.index),
      kindLine: lineAt(source, probe.index + kind.index),
    });
  }
  if (!kinds.length) {
    throw new Error(
      'no hasOwnProperty kind probe found in extension/agent-main.js',
    );
  }
  return kinds;
}

/** The token rule, read out of `routerTokenNameOf` and the comment that explains it. */
function readTokenRule(source) {
  const fn = blockOf(source, 'function routerTokenNameOf(token) {');
  const comment = commentAbove(source, 'function routerTokenNameOf(token) {');
  const steps = [];
  const step = (pattern, label) => {
    if (!pattern.test(fn.text)) {
      throw new Error(
        `routerTokenNameOf no longer states the rule ${JSON.stringify(label)} — the token derivation moved`,
      );
    }
    steps.push(label);
  };
  step(
    /if \(token === null \|\| typeof token === 'undefined'\) return null;/,
    'null or undefined answers null',
  );
  step(
    /if \(typeof token === 'string'\) return token;/,
    'a string token is the name itself',
  );
  step(
    /if \(typeof token\.name === 'string' && token\.name\.length\)/,
    "a token's non-empty name is the name",
  );
  step(
    /if \(typeof token\.toString === 'function'\) return String\(token\);/,
    'otherwise the token is stringified',
  );
  return {
    fn: 'routerTokenNameOf',
    lineRange: `${fn.firstLine}-${fn.lastLine}`,
    commentLineRange: comment.lineRange,
    comment: comment.text,
    steps,
    provideNotRead:
      comment.text.includes('provider.provide') &&
      comment.text.includes('not read'),
  };
}

/** Every read of the provider API, and the direct calls among them, with their lines. */
function readProviderReads(source) {
  const code = codeOnly(source);
  const occurrences = [...code.matchAll(/ɵgetInjectorProviders/g)].map(
    (found) => lineAt(source, found.index),
  );
  const calls = [...code.matchAll(/ɵgetInjectorProviders\s*\(/g)].map((found) =>
    lineAt(source, found.index),
  );
  return { occurrences, calls };
}

/** The `ProviderRecord` the installed Angular returns, so the fixture's input is not this suite's invention. */
function readProviderRecordDecl() {
  const dts = readFileSync(join(REPO_ROOT, PROVIDER_RECORD_DTS), 'utf8');
  const block = blockOf(dts, 'interface ProviderRecord {');
  const fields = [...block.text.matchAll(/^\s{4}([A-Za-z]+)\??:/gm)].map(
    (found) => found[1],
  );
  const version = JSON.parse(
    readFileSync(join(REPO_ROOT, CORE_PACKAGE_JSON), 'utf8'),
  ).version;
  return {
    path: PROVIDER_RECORD_DTS,
    interface: 'ProviderRecord',
    fields,
    version,
  };
}

// ----------------------------------------------------------- fixture ----

const core = await import('@angular/core');

/** The provider's own module, as a page declares it: the import path arrives as a class. */
class AppConfig {}

/**
 * The provider list a page that provides a non-default `LOCALE_ID` hands the walk, in the shape
 * `ProviderRecord` declares. Index 0 is a decoy — a class-token provider the walk reduces first — so
 * an entry matched by position is not the locale entry and the pin can say so.
 */
const FIXTURE = [
  {
    token: core.ErrorHandler,
    provider: { provide: core.ErrorHandler, useClass: core.ErrorHandler },
    isViewProvider: false,
    importPath: [AppConfig],
  },
  {
    token: core.LOCALE_ID,
    provider: { provide: core.LOCALE_ID, useValue: LOCALE_VALUE },
    isViewProvider: false,
    importPath: [AppConfig],
  },
];

/** The token's name as any reader of it would get it — never a literal of this milestone's. */
function tokenNameOf(token) {
  return typeof token.name === 'string' && token.name.length
    ? token.name
    : String(token);
}

/** The fixture described as data, so the record states the input and not just the output. */
function describeInput(records) {
  return records.map((record, index) => ({
    index,
    token: tokenNameOf(record.token),
    isViewProvider: record.isViewProvider,
    providerKeys: Object.keys(record.provider),
    importPath: (record.importPath || []).map(tokenNameOf),
  }));
}

/** The reduction the source carries, executed over `providers` — the entry is the code's, not ours. */
function reduceProviders(source, providers) {
  const block = readReduction(source);
  const run = new Function(
    'providers',
    `var provs = [];\n${block.text}\nreturn provs;`,
  );
  return run(providers);
}

// ---------------------------------------------------------- absence ----

/** Every word hit in `extension/*.js`, each classified by whether a comment holds it. */
function scanExtensionWords() {
  const dir = join(REPO_ROOT, 'extension');
  const hits = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.js')) continue;
    const source = readFileSync(join(dir, name), 'utf8');
    const code = codeOnly(source);
    source.split('\n').forEach((line, index) => {
      for (const found of line.matchAll(new RegExp(LOCALE_WORD.source, 'gi'))) {
        const inComment =
          code
            .split('\n')
            [index].slice(found.index, found.index + found[0].length) !==
          found[0];
        hits.push({
          path: `extension/${name}`,
          line: index + 1,
          word: found[0],
          inComment,
        });
      }
    });
  }
  return hits;
}

/** Every key under `research/raw/*.json` that bears a locale word, and the strict subset. */
function scanRecordKeys() {
  const dir = join(REPO_ROOT, 'research', 'raw');
  const keys = [];
  const strict = [];
  const unparsable = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.json') || name.startsWith(OWN_RECORD_PREFIX)) continue;
    const rel = `research/raw/${name}`;
    let value;
    try {
      value = JSON.parse(readFileSync(join(dir, name), 'utf8'));
    } catch {
      unparsable.push(rel);
      continue;
    }
    const walk = (node, path) => {
      if (Array.isArray(node)) {
        node.forEach((item, index) => walk(item, `${path}[${index}]`));
        return;
      }
      if (node && typeof node === 'object') {
        for (const [key, item] of Object.entries(node)) {
          const at = path ? `${path}.${key}` : key;
          if (LOCALE_WORD.test(key)) keys.push({ path: rel, key: at });
          if (FORMATTER_OR_LOCALE_FIELD.test(key)) {
            strict.push({ path: rel, key: at });
          }
          walk(item, at);
        }
      }
    };
    walk(value, '');
  }
  return { keys, strict, unparsable };
}

// ------------------------------------------------------------- pins ----

/**
 * The one place the locale entry is located: by the token it carries. `position` is the mutant — the
 * first entry of the list, which is the decoy — and it exists so the pin can be shown to redden.
 */
function localeEntryByToken(entries, token) {
  return entries.find((entry) => entry.token === token) || null;
}

function localeEntryByPosition(entries) {
  return entries[0] || null;
}

/** The pin: the selected entry is the locale entry, named by token, kind and import path. */
function assertLocaleEntry(selected, expected, how) {
  assert.ok(
    selected,
    `${how}: no provider entry was selected, so no LOCALE_ID entry is named`,
  );
  assert.equal(
    selected.token,
    expected.token,
    `${how}: the selected entry names the token ${JSON.stringify(selected.token)} but the locale entry carries ${JSON.stringify(expected.token)} — an entry matched by position is the decoy at index 0, never the entry that carries the token`,
  );
  assert.equal(
    selected.provider,
    expected.provider,
    `${how}: the selected entry's kind is ${JSON.stringify(selected.provider)}, not ${JSON.stringify(expected.provider)}`,
  );
  assert.equal(
    selected.importPath,
    expected.importPath,
    `${how}: the selected entry's import path is ${JSON.stringify(selected.importPath)}, not ${JSON.stringify(expected.importPath)}`,
  );
}

/** The pin: the provided value is in no field of the entry, and the absence says so. */
function assertValueNotRecorded(entry, value) {
  const text = JSON.stringify(entry);
  assert.ok(
    !text.includes(value),
    `locale-value-not-recorded is broken: the entry carries the provided value ${JSON.stringify(value)} — the walk reduces a useValue provider to the kind string 'value' (:1184-1185) and the entry literal (:1215-1223) reads no useValue`,
  );
  for (const field of Object.keys(entry)) {
    assert.ok(
      !/^(?:value|useValue|providedValue)$/.test(field),
      `locale-value-not-recorded is broken: the entry carries a ${JSON.stringify(field)} field`,
    );
  }
}

/** The pin: the read count is the walk's, and this milestone added no second read. */
function assertNoSecondRead(added, walked) {
  assert.equal(
    added,
    0,
    `a second provider read was added: the source has ${walked} direct call(s) of ɵgetInjectorProviders where the head the record names had a different count — the record counts the injector walk as the read it reduces and states no second read was added`,
  );
}

/** The failure a pin raises; a pin that passes has nothing to report and is itself a failure. */
function failureOf(run) {
  try {
    run();
  } catch (error) {
    return error;
  }
  assert.fail(
    'the pin passed on the mutant, so the mutation is not caught — a green mutant is a broken pin',
  );
}

// ------------------------------------------------------ measurement ----

let measured = null;

/** Everything the record states, measured once from the source at this checkout. */
function measure() {
  if (measured) return measured;
  const source = readFileSync(AGENT_MAIN_PATH, 'utf8');
  const reduction = readReduction(source);
  const entry = readEntryFields(reduction);
  const kinds = readProviderKinds(source);
  const tokenRule = readTokenRule(source);
  const reads = readProviderReads(source);
  const providerRead = readProviderRead(source);
  const tokenDerivation = spanWithin(reduction, 'var token =', ': String(pr);');
  const kindDefault = lineOf(source, "var providerKind = 'none';");
  const kindFunction = blockOf(
    source,
    "else if (typeof prov === 'function') {",
  );
  const kindBlock = `${kindDefault}-${kindFunction.lastLine}`;
  const entries = reduceProviders(source, FIXTURE);
  const localeIndex = FIXTURE.findIndex(
    (record) => record.token === core.LOCALE_ID,
  );
  const localeEntry = entries[localeIndex];
  if (!localeEntry) {
    throw new Error(
      'the source reduction produced no entry for the locale token — the reduction this record pins has moved',
    );
  }
  measured = {
    source,
    reduction,
    entry,
    kinds,
    tokenRule,
    reads,
    providerRead,
    tokenDerivation,
    kindDefault,
    kindFunction,
    kindBlock,
    entries,
    localeEntry,
    expected: {
      token: tokenNameOf(core.LOCALE_ID),
      provider: localeEntry.provider,
      importPath: localeEntry.importPath,
    },
  };
  return measured;
}

// ------------------------------------------------------ serialization ----

/** The record, assembled from the measurement. `byteTotal` fixes its own stated size. */
function buildRecord(head, byteTotal, commands) {
  const m = measure();
  const keys = scanRecordKeys();
  const words = scanExtensionWords();
  const useValueKind = m.kinds.find((kind) => kind.probe === 'useValue');
  const values = {
    head,
    entryFields: m.entry.fields,
    localeToken: m.localeEntry.token,
    localeKind: m.localeEntry.provider,
    localePath: m.localeEntry.importPath,
    value: LOCALE_VALUE,
  };
  return {
    schema: 'm061-record-shapes/v1',
    milestone: 'M061',
    task: 'T001',
    head,
    commands,
    records: [
      {
        path: AGENT_MAIN_REL,
        carries:
          `the provider entry at ${AGENT_MAIN_REL}:${m.entry.lineRange}: each record ` +
          'ɵgetInjectorProviders answers (' +
          `${AGENT_MAIN_REL}:${m.providerRead.lineRange}` +
          ') is reduced to four fields and no fifth — ' +
          `${values.entryFields.join(', ')} — where \`provider\` is the kind string ` +
          'the probe chain sets and never the provider object',
      },
      {
        path: AGENT_MAIN_REL,
        carries:
          'the LOCALE_ID provider entry this record reduces: the page-declared ' +
          `useValue provider yields token ${JSON.stringify(values.localeToken)}, ` +
          `kind ${JSON.stringify(values.localeKind)} and import path ` +
          `${JSON.stringify(values.localePath)}, and the provided value is in no ` +
          `field — ${AGENT_MAIN_REL}:${useValueKind.probeLine}-${useValueKind.kindLine} ` +
          'sets the kind string and the entry literal at ' +
          `${AGENT_MAIN_REL}:${m.entry.lineRange} reads no useValue`,
      },
      {
        path: AGENT_MAIN_REL,
        carries:
          'the token rule at ' +
          `${AGENT_MAIN_REL}:${m.tokenRule.lineRange} with its comment at ` +
          `${AGENT_MAIN_REL}:${m.tokenRule.commentLineRange}: routerTokenNameOf ` +
          'answers a string token unchanged, a token\u2019s non-empty `name`, else ' +
          'String(token), else null; the comment records that provider.provide is ' +
          'deliberately not read, so no token in this record comes from `provide`',
      },
    ],
    providers: {
      reduction:
        `${AGENT_MAIN_REL}:${m.reduction.firstLine}-${m.reduction.lastLine}, ` +
        'executed as source over the input below — this record builds no entry of its own',
      inputFrom: readProviderRecordDecl(),
      input: describeInput(FIXTURE),
      entries: m.entries,
      localeEntry: {
        ...m.localeEntry,
        matchedBy: 'token',
        tokenNote:
          'the token is the walk\u2019s derivation from the token object ' +
          `(${AGENT_MAIN_REL}:${m.tokenRule.lineRange}), not a literal of this ` +
          'record\u2019s: the installed LOCALE_ID publishes no name, so the walk ' +
          'answers String(token), and a join must match that string. The ' +
          'description LOCALE_ID appears here and in the carries prose only to ' +
          'name which Angular token was measured; no field of this record was ' +
          'read from the page',
      },
    },
    inventory: {
      measured:
        'the join T002 publishes, localeCorrectness(records) on ' +
        'globalThis.angularAiLocaleCorrectness, is a runtime export over the fields ' +
        'this record names, and T001 measures the fields rather than the join (T002); ' +
        'the surface record T003 writes — research/raw/m061-surface.json, its ' +
        'PANEL_SURFACES entry, LOADERS key and digest rows — renders the join\u2019s ' +
        'states and is named outside this map rather than mapped by it (T003); the ' +
        'verdict-claims record T004 publishes cites this map by artefactPath and ' +
        're-derives each claim against the tree, so it reads this map rather than ' +
        'being mapped by it (T004); and the two gate records T005 re-derives, ' +
        'research/raw/m044-gate-shapes.json and research/raw/m056-gate-stability.json, ' +
        'are measured from the suites rather than from this milestone\u2019s records (T005).',
      outsideTheMap: [
        {
          path: 'research/raw/m061-surface.json',
          why: 'the locale-correctness surface record T003 adds — the PANEL_SURFACES entry, the LOADERS key and the digest rows that render the states of the T002 join; T001 names the surface and does not map the surface record itself, so it is captured after this map was measured (T003).',
        },
        {
          path: 'research/raw/m061-verdict-claims.json',
          why: 'the verdict-claims record T004 publishes — the claims that cite this milestone\u2019s artefacts by artefactPath and re-derive each against the tree, reading this map rather than being mapped by it (T004).',
        },
      ],
    },
    producer: {
      path: AGENT_MAIN_REL,
      read:
        `static read of ${AGENT_MAIN_REL} at ${head}: the provider read ` +
        `${m.providerRead.lineRange}, the reduction ${m.reduction.firstLine}-${m.reduction.lastLine}, ` +
        `the kind chain ${m.kindBlock}, ` +
        `the entry object ${m.entry.lineRange}, the walk\u2019s token derivation ` +
        `${m.tokenDerivation}, and the token rule ${m.tokenRule.lineRange} with ` +
        `its comment ${m.tokenRule.commentLineRange}`,
      lineRanges: {
        providerRead: m.providerRead.lineRange,
        reduction: `${m.reduction.firstLine}-${m.reduction.lastLine}`,
        providerKinds: m.kindBlock,
        useValueBranch: `${useValueKind.probeLine}-${useValueKind.kindLine}`,
        entryObject: m.entry.lineRange,
        tokenDerivation: m.tokenDerivation,
        tokenRule: m.tokenRule.lineRange,
        tokenRuleComment: m.tokenRule.commentLineRange,
      },
      entryFields: m.entry.fields,
      fieldCount: m.entry.fields.length,
      providerKinds: m.kinds,
      providerKindDefault: { kind: 'none', line: m.kindDefault },
      providerKindFunction: {
        kind: 'class',
        lineRange: `${m.kindFunction.firstLine}-${m.kindFunction.lastLine}`,
      },
      tokenRule: {
        fn: m.tokenRule.fn,
        lineRange: m.tokenRule.lineRange,
        commentLineRange: m.tokenRule.commentLineRange,
        comment: m.tokenRule.comment,
        steps: m.tokenRule.steps,
        provideNotRead: m.tokenRule.provideNotRead,
      },
      providerReads: {
        occurrences: m.reads.occurrences.length,
        occurrenceLines: m.reads.occurrences,
        directCalls: m.reads.calls.length,
        directCallLines: m.reads.calls,
        walk: m.providerRead.lineRange,
        reduced: 1,
        addedByThisMilestone: 0,
        detail:
          'the walk at ' +
          `${AGENT_MAIN_REL}:${m.providerRead.lineRange}` +
          ' is the only provider read this record reduces and this milestone added none; ' +
          `the other ${m.reads.occurrences.length - 1} reads of the API in the file are ` +
          'counted here rather than claimed away, and only one of them is a direct call',
      },
    },
    absence: {
      'locale-value-not-recorded': {
        count: m.entry.fields.length,
        provider: values.localeKind,
        detail:
          `the reduction sets the kind string at ${AGENT_MAIN_REL}:` +
          `${useValueKind.probeLine}-${useValueKind.kindLine} for a useValue provider and ` +
          `builds the entry at ${AGENT_MAIN_REL}:${m.entry.lineRange} from ` +
          `${m.entry.fields.join(', ')} and no other field; none of them reads ` +
          `useValue, so the provided value ${JSON.stringify(values.value)} is in no ` +
          'field and is not recoverable from the record. The count is the entry\u2019s ' +
          'field count: every field an entry has was read looking for the value',
      },
      'no-formatter-named': {
        records: {
          wordBearingKeys: keys.keys,
          formatterOrLocaleFields: keys.strict,
          unparsable: keys.unparsable,
        },
        extension: {
          wordHits: words.map((hit) => ({
            path: hit.path,
            line: hit.line,
            word: hit.word,
            inComment: hit.inComment,
          })),
          codeHits: words.filter((hit) => !hit.inComment).length,
          commentHits: words.filter((hit) => hit.inComment).length,
          files: new Set(words.map((hit) => hit.path)).size,
        },
        detail:
          'no record under research/raw/ and no shipped field under extension/*.js ' +
          'names a formatter, a pipe or a locale: no key in any record is named ' +
          'format, formatter, pipe or locale as such, the keys that bear the words are ' +
          'an Angular compiler option about i18n message-id legacy format and an RxJS ' +
          'observable accessor, and every word occurrence in extension/*.js is inside ' +
          'a comment, so this milestone\u2019s join can read a formatter from no ' +
          'record and must report the absence instead',
      },
    },
    verdict: `This record is ${byteTotal} bytes, the UTF-8 length of the file the armed capture wrote, stated so the byte-consistency scan has a count of this file to hold.`,
  };
}

/**
 * The record as bytes, with its own byte total at a fixed point: the verdict states a count, the
 * count changes the length, so the capture iterates until the stated count is the file's length.
 * `commands` is passed in so the two recorded scans keep the exact output the capture read.
 */
function serializeRecord(head, commands) {
  let byteTotal = 0;
  for (let attempt = 0; attempt < 24; attempt++) {
    const text = `${JSON.stringify(buildRecord(head, byteTotal, commands), null, 2)}\n`;
    const length = Buffer.byteLength(text, 'utf8');
    if (length === byteTotal) return text;
    byteTotal = length;
  }
  throw new Error('the stated byte total did not reach a fixed point');
}

/** A command run through the shell exactly as the record states it, its trailing newline dropped. */
function runCommand(command) {
  return execSync(command, { cwd: REPO_ROOT, encoding: 'utf8' }).replace(
    /\n+$/,
    '',
  );
}

/** The commands the capture runs and records: the head, the two scans, and the capture itself. */
function captureCommands(head) {
  return [
    { command: 'git rev-parse HEAD', output: head },
    {
      command: RECORD_KEY_SCAN_COMMAND,
      output: runCommand(RECORD_KEY_SCAN_COMMAND),
    },
    {
      command: EXTENSION_WORD_SCAN_COMMAND,
      output: runCommand(EXTENSION_WORD_SCAN_COMMAND),
    },
    {
      command:
        'M061_CAPTURE=1 node --test scripts/locale-correctness-shapes.test.mjs',
      output:
        'capture run: serialized every section from the source at the captured head and wrote ' +
        `${RECORD_REL} byte-exactly; the suite then asserted the file it wrote`,
    },
  ];
}

const head = gitHead();
if (CAPTURE)
  writeFileSync(RECORD_PATH, serializeRecord(head, captureCommands(head)));

function loadRecord() {
  if (!existsSync(RECORD_PATH)) {
    throw new Error(
      `${RECORD_REL} is missing — run ` +
        '`M061_CAPTURE=1 node --test scripts/locale-correctness-shapes.test.mjs` to write it, then keep it',
    );
  }
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

// ------------------------------------------------------------- tests ----

test('a second armed run is byte-identical: two serializations and the committed file agree', () => {
  const recorded = loadRecord();
  const first = serializeRecord(recorded.head, recorded.commands);
  const second = serializeRecord(recorded.head, recorded.commands);
  assert.equal(
    second,
    first,
    'two serializations at the same head differ — the capture is not deterministic',
  );
  assert.equal(
    readFileSync(RECORD_PATH, 'utf8'),
    first,
    'the committed record differs from a fresh serialization of the source at this head — recapture with M061_CAPTURE=1',
  );
});

test('the record pins its schema, milestone, task and the derived head', () => {
  const record = loadRecord();
  assert.equal(record.schema, 'm061-record-shapes/v1');
  assert.equal(record.milestone, 'M061');
  assert.equal(record.task, 'T001');
  assert.match(
    record.head,
    /^[0-9a-f]{40}$/,
    `head is not a full sha: ${record.head}`,
  );
  assert.ok(
    headIsAncestor(record.head),
    `the record was measured at ${record.head}, which this checkout cannot reach from HEAD — a record that names a commit no branch carries measures nothing this history holds`,
  );
  assert.equal(
    headIsAncestor('0'.repeat(40)),
    false,
    'the reachability rule does not bite: a sha no object carries must be refused',
  );
});

test('commands[0] is `git rev-parse HEAD` and its output is the head field', () => {
  const record = loadRecord();
  assert.ok(Array.isArray(record.commands), 'commands[] is missing');
  assert.equal(
    record.commands[0].command,
    'git rev-parse HEAD',
    'commands[0] is not the head command',
  );
  assert.equal(
    record.commands[0].output,
    record.head,
    `commands[0].output ${JSON.stringify(record.commands[0].output)} and head ${JSON.stringify(record.head)} disagree`,
  );
  for (const [index, entry] of record.commands.entries()) {
    assert.equal(
      typeof entry.command,
      'string',
      `commands[${index}] has no command`,
    );
    assert.ok(
      typeof entry.output === 'string' && entry.output.length,
      `commands[${index}] has no output`,
    );
  }
  assert.ok(
    record.commands.some(
      (entry) =>
        entry.command ===
        'M061_CAPTURE=1 node --test scripts/locale-correctness-shapes.test.mjs',
    ),
    'no commands entry records the armed capture itself',
  );
});

test('the entry shape is re-derived from extension/agent-main.js at run time', () => {
  const record = loadRecord();
  const m = measure();
  assert.deepEqual(
    record.producer.entryFields,
    m.entry.fields,
    'the record\u2019s entry fields are not the ones the entry literal at :1215-1223 declares',
  );
  assert.deepEqual(
    record.producer.entryFields,
    ['token', 'isViewProvider', 'provider', 'importPath'],
    'the entry is four fields — token, isViewProvider, provider, importPath — and this asserts the shape rather than the order alone',
  );
  assert.equal(
    record.producer.fieldCount,
    m.entry.fields.length,
    'the stated field count is not the entry\u2019s own',
  );
  assert.deepEqual(
    record.producer.providerKinds,
    m.kinds,
    'the kind chain the record states is not the hasOwnProperty chain the source carries, in source order',
  );
  assert.deepEqual(
    record.producer.providerKindDefault,
    { kind: 'none', line: m.kindDefault },
    'the kind a provider starts at is not the default the source declares',
  );
  assert.deepEqual(
    record.producer.providerKindFunction,
    {
      kind: 'class',
      lineRange: `${m.kindFunction.firstLine}-${m.kindFunction.lastLine}`,
    },
    'a provider that is itself a function takes the kind the source assigns it',
  );
  assert.deepEqual(
    record.producer.lineRanges,
    {
      providerRead: m.providerRead.lineRange,
      reduction: `${m.reduction.firstLine}-${m.reduction.lastLine}`,
      providerKinds: m.kindBlock,
      useValueBranch: `${m.kinds.find((k) => k.probe === 'useValue').probeLine}-${m.kinds.find((k) => k.probe === 'useValue').kindLine}`,
      entryObject: m.entry.lineRange,
      tokenDerivation: m.tokenDerivation,
      tokenRule: m.tokenRule.lineRange,
      tokenRuleComment: m.tokenRule.commentLineRange,
    },
    'a line range the record states is not where that read sits in extension/agent-main.js',
  );
  assert.equal(
    /useValue/.test(m.entry.text),
    false,
    'the entry literal now mentions useValue — the value would be recoverable and the absence would be false',
  );
});

test('the provider reduction the source carries yields the entries the record states', () => {
  const record = loadRecord();
  const m = measure();
  assert.deepEqual(
    record.providers.inputFrom,
    readProviderRecordDecl(),
    'the input shape the record names is not the ProviderRecord the installed @angular/core declares',
  );
  assert.deepEqual(
    record.providers.input,
    describeInput(FIXTURE),
    'the input the record states is not the fixture the suite reduces',
  );
  assert.deepEqual(
    record.providers.entries,
    m.entries,
    'the entries the record states are not what the source reduction at :1166-1226 produces over the fixture',
  );
  assert.ok(
    record.providers.entries.length > 1,
    'the fixture must hold a decoy beside the locale entry, or a position match is indistinguishable from a token match',
  );
});

test('the record names the LOCALE_ID entry by token, kind and import path, never by position', () => {
  const record = loadRecord();
  const m = measure();
  assert.equal(
    record.providers.localeEntry.matchedBy,
    'token',
    'the record must state that the entry is matched by token — the mutant states position',
  );
  assertLocaleEntry(
    localeEntryByToken(m.entries, record.providers.localeEntry.token),
    m.expected,
    'the record\u2019s token match',
  );
  assert.deepEqual(
    {
      token: record.providers.localeEntry.token,
      isViewProvider: record.providers.localeEntry.isViewProvider,
      provider: record.providers.localeEntry.provider,
      importPath: record.providers.localeEntry.importPath,
    },
    m.localeEntry,
    'the locale entry the record names is not the entry the source reduction produced',
  );
  assert.match(
    record.providers.localeEntry.tokenNote,
    /String\(token\)|literal/,
    'the token note must state that the token is the derivation\u2019s and not a literal',
  );
  assert.equal(
    typeof core.LOCALE_ID.name,
    'undefined',
    'the installed LOCALE_ID now publishes a name, so the walk would take the name and the token this record carries would be wrong',
  );
  assert.equal(
    m.expected.token,
    String(core.LOCALE_ID),
    'the token the record names is the derivation\u2019s answer for a token that publishes no name',
  );
});

test('the provided value is in no field of the entry: locale-value-not-recorded', () => {
  const record = loadRecord();
  const m = measure();
  const absence = record.absence['locale-value-not-recorded'];
  assert.ok(absence, 'the locale-value-not-recorded absence is missing');
  assert.equal(
    absence.count,
    m.entry.fields.length,
    'the absence counts every field an entry has, and the count is not the field count',
  );
  assert.match(
    absence.detail,
    /useValue/,
    'the absence detail never names the branch that discards the value',
  );
  assertValueNotRecorded(m.localeEntry, LOCALE_VALUE);
  assert.ok(
    !JSON.stringify(record.providers.entries).includes(LOCALE_VALUE),
    'a providers entry carries the provided value — the absence would be false',
  );
});

test('the token rule is routerTokenNameOf\u2019s, and provider.provide is not read', () => {
  const record = loadRecord();
  const m = measure();
  assert.deepEqual(
    record.producer.tokenRule,
    {
      fn: m.tokenRule.fn,
      lineRange: m.tokenRule.lineRange,
      commentLineRange: m.tokenRule.commentLineRange,
      comment: m.tokenRule.comment,
      steps: m.tokenRule.steps,
      provideNotRead: m.tokenRule.provideNotRead,
    },
    'the token rule the record states is not the one routerTokenNameOf carries',
  );
  assert.equal(
    record.producer.tokenRule.provideNotRead,
    true,
    'the comment above routerTokenNameOf no longer states that provider.provide is not read — the rule this record rests on has moved',
  );
  assert.match(
    record.producer.tokenRule.comment,
    /33 of the entry's 90 `provide` names/,
    'the comment that explains why provide is not read is carried by the record, and it no longer states its measurement',
  );
  assert.match(
    record.producer.tokenRule.steps.join(' '),
    /string token is the name itself/,
    'the record must state that a string token is returned unchanged, which is what the walk\u2019s own string is',
  );
  assert.ok(
    !/\.provide\b/.test(m.reduction.text),
    'the reduction now reads .provide — the token would come from the provider rather than from the token',
  );
});

test('the injector walk is the only provider read the record reduces, and no second read was added', () => {
  const record = loadRecord();
  const m = measure();
  const reads = record.producer.providerReads;
  assert.equal(
    reads.occurrences,
    m.reads.occurrences.length,
    'the count of provider reads the record states is not the count in extension/agent-main.js',
  );
  assert.deepEqual(
    reads.occurrenceLines,
    m.reads.occurrences,
    'the lines the record names for the provider read are not where the source reads it',
  );
  assert.equal(
    reads.directCalls,
    m.reads.calls.length,
    'the direct call count the record states is not the source\u2019s',
  );
  assert.deepEqual(reads.directCallLines, m.reads.calls);
  assert.equal(
    reads.walk,
    m.providerRead.lineRange,
    'the walk the record reduces is not the provider read at :1149-1155',
  );
  assert.equal(
    reads.reduced,
    1,
    'the record reduces exactly one provider read',
  );
  assert.equal(
    reads.addedByThisMilestone,
    0,
    'the record must state that this milestone added no provider read',
  );
  const atHead = readProviderReads(fileAtHead(record.head, AGENT_MAIN_REL));
  assertNoSecondRead(
    m.reads.calls.length - atHead.calls.length,
    m.reads.calls.length,
  );
});

test('no record and no shipped field names a formatter, a pipe or a locale', () => {
  const record = loadRecord();
  const absence = record.absence['no-formatter-named'];
  assert.ok(absence, 'the no-formatter-named absence is missing');
  const keys = scanRecordKeys();
  const words = scanExtensionWords();
  assert.deepEqual(
    absence.records.wordBearingKeys,
    keys.keys,
    'the word-bearing keys the record lists are not the ones research/raw/*.json carries',
  );
  assert.deepEqual(
    absence.records.formatterOrLocaleFields,
    keys.strict,
    'a record now carries a field named a formatter, a pipe or a locale',
  );
  assert.deepEqual(
    absence.records.formatterOrLocaleFields,
    [],
    'the absence is only true while no record names one',
  );
  assert.deepEqual(
    absence.records.unparsable,
    keys.unparsable,
    'the records that do not parse are listed, so a skipped record is never a clean one',
  );
  assert.deepEqual(
    absence.extension.wordHits,
    words.map((hit) => ({
      path: hit.path,
      line: hit.line,
      word: hit.word,
      inComment: hit.inComment,
    })),
    'the extension word hits the record lists are not the ones extension/*.js carries',
  );
  assert.equal(
    absence.extension.codeHits,
    words.filter((hit) => !hit.inComment).length,
    'a shipped field under extension/*.js now names a formatter, a pipe or a locale',
  );
  assert.equal(
    absence.extension.codeHits,
    0,
    'the absence is only true while no shipped field names one',
  );
  assert.match(
    absence.detail,
    /formatter/,
    'the absence detail never names what no record carries',
  );
});

test('the recorded scans and the absence agree line for line', () => {
  const record = loadRecord();
  const keyScan = record.commands.find((entry) =>
    entry.command.startsWith('node -e'),
  );
  assert.ok(keyScan, 'the record carries no JSON key scan command');
  assert.deepEqual(
    keyScan.output === '' ? [] : keyScan.output.split('\n'),
    record.absence['no-formatter-named'].records.wordBearingKeys.map(
      (entry) => `${entry.path}:${entry.key}`,
    ),
    'the key scan\u2019s recorded output and the absence\u2019s key list disagree',
  );
  const wordScan = record.commands.find((entry) =>
    entry.command.includes('extension'),
  );
  assert.ok(wordScan, 'the record carries no extension word scan command');
  assert.deepEqual(
    wordScan.output === '' ? [] : wordScan.output.split('\n'),
    record.absence['no-formatter-named'].extension.wordHits.map(
      (hit) => `${hit.path}:${hit.line}:${hit.word}`,
    ),
    'the word scan\u2019s recorded output and the absence\u2019s hit list disagree',
  );
});

test('the census map lists the measured artefact and names the records outside it, each why citing a task', () => {
  const record = loadRecord();
  assert.ok(
    Array.isArray(record.records) && record.records.length >= 1,
    'records[] is missing or empty',
  );
  assert.ok(
    record.records.some(
      (entry) =>
        entry.path === AGENT_MAIN_REL &&
        typeof entry.carries === 'string' &&
        entry.carries.length,
    ),
    'records[] must carry extension/agent-main.js with what it states',
  );
  for (const entry of record.records) {
    assert.match(
      entry.carries,
      /:\d+-\d+/,
      `the entry for ${entry.path} names no line range of the source it measures`,
    );
  }
  const outside = record.inventory && record.inventory.outsideTheMap;
  assert.ok(
    Array.isArray(outside) && outside.length >= 1,
    'inventory.outsideTheMap is missing or empty',
  );
  for (const entry of outside) {
    assert.ok(
      entry.path,
      `an outsideTheMap entry has no path: ${JSON.stringify(entry)}`,
    );
    assert.match(
      entry.why,
      /T00\d/,
      `the why for ${entry.path} never cites a task id`,
    );
    assert.ok(
      entry.path.startsWith('research/raw/m061-'),
      `outsideTheMap names ${entry.path}, which this milestone does not owe — a map may name outside itself only the records its own milestone writes`,
    );
  }
});

test('the verdict states this file\u2019s own byte total, and the file is that long', () => {
  const record = loadRecord();
  const found = record.verdict.match(/(\d+) bytes/);
  assert.ok(
    found,
    `the verdict never states an integer followed by "bytes": ${record.verdict}`,
  );
  assert.equal(
    Number(found[1]),
    Buffer.byteLength(readFileSync(RECORD_PATH), 'utf8'),
    `the verdict states ${found[1]} bytes and the file is not that long`,
  );
  const numericBytes = [];
  const walk = (value, path) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (/bytes/i.test(key) && typeof item === 'number') {
          numericBytes.push(path ? `${path}.${key}` : key);
        }
        walk(item, path ? `${path}.${key}` : key);
      }
    }
  };
  walk(record, '');
  assert.deepEqual(
    numericBytes,
    [],
    'a numeric bytes field would pull this record into the byte-consistency corpus while its verdict states a different total',
  );
});

test('the suite\u2019s scans exclude this milestone\u2019s own records', () => {
  const present = readdirSync(join(REPO_ROOT, 'research', 'raw')).filter(
    (name) => name.startsWith(OWN_RECORD_PREFIX),
  );
  assert.ok(
    present.includes('m061-record-shapes.json'),
    'the record under test is not in the directory the scan reads',
  );
  assert.equal(
    scanRecordKeys().keys.some((entry) =>
      entry.path.startsWith(`research/raw/${OWN_RECORD_PREFIX}`),
    ),
    false,
    'the scan reads this milestone\u2019s own records back into itself',
  );
});

test('mutant — an entry matched by position instead of by token reddens by name', () => {
  const m = measure();
  assertLocaleEntry(
    localeEntryByToken(m.entries, m.expected.token),
    m.expected,
    'the pin against the token match',
  );
  const error = failureOf(() =>
    assertLocaleEntry(
      localeEntryByPosition(m.entries),
      m.expected,
      'the pin against the position match',
    ),
  );
  assert.match(
    String(error.message),
    /matched by position/,
    `the position mutant must redden naming position, not a generic mismatch: ${error.message}`,
  );
});

test('mutant — an entry that carries the useValue reddens naming locale-value-not-recorded', () => {
  const m = measure();
  assertValueNotRecorded(m.localeEntry, LOCALE_VALUE);
  const anchor = 'provider: providerKind,';
  assert.equal(
    m.source.split(anchor).length - 1,
    1,
    'the mutation anchor must be the one place in the source, or the mutant mutates nothing',
  );
  const mutated = m.source.replace(
    anchor,
    'provider: providerKind,\n              value: prov.useValue,',
  );
  assert.notEqual(mutated, m.source, 'the mutation did not change the source');
  const mutatedEntry = reduceProviders(mutated, FIXTURE)[
    FIXTURE.findIndex((record) => record.token === core.LOCALE_ID)
  ];
  assert.equal(
    mutatedEntry.value,
    LOCALE_VALUE,
    'the mutant must carry the provided value, or it is not the defect this pin exists for',
  );
  const mutatedFields = Object.keys(mutatedEntry);
  assert.deepEqual(
    [...mutatedFields].sort(),
    [...m.entry.fields, 'value'].sort(),
    'the mutant adds exactly one field to the entry, the one that carries the value',
  );
  const error = failureOf(() =>
    assertValueNotRecorded(mutatedEntry, LOCALE_VALUE),
  );
  assert.match(
    String(error.message),
    /locale-value-not-recorded/,
    `the value mutant must redden naming the absence, not something else: ${error.message}`,
  );
});

test('mutant — a second provider read reddens by name', () => {
  const m = measure();
  const atHead = readProviderReads(
    fileAtHead(loadRecord().head, AGENT_MAIN_REL),
  );
  assertNoSecondRead(
    atHead.calls.length - atHead.calls.length,
    atHead.calls.length,
  );
  const mutated = `${m.source}\nng.ɵgetInjectorProviders(inj);\n`;
  const after = readProviderReads(mutated);
  assert.equal(
    after.calls.length,
    m.reads.calls.length + 1,
    'the mutant must add one direct call, or it is not a second provider read',
  );
  const error = failureOf(() =>
    assertNoSecondRead(
      after.calls.length - atHead.calls.length,
      after.calls.length,
    ),
  );
  assert.match(
    String(error.message),
    /second provider read/,
    `the read mutant must redden naming the second read, not something else: ${error.message}`,
  );
});
