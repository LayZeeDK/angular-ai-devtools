// sanitizer-triage.js — the join behind PBR-1: one strip warning, and the component(s) the profiler
// record that covers it names.
//
// The sanitizer's only signal is a dev-mode `console.warn` that says a strip happened and says nothing
// else: not the tag, not the attribute, not the binding, not the element
// (`.project/research/m029-sanitizer-evidence.md`). T001 then measured, in one page load of the
// two-binding fixture, what the two lists actually hold and in what order
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
// This module is a reader of the two lists it is given and of nothing else (N1): it has no DOM (no
// `document`, `window`, `getComputedStyle`), it imports nothing, it installs no `console` tap, no
// sanitizer patch and no page global beyond the one namespace below. The warning supplies the
// occurrence and its time; the profiler record supplies the component. A bare `node:vm` context with
// nothing in it is enough to run it, which is what the suite proves.
//
// Input shapes, read as they are recorded:
//
//   warnings  the strip warnings, on the page clock (`performance.now`), which is the clock the
//             profiler records use: `[{ t }, …]`. An entry with no finite `t` cannot be placed in any
//             window, so it is `cannot-tell` rather than matched on another list's order.
//   records   the page agent's records: `[{ cycleId, startedAt, t, checks: [{ componentName,
//             events, binding? }, …] }, …]`. `startedAt` and `t` are the cycle's start and the moment
//             the record was dispatched; `events` are the profiler's enum numbers.
//
// The answer is one of exactly three states for the load, with one finding per warning:
//
//   stripped     at least one warning fell inside the template-update window of a record: the finding
//                names the component(s) that record's template-update checks name, the cycle ids, and
//                the warning's own time. It names a binding only when the record carries one
//                unambiguous one for the element it wrote (N2) — the measured record carries none, so
//                the measured finding names none.
//   cannot-tell  no profiler record covers the warning, so the module names that absence and nothing
//                else: no component, no binding, no cause. A warning with no page-clock time is
//                reached the same way, because no window can cover a time that was never recorded.
//   none         no warning was supplied at all. This is **not** a clean result (N3): a dev-mode
//                warning that did not appear is not evidence that nothing was stripped, and a
//                production build strips silently, so the absence is reported as an absence.
//
// No output string names a tag, an attribute, a removed substring or a cause: the module never copies
// the warning's text, and it repeats nothing the sanitizer did not say (which is nothing).
//
// The shapes, exactly — `state` is the load's answer, each finding is one warning's own:
//
//   { state: "stripped",    findings: [{ state: "stripped",    at, components, cycleIds [, binding] }, …] }
//   { state: "cannot-tell", findings: [{ state: "cannot-tell", at, reason }, …] }
//   { state: "none",        findings: [] }
//
// So a load whose first render could not be placed and whose later write could reports both: one
// finding `cannot-tell`, one `stripped`, and the load `stripped` because something was placed. One
// warning's answer never stands in for another's. `covers(record, t)` is the window predicate the join
// uses, exported so a caller can ask the same question of a record it holds.
(function () {
  "use strict";

  // Mirrors the two values in agent-main.js's ProfilerEvent literal that mark a template update:
  // TemplateUpdateStart 2, TemplateUpdateEnd 3. The extension's content scripts share one world but
  // not one module system, so the numbers are repeated here rather than imported; the measured
  // recording carries exactly these two numbers in its covering cycle.
  const TEMPLATE_UPDATE_START = 2;
  const TEMPLATE_UPDATE_END = 3;

  const STRIPPED = "stripped";
  const CANNOT_TELL = "cannot-tell";
  const NONE = "none";

  // The name of the absence, so a caller compares a constant instead of prose (E3).
  const NO_COVERING_RECORD = "no-covering-profiler-record";

  // The warning's own position on the page clock, or null when the entry carries none. A time from
  // another clock (the browser's epoch milliseconds, a list index) is not a page-clock time and would
  // place the warning in a window it was never in.
  function clockOf(warning) {
    if (
      warning &&
      typeof warning === "object" &&
      typeof warning.t === "number" &&
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
    if (!record || typeof record !== "object") return null;
    const start = record.startedAt;
    const end = record.t;
    if (typeof start !== "number" || !Number.isFinite(start)) return null;
    if (typeof end !== "number" || !Number.isFinite(end)) return null;
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
      if (typeof name === "string" && name !== "" && names.indexOf(name) === -1) names.push(name);
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
        if (typeof named !== "string" || named === "") continue;
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
        if (finding.components.indexOf(names[n]) === -1) finding.components.push(names[n]);
      }
      const cycleId = covering[i].record.cycleId;
      if (typeof cycleId === "number" && finding.cycleIds.indexOf(cycleId) === -1) {
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
    return { state: CANNOT_TELL, at: at === undefined ? null : at, reason: NO_COVERING_RECORD };
  }

  // The no-warning result. There is no clean state (N3): the absence of a dev-mode warning is the
  // absence of a capture, not a proof that nothing was stripped, and a production build strips
  // silently whatever this module reports.
  function absence() {
    return { state: NONE, findings: [] };
  }

  // The load's answer: stripped when anything was placed, cannot-tell when warnings were supplied and
  // none of them was, and nothing else — `none` is only reachable with no warning at all.
  function stateOf(findings) {
    for (let i = 0; i < findings.length; i += 1) {
      if (findings[i].state === STRIPPED) return STRIPPED;
    }
    return CANNOT_TELL;
  }

  // The join. Each warning is placed on its own: the record whose window covers its time and whose
  // checks carried the template update is the one it is joined to, and one warning's answer never
  // stands in for another's.
  function join(warnings, records) {
    const warningList = Array.isArray(warnings) ? warnings : [];
    const list = Array.isArray(records) ? records : [];
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

    if (findings.length === 0) return absence();

    return { state: stateOf(findings), findings: findings };
  }

  const namespace = {
    join,
    covers,
    NO_COVERING_RECORD,
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
