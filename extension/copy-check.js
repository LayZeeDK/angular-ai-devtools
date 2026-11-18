// copy-check.js — the join behind M048: the copy a panel surface declares, and what the copy digest
// says about it.
//
// T001 measured both sides and published them as `research/raw/m048-surface-copy.json`; this module
// reads only what that record states:
//
//   surfaces   the record's `surfaces` list — 20 entries, one per `panel-*.ts` surface. Each carries
//              an `id`, the sentences it declares in a map or a module constant (`sentences[]`, each
//              with `key`, `text` and `kind`) and the lines it builds inline where no map can reach
//              them (`inline[]`, each with `text` and `kind`). Nothing here reads a panel source, a
//              component, or a page: the declared copy is the record's, and a caller that read the
//              page to decide what the copy says would be a second rule nobody measured (N5).
//   digest     `extension/copy-digest.json` — `{ schema, version, source, entries }`, one entry per
//              sanctioned sentence: `{ surface, key, text }`. Only `text` is read. `surface` and
//              `key` are provenance for a reader, and the suite holds them to the record; the join
//              does not consult them, because a string is sanctioned by being in the digest and by
//              nothing else. A sentence the surface declares under a key carries that key; a
//              sentence written inline carries `null`, because it is declared under no key at all.
//
// The join keys on one thing: the digest's own text, compared with `===` after nothing. No trimming,
// no case folding, no Unicode or quote normalisation, no prefix, no substring, no edit distance: if
// two strings are not the same string, the digest does not explain the declared one, and the join
// reports it with the surface that renders it (E1, E2, N1). The record names two places where a
// normalisation would silently explain a sentence the pane does not render: panel-stability.ts:107
// spells `page’s` with U+2019, and panel-sanitizer.ts:180 builds a plural from a count — so a digest
// holding an ASCII apostrophe, or `2 warning`, would be a different string from the one on screen.
// The comparison is exact for exactly that reason.
//
// The answer is `{ state, unexplained, checked, reason }` and nothing else:
//
//   state        clean          every sentence the surfaces declare is in the digest. A surface
//                               that renders no copy does not decide this: the absence is reported
//                               in that surface's own row, and a record whose read copy is
//                               explained reads clean with the absence still visible beside it.
//                unexplained    at least one declared sentence is not in the digest. `unexplained`
//                               names each one, in the order the surfaces and their sentences were
//                               handed over, with the surface that renders it.
//                cannot-tell    one side of the comparison is missing, and the reason says which:
//                               no digest at all, or no string compared. "Nothing to compare"
//                               never comes back as "nothing wrong" (E3, E4, N2).
//   unexplained  `{ string, surface }[]` — the sentences the digest does not carry, in record order,
//                with the `id` of the surface that declares each. Empty where nothing was compared;
//                where a record carries both a copy-less surface and an unexplained sentence, the
//                sentences are still reported beside the reason, so the cannot-tell does not swallow
//                what was measured.
//   checked      the number of sentences this join compared against the digest. Zero where nothing
//                was compared at all — no digest, or a record whose surfaces declare no sentence —
//                and zero comparisons is not zero defects.
//   reason       present only where the state is cannot-tell, and one of `REASONS` — the closed list
//                below, so a surface renders each as the known absence it has a sentence for and no
//                reason outside the list is a join answer at all. The order is the contract's, and it
//                is the order the cases are decided in: a missing digest is answered before anything
//                is compared, and zero strings compared is answered after it, so a record with no
//                digest and a record with no strings do not answer with each other's reason. The
//                reason names the case and not the surface: the answer has no fifth field, the
//                contract states four, and a surface that renders nothing is named in its own row,
//                so a surface that renders this reason says which absence it is reading and does not
//                invent a subject the join did not answer with.
//
// The digest is a digest of sentences and not of every literal the record carries. `SCOPE` below is
// the boundary as data: the sentence kinds are read, and the record's label prefixes and value words
// are read past. T001 counts those separately — `declaredLabels` (3), `declaredWordsAndFragments`
// (8), `inlineLabels` (118), `inlineWords` (7) — and they are the prefix a line is built from and the
// word substituted into it (`state: `, `recorded`, `no readable count`), never a string a surface
// renders whole. Digesting them would hold strings the pane never renders, which is the defect the
// sanitizer's pluraliser is recorded against in `NOT_DIGESTED`. So this join explains the sentences,
// and a reader who wants the labels has T001's measurement of them and not a claim from this module
// that they were checked.
(function () {
  'use strict';

  const CLEAN = 'clean';
  const UNEXPLAINED = 'unexplained';
  const CANNOT_TELL = 'cannot-tell';

  // The three states the join can answer, enumerated in one place.
  const STATES = Object.freeze([CLEAN, UNEXPLAINED, CANNOT_TELL]);

  const NO_DIGEST = 'no-digest';
  const SURFACE_DECLARES_NOTHING = 'surface-declares-nothing';

  // The reasons a cannot-tell answer can state: the closed set a surface renders, one sentence per
  // word, and no word outside the list is a join answer. Every member here is reachable — a reason
  // that no input can return is a word the surface could render but never would, so this list holds
  // only what the contract's order can answer: no digest at all, and nothing compared.
  const REASONS = Object.freeze([NO_DIGEST, SURFACE_DECLARES_NOTHING]);

  // Why a string the record carries is deliberately not in the digest. A closed list: a decision
  // outside it is a string this module has no measurement for, and `NOT_DIGESTED` below carries one
  // of these words per entry.
  const COMPOSED_AT_RENDER = 'composed-at-render';
  const NOT_DIGESTED_REASONS = Object.freeze([COMPOSED_AT_RENDER]);

  // The kinds of string this join reads, and the kinds it reads past, as data rather than as a
  // comment: a test can hold the record's counts against it, and a surface that started declaring a
  // sentence under a kind this list does not carry would be a kind nobody reads, not a silent miss.
  const SCOPE = Object.freeze({
    declared: Object.freeze({
      read: Object.freeze(['sentence-in-registry', 'sentence-from-constant']),
      passedOver: Object.freeze([
        'label-from-constant',
        'word-from-constant',
        'fragment-from-constant',
      ]),
    }),
    inline: Object.freeze({
      read: Object.freeze(['sentence']),
      passedOver: Object.freeze(['label', 'word']),
    }),
  });

  // The strings the record carries that are deliberately not digested, each with the reason. There
  // is one at this head and it is the decision T002 is required to record: `counted()` at
  // panel-sanitizer.ts:180 writes `${count} ${noun}${count === 1 ? '' : 's'}`, so the pane renders
  // `2 warnings` and `1 warning` and never renders the template as a whole. A digest entry for it
  // would be a row for a string no surface renders, and a digest holding `2 warning` would hold a
  // string the pluraliser never produces. The entry also falls outside `SCOPE` — the record files it
  // under `inline` with kind `word` — so this list and the scope agree by measurement and not by
  // luck, and the suite asserts both the record's measurement and the digest's silence about it.
  const NOT_DIGESTED = Object.freeze([
    Object.freeze({
      surface: 'sanitizer',
      text: "${count} ${noun}${count === 1 ? '' : 's'}",
      reason: COMPOSED_AT_RENDER,
    }),
  ]);

  // The digest as shipped is `{ schema, version, source, entries }`. A bare array of entries is read
  // the same way, so a caller holding only the list does not have to wrap it. Anything else — a
  // missing digest, an object with no `entries` list — holds no entries, and no entries is the
  // cannot-tell case below rather than an empty digest that agrees with everything.
  function entriesOf(digest) {
    if (Array.isArray(digest)) return digest;
    if (digest && typeof digest === 'object' && Array.isArray(digest.entries)) {
      return digest.entries;
    }
    return [];
  }

  // Every text the digest carries, in the digest's own order, and nothing else: an entry with no
  // string `text` explains no string. This is the module's whole reading of the digest, exported so
  // a pin can hold "the digest explains these strings and no others" to the file the extension ships
  // — an invented row is caught here, where the join's own answer could not show it.
  function explainedTexts(digest) {
    const entries = entriesOf(digest);
    const texts = [];
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (
        entry &&
        typeof entry === 'object' &&
        typeof entry.text === 'string'
      ) {
        texts.push(entry.text);
      }
    }
    return texts;
  }

  // The sentences one surface declares, in the record's own order: the declared ones first, then the
  // lines it writes inline. A kind the scope reads past is skipped, and a surface that is not the
  // object the record measured yields no sentence at all — which is the cannot-tell case below, not a
  // clean surface with nothing wrong with it.
  function sentencesOf(surface) {
    const texts = [];
    if (!surface || typeof surface !== 'object') return texts;
    const declared = Array.isArray(surface.sentences) ? surface.sentences : [];
    for (let i = 0; i < declared.length; i += 1) {
      const sentence = declared[i];
      if (!sentence || typeof sentence !== 'object') continue;
      if (!SCOPE.declared.read.includes(sentence.kind)) continue;
      if (typeof sentence.text !== 'string') continue;
      texts.push(sentence.text);
    }
    const inline = Array.isArray(surface.inline) ? surface.inline : [];
    for (let i = 0; i < inline.length; i += 1) {
      const line = inline[i];
      if (!line || typeof line !== 'object') continue;
      if (!SCOPE.inline.read.includes(line.kind)) continue;
      if (typeof line.text !== 'string') continue;
      texts.push(line.text);
    }
    return texts;
  }

  // One surface's own row: everything this join knows about that surface alone, decided here and
  // nowhere else. A surface that declares no sentence is `cannot-tell` in its row with
  // `surface-declares-nothing` and contributes nothing else — the absence is a property of that
  // surface, reported where it sits, and not a fact about the record that carries it.
  function surfaceRow(surface, explained) {
    const id = surface && typeof surface === 'object' ? surface.id : undefined;
    const texts = sentencesOf(surface);
    if (texts.length === 0) {
      return {
        state: CANNOT_TELL,
        unexplained: [],
        checked: 0,
        reason: SURFACE_DECLARES_NOTHING,
      };
    }

    const unexplained = [];
    for (let j = 0; j < texts.length; j += 1) {
      const text = texts[j];
      if (!explained.has(text)) unexplained.push({ string: text, surface: id });
    }
    return {
      state: unexplained.length > 0 ? UNEXPLAINED : CLEAN,
      unexplained: unexplained,
      checked: texts.length,
    };
  }

  // The join. The record's answer is the rows above and the contract's order over them, with no
  // second pass that decides it another way: `checked` is what the rows compared, `unexplained` is
  // what they report in record order, and `state` is the first of the contract's cases that holds.
  // A surface that renders no copy is a row and never the record's verdict.
  function copyCheck(surfaces, digest) {
    // The first absence is the digest: membership in this set is the whole comparison, `===` on the
    // digest's own text. A digest that holds no text holds nothing to compare, and emptiness is not
    // agreement — an entry-less digest is refused exactly as a missing one is (E4, N2). Nothing was
    // compared, so nothing is counted and no string is reported.
    const explained = new Set(explainedTexts(digest));
    if (explained.size === 0) {
      return {
        state: CANNOT_TELL,
        unexplained: [],
        checked: 0,
        reason: NO_DIGEST,
      };
    }

    // Every surface's own row, in the record's order. A caller that handed over no record at all has
    // no rows, which is the zero-string case below and not a clean record with nothing in it.
    const rows = [];
    if (Array.isArray(surfaces)) {
      for (let i = 0; i < surfaces.length; i += 1)
        rows.push(surfaceRow(surfaces[i], explained));
    }

    // The record reads what its rows compared and what they reported, both in record order.
    const unexplained = [];
    let checked = 0;
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      checked += row.checked;
      for (let j = 0; j < row.unexplained.length; j += 1)
        unexplained.push(row.unexplained[j]);
    }

    // Zero strings compared is never clean: "nothing to compare" is not "nothing wrong", and it is
    // the record's answer only when no string at all was compared (E4, N2).
    if (checked === 0) {
      return {
        state: CANNOT_TELL,
        unexplained: unexplained,
        checked: checked,
        reason: SURFACE_DECLARES_NOTHING,
      };
    }

    // Otherwise the rows decide: any string the digest does not explain is reported, and a record
    // whose every compared string is explained is clean whatever its rows declare nothing.
    return {
      state: unexplained.length > 0 ? UNEXPLAINED : CLEAN,
      unexplained: unexplained,
      checked: checked,
    };
  }

  const namespace = {
    copyCheck: copyCheck,
    explainedTexts: explainedTexts,
    STATES: STATES,
    REASONS: REASONS,
    SCOPE: SCOPE,
    NOT_DIGESTED: NOT_DIGESTED,
    NOT_DIGESTED_REASONS: NOT_DIGESTED_REASONS,
    COMPOSED_AT_RENDER: COMPOSED_AT_RENDER,
  };

  if (globalThis.angularAiCopyCheck) {
    Object.assign(globalThis.angularAiCopyCheck, namespace);
  } else {
    globalThis.angularAiCopyCheck = namespace;
  }
})();
