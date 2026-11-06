// sanitizer-triage.js — the join behind PBR-1: one strip warning, and the component(s) the profiler
// record that covers it names.
//
// The sanitizer's only signal is a dev-mode `console.warn` that says a strip happened and says nothing
// else: not the tag, not the attribute, not the binding, not the element
// (`.project/research/m029-sanitizer-evidence.md`). T001 then measured, in one page load of the fixture
// as it stood with two bindings, what the two lists actually hold and in what order
// (`research/raw/m029-sanitizer-warning.json`):
//
//   - the first render's strip warns at page-clock 1401 ms and the page agent's profiler subscription
//     lands at 1426.7 ms, so **that warning has no profiler record at all**;
//   - a later write does share a cycle with a record, but the record lists two components
//     (`app-root`, `app-trust-bypass-page`) with events [2,3] and carries no binding name, no element
//     and empty `changedNodeIds`.
//
// So the join is built to that measurement and not around it. A component-level occurrence is the
// strongest thing these two lists support, and `cannot-tell` is the **expected** answer for a
// first-render strip, not a fallback. A binding is named only when the element's own record carries
// one; nothing here guesses the nearest component across a window boundary, because a component that
// merely ran nearby is not the component that wrote the element.
//
// This module is a reader of the lists it is given and of nothing else (N1): it has no DOM (no
// `document`, `window`, `getComputedStyle`), it imports nothing, it installs no `console` tap, no
// sanitizer patch and no page global beyond the one namespace below. The warning supplies the
// occurrence and its time; the profiler record supplies the component; the page supplies the bindings
// it declares. A bare `node:vm` context with nothing in it is enough to run it, which is what the
// suites prove.
//
// Input shapes, read as they are recorded:
//
//   warnings  the strip warnings, on the page clock (`performance.now`), which is the clock the
//             profiler records use: `[{ t }, …]`. An entry with no finite `t` cannot be placed in any
//             window, so it is `cannot-tell` rather than matched on another list's order.
//   records   the page agent's records: `[{ cycleId, startedAt, t, checks: [{ componentName,
//             events, binding? }, …] }, …]`. `startedAt` and `t` are the cycle's start and the moment
//             the record was dispatched; `events` are the profiler's enum numbers.
//   bindings  the bindings the page declares, read off the page: `[{ id, bypass?, writes: [{ version,
//             value, rendered }, …] }, …]`. `bypass` is the `bypassSecurityTrust*` method the binding
//             passes its value through, absent or null when the binding is sanitized; `value` is the
//             value the binding wrote and `rendered` the markup that reached the element. This is the
//             page's own declaration, not the module's inference: nothing in `warnings` or `records`
//             can name a bypass, because a binding that bypasses the sanitizer never calls it and so
//             never writes a message (T004).
//
// The answer is one of exactly four states for the load, with one finding per warning and one per
// binding whose bypass was measured against a warning beside it:
//
//   stripped     at least one warning fell inside the template-update window of a record: the finding
//                names the component(s) that record's template-update checks name, the cycle ids, and
//                the warning's own time. It names a binding only when the record carries one
//                unambiguous one for the element it wrote (N2) — the measured record carries none, so
//                the measured finding names none.
//   deliberate   a binding declared a `bypassSecurityTrust*` bypass, its write kept its value whole,
//                and **another** binding's write of the same value lost content while at least one
//                warning was captured in the same load. That contrast is the whole of the evidence:
//                a `SafeValue` short-circuits `ɵɵsanitizeHtml`, so a bypassed binding cannot write a
//                warning at all, and an absent warning on its own would be the same absence a
//                production build, a page that stripped nothing and a capture that missed the write
//                all leave behind. The finding names the bypass method, the binding and write whose
//                value it shares, and the number of warnings in the load; it names no component, no
//                cycle and no time, because no message was observed for it and no record carries it.
//                `deliberate` is unreachable without a warning in the load (N3, T004).
//   cannot-tell  no profiler record covers the warning, so the module names that absence and nothing
//                else: no component, no binding, no cause. A warning with no page-clock time is
//                reached the same way, because no window can cover a time that was never recorded.
//   none         no warning was supplied at all, whatever the bindings declare. This is **not** a
//                clean result (N3): a dev-mode warning that did not appear is not evidence that
//                nothing was stripped, and a production build strips silently, so the absence is
//                reported as an absence — and never as `deliberate` either, because an absence with no
//                presence beside it measures nothing.
//
// A load that holds both a placed strip and a measured bypass reports the ladder's strongest positive
// answer, `stripped`, and still carries the bypass's own finding: what was placed outranks what was
// measured, and what was measured outranks the absence answer, exactly as a placed warning already
// outranks `cannot-tell`. No finding ever stands in for another's.
//
// No output string names a tag, an attribute, a removed substring or a cause: the module never copies
// the warning's text or the binding's markup, and it repeats nothing the sanitizer did not say (which
// is nothing).
//
// The shapes, exactly — `state` is the load's answer, each finding is one answer's own:
//
//   { state: "stripped",    findings: [{ state: "stripped",    at, components, cycleIds [, binding] }, …] }
//   { state: "deliberate",  findings: [{ state: "deliberate",  binding, contrast: { binding,
//                                       writeVersion, bypassWriteVersion, warnings } }, …] }
//   { state: "cannot-tell", findings: [{ state: "cannot-tell", at, reason }, …] }
//   { state: "none",        findings: [] }
//
// So a load whose first render could not be placed and whose later write could reports both: one
// finding `cannot-tell`, one `stripped`, and the load `stripped` because something was placed. One
// warning's answer never stands in for another's. `covers(record, t)` is the window predicate the join
// uses, exported so a caller can ask the same question of a record it holds.
(function () {
  'use strict';

  // Mirrors the two values in agent-main.js's ProfilerEvent literal that mark a template update:
  // TemplateUpdateStart 2, TemplateUpdateEnd 3. The extension's content scripts share one world but
  // not one module system, so the numbers are repeated here rather than imported; the measured
  // recording carries exactly these two numbers in its covering cycle.
  const TEMPLATE_UPDATE_START = 2;
  const TEMPLATE_UPDATE_END = 3;

  const STRIPPED = 'stripped';
  const CANNOT_TELL = 'cannot-tell';
  const DELIBERATE = 'deliberate';
  const NONE = 'none';

  // The name of the absence, so a caller compares a constant instead of prose (E3).
  const NO_COVERING_RECORD = 'no-covering-profiler-record';

  // The one family of sanitizer calls that writes a value the sanitizer never sees: every
  // `DomSanitizer` method is `bypassSecurityTrust<Html|Style|Script|Url|ResourceUrl>`, and a binding may
  // only be reported `deliberate` when it declares one of them. A binding that bypasses nothing is not
  // a bypass, however convenient the label would be (N2).
  const VETTED_BYPASS_PREFIX = 'bypassSecurityTrust';
  const VETTED_BYPASS = /^bypassSecurityTrust[A-Za-z]+$/;

  // The warning's own position on the page clock, or null when the entry carries none. A time from
  // another clock (the browser's epoch milliseconds, a list index) is not a page-clock time and would
  // place the warning in a window it was never in.
  function clockOf(warning) {
    if (
      warning &&
      typeof warning === 'object' &&
      typeof warning.t === 'number' &&
      Number.isFinite(warning.t)
    ) {
      return warning.t;
    }
    return null;
  }

  // The window a record covers: from the cycle's start to the moment the record was dispatched, both
  // ends included as T001's shared-position definition states them. A record missing either end has
  // no window and covers nothing.
  function windowOf(record) {
    if (!record || typeof record !== 'object') return null;
    const start = record.startedAt;
    const end = record.t;
    if (typeof start !== 'number' || !Number.isFinite(start)) return null;
    if (typeof end !== 'number' || !Number.isFinite(end)) return null;
    return { start: start, end: end };
  }

  // The checks in a record whose own event list carries both halves of the template-update pair. A
  // check carrying neither is not evidence that a template wrote anything: cycle 1 of the recording
  // carries `[]`, and it covers no warning even inside its own window.
  function templateUpdateChecks(record) {
    const checks = record && Array.isArray(record.checks) ? record.checks : [];
    const found = [];
    for (let i = 0; i < checks.length; i += 1) {
      const check = checks[i];
      const events = check && Array.isArray(check.events) ? check.events : [];
      let started = false;
      let ended = false;
      for (let e = 0; e < events.length; e += 1) {
        if (events[e] === TEMPLATE_UPDATE_START) started = true;
        if (events[e] === TEMPLATE_UPDATE_END) ended = true;
      }
      if (started && ended) found.push(check);
    }
    return found;
  }

  // The components those checks name, in the record's own order and without repeats. The record names
  // components and nothing else, so this is the whole of what it can attribute — with two components
  // in the covering cycle, both are named rather than one of them chosen.
  function componentNames(checks) {
    const names = [];
    for (let i = 0; i < checks.length; i += 1) {
      const name = checks[i].componentName;
      if (typeof name === 'string' && name !== '' && names.indexOf(name) === -1)
        names.push(name);
    }
    return names;
  }

  // The binding the covering record carries for the element it wrote — and only when it carries one
  // unambiguous one. A record that names two different bindings has not said which one wrote the
  // element, so naming either would be the guess N2 forbids.
  function bindingOf(covering) {
    let binding = null;
    for (let i = 0; i < covering.length; i += 1) {
      const checks = covering[i].checks;
      for (let c = 0; c < checks.length; c += 1) {
        const named = checks[c].binding;
        if (typeof named !== 'string' || named === '') continue;
        if (binding === null) {
          binding = named;
          continue;
        }
        if (binding !== named) return null;
      }
    }
    return binding;
  }

  // The records whose template-update window contains `t`, in the recorded order, each with the checks
  // that make it eligible. A window that merely sits next to `t` is not returned: that is precisely
  // the nearest-component guess the module refuses.
  function coveringFor(t, records) {
    const covering = [];
    for (let i = 0; i < records.length; i += 1) {
      const window = windowOf(records[i]);
      if (window === null) continue;
      if (t < window.start || t > window.end) continue;
      const checks = templateUpdateChecks(records[i]);
      if (checks.length === 0) continue;
      covering.push({ record: records[i], checks: checks });
    }
    return covering;
  }

  // Whether a record covers a page-clock time: inside its window, and carrying a template update.
  function covers(record, t) {
    return coveringFor(t, [record]).length > 0;
  }

  // The stripped finding: the component(s) the record names, its cycle id(s), and the warning's own
  // time. Written in one place so a pin on its shape is a pin on every stripped finding (E1).
  function strippedFinding(at, covering) {
    /** @type {{ state: string, at: number|null, components: string[], cycleIds: number[], binding?: string }} */
    const finding = { state: STRIPPED, at: at, components: [], cycleIds: [] };

    for (let i = 0; i < covering.length; i += 1) {
      const names = componentNames(covering[i].checks);
      for (let n = 0; n < names.length; n += 1) {
        if (finding.components.indexOf(names[n]) === -1)
          finding.components.push(names[n]);
      }
      const cycleId = covering[i].record.cycleId;
      if (
        typeof cycleId === 'number' &&
        finding.cycleIds.indexOf(cycleId) === -1
      ) {
        finding.cycleIds.push(cycleId);
      }
    }

    // The element's own record carries the binding, or the finding carries none.
    const binding = bindingOf(covering);
    if (binding !== null) finding.binding = binding;

    return finding;
  }

  // The absent-record finding, written once so every way of reaching it says the same thing and
  // nothing that reads as a component, a binding or a cause (E3, N2). The warning's own time is
  // carried through: it is the one thing that was observed, and it names nobody.
  function cannotTell(at) {
    return {
      state: CANNOT_TELL,
      at: at === undefined ? null : at,
      reason: NO_COVERING_RECORD,
    };
  }

  // The `bypassSecurityTrust*` method a binding declares, or null when it declares none. A binding that
  // bypasses nothing — the sanitized ones, and a label that merely looks like one — is not a bypass.
  function bypassOf(binding) {
    if (!binding || typeof binding !== 'object') return null;
    const named = binding.bypass;
    if (typeof named !== 'string') return null;
    return VETTED_BYPASS.test(named) ? named : null;
  }

  // The binding's writes, as recorded: `[{ version, value, rendered }, …]`.
  function writesOf(binding) {
    return binding && Array.isArray(binding.writes) ? binding.writes : [];
  }

  // A write whose markup reached the element unchanged and whole: the sanitizer removed nothing from
  // it. A write with no value, or with no rendered markup to compare against, is no evidence at all.
  function wholeWriteOf(binding) {
    const writes = writesOf(binding);
    for (let i = 0; i < writes.length; i += 1) {
      const write = writes[i];
      if (!write || typeof write !== 'object') continue;
      if (typeof write.value !== 'string' || write.value === '') continue;
      if (typeof write.rendered !== 'string') continue;
      if (write.rendered !== write.value) continue;
      return { version: write.version, value: write.value };
    }
    return null;
  }

  // Another binding's write of exactly this value that lost content: the presence the bypass's absence
  // is measured against. Only a binding that declares no bypass can be it — a `SafeValue` short-circuits
  // the sanitizer, so a bypassing write cannot be the one that stripped, and the first such write in the
  // caller's order is the one named.
  function losingCounterpartOf(value, bindings, self) {
    for (let i = 0; i < bindings.length; i += 1) {
      const binding = bindings[i];
      if (!binding || typeof binding !== 'object') continue;
      if (binding === self) continue;
      if (binding.id === self.id) continue;
      if (bypassOf(binding) !== null) continue;
      const writes = writesOf(binding);
      for (let w = 0; w < writes.length; w += 1) {
        const write = writes[w];
        if (!write || typeof write !== 'object') continue;
        if (write.value !== value) continue;
        if (typeof write.rendered !== 'string') continue;
        if (write.rendered === value) continue;
        return { id: binding.id, version: write.version };
      }
    }
    return null;
  }

  // The deliberate finding, written once so a pin on its shape is a pin on every deliberate finding
  // (E1). It states the bypass method the binding declares, the binding and write whose value it kept
  // whole beside the one that lost content, and how many warnings the load held. It names no component,
  // no cycle and no time: nothing was observed for this binding, and nothing copies the markup.
  function deliberateFinding(bypass, whole, counterpart, warnings) {
    return {
      state: DELIBERATE,
      binding: bypass,
      contrast: {
        binding: counterpart.id,
        writeVersion: counterpart.version,
        bypassWriteVersion: whole.version,
        warnings: warnings,
      },
    };
  }

  // The deliberate findings: one per binding that declares a vetted bypass, kept its value whole, and
  // sits beside another binding's write of the same value that lost content in a load that warned at
  // least once. With no warning supplied there is no presence to measure the absence against, so the
  // answer is `none` and not this — an absence beside an absence measures nothing (N3).
  function deliberateFindings(warnings, bindings) {
    const findings = [];
    if (warnings === 0) return findings;
    for (let i = 0; i < bindings.length; i += 1) {
      const binding = bindings[i];
      const bypass = bypassOf(binding);
      if (bypass === null) continue;
      const whole = wholeWriteOf(binding);
      if (whole === null) continue;
      const counterpart = losingCounterpartOf(whole.value, bindings, binding);
      if (counterpart === null) continue;
      findings.push(deliberateFinding(bypass, whole, counterpart, warnings));
    }
    return findings;
  }

  // The no-warning result. There is no clean state (N3): the absence of a dev-mode warning is the
  // absence of a capture, not a proof that nothing was stripped, and a production build strips
  // silently whatever this module reports. It is not `deliberate` either: a bypass in a load that
  // never warned is the same absence a page with nothing to strip leaves behind.
  function absence() {
    return { state: NONE, findings: [] };
  }

  // The load's answer, by the ladder the findings are ordered on: a placed strip outranks a measured
  // bypass, and a measured bypass outranks the absence answer — the same rule that already puts a
  // placed warning above `cannot-tell`. `none` is not on the ladder: it is only reachable with no
  // warning at all, before any finding exists.
  function stateOf(findings) {
    let state = CANNOT_TELL;
    for (let i = 0; i < findings.length; i += 1) {
      if (findings[i].state === STRIPPED) return STRIPPED;
      if (findings[i].state === DELIBERATE) state = DELIBERATE;
    }
    return state;
  }

  // The join. Each warning is placed on its own: the record whose window covers its time and whose
  // checks carried the template update is the one it is joined to, and one warning's answer never
  // stands in for another's. Each declared bypass is measured on its own, against the warnings and the
  // competing write of the same value in the same lists.
  function join(warnings, records, bindings) {
    const warningList = Array.isArray(warnings) ? warnings : [];
    if (warningList.length === 0) return absence();

    const list = Array.isArray(records) ? records : [];
    const declared = Array.isArray(bindings) ? bindings : [];
    const findings = [];

    for (let i = 0; i < warningList.length; i += 1) {
      const at = clockOf(warningList[i]);
      const covering = at === null ? [] : coveringFor(at, list);
      if (covering.length === 0) {
        findings.push(cannotTell(at));
        continue;
      }
      findings.push(strippedFinding(at, covering));
    }

    const deliberate = deliberateFindings(warningList.length, declared);
    for (let i = 0; i < deliberate.length; i += 1) findings.push(deliberate[i]);

    return { state: stateOf(findings), findings: findings };
  }

  const namespace = {
    join,
    covers,
    NO_COVERING_RECORD,
    VETTED_BYPASS_PREFIX,
    TEMPLATE_UPDATE_START,
    TEMPLATE_UPDATE_END,
  };

  if (globalThis.angularAiSanitizerTriage) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiSanitizerTriage, namespace);
  } else {
    globalThis.angularAiSanitizerTriage = namespace;
  }
})();
