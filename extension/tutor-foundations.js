// tutor-foundations — the pure join behind M055's tutor surface: one question in, the one artefact
// file a record states for the criterion that answers it out, and the absence named when there is no
// answer to give.
//
// The join reads three fields and no others. The milestone is the answering record's own `milestone`
// field, the criterion is its own `claims[].criterion`, and the artefact file is its own
// `claims[].artefactPath` — read at answer time, from the parsed record a caller hands over, on every
// call. Nothing is composed from a file name, from a path convention or from the record's prose: the
// derivation's `reason`, `artefact` and `reading` fields are one template shared word for word across
// milestones (C3), so this module never touches them, and a fixture whose prose names a decoy file is
// part of the suite for exactly that reason (N1).
//
// The question side is the one authored mapping (extension/tutor-index.js): a question text, a
// criterion id and a milestone. Everything else — which record, which claim, which path, whether the
// path is there — is decided here from the records and the reader, never from a row.
//
// The answer is `{ state, question, milestone, criterion, artefactPaths, detail }` and nothing else:
//
//   state          answered              the record states a path for the criterion and the reader
//                                        reported it present. `milestone`, `criterion` and every member
//                                        of `artefactPaths` are the record's own field values, verbatim.
//                  no-matching-criterion  the first absence: no criterion matches the question. Two
//                                        cases, one state, and `detail` says which: no row of the
//                                        authored mapping carries the question, or the milestone the row
//                                        names has no readable record whose claims carry the criterion.
//                  no-artefact-named      the second absence: the record carries the criterion but no
//                                        claim of it states `claims[].artefactPath`. `detail` names the
//                                        missing field and the record, and `artefactPaths` is empty.
//                  records-unreadable     the third absence: nothing could be read — no record was
//                                        supplied, none supplied was a parsed record, or no reader was
//                                        injected to read presence with. Three cases, one state, and
//                                        `detail` says which.
//                  missing-artefact       the record states a path and the injected reader reported it
//                                        absent where the record says it lives. `artefactPaths` carries
//                                        the paths that were not there and `detail` names the record and
//                                        every missing path. Never `no-matching-criterion`: a gone file
//                                        is not an unanswered question (E4).
//   question       the question asked, trimmed, echoed into every state.
//   milestone      `null` where no record was named; the index row's milestone where the row is what
//                  failed; the answering record's own `milestone` field, verbatim, everywhere a record
//                  answered. The field is spelled two ways in the records this repository holds: the
//                  verdict-claims records carry the bare id ('M054') and the surface records carry the
//                  id and the milestone's name ('M054 visual-qa'). Matching reads the first
//                  whitespace-delimited token, so both spellings are recognised as the same milestone,
//                  and the rendered value is the record's field as the record spells it. In practice
//                  that is always the bare id, because a surface record carries no `claims[].criterion`
//                  and no `claims[].artefactPath` and so can never be the record that answers.
//   criterion      the claim's own `criterion` value, which is the id the row named — matched with
//                  `===` and never renumbered, generalised or invented (N4). `null` on the two
//                  absences that hold before a record is named.
//   artefactPaths  the paths the record states for the criterion, in the record's own claim order, as
//                  the record spells them — never re-rooted, normalised or shortened (E2) — or, on
//                  `missing-artefact`, the stated paths the reader reported absent, in that same order.
//                  Empty on every state that names no artefact.
//   detail         this join's own sentence about which absence holds, or about what it read. Never a
//                  record field and never the derivation's prose.
//
// The three absences are three states with three sentences, decided in this order and never folded into
// one blank answer: the instrument, then the records, then the mapping, then the criterion, then the
// field, then presence (E3, N2). The order is the contract's and each case answers before the next is
// asked, so a record with no `artefactPath` and a record that cannot be read never answer with each
// other's absence.
//
// The count this module is built to, measured by the milestone's own recording of the record shapes:
// `claims[].artefactPath` is carried by 12 of the 34 verdict-claims records and by 44 claims, while 22
// records carry none of it in four different shapes. So the join answers from the records that carry the
// fields and reports the rest as the absence that names the missing field — it does not fall back to
// prose, and the authored index does not grow a third fact to paper the gap over (C4, N5).
//
// Presence is read through the caller's injected `sources.exists(path)` on every answer. This module
// imports nothing at runtime, holds no filesystem, dispatches no message, performs no network call,
// holds no clock and keeps no state between calls, so a second answer to the same question over the
// same records names the same record fields (E5). E4's dead-path state has no live instance: all 44
// `artefactPath` values resolve at the head the milestone's recording measured. The state is therefore
// pinned by a constructed input in the suite that owns it, and this note says so plainly so that no
// reader believes the state was measured in the tree.
(function () {
  'use strict';

  const ANSWERED = 'answered';
  const NO_MATCHING_CRITERION = 'no-matching-criterion';
  const NO_ARTEFACT_NAMED = 'no-artefact-named';
  const RECORDS_UNREADABLE = 'records-unreadable';
  const MISSING_ARTEFACT = 'missing-artefact';

  // The five states the join can answer, in the order the contract lists them, as data a surface can
  // enumerate rather than as five string comparisons scattered through a renderer.
  const STATES = Object.freeze([
    ANSWERED,
    NO_MATCHING_CRITERION,
    NO_ARTEFACT_NAMED,
    RECORDS_UNREADABLE,
    MISSING_ARTEFACT,
  ]);

  // The three absences SC2 requires stated distinctly, in the order this module decides them.
  const ABSENCES = Object.freeze([
    NO_MATCHING_CRITERION,
    NO_ARTEFACT_NAMED,
    RECORDS_UNREADABLE,
  ]);

  // The fields an answer reads, named once so a surface can say which field it rendered from and so the
  // suite can hold this list to the contract's three.
  const READS = Object.freeze({
    milestone: 'milestone',
    criterion: 'claims[].criterion',
    artefactPath: 'claims[].artefactPath',
  });

  // One answer, with every field present in every state, so a renderer reads six fields and not five
  // sometimes.
  function answerOf(state, asked, milestone, criterion, artefactPaths, detail) {
    return {
      state: state,
      question: asked,
      milestone: milestone,
      criterion: criterion,
      artefactPaths: artefactPaths,
      detail: detail,
    };
  }

  // The quoted spelling of each path, for the join's own sentences. The paths are quoted exactly as the
  // record spells them inside the sentence too, so a reader cannot mistake the detail for a normalised
  // form of a path the record states.
  function spell(paths) {
    const quoted = [];
    for (let i = 0; i < paths.length; i += 1) quoted.push('"' + paths[i] + '"');
    return quoted.join(' and ');
  }

  // The first whitespace-delimited token of a milestone field: 'M054' reads as 'M054' and
  // 'M054 visual-qa' reads as 'M054'. No case folding, no trimming inside the token, no other rule: the
  // id is the first token or the field names no milestone this join can match.
  function milestoneId(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    const space = trimmed.search(/\s/);
    return space === -1 ? trimmed : trimmed.slice(0, space);
  }

  // The authored mapping's rows: the list itself or the module's `{ rows }` object, so a caller can hand
  // over either without wrapping it. Anything else holds no row, and no row is the first absence below
  // rather than a question that answered itself.
  function rowsOf(index) {
    if (Array.isArray(index)) return index;
    if (index && typeof index === 'object' && Array.isArray(index.rows)) {
      return index.rows;
    }
    return [];
  }

  // The one row carrying this question text, compared with `===` after nothing but the caller's
  // surrounding whitespace: a question the mapping does not carry is not matched by similarity, by
  // prefix or by a keyword, because a near-miss row would bind a question to a criterion nobody
  // authored for it.
  function findRow(rows, asked) {
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row || typeof row !== 'object') continue;
      if (row.question === asked) return row;
    }
    return null;
  }

  // The records a caller handed over that can be read at all: an entry is readable when it names a path
  // and carries a parsed record object. A record that could not be parsed is handed over with no
  // `record` (or not at all), and this join will not pretend a record with no `record` is a record that
  // answers nothing — that is the third absence, not an empty answer.
  function readableRecords(supplied) {
    const records = Array.isArray(supplied.records) ? supplied.records : [];
    const readable = [];
    for (let i = 0; i < records.length; i += 1) {
      const entry = records[i];
      if (!entry || typeof entry !== 'object') continue;
      if (typeof entry.path !== 'string') continue;
      const record = entry.record;
      if (!record || typeof record !== 'object') continue;
      readable.push({ path: entry.path, record: record });
    }
    return readable;
  }

  // The artefact paths one claim states: its own `claims[].artefactPath`, as the record spells it, and
  // nothing else. A claim that carries no string there names no path — never a path pulled out of its
  // prose, never one built from its criterion or from the name of the file the record sits in.
  function pathsOfClaim(claim) {
    const stated =
      claim && typeof claim === 'object' ? claim.artefactPath : undefined;
    if (typeof stated === 'string') return [stated];
    return [];
  }

  // The claim a readable record states for one milestone id and one criterion id, with the record it was
  // read from. A record whose claims name the criterion more than once contributes every claim's path in
  // the record's own order, which is how a record states more than one artefact for one criterion (E2).
  // A record carrying neither field contributes nothing to an answer and is not an absence by itself: it
  // is simply not the record this question's milestone names.
  function claimFor(records, id, criterion) {
    let owner = null;
    let rendered = '';
    const paths = [];
    for (let i = 0; i < records.length; i += 1) {
      const entry = records[i];
      if (milestoneId(entry.record.milestone) !== id) continue;
      const claims = Array.isArray(entry.record.claims)
        ? entry.record.claims
        : [];
      for (let j = 0; j < claims.length; j += 1) {
        const claim = claims[j];
        if (!claim || typeof claim !== 'object') continue;
        if (claim.criterion !== criterion) continue;
        if (owner === null) {
          owner = entry;
          rendered = claim.criterion;
        }
        const stated = pathsOfClaim(claim);
        for (let k = 0; k < stated.length; k += 1) paths.push(stated[k]);
      }
    }
    if (owner === null) return null;
    return {
      record: owner.path,
      milestone: owner.record.milestone,
      criterion: rendered,
      paths: paths,
    };
  }

  // The join. One question, the records and the reader; six fields out, in every state.
  function tutorAnswer(question, sources) {
    const asked = typeof question === 'string' ? question.trim() : '';
    const supplied = sources && typeof sources === 'object' ? sources : {};
    const exists = supplied.exists;

    // 1. The instrument. Presence is read through the injected reader on every answer, so a join with
    // no reader would have to bake the answer; it says so instead, and says it as the third absence
    // because what could not be read is the records' presence.
    if (typeof exists !== 'function') {
      return answerOf(
        RECORDS_UNREADABLE,
        asked,
        null,
        null,
        [],
        'no record could be read: the caller injected no reader, and every rendered path is read through the caller\u2019s reader at answer time, so with none given no record could be read where it says it lives',
      );
    }

    // 2. The records themselves.
    const records = readableRecords(supplied);
    if (records.length === 0) {
      const suppliedCount = Array.isArray(supplied.records)
        ? supplied.records.length
        : 0;
      return answerOf(
        RECORDS_UNREADABLE,
        asked,
        null,
        null,
        [],
        suppliedCount === 0
          ? 'no record could be read: no record was supplied, so no criterion can be matched and no artefact named'
          : 'no record could be read: none of the ' +
              suppliedCount +
              ' record(s) supplied is a parsed record with a path, so no criterion can be matched and no artefact named',
      );
    }

    // 3. The authored mapping decides the question-to-criterion side. A question no row carries is the
    // first absence and nothing beside it: not the first record's claim, not a keyword guess.
    const row = findRow(rowsOf(supplied.index), asked);
    if (row === null) {
      return answerOf(
        NO_MATCHING_CRITERION,
        asked,
        null,
        null,
        [],
        'no criterion matches the question: no row of the authored mapping carries it, and that mapping is the only place a question is bound to a criterion',
      );
    }

    const id = milestoneId(row.milestone);
    const criterion = typeof row.criterion === 'string' ? row.criterion : '';

    // 4. The criterion the row names, read from the record's own claims.
    const matched = claimFor(records, id, criterion);
    if (matched === null) {
      return answerOf(
        NO_MATCHING_CRITERION,
        asked,
        row.milestone,
        criterion,
        [],
        'no criterion matches the question: no readable record belongs to ' +
          id +
          ' and carries criterion ' +
          criterion +
          ' among the ' +
          records.length +
          ' readable record(s), so the row names a criterion this join cannot find',
      );
    }

    // 5. The criterion matched and the claim names no artefact path: the second absence, naming the
    // field. This is the shape C4 measured in 22 of the 34 records, and it is never an answer with a
    // composed path in it.
    if (matched.paths.length === 0) {
      return answerOf(
        NO_ARTEFACT_NAMED,
        asked,
        matched.milestone,
        matched.criterion,
        [],
        'the record ' +
          matched.record +
          ' carries criterion ' +
          matched.criterion +
          ' but no claim of it states ' +
          READS.artefactPath +
          ': the record names no artefact file, and none is composed from its prose fields or from its own name',
      );
    }

    // 6. Presence, read at answer time. Only a strict `true` counts as present: a reader that answers
    // with anything else has not reported the path there.
    const missing = [];
    for (let i = 0; i < matched.paths.length; i += 1) {
      const path = matched.paths[i];
      const present = exists(path) === true;
      if (!present) missing.push(path);
    }

    // 7. The dead path. The record states a file that is not where the record says it lives, so the
    // answer names the record and the missing path beside the absence, and never the unanswered state.
    if (missing.length > 0) {
      return answerOf(
        MISSING_ARTEFACT,
        asked,
        matched.milestone,
        matched.criterion,
        missing,
        'the record ' +
          matched.record +
          ' states ' +
          spell(matched.paths) +
          ' for criterion ' +
          matched.criterion +
          ', and the injected reader reported ' +
          spell(missing) +
          ' absent where the record says it lives: a gone file is not an unanswered question',
      );
    }

    // 8. The answer: the record's own three field values, the paths verbatim, and this join's sentence.
    return answerOf(
      ANSWERED,
      asked,
      matched.milestone,
      matched.criterion,
      matched.paths,
      'the record ' +
        matched.record +
        ' states ' +
        spell(matched.paths) +
        ' as its own ' +
        READS.artefactPath +
        ' for criterion ' +
        matched.criterion +
        ', and the injected reader reported each present at answer time',
    );
  }

  const namespace = {
    tutorAnswer: tutorAnswer,
    STATES: STATES,
    ABSENCES: ABSENCES,
    READS: READS,
  };

  if (globalThis.angularAiTutorFoundations) {
    Object.assign(globalThis.angularAiTutorFoundations, namespace);
  } else {
    globalThis.angularAiTutorFoundations = namespace;
  }
})();
