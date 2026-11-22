// locale-correctness.js — the join behind M061: the provider entry the injector walk recorded
// for the locale token, the kind it was declared with, the module it came from, and the two
// absences this tree can prove — the value that entry provides is in no field the walk writes,
// and no record in this tree names a formatter.
//
// The record it answers from is the one T001 measured, `research/raw/m061-record-shapes.json`:
// each provider the injector walk answers (`extension/agent-main.js:1149-1155`) is reduced to
// four fields and no fifth — `token`, `isViewProvider`, `provider`, `importPath`
// (`extension/agent-main.js:1215-1223`) — where `token` is the walk's own derivation from the
// token object (`extension/agent-main.js:1677-1688`), never the token itself and never
// `provider.provide`.
//
// The token is matched by that derivation's rule and never by a literal. @angular/core@22.1.8's
// `LOCALE_ID` is an `InjectionToken` that publishes no `name`, so the walk answers
// `String(token)`, and the entry it writes carries "InjectionToken LocaleId": the class's own
// word followed by the description the token was built with. A join that compared that string
// with the literal "LOCALE_ID" would match nothing on every real page; this one reads the
// description out of the derivation, normalises it, and compares that — so the measured
// string, the same token spelled another way, and a token that publishes the description as
// its `name` are one token here, and anything else is no token this answer can name.
//
// What it is handed — one frame, and nothing beside it:
//
//   providers  the provider entries the walk recorded, in the walk's own order. Accepted as
//              the entry list itself, as `{ providers: [...] }` (the agent's own field), as
//              `{ entries: [...] }`, and as `{ providers: { entries: [...] } }` — the shape
//              `research/raw/m061-record-shapes.json` states the entries in.
//   formatter  the formatter identity the record names, if any. No record in this tree
//              carries this field (T001 measured `no-formatter-named`: no record key and no
//              shipped field names a formatter, a pipe or a locale, code hits 0), so a record
//              that states it as absent states that the formatting is outside Angular's i18n
//              surface.
//
// The four states, each the whole of what its record establishes, decided in this order — the
// strongest statement the record makes first:
//
//   locale-provider-entry  the record carries an entry whose token this rule recognises;
//                          `token`, `provider` and `importPath` are that entry's own fields,
//                          and `locale-value-not-recorded` names the value the walk discards.
//   locale-token-absent    the record carries provider entries and none of them is the locale
//                          token; `token` is null and nothing is guessed in its place.
//   formatted-outside-i18n the record states it names no formatter identity and carries no
//                          provider record; `no-formatter-named` is the absence.
//   cannot-tell            the record states nothing this answer can use — neither a provider
//                          record nor a formatter statement — or names a formatter beside no
//                          provider record, so no locale entry can be named either way.
//
// The absences are values and never missing fields, assembled once in one order:
// `no-provider-record` when the record carries no entry list, `locale-token-absent` when it
// carries entries and none matches, `locale-value-not-recorded` whenever an entry is named
// (the value is in no field the walk writes: the reduction sets the kind string at
// `extension/agent-main.js:1184-1185` and the entry literal at
// `extension/agent-main.js:1215-1223` reads no `useValue`), and `no-formatter-named` whenever
// the record names no formatter identity.
//
// Nothing here is derived from the page: no rendered text, no `navigator.language`, no DOM, no
// `Intl`, no clock, no console, no second provider read. Each `claims[]` entry cites a record
// this answer rests on by the `artefactPath` that record carries, and a record that carries
// none is cited by no claim — so the answer names no identity it was not given.
(function () {
  'use strict';

  const LOCALE_PROVIDER_ENTRY = 'locale-provider-entry';
  const LOCALE_TOKEN_ABSENT = 'locale-token-absent';
  const FORMATTED_OUTSIDE_I18N = 'formatted-outside-i18n';
  const CANNOT_TELL = 'cannot-tell';

  // The named absences, one per unanswered question, each in its own name.
  const NO_PROVIDER_RECORD = 'no-provider-record';
  const LOCALE_VALUE_NOT_RECORDED = 'locale-value-not-recorded';
  const NO_FORMATTER_NAMED = 'no-formatter-named';

  // The word an InjectionToken's own stringification writes before the description the token
  // was built with. It is the class's word and not the token's: `String(token)` is this
  // followed by the token's own description, which is why the walk writes
  // "InjectionToken LocaleId" for a token that publishes no `name`.
  const INJECTION_TOKEN_WORD = 'InjectionToken ';

  // The locale token's description, normalised. The installed `LOCALE_ID` is built with the
  // description "LocaleId" — a spelling is the token's business to change, not this rule's —
  // and every other InjectionToken in an application's provider list normalises to something
  // else ("LocaleData", "WIRE_TOKEN", …).
  const LOCALE_DESCRIPTIONS = ['localeid'];

  // One sentence per kind of claim, each stating only that the answer rests on that record.
  const ENTRY_CLAIM = 'the record carries this provider entry';
  const RECORD_CLAIM = 'the record this answer was given';

  // A payload field behind a guard: the record crosses a message boundary and comes from the
  // page's own runtime, so a getter that throws reads as "no value here" rather than losing
  // the answer. Nothing here is read from anywhere but the record it is handed.
  function fieldOf(source, field) {
    if (source === null || typeof source !== 'object') return undefined;
    try {
      return source[field];
    } catch (e) {
      return undefined;
    }
  }

  // A string that says something, or null. No empty string ever stands in for a fact the
  // record did not carry.
  function textOf(value) {
    return typeof value === 'string' && value !== '' ? value : null;
  }

  // The length of a list a record carries, or 0 where reading it throws. The list is iterated
  // by index rather than by its own iterator, so an iterator a record replaced cannot decide
  // how many entries this answer reads.
  function lengthOf(list) {
    try {
      return typeof list.length === 'number' ? list.length : 0;
    } catch (e) {
      return 0;
    }
  }

  // The name a token yields, by the walk's own rule (extension/agent-main.js:1677-1688): a
  // string token is the name itself, a token's non-empty `name` is the name, and otherwise the
  // token is stringified. A record that hands this join a live token object and a record that
  // hands it the string the walk derived are therefore read by one rule.
  function tokenNameOf(token) {
    if (token === null || typeof token === 'undefined') return null;
    try {
      if (typeof token === 'string') return textOf(token);
      if (typeof token.name === 'string' && token.name.length)
        return token.name;
      if (typeof token.toString === 'function') return textOf(String(token));
    } catch (e) {
      return null;
    }
    return null;
  }

  // A name with everything a spelling can vary stripped out: case and punctuation.
  function normalised(name) {
    return name.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  }

  // Whether a derived token name is the locale token's. The test reads the description out of
  // the derivation — the class's word when the stringification carries it, the whole name when
  // a token publishes the description as its `name` — and compares the description, never the
  // string against a literal.
  function isLocaleToken(name) {
    if (name === null) return false;
    const description =
      name.slice(0, INJECTION_TOKEN_WORD.length) === INJECTION_TOKEN_WORD
        ? name.slice(INJECTION_TOKEN_WORD.length)
        : name;
    return LOCALE_DESCRIPTIONS.indexOf(normalised(description)) !== -1;
  }

  // The provider entries the record carries, in any of the spellings this tree writes them in,
  // or null where the record carries none. A record that carries no entry list is never read
  // as a list of zero entries: the two are different facts and the answer says which it had.
  function providerEntriesOf(records) {
    if (Array.isArray(records)) return records;
    if (records === null) return null;
    const providers = fieldOf(records, 'providers');
    if (Array.isArray(providers)) return providers;
    const nested = fieldOf(providers, 'entries');
    if (Array.isArray(nested)) return nested;
    const own = fieldOf(records, 'entries');
    if (Array.isArray(own)) return own;
    return null;
  }

  // The formatter identity a record states, as a bare name or behind the record's own `name`
  // field, or null where it states none and none is invented for it.
  function formatterNameOf(value) {
    const flat = textOf(value);
    if (flat !== null) return flat;
    return textOf(fieldOf(value, 'name'));
  }

  // The entry the answer reads: the first entry whose derived token this rule recognises. The
  // walk writes the nearest injector's entries first, so the token decides the entry and the
  // walk's own order decides only between two entries that carry it — the nearest of them is
  // read, its own kind and import path are named, and its own claim says which entry it was.
  // No field is borrowed from an entry at a fixed index: without the token, no entry is read.
  function localeEntryOf(entries) {
    let found = null;
    if (entries === null) return found;
    for (let i = 0; i < lengthOf(entries); i++) {
      const candidate = fieldOf(entries, i);
      const name = tokenNameOf(fieldOf(candidate, 'token'));
      if (isLocaleToken(name)) {
        found = candidate;
        break;
      }
    }
    return found;
  }

  // One claim per record the answer cites, each carrying the `artefactPath` the record itself
  // carries. A record that names none is cited by no claim, and nothing is invented here.
  function claimsOf(kind, claim, records) {
    const claims = [];
    for (const record of records) {
      const artefactPath = textOf(fieldOf(record, 'artefactPath'));
      if (artefactPath !== null) {
        claims.push({ kind: kind, claim: claim, artefactPath: artefactPath });
      }
    }
    return claims;
  }

  // One answer, built in one place, so a pin on its keys is a pin on every answer: the six
  // contract fields, in every state, and no seventh.
  function answerOf(state, token, provider, importPath, absences, claims) {
    return {
      state: state,
      token: token,
      provider: provider,
      importPath: importPath,
      absences: absences,
      claims: claims,
    };
  }

  // The join. `records` is the frame above and anything else on it is ignored, so a caller
  // cannot smuggle a locale, a formatter or an identity into an answer through a field this
  // file does not read.
  function localeCorrectness(records) {
    const read =
      records !== null && typeof records === 'object' ? records : null;
    const entries = providerEntriesOf(read);
    const formatterGiven =
      read !== null && Object.prototype.hasOwnProperty.call(read, 'formatter');
    const formatter = formatterGiven
      ? formatterNameOf(fieldOf(read, 'formatter'))
      : null;

    const entry = localeEntryOf(entries);
    const token = entry === null ? null : tokenNameOf(fieldOf(entry, 'token'));
    const provider = entry === null ? null : textOf(fieldOf(entry, 'provider'));
    const importPath =
      entry === null ? null : textOf(fieldOf(entry, 'importPath'));

    // The absences, each in its own name and in one fixed order: the provider record that is
    // not carried, the token that is absent from the entries that are, the value the walk
    // discards, and the formatter no record names.
    const absences = [];
    if (entries === null) {
      absences.push(NO_PROVIDER_RECORD);
    }
    if (entries !== null && entry === null) {
      absences.push(LOCALE_TOKEN_ABSENT);
    }
    if (provider !== null) {
      absences.push(LOCALE_VALUE_NOT_RECORDED);
    }
    if (formatter === null) {
      absences.push(NO_FORMATTER_NAMED);
    }

    // The claims, one per record that carries an artefactPath to cite: the entry this answer
    // read, and the frame it was handed.
    let claims = [];
    if (entry !== null) {
      claims = claimsOf('provider-entry', ENTRY_CLAIM, [entry]);
    }
    if (read !== null) {
      claims = claims.concat(claimsOf('provider-record', RECORD_CLAIM, [read]));
    }

    // The state, decided from the strongest statement the record makes to the weakest — never
    // from what a page would have said.
    let state;
    if (entries !== null) {
      state = entry === null ? LOCALE_TOKEN_ABSENT : LOCALE_PROVIDER_ENTRY;
    } else if (formatterGiven && formatter === null) {
      state = FORMATTED_OUTSIDE_I18N;
    } else {
      state = CANNOT_TELL;
    }

    return answerOf(state, token, provider, importPath, absences, claims);
  }

  globalThis.angularAiLocaleCorrectness = localeCorrectness;
})();
