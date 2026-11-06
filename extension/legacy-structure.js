// legacy-structure.js — the join behind M034: a selected component's structure, and the modern
// form a cited table sources for it.
//
// T001 measured that Angular's legacy-construct diagnostic (`NG6100`) never reaches the page
// console: it is printed by the dev server's compiler plugin and stopped there
// (`research/raw/m034-legacy-diagnostic.json`, `reachedThePageConsole: false`). A panel that can
// only read the page therefore cannot join that message. What the page does carry is the
// component's own metadata — `ɵcmp.standalone` — so the legacy axis this module joins is the
// structure of the selected component: declared in an NgModule, or standalone.
//
// The modern form is data, and it is never composed here. `research/raw/m034-equivalents.json` is
// a capture of pages that state it, each entry holding the URL it came from, a verbatim quote and
// the instant it was retrieved. This module reads an entry's `modernForm` and `url` and states
// them; a form it cannot find in the table is not answered at all. A migration guide that was
// never fetched is a guess wearing a citation, and a guess is what this module refuses to make.
//
// What the module is not: it is a reader of the one fact and the one table it is given, and of
// nothing else (N1). It has no DOM (no `document`, no `window`, no `getComputedStyle`), no clock,
// no `console`, no network, no selector walk and no imports, and it installs no page global beyond
// the one namespace below. A bare `node:vm` context with nothing in it is enough to run it, which
// is what the suite proves.
//
// Input shapes, read as they are recorded:
//
//   fact          what the caller read about the selected component:
//                 `{ name, standalone }`, where `name` is the component's own name and
//                 `standalone` is the boolean the caller read from `ɵcmp.standalone` in the
//                 page's own realm. This module reads the flag; it never reaches for `ɵcmp`
//                 itself, and no other field of the fact — a selector, a file path, a class-name
//                 suffix — is evidence of structure (E2).
//   equivalents   the cited table, as the recording holds it: the recording object with its
//                 `entries` array, or that array itself.
//
// The answer is one object, one of three states the surface can render (T003 adds none):
//
//   { state: "finding",     component, structure: "NgModule-declared", modernForm, source }
//   { state: "cannot-tell", reason: "already-standalone" }
//   { state: "cannot-tell", reason: "metadata-unreadable" | "no-sourced-equivalent" }
//
// A finding names the component the caller named, states that its structure is NgModule-declared,
// and carries the modern form and the source URL the equivalents entry itself holds — the two
// strings are copied from the table, never paraphrased, reordered or completed from memory.
//
// A "cannot tell" names the absence it found and nothing else — no component, no structure, no
// form:
//
//   metadata-unreadable     the fact carries no boolean `standalone` flag (or no name to put on a
//                           finding). The metadata read did not happen, so there is no structure to
//                           answer for: this is the held-out E3, and it is also what a component's
//                           name, selector or file path can never talk the module out of (E2).
//   already-standalone      `ɵcmp.standalone` is true, so there is no NgModule declaration to
//                           modernise and no form to name (AC2).
//   no-sourced-equivalent   the component is NgModule-declared and the table holds no entry that
//                           states the modern form for that structure. The module has nowhere to
//                           copy a form from, so it names none: an unsourced form is the failure
//                           this reason exists to prevent (AC6).
(function () {
  'use strict';

  const FINDING = 'finding';
  const CANNOT_TELL = 'cannot-tell';

  // The one structure this module answers for, and the names of the absences, so a caller compares
  // a constant instead of prose.
  const NGMODULE_DECLARED = 'NgModule-declared';
  const ALREADY_STANDALONE = 'already-standalone';
  const METADATA_UNREADABLE = 'metadata-unreadable';
  const NO_SOURCED_EQUIVALENT = 'no-sourced-equivalent';

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A string that says something, or null. Prose is trimmed; anything that is not a string, and a
  // string that is only whitespace, states nothing.
  function nonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  // The component's name as the caller stated it, or null when the fact carries none. The name is
  // read, never derived: no selector, no file path and no class-name suffix is turned into one.
  function nameOf(fact) {
    return isObject(fact) ? nonEmptyString(fact.name) : null;
  }

  // The standalone flag the caller read from `ɵcmp.standalone`, or null when the fact carries
  // nothing that can be read as one. A missing field, a null, a 0 and the string "false" all mean
  // the read did not happen: this module does not guess which way a non-boolean leans (E3).
  function standaloneOf(fact) {
    if (!isObject(fact)) return null;
    return typeof fact.standalone === 'boolean' ? fact.standalone : null;
  }

  // The cited entries the caller supplied, in the caller's order: the recording object that holds
  // them, or the list itself. Nothing else the caller passes is read.
  function entriesOf(equivalents) {
    if (Array.isArray(equivalents)) return equivalents;
    if (isObject(equivalents) && Array.isArray(equivalents.entries)) {
      return equivalents.entries;
    }
    return [];
  }

  // The first entry that states a modern form for a structure, with the source it came from. An
  // entry missing either half is not a sourced equivalent, and this module fills in neither: the
  // form is the table's, and so is the URL that answers for it.
  function sourcedFor(equivalents, structure) {
    const entries = entriesOf(equivalents);
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (!isObject(entry)) continue;
      if (entry.structure !== structure) continue;
      const modernForm = nonEmptyString(entry.modernForm);
      const url = nonEmptyString(entry.url);
      if (modernForm === null || url === null) continue;
      return { modernForm: modernForm, url: url };
    }
    return null;
  }

  // The finding, written in one place so a pin on its shape is a pin on every finding. It carries
  // the component, the structure and the two strings the table holds — and nothing composed here.
  function finding(component, sourced) {
    return {
      state: FINDING,
      component: component,
      structure: NGMODULE_DECLARED,
      modernForm: sourced.modernForm,
      source: sourced.url,
    };
  }

  // The absence, written in one place so every way of reaching it says the same thing and nothing
  // that reads as a structure, a form or a clean page.
  function cannotTell(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  /**
   * The join: one component's structure, and the modern form the cited table sources for it.
   *
   * @param {any} fact what the caller read: `{ name, standalone }`
   * @param {any} equivalents the cited table: the recording or its `entries` array
   * @returns {{ state: string, component?: string, structure?: string, modernForm?: string, source?: string, reason?: string }}
   */
  function legacyStructure(fact, equivalents) {
    const standalone = standaloneOf(fact);

    // The metadata read did not happen: no structure is answered for, whatever the fact's other
    // fields look like (E2, E3).
    if (standalone === null) return cannotTell(METADATA_UNREADABLE);

    // Already standalone: there is no NgModule declaration to modernise and no form to name (AC2).
    if (standalone === true) return cannotTell(ALREADY_STANDALONE);

    const component = nameOf(fact);
    if (component === null) return cannotTell(METADATA_UNREADABLE);

    const sourced = sourcedFor(equivalents, NGMODULE_DECLARED);
    // The table holds no form for this structure: name none rather than compose one (AC6).
    if (sourced === null) return cannotTell(NO_SOURCED_EQUIVALENT);

    return finding(component, sourced);
  }

  const namespace = {
    legacyStructure: legacyStructure,
    FINDING: FINDING,
    CANNOT_TELL: CANNOT_TELL,
    NGMODULE_DECLARED: NGMODULE_DECLARED,
    ALREADY_STANDALONE: ALREADY_STANDALONE,
    METADATA_UNREADABLE: METADATA_UNREADABLE,
    NO_SOURCED_EQUIVALENT: NO_SOURCED_EQUIVALENT,
  };

  if (globalThis.angularAiLegacyStructure) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiLegacyStructure, namespace);
  } else {
    globalThis.angularAiLegacyStructure = namespace;
  }
})();
