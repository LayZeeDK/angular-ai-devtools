// router-diagnostic.js — the join behind M033: a captured router diagnostic, and the configured
// routes it failed to match.
//
// T001 measured the only router diagnostic this fixture puts on a console:
// `NG04002: Cannot match any routes. URL Segment: 'this-route-does-not-exist'`. Its recording says
// `digestCarriesCode: false` and `namesConfiguredRoutePath: false`, and it carries the 15 configured
// paths read at the same instant. So the join is not "which configured route does this belong to" —
// the whole message means no configured route matched. The join is: take the segment the message
// names, compare it against the configured paths, and report the absence, listing what was compared.
//
// This module is a reader of the lists it is given and of nothing else (N1): it has no DOM (no
// `document`, `window`, `getComputedStyle`), it imports nothing, it installs no `console` tap and no
// page global beyond the one namespace below. A bare `node:vm` context with nothing in it is enough
// to run it, which is what the suites prove.
//
// Input shapes, read as they are recorded:
//
//   messages  the console messages the agent already captures (N1), as the capture writes them:
//             `[{ code, text }, …]` where `code` is the code the browser printed (or null) and
//             `text` is the text it printed, stack frames included.
//   facts     what the caller knows, including the configured routes:
//             `{ config: [{ path, … }, …] }` (or any of the accepted spellings). Only the configured
//             paths are read. Anything else the caller passes is deliberately not consulted for
//             attribution.
//
// The answer is one object with exactly the fields the surface renders (T003 adds none):
//
//   { state: "finding",     segment, code, message, consideredCount }
//   { state: "cannot-tell", reason }
//
// A finding names the segment the message named, carries the code the message stated (even when the
// digest does not carry it) and the message body the console showed, and states how many configured
// paths were compared. It names no configured route as the owner.
//
// A "cannot tell" names the absence it found and nothing else — no segment, no code, no cause:
//
//   no-captured-messages            no message was supplied at all.
//   no-url-segment                  the message carried no extractable URL segment.
//   segment-matches-configuration   the segment does match a configured path, so the router failed
//                                   for a reason the message does not give.
(function () {
  'use strict';

  const FINDING = 'finding';
  const CANNOT_TELL = 'cannot-tell';

  const NO_CAPTURED_MESSAGES = 'no-captured-messages';
  const NO_URL_SEGMENT = 'no-url-segment';
  const SEGMENT_MATCHES_CONFIGURATION = 'segment-matches-configuration';

  const NG_CODE = /NG\d{4,5}/;
  const STACK_FRAME = /\n\s+at\s/;
  const URL_SEGMENT = /URL\s*Segment:\s*['"]([^'"]+)['"]/i;

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

  function bodyOf(text) {
    const frame = text.search(STACK_FRAME);
    return (frame === -1 ? text : text.slice(0, frame)).trim();
  }

  function codeOf(body, message) {
    const found = body.match(NG_CODE);
    if (found !== null) return found[0];
    if (
      message &&
      typeof message === 'object' &&
      typeof message.code === 'string' &&
      message.code !== ''
    ) {
      return message.code;
    }
    return null;
  }

  function segmentOf(body) {
    const found = body.match(URL_SEGMENT);
    if (found === null) return null;
    const value = found[1];
    return value === '' ? null : value;
  }

  function normalizePath(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (trimmed === '') return '';
    return trimmed.replace(/^\/+/, '');
  }

  function pathsOf(facts) {
    let config = null;
    if (Array.isArray(facts)) {
      config = facts;
    } else if (facts && typeof facts === 'object') {
      const keys = [
        'config',
        'routes',
        'configuredRoutes',
        'routeConfig',
        'paths',
        'configuredPaths',
        'entries',
        'configuration',
      ];
      for (let i = 0; i < keys.length; i += 1) {
        if (Array.isArray(facts[keys[i]])) {
          config = facts[keys[i]];
          break;
        }
      }
    }
    if (!Array.isArray(config)) return [];
    const paths = [];
    for (let i = 0; i < config.length; i += 1) {
      const entry = config[i];
      if (typeof entry === 'string') {
        const normalized = normalizePath(entry);
        if (normalized !== null) paths.push(normalized);
        continue;
      }
      if (entry && typeof entry === 'object') {
        const raw =
          entry.path !== undefined
            ? entry.path
            : entry.route !== undefined
              ? entry.route
              : entry.url !== undefined
                ? entry.url
                : entry.path === undefined
                  ? null
                  : null;
        const normalized = normalizePath(raw);
        if (normalized !== null) paths.push(normalized);
      }
    }
    return paths;
  }

  function finding(segment, code, message, consideredCount) {
    return {
      state: FINDING,
      segment: segment,
      code: code,
      message: message,
      consideredCount: consideredCount,
    };
  }

  function cannotTell(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  function matchesConfig(segment, paths) {
    const normalized = normalizePath(segment);
    for (let i = 0; i < paths.length; i += 1) {
      if (paths[i] === normalized) return true;
    }
    return false;
  }

  function routerDiagnostic(messages, facts) {
    const list = Array.isArray(messages) ? messages : [];
    const paths = pathsOf(facts);
    const consideredCount = paths.length;

    if (list.length === 0) return cannotTell(NO_CAPTURED_MESSAGES);

    const answers = [];
    for (let i = 0; i < list.length; i += 1) {
      const message = list[i];
      const text = textOf(message);
      if (text === null) {
        answers.push(cannotTell(NO_URL_SEGMENT));
        continue;
      }
      const body = bodyOf(text);
      const segment = segmentOf(body);
      if (segment === null) {
        answers.push(cannotTell(NO_URL_SEGMENT));
        continue;
      }
      const code = codeOf(body, message);
      if (!matchesConfig(segment, paths)) {
        answers.push(finding(segment, code, body, consideredCount));
      } else {
        answers.push(cannotTell(SEGMENT_MATCHES_CONFIGURATION));
      }
    }

    for (let i = 0; i < answers.length; i += 1) {
      if (answers[i].state === FINDING) return answers[i];
    }
    return answers[0];
  }

  const namespace = {
    routerDiagnostic: routerDiagnostic,
    FINDING: FINDING,
    CANNOT_TELL: CANNOT_TELL,
    NO_CAPTURED_MESSAGES: NO_CAPTURED_MESSAGES,
    NO_URL_SEGMENT: NO_URL_SEGMENT,
    SEGMENT_MATCHES_CONFIGURATION: SEGMENT_MATCHES_CONFIGURATION,
  };

  if (globalThis.angularAiRouterDiagnostic) {
    Object.assign(globalThis.angularAiRouterDiagnostic, namespace);
  } else {
    globalThis.angularAiRouterDiagnostic = namespace;
  }
})();
