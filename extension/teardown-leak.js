// teardown-leak.js — the pure join behind M059's panel surface: why a destroyed component still
// changes state, answered from the console record the agent already keeps and the digest it already
// carries.
//
// T001 measured both records (`research/raw/m059-record-shapes.json`), and four of its facts fix what
// this module may say. It is built to them rather than around them:
//
//   - `extension/error-digest.json` carries 64 codes, `NG0205` among them, and the installed build
//     prints it as `NG0205: Injector has already been destroyed.` The digest states its title without
//     a full stop and the printed body carries one, so `message` here is the body the console
//     carried, and the digest is read for the code it carries and the title it states (C2).
//   - a joined console message carries `text`, with its level in `type` and no `message` field: the
//     console join returns the captured string byte for byte, and the capture writes `order`, `type`,
//     `code`, `text` and `location`. So the body is read from `text`, and a payload's `message` is
//     not a field of this record (C3).
//   - `NG0205` is thrown by `Injector.get` on a destroyed injector, so it arrives as a console
//     message and never as an inference from a write: this join states the diagnostic the record
//     carries, or names the absence of one, and reads no write to decide (C2, SC1).
//   - no record this repository holds carries a per-injector handle: the three names a handle record
//     would need occur 0 times across 38 extension modules, 136 suites and 146 `research/raw/`
//     records (T001's counts, measured before this module existed), and the console stream could not
//     carry one — it carries a code and a body, and the body names no owner. So this join names no
//     subscription, no effect, no timer and no handle, and states `handle-record-not-held` in every
//     answer (C1, SC4).
//
// The one field of a message that could attribute the diagnostic is `owner`, and the capture's
// `component` is not it: that field is the owner of the focused element or `app-root`, not of the
// component that wrote the message, and neither shipped join reads it. So `owner` stays null unless a
// field of the message carries it, and where it does not the answer states
// `owner-not-in-the-message` beside the code instead of rendering the element, the name in the
// stack, the last component mounted or whatever arrived last (N1, SC1).
//
// Input shapes, read as T001 recorded them:
//
//   console   the console record the agent already produces (N2), as `{ path, messages, releases }`:
//             `messages` is the joined messages, each `{ type, text, order?, owner? }` — `text` is the
//             string the console showed, stack frames included, and `order` is the position the
//             capture wrote. `releases` is the release records the same record states, each
//             `{ order }`: a release record states that a release ran at that position and never what
//             was released, because no record holds a handle (C1). `path` is where the record is
//             written, because every claim this module renders carries the artefact path that states
//             it and a pure join may not read a record's own bytes (SC5).
//   digest    the digest record, as `extension/error-digest.json` is written:
//             `{ path, entries: [{ code, title, … }] }`. It is read for the codes it carries and for
//             the `NG0205` entry's own title, and for nothing else.
//
// Anything else on `records` — a page, a DOM node, a clock, the last component mounted, a write this
// answer is asked to explain — is ignored, so a caller cannot smuggle a page value or a cause into
// the answer (C3, N2, N6). The same holds inside each message: it is read for `text`, `type`, `order`
// and `owner`, so its `component`, its `location`, its `timestamp` and any claimed `carriedCode`
// decide nothing here.
//
// The answer is one object with seven fields, every one present in every state:
//
//   { state, code, message, owner, absences, claims, detail }
//
//   state      finding     the console record carries a message whose own body carries `NG0205`
//                           (SC1).
//              absent      the console record states its messages and none of them carries the code:
//                           a named absence that states the code searched for and the count it read,
//                           and never a page reported free of the diagnostic (E2).
//              cannot-tell a record was passed and it does not state what was asked — no console
//                           record, no message list, no artefact path, no digest entries, or a digest
//                           that does not carry the code. The reason is named in `detail` and in the
//                           `cannot-tell` claim, and nothing is attributed.
//              empty       no record was passed at all.
//   code       the code the message's own body carries on `finding`; the code searched for, `NG0205`,
//              on `absent`; null on `cannot-tell` and `empty`.
//   message    the message body with the stack frames dropped, exactly as `extension/lint-core.js`
//              drops them, on `finding`; null in every other state.
//   owner      the message's own `owner` field where it carries one, and null everywhere else. Never
//              the stack, never `component`, never the last component seen and never arrival order
//              (N1).
//   absences   two states, each its own object with its own `detail`, and never folded into one line
//              (E5):
//                owner-not-in-the-message  holds where a message was read and no field of it names an
//                                          owner.
//                handle-record-not-held    holds in every answer, in every state: the console stream
//                                          carries a code and a body and no per-injector handle, so no
//                                          handle identity is named anywhere (SC4).
//   claims     one entry per rendered claim, each `{ claim, values, artefactPath }`: a claim carries
//              the artefact that states it, or it is not a claim this module produces (SC5). Every
//              claim cites the console record's own path or the digest record's own path; where the
//              console record names no path there is no artefact to cite, and no claim is rendered.
//   detail     this join's own sentence about what it read: the code and the body, the count read, the
//              sequence the record states and which absences hold. Never a record field and never a
//              record's prose.
//
// The sequence is read, not assumed: each release record's own `order` beside the diagnostic's own
// `order` renders `release-then-diagnostic` where every release precedes it,
// `release-after-diagnostic` where every release follows it, and `sequence-not-stated` where the
// record states no order or places releases on both sides. Where the release ran first and the
// diagnostic still arrived, the answer names the sequence and the code and names no handle as the
// cause: a release is not a leak, and a released handle is never rendered as one (SC3, E4).
//
// This module imports nothing at runtime, touches no filesystem, dispatches no message, performs no
// network call, holds no clock, starts no tap and reads no page global (SC2, N2). It is a pure join,
// so it cannot reach a page even if it wanted to: the capture belongs to the caller, and this module
// only says what the records it was handed support. A bare `node:vm` context with nothing in it is
// enough to run it, which the suite proves rather than assuming, and a second answer over the same
// record states the same code, the same message and the same absences (E9).
(function () {
  'use strict';

  // The four states the join can answer, as data a surface can enumerate rather than as string
  // comparisons scattered through a renderer (E2, E5).
  const FINDING = 'finding';
  const ABSENT = 'absent';
  const CANNOT_TELL = 'cannot-tell';
  const EMPTY = 'empty';

  const STATES = Object.freeze([FINDING, ABSENT, CANNOT_TELL, EMPTY]);

  // The two absences SC1 and SC4 require stated distinctly, in the order this module decides them.
  const OWNER_NOT_IN_THE_MESSAGE = 'owner-not-in-the-message';
  const HANDLE_RECORD_NOT_HELD = 'handle-record-not-held';

  const ABSENCES = Object.freeze([
    OWNER_NOT_IN_THE_MESSAGE,
    HANDLE_RECORD_NOT_HELD,
  ]);

  // The one code this join answers about (C2): the diagnostic a post-teardown write leaves behind.
  const CODE_SEARCHED = 'NG0205';

  // The claim names an answer renders, one per statement it makes (SC5).
  const CLAIM_CODE = 'code';
  const CLAIM_MESSAGE = 'message';
  const CLAIM_DIGEST = 'digest';
  const CLAIM_SEQUENCE = 'sequence';
  const CLAIM_COUNT = 'count';
  const CLAIM_ABSENCE = 'absence';
  const CLAIM_CANNOT_TELL = 'cannot-tell';

  const CLAIMS = Object.freeze([
    CLAIM_CODE,
    CLAIM_MESSAGE,
    CLAIM_DIGEST,
    CLAIM_SEQUENCE,
    CLAIM_COUNT,
    CLAIM_ABSENCE,
    CLAIM_CANNOT_TELL,
  ]);

  // The sequences the release records and the diagnostic's own order can state (SC3, E4).
  const RELEASE_THEN_DIAGNOSTIC = 'release-then-diagnostic';
  const RELEASE_AFTER_DIAGNOSTIC = 'release-after-diagnostic';
  const SEQUENCE_NOT_STATED = 'sequence-not-stated';

  const SEQUENCES = Object.freeze([
    RELEASE_THEN_DIAGNOSTIC,
    RELEASE_AFTER_DIAGNOSTIC,
    SEQUENCE_NOT_STATED,
  ]);

  // The reasons a `cannot-tell` is the answer: each names the half of the record that states nothing,
  // so a surface renders a reason rather than a diagnosis (E2's shape).
  const NO_CONSOLE_RECORD = 'console-record-not-supplied';
  const NO_CONSOLE_PATH = 'console-record-names-no-path';
  const NO_CONSOLE_MESSAGES = 'console-record-states-no-messages';
  const NO_DIGEST_RECORD = 'digest-record-not-supplied';
  const NO_DIGEST_PATH = 'digest-record-names-no-path';
  const NO_DIGEST_ENTRIES = 'digest-record-states-no-entries';
  const DIGEST_DOES_NOT_CARRY = 'digest-does-not-carry-the-code';

  const REASONS = Object.freeze([
    NO_CONSOLE_RECORD,
    NO_CONSOLE_PATH,
    NO_CONSOLE_MESSAGES,
    NO_DIGEST_RECORD,
    NO_DIGEST_PATH,
    NO_DIGEST_ENTRIES,
    DIGEST_DOES_NOT_CARRY,
  ]);

  // Angular prints a runtime code as `NG0` + the number, so a code is `NG` and four or five digits.
  // `extension/lint-core.js` carries the same pattern for the same reason.
  const NG_CODE = /NG\d{4,5}/;

  // A stack frame as V8 prints it: a newline, indentation, and `at `. Everything before it is the
  // message body, and the body is the only part of the text that counts as the message saying
  // anything (M032's rule, and the reason a component in the stack is never named).
  const STACK_FRAME = /\n\s+at\s/;

  // The fields an answer reads, named once so a surface can say which field it rendered from and so
  // the suite can hold this list to the message shapes T001 measured.
  const READS = Object.freeze({
    console: 'console',
    consolePath: 'console.path',
    consoleMessages: 'console.messages',
    consoleReleases: 'console.releases[].order',
    messageText: 'message.text',
    messageType: 'message.type',
    messageOrder: 'message.order',
    messageOwner: 'message.owner',
    digest: 'digest',
    digestPath: 'digest.path',
    digestEntries: 'digest.entries[].code',
    digestTitle: 'digest.entries[].title',
  });

  // The fields the records carry that this join never reads, declared here so a pin can hold the
  // module to reading none of them (C3, N1, N2). A record carrying one changes nothing this module
  // reports.
  const IGNORED = Object.freeze([
    'message.message',
    'message.component',
    'message.location',
    'message.timestamp',
    'message.carriedCode',
    'page',
    'clock',
    'lastMounted',
    'arrivalOrder',
    'write',
  ]);

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A position in the console record's own order, as the capture writes it.
  function isOrder(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  // A quoted value, for this join's own sentences: the value is quoted as the record spells it.
  function quote(value) {
    return '"' + String(value) + '"';
  }

  function countOf(count, one, many) {
    return count + ' ' + (count === 1 ? one : many);
  }

  // The text a joined console message carries, or null when it carries none. The joined message
  // carries `text`; a payload's `message` is not this record's field, so an entry holding one and no
  // `text` says nothing this module can answer for (C3).
  function textOf(message) {
    if (
      message &&
      typeof message === 'object' &&
      typeof message.text === 'string'
    ) {
      return message.text;
    }
    return null;
  }

  // The message body: everything before the first stack frame, trimmed. The stack is dropped rather
  // than kept, so no name that only a frame carries rides out on the answer (M032's rule, N1).
  function bodyOf(text) {
    const frame = text.search(STACK_FRAME);
    return (frame === -1 ? text : text.slice(0, frame)).trim();
  }

  // The code the message body's own text carries, or null. The entry's `code` field is not consulted:
  // the text is the evidence, and an entry claiming a code its text does not carry is not a
  // diagnostic of that code (`extension/lint-core.js`'s rule).
  function codeOf(body) {
    const found = body.match(NG_CODE);
    return found === null ? null : found[0];
  }

  // The level the message carries, in `type`, or null where it carries none. It is rendered as the
  // level the record states and decides nothing about whether the message is a diagnostic.
  function levelOf(message) {
    if (
      message &&
      typeof message === 'object' &&
      typeof message.type === 'string'
    ) {
      return message.type;
    }
    return null;
  }

  // The position the message carries, in `order`, or null where it states none. A position is read
  // for the sequence only; which message answers is the record's own order.
  function orderOf(message) {
    if (message && typeof message === 'object' && isOrder(message.order)) {
      return message.order;
    }
    return null;
  }

  // The one field of a message that would attribute the diagnostic: `owner`. The capture's
  // `component` is the owner of the focused element rather than of the component that wrote the
  // message, `location` names a source file and the stack names a frame, so none of the three is an
  // owner this record attributes and none is read here (N1, SC1).
  function ownerOf(message) {
    if (message && typeof message === 'object') {
      const owner = message.owner;
      if (typeof owner === 'string' && owner !== '') return owner;
    }
    return null;
  }

  // The release records the console record states: each its own `order`, and each stating that a
  // release ran at that position. What was released is never carried, because no record holds a
  // handle (C1).
  function releasesOf(record) {
    const stated = Array.isArray(record.releases) ? record.releases : [];
    const releases = [];
    for (let i = 0; i < stated.length; i += 1) {
      const release = stated[i];
      if (!isObject(release)) continue;
      if (!isOrder(release.order)) continue;
      releases.push({ order: release.order });
    }
    return releases;
  }

  // The console record: the messages it states, the release records it states, and the artefact path
  // that states them. A record that names no path cannot produce a claim, so it answers `cannot-tell`
  // rather than a claim with no artefact (SC5).
  function consoleRecordOf(records) {
    const record = isObject(records) ? records.console : null;
    if (!isObject(record)) {
      return {
        reason: NO_CONSOLE_RECORD,
        path: null,
        messages: null,
        releases: [],
      };
    }
    if (typeof record.path !== 'string' || record.path === '') {
      return {
        reason: NO_CONSOLE_PATH,
        path: null,
        messages: null,
        releases: [],
      };
    }
    if (!Array.isArray(record.messages)) {
      return {
        reason: NO_CONSOLE_MESSAGES,
        path: record.path,
        messages: null,
        releases: [],
      };
    }
    return {
      reason: null,
      path: record.path,
      messages: record.messages,
      releases: releasesOf(record),
    };
  }

  // The digest record: the codes it carries, the `NG0205` entry's own title, and the artefact path
  // that states them.
  function digestRecordOf(records) {
    const record = isObject(records) ? records.digest : null;
    if (!isObject(record)) {
      return { reason: NO_DIGEST_RECORD, path: null, entry: null, codes: [] };
    }
    if (typeof record.path !== 'string' || record.path === '') {
      return { reason: NO_DIGEST_PATH, path: null, entry: null, codes: [] };
    }
    const entries = Array.isArray(record.entries) ? record.entries : null;
    if (entries === null) {
      return {
        reason: NO_DIGEST_ENTRIES,
        path: record.path,
        entry: null,
        codes: [],
      };
    }
    const codes = [];
    let entry = null;
    for (let i = 0; i < entries.length; i += 1) {
      const candidate = entries[i];
      if (!isObject(candidate)) continue;
      const code = candidate.code;
      if (typeof code !== 'string' || code === '') continue;
      if (codes.indexOf(code) === -1) codes.push(code);
      if (code !== CODE_SEARCHED) continue;
      entry = {
        code: code,
        title: typeof candidate.title === 'string' ? candidate.title : null,
      };
    }
    if (entry === null) {
      return {
        reason: DIGEST_DOES_NOT_CARRY,
        path: record.path,
        entry: null,
        codes: codes,
      };
    }
    return { reason: null, path: record.path, entry: entry, codes: codes };
  }

  // The diagnostic the console record carries: the first message whose own body carries the code, in
  // the record's own order, with the body the stack was dropped from, the level it states and the
  // owner a field of it names. A message whose text carries no code is not a diagnostic, and the
  // console holds such messages.
  function diagnosticOf(messages) {
    for (let i = 0; i < messages.length; i += 1) {
      const message = messages[i];
      const text = textOf(message);
      if (text === null) continue;
      const body = bodyOf(text);
      const code = codeOf(body);
      if (code !== CODE_SEARCHED) continue;
      return {
        message: message,
        body: body,
        code: code,
        type: levelOf(message),
        order: orderOf(message),
        owner: ownerOf(message),
      };
    }
    return null;
  }

  // The sequence the record states: every release record's own `order` beside the diagnostic's own.
  function sequenceOf(releases, found) {
    const order = found.order;
    if (releases.length === 0 || order === null) {
      return {
        name: SEQUENCE_NOT_STATED,
        releases: releases.length,
        before: 0,
        after: 0,
        order: order,
      };
    }
    let before = 0;
    let after = 0;
    for (let i = 0; i < releases.length; i += 1) {
      if (releases[i].order < order) before += 1;
      if (releases[i].order > order) after += 1;
    }
    let name = SEQUENCE_NOT_STATED;
    if (before === releases.length) name = RELEASE_THEN_DIAGNOSTIC;
    if (after === releases.length) name = RELEASE_AFTER_DIAGNOSTIC;
    return {
      name: name,
      releases: releases.length,
      before: before,
      after: after,
      order: order,
    };
  }

  // The absence the message's own shape states: no field of it names an owner. The fields the
  // message carries are listed, so the absence is a statement about this message and not a manner of
  // speaking (SC1, N1).
  function ownerAbsenceOf(message) {
    const fields = isObject(message) ? Object.keys(message).sort() : [];
    return {
      state: OWNER_NOT_IN_THE_MESSAGE,
      messageFields: fields,
      ownerFieldsRead: [],
      detail:
        'the absence ' +
        OWNER_NOT_IN_THE_MESSAGE +
        ' holds: the message the console record states carries ' +
        countOf(fields.length, 'field', 'fields') +
        ' (' +
        fields.join(', ') +
        ') and the one field this join reads as an owner (`owner`) is not among them, so no owner is rendered — not from the stack, not from the last component mounted and not from the message’s arrival order',
    };
  }

  // The absence no record this repository holds can fill, stated in every answer whatever the state:
  // the console stream carries a code and a body and no per-injector handle (C1, SC4).
  function handleAbsenceOf() {
    return {
      state: HANDLE_RECORD_NOT_HELD,
      because:
        'the console stream carries a code and a body, and no record this join reads carries a per-injector handle',
      detail:
        'the absence ' +
        HANDLE_RECORD_NOT_HELD +
        ' holds: the console record carries a code and a body, and no record this join reads carries a per-injector handle, so no handle identity is named anywhere and none is inferred from the message body, the stack, the last component mounted or the message’s arrival order',
    };
  }

  // One claim: what it renders, and the artefact path that states it. A claim with no artefact path
  // is not a claim this module can build, because the path is an argument here (SC5).
  function claimOf(claim, values, artefactPath) {
    return { claim: claim, values: values, artefactPath: artefactPath };
  }

  // The sentence about the sequence the record states, for `detail`. Where a release ran before the
  // diagnostic, it is rendered as the sequence it is and never as a leak the release contradicts
  // (SC3, E4).
  function sequenceDetail(sequence) {
    if (sequence.name === RELEASE_THEN_DIAGNOSTIC) {
      return (
        'the sequence it read is ' +
        RELEASE_THEN_DIAGNOSTIC +
        ': ' +
        countOf(
          sequence.before,
          'release record is ordered',
          'release records are ordered',
        ) +
        ' before the diagnostic at order ' +
        sequence.order +
        ' and none after it, so the release ran first and no handle is named as the cause of the diagnostic'
      );
    }
    if (sequence.name === RELEASE_AFTER_DIAGNOSTIC) {
      return (
        'the sequence it read is ' +
        RELEASE_AFTER_DIAGNOSTIC +
        ': ' +
        countOf(
          sequence.after,
          'release record is ordered',
          'release records are ordered',
        ) +
        ' after the diagnostic at order ' +
        sequence.order +
        ' and none before it, so the release ran after the diagnostic and is not its cause'
      );
    }
    if (sequence.releases === 0) {
      return (
        'the sequence is ' +
        SEQUENCE_NOT_STATED +
        ': the record states no release record, so nothing is ordered against the diagnostic at order ' +
        String(sequence.order) +
        ' and no release is named as its cause'
      );
    }
    return (
      'the sequence is ' +
      SEQUENCE_NOT_STATED +
      ': the record states ' +
      countOf(sequence.releases, 'release record', 'release records') +
      ' and no order places every one of them on one side of the diagnostic, so no order is rendered as the one the record states and no release is named as its cause'
    );
  }

  // The sentence the absences are stated in, once, so no state can fold them into one line (E5).
  function absencesSentence(absences) {
    const states = [];
    for (let i = 0; i < absences.length; i += 1) states.push(absences[i].state);
    return (
      'the absences it renders are ' +
      countOf(states.length, 'state', 'states') +
      ' and never one line: ' +
      states.join(' beside ')
    );
  }

  // The detail a `finding` states: the record, the message's own order, the body the stack was
  // dropped from, the digest's own entry, the sequence and the absences (SC1, SC3, SC5).
  function findingDetail(
    consoleRecord,
    digestRecord,
    found,
    sequence,
    absences,
  ) {
    let detail =
      'the console record ' +
      consoleRecord.path +
      ' states ' +
      countOf(
        consoleRecord.messages.length,
        'console message',
        'console messages',
      ) +
      ' and the first of them whose own body carries ' +
      CODE_SEARCHED +
      ' is at order ' +
      (found.order === null ? 'no stated order' : String(found.order)) +
      ', with the body ' +
      quote(found.body) +
      ' and the level ' +
      quote(found.type === null ? '' : found.type) +
      ' in `type`, and the stack frames dropped from it';
    detail +=
      '; the digest record ' +
      digestRecord.path +
      ' carries ' +
      CODE_SEARCHED +
      (digestRecord.entry.title === null
        ? ''
        : ' ' + quote(digestRecord.entry.title)) +
      ' among ' +
      countOf(digestRecord.codes.length, 'code', 'codes');
    detail +=
      found.owner === null
        ? '; no field of the message names an owner, so ' +
          OWNER_NOT_IN_THE_MESSAGE +
          ' stands beside the code'
        : '; the message’s own `owner` field states the owner ' +
          quote(found.owner) +
          ', so that is the one owner rendered and nothing else is substituted for it';
    detail += '; ' + sequenceDetail(sequence);
    detail += '; ' + absencesSentence(absences);
    return detail;
  }

  // The detail an `absent` states: the code searched for and the count read, and no diagnosis (E2).
  function absentDetail(consoleRecord, digestRecord, messagesRead) {
    return (
      'the console record ' +
      consoleRecord.path +
      ' states ' +
      countOf(messagesRead, 'console message', 'console messages') +
      ' and none of them carries ' +
      CODE_SEARCHED +
      '; the digest record ' +
      digestRecord.path +
      ' carries that code, so the code searched for is ' +
      CODE_SEARCHED +
      ' and the count read is ' +
      messagesRead +
      ': the record states no diagnostic, this answer names that absence rather than a finding, and the sequence is ' +
      SEQUENCE_NOT_STATED +
      ' because there is no diagnostic to order a release against'
    );
  }

  // The sentence each `cannot-tell` reason is stated in, so no reason renders as a diagnosis.
  function reasonSentence(reason) {
    if (reason === NO_CONSOLE_RECORD) {
      return 'no console record was supplied, so no message states a diagnostic';
    }
    if (reason === NO_CONSOLE_PATH) {
      return 'the console record names no path, so no claim could carry the artefact that states it';
    }
    if (reason === NO_CONSOLE_MESSAGES) {
      return 'the console record states no message list, so there is no console record to read';
    }
    if (reason === NO_DIGEST_RECORD) {
      return 'no digest record was supplied, so nothing states that the code is one this tool speaks about';
    }
    if (reason === NO_DIGEST_PATH) {
      return 'the digest record names no path, so no claim could carry the artefact that states it';
    }
    if (reason === NO_DIGEST_ENTRIES) {
      return 'the digest record states no entry list, so nothing states which codes it carries';
    }
    return (
      'the digest record ' +
      'does not carry ' +
      CODE_SEARCHED +
      ', so nothing here can state what the code the console would carry means'
    );
  }

  // The detail a `cannot-tell` states: which half of the record states nothing, the code searched
  // for, and that nothing was attributed.
  function cannotTellDetail(consoleRecord, reason) {
    let detail = 'the answer is ' + CANNOT_TELL + ': ' + reasonSentence(reason);
    if (consoleRecord.path !== null) {
      detail += ' (the console record ' + consoleRecord.path + ')';
    }
    detail +=
      '; the code searched for is ' +
      CODE_SEARCHED +
      ', and no code, no message, no owner and no sequence is rendered';
    return detail;
  }

  // The detail an `empty` states: no record was passed, and nothing was read.
  function emptyDetail() {
    return (
      'no record was passed, so nothing is read: the question is why a destroyed component still changes state, the code searched for is ' +
      CODE_SEARCHED +
      ', and no console message, no release record and no digest entry was supplied'
    );
  }

  // One answer, with every field present in every state, so a renderer reads seven fields and not
  // six sometimes (SC5).
  function answerOf(state, code, message, owner, absences, claims, detail) {
    return {
      state: state,
      code: code,
      message: message,
      owner: owner,
      absences: absences,
      claims: claims,
      detail: detail,
    };
  }

  // The claims a `finding` renders, in the order it renders them: the code, the message and its
  // level, the digest's own entry, the sequence where the record states one, and one claim per
  // absence. Every claim cites the record that states it (SC5).
  function findingClaims(
    consoleRecord,
    digestRecord,
    found,
    sequence,
    absences,
  ) {
    const claims = [];
    claims.push(claimOf(CLAIM_CODE, { code: found.code }, consoleRecord.path));
    claims.push(
      claimOf(
        CLAIM_MESSAGE,
        { message: found.body, type: found.type },
        consoleRecord.path,
      ),
    );
    claims.push(
      claimOf(
        CLAIM_DIGEST,
        { code: digestRecord.entry.code, title: digestRecord.entry.title },
        digestRecord.path,
      ),
    );
    if (sequence.name !== SEQUENCE_NOT_STATED) {
      claims.push(
        claimOf(
          CLAIM_SEQUENCE,
          {
            sequence: sequence.name,
            releases: sequence.releases,
            order: sequence.order,
          },
          consoleRecord.path,
        ),
      );
    }
    for (let i = 0; i < absences.length; i += 1) {
      claims.push(
        claimOf(
          CLAIM_ABSENCE,
          { state: absences[i].state },
          consoleRecord.path,
        ),
      );
    }
    return claims;
  }

  // The claims an `absent` renders: the count it read beside the code it searched for, and the one
  // absence that holds without a message (E2, SC4).
  function absentClaims(consoleRecord, messagesRead, absences) {
    const claims = [];
    claims.push(
      claimOf(
        CLAIM_COUNT,
        { codeSearched: CODE_SEARCHED, messagesRead: messagesRead },
        consoleRecord.path,
      ),
    );
    for (let i = 0; i < absences.length; i += 1) {
      claims.push(
        claimOf(
          CLAIM_ABSENCE,
          { state: absences[i].state },
          consoleRecord.path,
        ),
      );
    }
    return claims;
  }

  // The answer a record that states nothing of what was asked produces: the reason, the absences,
  // and no claim where the console record names no artefact to cite.
  function cannotTellOf(consoleRecord, reason) {
    const absences = [handleAbsenceOf()];
    const claims = [];
    if (consoleRecord.path !== null) {
      claims.push(
        claimOf(
          CLAIM_CANNOT_TELL,
          { codeSearched: CODE_SEARCHED, reason: reason },
          consoleRecord.path,
        ),
      );
      claims.push(
        claimOf(
          CLAIM_ABSENCE,
          { state: HANDLE_RECORD_NOT_HELD },
          consoleRecord.path,
        ),
      );
    }
    return answerOf(
      CANNOT_TELL,
      null,
      null,
      null,
      absences,
      claims,
      cannotTellDetail(consoleRecord, reason),
    );
  }

  // The answer a console record that carries no diagnostic produces: the code searched for, the
  // count read, and the one absence that holds without a message (E2, SC4).
  function absentOf(consoleRecord, digestRecord) {
    const messagesRead = consoleRecord.messages.length;
    const absences = [handleAbsenceOf()];
    return answerOf(
      ABSENT,
      CODE_SEARCHED,
      null,
      null,
      absences,
      absentClaims(consoleRecord, messagesRead, absences),
      absentDetail(consoleRecord, digestRecord, messagesRead),
    );
  }

  // The join. `records` is the two records and nothing else — the console record the agent already
  // produces and the digest record it already carries — so a caller cannot smuggle a page value, a
  // clock or a cause into the answer through this function. Anything else on `records` is ignored.
  function teardownLeak(records) {
    const read = isObject(records) ? records : {};

    // 1. No record at all: the one request this join can state nothing about (E2's boundary).
    if (!isObject(read.console) && !isObject(read.digest)) {
      return answerOf(
        EMPTY,
        null,
        null,
        null,
        [handleAbsenceOf()],
        [],
        emptyDetail(),
      );
    }

    // 2. The console record: its messages, its release records and its own path.
    const consoleRecord = consoleRecordOf(read);
    if (consoleRecord.reason !== null) {
      return cannotTellOf(consoleRecord, consoleRecord.reason);
    }

    // 3. The digest record: the codes it carries, `NG0205` among them, and that entry's own title.
    const digestRecord = digestRecordOf(read);
    if (digestRecord.reason !== null) {
      return cannotTellOf(consoleRecord, digestRecord.reason);
    }

    // 4. The diagnostic the record carries, read from each message's own body and never from a write
    // or from anything the record does not state (C2, SC1).
    const found = diagnosticOf(consoleRecord.messages);
    if (found === null) return absentOf(consoleRecord, digestRecord);

    // 5. The finding: the code and the body the record states, the owner only where a field of the
    // message carries it, the sequence the release records and the diagnostic's own order state, and
    // the two absences as two states (SC1, SC3, SC4, SC5).
    const sequence = sequenceOf(consoleRecord.releases, found);
    const absences = [];
    if (found.owner === null) absences.push(ownerAbsenceOf(found.message));
    absences.push(handleAbsenceOf());
    return answerOf(
      FINDING,
      found.code,
      found.body,
      found.owner,
      absences,
      findingClaims(consoleRecord, digestRecord, found, sequence, absences),
      findingDetail(consoleRecord, digestRecord, found, sequence, absences),
    );
  }

  const namespace = {
    teardownLeak: teardownLeak,
    STATES: STATES,
    ABSENCES: ABSENCES,
    CLAIMS: CLAIMS,
    SEQUENCES: SEQUENCES,
    REASONS: REASONS,
    READS: READS,
    IGNORED: IGNORED,
    CODE_SEARCHED: CODE_SEARCHED,
  };

  if (globalThis.angularAiTeardownLeak) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiTeardownLeak, namespace);
  } else {
    globalThis.angularAiTeardownLeak = namespace;
  }
})();
