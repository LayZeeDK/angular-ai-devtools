// Tests for extension/locale-correctness.js — the join T002 publishes on
// `globalThis.angularAiLocaleCorrectness`, answering purely from the provider record T001
// measured (`research/raw/m061-record-shapes.json`): the entry the injector walk reduced for
// the locale token, the kind it was declared with and the module it came from, beside the two
// absences this tree can prove.
//
// The record under test is the committed measurement and not a copy of it: `providers.entries`
// is handed to the join as it stands, and the token the answer must name is derived from the
// installed `@angular/core` — `String(LOCALE_ID)`, "InjectionToken LocaleId" — so a join that
// compared the token with the literal "LOCALE_ID" matches nothing on a real page and reddens
// here by name. That is the defect this suite exists to catch: a literal-matching join passes
// a test written against the literal and does nothing in the product.
//
// Purity is proved the way `scripts/error-routing.test.mjs` proves it: two `node:vm` contexts
// whose `navigator`, `window`, `document`, `performance` and `Intl` are throw-on-touch traps
// produce the same answer as the bare realm, and the traps are shown to bite before anything
// is asserted through them — so the page, the rendered text and the browser's language are
// impossible to read rather than merely avoided.
//
// Every mutant is applied to a copy of the module source, after the unmutated module is pinned
// with the same function, and must redden that pin by name: a mutant that survived its pin
// would prove the pin vacuous. Each `it` under "mutants redden by name" first pins the shipped
// behaviour, then mutates, then asserts the failure names the defect by string.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/locale-correctness.js', import.meta.url),
  'utf8',
);

/** The record T001 measured and committed, read as the record it is. */
const RECORD = JSON.parse(
  readFileSync(
    new URL('../research/raw/m061-record-shapes.json', import.meta.url),
    'utf8',
  ),
);

/** The installed package, so the token derivation under test is Angular's and not this suite's. */
const core = await import('@angular/core');

/** The token the injector walk derives for the installed `LOCALE_ID`: its own stringification. */
const INSTALLED_TOKEN = String(core.LOCALE_ID);

/**
 * The two halves of that derivation, neither of them a literal of this suite's: the word an
 * InjectionToken's stringification opens with, read off a token this suite builds, and the
 * description the installed token is built with, which is what is left of the derivation once
 * the word is taken off.
 */
const PROBE = 'M061_PROBE';
const PROBE_DERIVATION = String(new core.InjectionToken(PROBE));
const TOKEN_WORD = PROBE_DERIVATION.slice(
  0,
  PROBE_DERIVATION.length - PROBE.length,
);
const TOKEN_DESCRIPTION = INSTALLED_TOKEN.slice(TOKEN_WORD.length);

/** The entries the reduction wrote, exactly as the record carries them. */
const MEASURED_ENTRIES = RECORD.providers.entries;

/** The entry the record names as the locale entry, and the value the record says it discards. */
const LOCALE_ENTRY = RECORD.providers.localeEntry;
const LOCALE_VALUE = 'fr-FR';

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * The module in a bare context. No DOM, no clock, no console and no network are installed by
 * `node:vm` beyond the two every JavaScript context has (`Date` and `Intl`), which the guarded
 * pins below handle. Whatever the caller puts in the sandbox is all the world the module gets.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const join = context.angularAiLocaleCorrectness;
  assert.equal(
    typeof join,
    'function',
    'the module must publish the join itself on globalThis.angularAiLocaleCorrectness',
  );
  return join;
}

/** A value from the vm context carries that context's own prototypes, so it is copied here. */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * The globals the join must never reach for. `document`, `window`, `performance`, the two
 * timers, `fetch` and `XMLHttpRequest` are absent from a `node:vm` context altogether; `Date`,
 * `Intl` and `console` are in every context there is, so only a trap can catch a module that
 * used them. `navigator` is absent from a context this Node version builds, and is trapped
 * anyway: a mutant that reads it in a realm that has one must be caught, not accommodated.
 */
const HOST_GLOBALS = [
  'navigator',
  'window',
  'document',
  'performance',
  'Intl',
  'console',
  'Date',
  'setTimeout',
  'setInterval',
  'fetch',
  'XMLHttpRequest',
];

/**
 * A global that throws when it is read, called or constructed, naming itself in the error. A
 * module that reached for the page, the browser's language or the clock inside the context
 * hits this on the first touch, which is what makes the guard a guard rather than a decoration.
 */
function tripwire(name) {
  const reached = () => {
    throw new Error('the module reached for ' + name);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

/** The armed-traps context, for the assertions that prove the guard is live. */
function armedContext() {
  const sandbox = {};
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  return createContext(sandbox);
}

/**
 * Runs the join *inside* a context where every one of `HOST_GLOBALS` is a trap, and returns
 * the answer it produced. The record is handed in through the sandbox, so nothing about the
 * call crosses from this realm except the data. Two calls are two contexts.
 */
function guarded(source, input, extra = {}) {
  const sandbox = { __frame: input, ...extra };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const context = createContext(sandbox);
  runInContext(source, context);
  return plain(runInContext('angularAiLocaleCorrectness(__frame)', context));
}

/** Applies one mutation to a copy of the module source, or stops with a named failure. */
function mutate(defect, anchor, replacement) {
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(
    mutated,
    SRC,
    'the ' +
      defect +
      ' mutation target is gone from extension/locale-correctness.js — restate the bite in scripts/locale-correctness.test.mjs',
  );
  return mutated;
}

/** A pin that must redden on a mutant: returns the failure the pin raises on it. */
function reddens(pin, defect) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    '"' +
      defect +
      '" passed its pin on the mutant, so the mutation is not caught',
  );
  return failure;
}

// ------------------------------------------------- the records the join is handed ----

/** A fresh copy of the measured entry list, so no pin hands the join a list another one edited. */
function measuredEntries() {
  return JSON.parse(JSON.stringify(MEASURED_ENTRIES));
}

/**
 * The decoy the walk wrote first: a class-token provider that is not the locale token. It is
 * there so an entry matched by position is never the entry that carries the token.
 */
const DECOY = {
  token: 'ErrorHandler',
  isViewProvider: false,
  provider: 'class',
  importPath: 'AppConfig',
};

/** One entry naming one token, so a token rule can be asked about that token alone. */
function entryWith(token, extra = {}) {
  return {
    token: token,
    isViewProvider: false,
    provider: 'value',
    importPath: 'AppConfig',
    ...extra,
  };
}

/** The record the walk measured: the decoy first, the locale entry second. */
function measuredFrame() {
  return { providers: measuredEntries() };
}

/** A record that carries provider entries and none of them the locale token. */
function tokenAbsentFrame(extra = {}) {
  return { providers: [DECOY], ...extra };
}

/** A record that states it names no formatter identity and carries no provider record. */
function noFormatterFrame() {
  return { formatter: null };
}

// ------------------------------------------------- the vocabulary, as the contract names it ----

/** The six fields an answer carries, and the only fields it carries. */
const ANSWER_KEYS = [
  'absences',
  'claims',
  'importPath',
  'provider',
  'state',
  'token',
];

/** The four states, and the only states. */
const STATES = [
  'cannot-tell',
  'formatted-outside-i18n',
  'locale-provider-entry',
  'locale-token-absent',
];

/** The four absences, and the only absences. */
const ABSENCES = [
  'locale-token-absent',
  'locale-value-not-recorded',
  'no-formatter-named',
  'no-provider-record',
];

/** The words a remedy, a cause or a schematic is written with — and an answer never is. */
const REMEDY =
  /\b(fix|fixed|fixes|remedy|remedies|schematic|schematics|cause|causes|because|should|must|migrate|upgrade)\b/i;

// ---------------------------------------------------------------- the pins ----

/**
 * SC3's pin, over one module source: two `node:vm` contexts whose host globals are
 * throw-on-touch traps answer identically, and identically to the bare realm — so the join
 * reads nothing the traps hide, and a module that reached for one of them cannot answer here.
 */
function pinGuardedAnswer(source, label, frame = measuredFrame()) {
  const first = guarded(source, frame);
  const second = guarded(source, frame);
  assert.deepEqual(
    second,
    first,
    `${label}: two node:vm contexts with throw-on-touch globals answer identically`,
  );
  assert.deepEqual(
    first,
    plain(standalone(source)(frame)),
    `${label}: the guarded answer is the bare realm's answer, so nothing the traps hide was read`,
  );
  return first;
}

/** The key pin: every answer carries exactly the six contract fields, in every state. */
function pinEveryFieldInEveryState(join, label) {
  const table = [
    ['the measured record', measuredFrame()],
    ['the record the walk measured as a bare list', measuredEntries()],
    ['the record-shapes section', RECORD.providers],
    ['a record that carries the decoy alone', tokenAbsentFrame()],
    ['a record that carries an empty entry list', { providers: [] }],
    ['a record that states no formatter', noFormatterFrame()],
    [
      'a record that names a formatter and no provider record',
      { formatter: 'DatePipe' },
    ],
    ['no record at all', undefined],
    ['an empty record', {}],
    ['a record whose providers are not a list', { providers: 'ErrorHandler' }],
    [
      'a record whose entry carries a live token',
      {
        providers: [
          {
            token: { name: 'BarToken' },
            provider: 'factory',
            importPath: 'CounterComponent',
          },
        ],
      },
    ],
    ['a record whose entry carries no token', { providers: [{}] }],
  ];
  const seen = new Set();
  for (const [what, input] of table) {
    const answer = plain(join(input));
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_KEYS,
      `${label}: every answer carries exactly the six contract fields and no seventh (${what})`,
    );
    assert.equal(
      STATES.includes(answer.state),
      true,
      `${label}: the state is one of the four the contract names (${what})`,
    );
    seen.add(answer.state);
    for (const field of ['token', 'provider', 'importPath']) {
      assert.ok(
        answer[field] === null ||
          (typeof answer[field] === 'string' && answer[field] !== ''),
        `${label}: ${field} is a string the record carried or null, never an empty stand-in (${what})`,
      );
    }
    assert.equal(
      Array.isArray(answer.absences),
      true,
      `${label}: the absences are a list in every state (${what})`,
    );
    assert.equal(
      Array.isArray(answer.claims),
      true,
      `${label}: the claims are a list in every state (${what})`,
    );
    for (const absence of answer.absences) {
      assert.equal(
        ABSENCES.includes(absence),
        true,
        `${label}: ${JSON.stringify(absence)} is one of the four named absences (${what})`,
      );
    }
    if (answer.provider !== null) {
      assert.equal(
        answer.absences.includes('locale-value-not-recorded'),
        true,
        `${label}: an answer that names a provider entry carries locale-value-not-recorded (${what})`,
      );
    }
  }
  assert.deepEqual(
    [...seen].sort(),
    STATES,
    `${label}: the four states are the four the contract names, and this table reaches every one`,
  );
}

/**
 * SC1's pin: the record the walk measured names the locale provider entry by token, kind and
 * import path, and the value that entry provides is in no field — `locale-value-not-recorded`.
 */
function pinLocaleProviderEntry(join, label) {
  const answer = plain(join(measuredFrame()));
  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_KEYS,
    `${label}: the answer carries exactly the six contract fields`,
  );
  assert.equal(
    answer.state,
    'locale-provider-entry',
    `${label}: the record that carries the locale entry is locale-provider-entry — the token is matched by the derivation's own rule, never by the literal "LOCALE_ID"`,
  );
  assert.equal(
    answer.token,
    INSTALLED_TOKEN,
    `${label}: the answer names the token the entry carries (${JSON.stringify(answer.token)}), not the decoy's — an entry matched by position is the decoy at index 0, never the entry that carries the token`,
  );
  assert.equal(
    answer.token,
    LOCALE_ENTRY.token,
    `${label}: the token is the one the record's own locale entry carries`,
  );
  assert.equal(
    answer.provider,
    LOCALE_ENTRY.provider,
    `${label}: the kind is the entry's own provider field (${JSON.stringify(answer.provider)})`,
  );
  assert.equal(
    answer.importPath,
    LOCALE_ENTRY.importPath,
    `${label}: the import path is the entry's own field (${JSON.stringify(answer.importPath)})`,
  );
  assert.deepEqual(
    answer.absences,
    ['locale-value-not-recorded', 'no-formatter-named'],
    `${label}: locale-value-not-recorded is carried — the walk discards the value — beside no-formatter-named, which no record in this tree fills`,
  );
  assert.deepEqual(
    answer.claims,
    [],
    `${label}: no record this answer read carries an artefactPath, so no claim is invented for one`,
  );
  assert.equal(
    JSON.stringify(answer).includes(LOCALE_VALUE),
    false,
    `${label}: locale-value-not-recorded is honoured — the provided value is in no field of the answer`,
  );
  return answer;
}

/**
 * SC1's pin on the token rule itself: the match is the walk's derivation of the installed
 * token, and never the literal "LOCALE_ID" a join would otherwise hardcode.
 */
function pinTokenIsMatchedByItsDerivation(join, label) {
  assert.equal(
    PROBE_DERIVATION,
    TOKEN_WORD + PROBE,
    `${label}: the word an InjectionToken's stringification opens with is the class's own`,
  );
  assert.equal(
    core.LOCALE_ID.name,
    undefined,
    `${label}: the installed LOCALE_ID publishes no name, so the walk answers String(token)`,
  );
  assert.equal(
    INSTALLED_TOKEN,
    TOKEN_WORD + TOKEN_DESCRIPTION,
    `${label}: the derivation is the class's word followed by the token's own description`,
  );
  assert.equal(
    TOKEN_DESCRIPTION,
    core.LOCALE_ID._desc,
    `${label}: the description the derivation carries is the description the token publishes`,
  );
  assert.equal(
    TOKEN_DESCRIPTION.replace(/[^A-Za-z0-9]/g, '').toLowerCase(),
    'localeid',
    `${label}: the description the installed token publishes is the one the join's rule names`,
  );
  assert.notEqual(
    INSTALLED_TOKEN,
    'LOCALE_ID',
    `${label}: the measured token is not the literal, so a literal match would find nothing on a real page`,
  );
  assert.equal(
    LOCALE_ENTRY.token,
    INSTALLED_TOKEN,
    `${label}: the record T001 committed carries the derivation this suite derives from the installed token`,
  );
  assert.equal(
    /\bLOCALE_ID\b/.test(code(SRC)),
    false,
    `${label}: the join matches the token by its derivation and never by the literal "LOCALE_ID"`,
  );
  for (const [what, token] of [
    ['the measured derivation', INSTALLED_TOKEN],
    ['the same token spelled another way', TOKEN_WORD + 'LOCALE_ID'],
    ['the description a token publishes as its name', TOKEN_DESCRIPTION],
  ]) {
    const answer = plain(join({ providers: [entryWith(token)] }));
    assert.equal(
      answer.state,
      'locale-provider-entry',
      `${label}: a token whose derivation is the locale description is recognised — the rule reads the derivation, never the literal (${what})`,
    );
    assert.equal(
      answer.token,
      token,
      `${label}: the answer names the token the record carried, not a literal of the join's (${what})`,
    );
  }
  for (const [what, token] of [
    ['LocaleData', TOKEN_WORD + 'LocaleData'],
    [
      'a token that merely starts with the description',
      TOKEN_DESCRIPTION + 'Helper',
    ],
    ['a class token', 'ErrorHandler'],
  ]) {
    const answer = plain(join({ providers: [entryWith(token)] }));
    assert.equal(
      answer.state,
      'locale-token-absent',
      `${label}: a token the record carries that no rule recognises is locale-token-absent and never a guess (${what})`,
    );
  }
}

/**
 * SC1's pin on the absence edge: provider entries are carried and none of them is the locale
 * token — the absence is named, the token is null, and no default value is assumed for it.
 */
function pinLocaleTokenAbsent(join, label) {
  const answer = plain(join(tokenAbsentFrame()));
  assert.equal(
    answer.state,
    'locale-token-absent',
    `${label}: a record whose entries carry no recognised token is locale-token-absent`,
  );
  assert.equal(
    answer.token,
    null,
    `${label}: the answer guesses nothing — no token is named where the record carries none`,
  );
  assert.equal(
    answer.provider,
    null,
    `${label}: no kind is named where the record carries no locale entry`,
  );
  assert.equal(
    answer.importPath,
    null,
    `${label}: no import path is named where the record carries no locale entry`,
  );
  assert.deepEqual(
    answer.absences,
    ['locale-token-absent', 'no-formatter-named'],
    `${label}: the absence is named beside the formatter no record fills`,
  );
  assert.equal(
    JSON.stringify(answer).includes(DECOY.token),
    false,
    `${label}: the decoy's token is not reported as the locale provider`,
  );

  const empty = plain(join({ providers: [] }));
  assert.equal(
    empty.state,
    'locale-token-absent',
    `${label}: a record that carries an empty entry list says so, and is not read as a missing record`,
  );
  assert.deepEqual(
    empty.absences,
    ['locale-token-absent', 'no-formatter-named'],
    `${label}: the empty list carries the same named absence`,
  );

  const named = plain(join(tokenAbsentFrame({ formatter: 'DatePipe' })));
  assert.equal(
    named.state,
    'locale-token-absent',
    `${label}: a record that names a formatter is still locale-token-absent where no entry carries the token`,
  );
  assert.deepEqual(
    named.absences,
    ['locale-token-absent'],
    `${label}: a formatter the record itself names is not an absent one`,
  );
  return answer;
}

/**
 * SC1's ordering edge: two entries name the token, and the answer reads the first the walk
 * wrote — the injector nearest the component — naming it by its own kind and import path.
 */
function pinTheNearestEntryIsNamed(join, label) {
  const answer = plain(
    join({
      providers: [
        entryWith(INSTALLED_TOKEN, {
          artefactPath: 'extension/agent-main.js#L1215-L1223',
        }),
        entryWith(INSTALLED_TOKEN, {
          isViewProvider: true,
          provider: 'existing',
          importPath: 'WidgetComponent',
        }),
      ],
    }),
  );
  assert.equal(
    answer.state,
    'locale-provider-entry',
    `${label}: two entries naming the token are still locale-provider-entry`,
  );
  assert.equal(
    answer.provider,
    'value',
    `${label}: the answer names the entry the walk wrote first — the one nearest the component (${JSON.stringify(answer.provider)})`,
  );
  assert.equal(
    answer.importPath,
    'AppConfig',
    `${label}: the import path is that entry's own and never the farthest matching entry's (${JSON.stringify(answer.importPath)})`,
  );
  assert.deepEqual(
    answer.claims.map((claim) => claim.artefactPath),
    ['extension/agent-main.js#L1215-L1223'],
    `${label}: the claim cites the entry this answer read and no other, so the answer says which entry it read`,
  );
  return answer;
}

/**
 * SC2's pin: a record that names no formatter identity and carries no provider record is
 * `formatted-outside-i18n`, with every other field null — the gap is never filled from the
 * page, from the rendered text or from the browser's language.
 */
function pinFormattedOutsideI18n(join, label) {
  const answer = plain(join(noFormatterFrame()));
  assert.equal(
    answer.state,
    'formatted-outside-i18n',
    `${label}: a record that states no formatter identity is formatted-outside-i18n`,
  );
  assert.equal(
    answer.token,
    null,
    `${label}: the gap is not filled from the page — no token is named where the record names none, and navigator.language is not a record`,
  );
  assert.equal(
    answer.provider,
    null,
    `${label}: no kind is named where the record carries no entry`,
  );
  assert.equal(
    answer.importPath,
    null,
    `${label}: no import path is named where the record carries no entry`,
  );
  assert.deepEqual(
    answer.absences,
    ['no-provider-record', 'no-formatter-named'],
    `${label}: both absences are carried, each in its own name`,
  );
  assert.deepEqual(
    answer.claims,
    [],
    `${label}: no claim is invented for a record that cites no artefact`,
  );
  for (const [what, identity] of [
    ['an empty identity', ''],
    ['a null identity', null],
    ['an identity with no name', {}],
  ]) {
    assert.equal(
      plain(join({ formatter: identity })).state,
      'formatted-outside-i18n',
      `${label}: a record that states ${what} names no formatter either`,
    );
  }
  assert.equal(
    Object.prototype.hasOwnProperty.call(RECORD.providers, 'formatter'),
    false,
    `${label}: the record T001 committed carries no formatter field`,
  );
  assert.deepEqual(
    RECORD.absence['no-formatter-named'].records.formatterOrLocaleFields,
    [],
    `${label}: no record key in this tree names a formatter, a pipe or a locale`,
  );
  assert.deepEqual(
    guarded(SRC, noFormatterFrame()),
    answer,
    `${label}: the answer is produced where navigator, window, document, performance and Intl are traps`,
  );
  return answer;
}

/** The unknown-input pin: whatever the record does not say is `cannot-tell`, never a guess. */
function pinCannotTell(join, label) {
  for (const [what, input] of [
    ['no record at all', undefined],
    ['a null record', null],
    ['an empty record', {}],
    ['a record of nothing', Object.create(null)],
    ['a string', 'the walk measured a locale'],
    ['a number', 42],
    ['a record whose providers are not a list', { providers: 'ErrorHandler' }],
    ['a record whose providers are null', { providers: null }],
    ['a record whose entries are not a list', { entries: 'ErrorHandler' }],
  ]) {
    const answer = plain(join(input));
    assert.equal(
      answer.state,
      'cannot-tell',
      `${label}: ${what} is cannot-tell`,
    );
    assert.equal(answer.token, null, `${label}: ${what} names no token`);
    assert.deepEqual(
      answer.absences,
      ['no-provider-record', 'no-formatter-named'],
      `${label}: ${what} states which input it did not carry`,
    );
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_KEYS,
      `${label}: even a cannot-tell answer carries exactly the six contract fields (${what})`,
    );
  }
  const named = plain(join({ formatter: 'DatePipe' }));
  assert.equal(
    named.state,
    'cannot-tell',
    `${label}: a formatter named beside no provider record leaves the locale entry untellable`,
  );
  assert.deepEqual(
    named.absences,
    ['no-provider-record'],
    `${label}: only the input the record did not carry is named absent`,
  );
  return plain(join({}));
}

/**
 * SC4's pin: no answer names a remedy, a cause, a schematic or an identity the record did not
 * carry — every claim cites an artefactPath a record carries, and every field is the record's.
 */
function pinNoAnswerNamesWhatItWasNotGiven(join, label) {
  const frames = [
    ['the measured record', measuredFrame()],
    ['a record with no locale token', tokenAbsentFrame()],
    ['a record with no formatter', noFormatterFrame()],
    ['an empty record', {}],
    ['no record at all', undefined],
  ];
  for (const [what, input] of frames) {
    const answer = plain(join(input));
    assert.doesNotMatch(
      JSON.stringify(answer),
      REMEDY,
      `${label}: no answer names a remedy, a cause or a schematic (${what})`,
    );
    for (const claim of answer.claims) {
      assert.deepEqual(
        Object.keys(claim).sort(),
        ['artefactPath', 'claim', 'kind'],
        `${label}: every claim carries its kind, its sentence and the artefactPath it cites (${what})`,
      );
      assert.notEqual(
        claim.artefactPath,
        '',
        `${label}: no claim cites an empty artefactPath (${what})`,
      );
    }
  }

  const bare = plain(join(measuredFrame()));
  assert.deepEqual(
    bare.claims,
    [],
    `${label}: a record that cites no artefact is cited by no claim — no path is invented for it`,
  );
  const cited = plain(
    join({
      providers: [
        entryWith(INSTALLED_TOKEN, {
          artefactPath: 'extension/agent-main.js#L1215-L1223',
        }),
      ],
      artefactPath: 'research/raw/m061-record-shapes.json',
    }),
  );
  assert.deepEqual(
    cited.claims.map((claim) => claim.artefactPath),
    [
      'extension/agent-main.js#L1215-L1223',
      'research/raw/m061-record-shapes.json',
    ],
    `${label}: each claim cites the artefactPath the record itself carries, and no other`,
  );
  assert.deepEqual(
    cited.claims.map((claim) => claim.kind),
    ['provider-entry', 'provider-record'],
    `${label}: the entry this answer read and the frame it was handed are the two records cited`,
  );
  assert.equal(
    cited.token,
    INSTALLED_TOKEN,
    `${label}: the token is the entry's own and never an identity the record did not carry`,
  );
  assert.equal(
    cited.importPath,
    'AppConfig',
    `${label}: the import path is the entry's own field and no other module is named`,
  );
  return cited;
}

// ---------------------------------------------------------------- the shipped join ----

describe('locale-correctness.js is pure', () => {
  it('evaluates in a bare context and publishes the join itself, and nothing else of its own', () => {
    const context = createContext({});
    runInContext(SRC, context);
    assert.equal(
      typeof context.angularAiLocaleCorrectness,
      'function',
      'the module publishes the join on the global object of whatever world it runs in',
    );
    assert.equal(
      context.angularAiLocaleCorrectness.length,
      1,
      'the join takes the one record it reads',
    );
    assert.deepEqual(
      Object.getOwnPropertyNames(context).filter((name) =>
        /^angularAi/.test(name),
      ),
      ['angularAiLocaleCorrectness'],
      'the module publishes the join and nothing else of its own',
    );
  });

  it('SC3 — two node:vm contexts with throw-on-touch globals produce deep-equal answers', () => {
    // The traps are armed, and proven armed before anything is asserted through them: a guard
    // that did not throw would make every guarded pin below pass on any module.
    const armed = armedContext();
    for (const name of [
      'navigator',
      'window',
      'document',
      'performance',
      'Intl',
    ]) {
      assert.throws(
        () => runInContext(`${name}.toString()`, armed),
        new RegExp('reached for ' + name),
        `the ${name} trap must bite, or the guard is decoration`,
      );
    }
    assert.throws(
      () => runInContext('Date.now()', armed),
      /reached for Date/,
      'the Date trap must bite, or the guard is decoration',
    );

    // Two contexts, each built with its own traps, and the bare realm beside them: one answer.
    const first = pinGuardedAnswer(SRC, 'the shipped module');
    for (const [what, input] of [
      ['the record with no locale token', tokenAbsentFrame()],
      ['the record with no formatter', noFormatterFrame()],
      ['an empty record', {}],
    ]) {
      assert.deepEqual(
        guarded(SRC, input),
        plain(standalone()(input)),
        `the two realms answer ${what} identically`,
      );
    }
    assert.deepEqual(
      guarded(SRC, measuredFrame()),
      pinLocaleProviderEntry(standalone(), 'the guarded pin'),
      'the answer the traps allow is the answer SC1 pins',
    );
  });

  it('reaches for no host global and no live page value', () => {
    const body = code(SRC);
    for (const [what, pattern] of [
      ['a navigator read', /\bnavigator\b/],
      ['an Intl read', /\bIntl\b/],
      ['a document read', /\bdocument\b/],
      ['a window read', /\bwindow\b/],
      ['a console call', /\bconsole\b/],
      ['a clock read', /\b(Date|performance|setTimeout|setInterval)\b/],
      [
        'a DOM query',
        /\b(querySelector|getElementById|createElement|getComputedStyle)\b/,
      ],
      ['a network call', /\b(fetch|XMLHttpRequest)\b/],
      [
        'a read of the rendered text',
        /\b(textContent|innerText|outerText|nodeValue)\b/,
      ],
      [
        'a value formatted by the platform',
        /\b(toLocaleString|toLocaleDateString|toLocaleTimeString|resolvedOptions|localeCompare)\b/,
      ],
      ['a live page read', /\b(getOwningComponent|ng\.getContext)\b/],
      ['a default locale', /en[-_]?US/],
    ]) {
      assert.equal(
        pattern.test(body),
        false,
        'locale-correctness.js must contain no ' + what,
      );
    }
  });

  it('answers the same record twice with the same value and mutates nothing it was handed', () => {
    const join = standalone();
    const record = measuredFrame();
    const before = JSON.stringify(record);
    const first = join(record);
    const second = join(record);
    assert.deepEqual(plain(second), plain(first));
    assert.notEqual(first, second, 'each call answers a fresh object');
    assert.notEqual(
      first.absences,
      second.absences,
      'each call answers a fresh absences list, so no caller can edit the next answer',
    );
    assert.notEqual(
      first.claims,
      second.claims,
      'each call answers a fresh claims list',
    );
    assert.equal(
      JSON.stringify(record),
      before,
      'the join mutates nothing in the record it was handed',
    );
  });

  it('throws on no input', () => {
    const join = standalone();
    const throwing = new Proxy(
      {},
      {
        get() {
          throw new Error('no read');
        },
        has() {
          throw new Error('no has');
        },
        getOwnPropertyDescriptor() {
          return { configurable: true, enumerable: true, value: undefined };
        },
      },
    );
    const throwingList = new Proxy([{ token: INSTALLED_TOKEN }], {
      get(target, key) {
        if (key === 'length') throw new Error('no length');
        return Reflect.get(target, key);
      },
    });
    const inputs = [
      ['undefined', undefined],
      ['null', null],
      ['zero', 0],
      ['an empty string', ''],
      ['a boolean', true],
      ['a function', () => {}],
      ['an array of nothing', [null, undefined, 0, 'x']],
      ['a frozen record', Object.freeze({})],
      ['a record whose every read throws', throwing],
      [
        'a record whose providers getter throws',
        {
          get providers() {
            throw new Error('no providers');
          },
        },
      ],
      [
        'a record whose entry list throws on length',
        { providers: throwingList },
      ],
      [
        'a record whose token throws on stringification',
        {
          providers: [
            {
              token: {
                toString() {
                  throw new Error('no token');
                },
              },
            },
          ],
        },
      ],
      [
        'a record whose entry getter throws',
        {
          providers: [
            {
              get token() {
                throw new Error('no token field');
              },
            },
          ],
        },
      ],
      [
        'a record whose formatter name throws',
        {
          formatter: {
            get name() {
              throw new Error('no name');
            },
          },
        },
      ],
    ];
    for (const [what, input] of inputs) {
      let answer = null;
      assert.doesNotThrow(() => {
        answer = plain(join(input));
      }, `the join throws on ${what}, and the contract says it throws on no input`);
      assert.deepEqual(
        Object.keys(answer).sort(),
        ANSWER_KEYS,
        `even ${what} answers exactly the six contract fields`,
      );
      assert.equal(
        STATES.includes(answer.state),
        true,
        `even ${what} answers one of the four states`,
      );
    }
  });
});

describe('the shipped join answers the provider record', () => {
  it('carries exactly the six contract fields in every state, and reaches all four', () => {
    pinEveryFieldInEveryState(standalone(), 'the shipped module');
  });

  it('SC1 — the locale provider entry is named by token, kind and import path, with its value not recorded', () => {
    pinLocaleProviderEntry(standalone(), 'the shipped module');
  });

  it('SC1 — the token is matched by its derivation, never by the literal LOCALE_ID', () => {
    pinTokenIsMatchedByItsDerivation(standalone(), 'the shipped module');
  });

  it('SC1 — entries that carry no recognised token are locale-token-absent, and nothing is guessed', () => {
    pinLocaleTokenAbsent(standalone(), 'the shipped module');
  });

  it('SC1 — two entries naming the token: the nearest is named by its own kind and import path', () => {
    pinTheNearestEntryIsNamed(standalone(), 'the shipped module');
  });

  it('SC2 — a record with no formatter is formatted-outside-i18n and never reads the page', () => {
    pinFormattedOutsideI18n(standalone(), 'the shipped module');
  });

  it('SC4 — no answer names a remedy, a cause, a schematic or an identity it was not given', () => {
    pinNoAnswerNamesWhatItWasNotGiven(standalone(), 'the shipped module');
  });

  it('cannot-tell — a record that states nothing usable names which input it did not carry', () => {
    pinCannotTell(standalone(), 'the shipped module');
  });
});

describe('mutants redden by name', () => {
  it('M1 — an entry matched by position reddens the locale-entry pin', () => {
    pinLocaleProviderEntry(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'an entry matched by position',
        '      if (isLocaleToken(name)) {',
        '      if (i === 0) {',
      ),
    );
    const answered = plain(join(measuredFrame()));
    assert.equal(
      answered.token,
      DECOY.token,
      'the mutant answers with the first entry of the list, which is the decoy',
    );
    assert.equal(
      answered.provider,
      DECOY.provider,
      "the mutant borrows the decoy's kind as well",
    );

    const failure = reddens(
      () => pinLocaleProviderEntry(join, 'the mutant module'),
      'an entry matched by position',
    );
    assert.match(
      failure.message,
      /matched by position/,
      'the position mutant must redden the locale-entry pin by name: ' +
        failure.message,
    );
  });

  it('M2 — the gap filled from the rendered text reddens the no-formatter pin', () => {
    pinFormattedOutsideI18n(standalone(), 'the unmutated module');

    const mutated = mutate(
      'the gap filled from the rendered text',
      "    const token = entry === null ? null : tokenNameOf(fieldOf(entry, 'token'));",
      "    const token =\n      entry === null\n        ? textOf(fieldOf(globalThis, '__M061_RENDERED_TEXT__'))\n        : tokenNameOf(fieldOf(entry, 'token'));",
    );
    // With no rendered text in reach the mutant answers what the join answers: the defect is
    // only visible when the page's own text is there to be borrowed.
    assert.equal(
      plain(standalone(mutated)(noFormatterFrame())).token,
      null,
      'with no rendered text in reach the mutant has nothing to borrow',
    );
    const live = standalone(mutated, { __M061_RENDERED_TEXT__: '31/12/2026' });
    assert.equal(
      plain(live(noFormatterFrame())).token,
      '31/12/2026',
      'the mutant fills the absent token from the rendered text',
    );

    const failure = reddens(
      () => pinFormattedOutsideI18n(live, 'the mutant module'),
      'the gap filled from the rendered text',
    );
    assert.match(
      failure.message,
      /filled from the page/,
      'the rendered-text mutant must redden the no-formatter pin by name: ' +
        failure.message,
    );
  });

  it('M3 — the gap filled from navigator.language reddens the no-formatter pin', () => {
    pinFormattedOutsideI18n(standalone(), 'the unmutated module');

    const mutated = mutate(
      'the gap filled from navigator.language',
      "    const token = entry === null ? null : tokenNameOf(fieldOf(entry, 'token'));",
      "    const token =\n      entry === null\n        ? String(navigator.language)\n        : tokenNameOf(fieldOf(entry, 'token'));",
    );
    // The guarded context catches the read itself, so the page's language is not merely
    // avoided here — reaching for it throws.
    assert.throws(
      () => guarded(mutated, noFormatterFrame()),
      /reached for navigator/,
      'the navigator trap must catch the mutant reading navigator.language',
    );
    const live = standalone(mutated, { navigator: { language: 'de-DE' } });
    assert.equal(
      plain(live(noFormatterFrame())).token,
      'de-DE',
      "the mutant borrows the browser's language for the token the record did not carry",
    );

    // The purity pin reddens on the same mutant: with navigator a trap the pin cannot even
    // produce the two answers it compares.
    const purity = reddens(
      () => pinGuardedAnswer(mutated, 'the mutant module', noFormatterFrame()),
      'the gap filled from navigator.language',
    );
    assert.match(
      purity.message,
      /reached for navigator/,
      'the purity pin must redden on the navigator mutant by name: ' +
        purity.message,
    );

    const failure = reddens(
      () => pinFormattedOutsideI18n(live, 'the mutant module'),
      'the gap filled from navigator.language',
    );
    assert.match(
      failure.message,
      /navigator\.language/,
      'the navigator mutant must redden the no-formatter pin by name: ' +
        failure.message,
    );
  });

  it('M4 — a claim naming a remedy reddens the no-remedy pin', () => {
    pinNoAnswerNamesWhatItWasNotGiven(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'a claim naming a remedy',
        "      claims = claims.concat(claimsOf('provider-record', RECORD_CLAIM, [read]));",
        "      claims = claims\n        .concat(claimsOf('provider-record', RECORD_CLAIM, [read]))\n        .concat([\n          {\n            kind: 'remedy',\n            claim:\n              'provide the locale in the bootstrap module, so the formatting is fixed',\n            artefactPath: 'app/app.config.ts',\n          },\n        ]);",
      ),
    );
    const answered = plain(join(measuredFrame()));
    assert.equal(
      answered.claims.length,
      1,
      'the mutant answers a claim the record never carried',
    );
    assert.match(
      answered.claims[0].claim,
      REMEDY,
      'the invented claim names a remedy the record does not state',
    );

    const failure = reddens(
      () => pinNoAnswerNamesWhatItWasNotGiven(join, 'the mutant module'),
      'a claim naming a remedy',
    );
    assert.match(
      failure.message,
      /remedy|a cause|a schematic/,
      'the remedy mutant must redden the no-remedy pin by name: ' +
        failure.message,
    );
  });

  it('M5 — locale-value-not-recorded dropped reddens the locale-entry pin', () => {
    pinLocaleProviderEntry(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'locale-value-not-recorded dropped',
        '    if (provider !== null) {\n      absences.push(LOCALE_VALUE_NOT_RECORDED);\n    }\n',
        '',
      ),
    );
    const answered = plain(join(measuredFrame()));
    assert.deepEqual(
      answered.absences,
      ['no-formatter-named'],
      'the mutant drops the absence the value leaves behind',
    );

    const failure = reddens(
      () => pinLocaleProviderEntry(join, 'the mutant module'),
      'locale-value-not-recorded dropped',
    );
    assert.match(
      failure.message,
      /locale-value-not-recorded/,
      'the dropped-absence mutant must redden the locale-entry pin by name: ' +
        failure.message,
    );
  });

  it('M6 — a seventh field on the answer reddens the six-field pin', () => {
    pinEveryFieldInEveryState(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'a seventh field on the answer',
        '      claims: claims,\n    };',
        "      claims: claims,\n      detail: 'a sentence the contract does not carry',\n    };",
      ),
    );
    const answered = plain(join(measuredFrame()));
    assert.deepEqual(
      Object.keys(answered).sort(),
      [...ANSWER_KEYS, 'detail'].sort(),
      'the mutant answers a seventh field',
    );

    const failure = reddens(
      () => pinEveryFieldInEveryState(join, 'the mutant module'),
      'a seventh field on the answer',
    );
    assert.match(
      failure.message,
      /six contract fields/,
      'the seventh-field mutant must redden the six-field pin by name: ' +
        failure.message,
    );
  });

  it('M7 — a token guessed where the record carries none reddens the absence pin', () => {
    pinLocaleTokenAbsent(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'a token guessed where the record carries none',
        "    const token = entry === null ? null : tokenNameOf(fieldOf(entry, 'token'));",
        "    const token =\n      entry === null\n        ? tokenNameOf(fieldOf(fieldOf(entries, 0), 'token'))\n        : tokenNameOf(fieldOf(entry, 'token'));",
      ),
    );
    const answered = plain(join(tokenAbsentFrame()));
    assert.equal(
      answered.token,
      DECOY.token,
      "the mutant reports the decoy's token as the locale token",
    );

    const failure = reddens(
      () => pinLocaleTokenAbsent(join, 'the mutant module'),
      'a token guessed where the record carries none',
    );
    assert.match(
      failure.message,
      /guesses nothing/,
      'the guessed-token mutant must redden the absence pin by name: ' +
        failure.message,
    );
  });

  it('M8 — the farthest matching entry chosen reddens the nearest-entry pin', () => {
    pinTheNearestEntryIsNamed(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'the farthest matching entry chosen',
        '        found = candidate;\n        break;\n',
        '        found = candidate;\n',
      ),
    );
    const answered = plain(
      join({
        providers: [
          entryWith(INSTALLED_TOKEN),
          entryWith(INSTALLED_TOKEN, {
            isViewProvider: true,
            provider: 'existing',
            importPath: 'WidgetComponent',
          }),
        ],
      }),
    );
    assert.equal(
      answered.importPath,
      'WidgetComponent',
      'the mutant answers with the last entry naming the token',
    );

    const failure = reddens(
      () => pinTheNearestEntryIsNamed(join, 'the mutant module'),
      'the farthest matching entry chosen',
    );
    assert.match(
      failure.message,
      /nearest/,
      'the farthest-entry mutant must redden the nearest-entry pin by name: ' +
        failure.message,
    );
  });

  it('M9 — the token matched by the literal LOCALE_ID reddens the derivation pin', () => {
    pinTokenIsMatchedByItsDerivation(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'the token matched by the literal LOCALE_ID',
        '    return LOCALE_DESCRIPTIONS.indexOf(normalised(description)) !== -1;',
        "    return name === 'LOCALE_ID';",
      ),
    );
    const answered = plain(join(measuredFrame()));
    assert.equal(
      answered.state,
      'locale-token-absent',
      'the literal match finds nothing in the record a real page writes',
    );
    assert.equal(
      answered.token,
      null,
      'the mutant names no token for the record T001 measured',
    );

    const failure = reddens(
      () => pinLocaleProviderEntry(join, 'the mutant module'),
      'the token matched by the literal LOCALE_ID',
    );
    assert.match(
      failure.message,
      /literal/,
      'the literal-token mutant must redden the locale-entry pin by name: ' +
        failure.message,
    );

    // The pin that measures the rule itself reddens too, naming the literal.
    const second = reddens(
      () => pinTokenIsMatchedByItsDerivation(join, 'the mutant module'),
      'the token matched by the literal LOCALE_ID',
    );
    assert.match(
      second.message,
      /literal/,
      'the derivation pin must redden on the same mutant by name: ' +
        second.message,
    );
  });
});
