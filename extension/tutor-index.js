// tutor-index — the one authored mapping this milestone owns (C2, N5), and data only.
//
// Two measurements decide this file's whole shape. The question-to-criterion side of an answer exists
// in no record: every key at every depth of the thirty-four verdict-claims records was enumerated and
// none carries a question, a query or a prompt, so the binding from a question a person would ask to
// the criterion that answers it is authored here and derived from nothing. The criterion-to-artefact
// side is the opposite: the records carry it as their own fields, so this file does not hold it and
// could not: a reader that found a path in here would be reading a second, unmeasured rule.
//
// A row is two facts and no more — the question text, the criterion id, and the milestone naming the
// one record that answers it. No path, no value, no measured count, no answer sentence, no template
// prose, no date. The refusal is enforced over these bytes rather than promised: the suite that reads
// this file refuses a slash in its code, any file-extension-shaped token in its code or in a row, and
// any repository path anywhere in its bytes at all, so a path cannot be added to a row without
// reddening. The same suite holds every criterion id below to the `claims[].criterion` fields of the
// record its milestone names, at authoring time and on every run.
//
// One criterion id is here on purpose because its record cannot answer: the M023 row names a criterion
// that record's own claim carries, and that claim states no `claims[].artefactPath` at all, so the join
// answers `no-artefact-named` and names the missing field. That is the shape C4 measured across
// twenty-two of the thirty-four records, rendered as SC2's absence instead of papered over with a
// third fact in a row. Nothing in this file decides that: the row is two facts, and the record decides
// the rest at answer time.
//
// The milestone is spelled as the bare id the verdict-claims records use. A record that spells the id
// and the milestone's name in one string is matched by the reader on its first token, which is the
// join's rule and not this file's, so no row here carries a name.
(function () {
  'use strict';

  // The mapping. One row per question, in milestone order. Each row is frozen, so a caller cannot give
  // the index a third fact by assignment, and the list is frozen, so it cannot grow one either.
  const rows = Object.freeze([
    Object.freeze({
      question:
        'which artefact proves the harness target handles the boundary, predicate, ambiguity and action cases?',
      criterion: 'SC2',
      milestone: 'M023',
    }),
    Object.freeze({
      question:
        'which check refuses a test that resolves a milestone path its own archive move deletes?',
      criterion: 'SC1',
      milestone: 'M044',
    }),
    Object.freeze({
      question:
        'does the ship gate run the archive-path and fix-record checks, rather than print them as advice?',
      criterion: 'SC3',
      milestone: 'M044',
    }),
    Object.freeze({
      question:
        'does the panel report one finding per captured console diagnostic, naming the message text and the code it carries?',
      criterion: 'SC1',
      milestone: 'M045',
    }),
    Object.freeze({
      question:
        'is a finding that names an absence handed over with that absence, rather than as an empty finding?',
      criterion: 'SC2',
      milestone: 'M046',
    }),
    Object.freeze({
      question:
        'is every string a panel surface renders either explained by the copy digest or reported with the surface that renders it?',
      criterion: 'SC1',
      milestone: 'M048',
    }),
    Object.freeze({
      question:
        'does every step of the interaction story quote an event the record carries, in the order it arrived?',
      criterion: 'SC1',
      milestone: 'M049',
    }),
    Object.freeze({
      question:
        'what does the panel report when the page exposes no readable list of tools?',
      criterion: 'SC2',
      milestone: 'M052',
    }),
    Object.freeze({
      question:
        'does the panel report the computed and the baseline value of each property it measured on its own element?',
      criterion: 'SC1',
      milestone: 'M054',
    }),
    Object.freeze({
      question:
        'does the gate integrity suite still pass at a head where this milestone has shipped?',
      criterion: 'SC3',
      milestone: 'M056',
    }),
  ]);

  const namespace = {
    rows: rows,
  };

  if (globalThis.angularAiTutorIndex) {
    Object.assign(globalThis.angularAiTutorIndex, namespace);
  } else {
    globalThis.angularAiTutorIndex = namespace;
  }
})();
