// console-join.test.mjs — M045 T002. The join is proven against the digest the extension actually
// ships (`extension/error-digest.json`, 64 entries, 64 unique codes), not only against a fixture, and
// each defect the milestone names is armed as a mutation of the module's own source and shown to
// redden the pin that names it. T008 added the two rules wave 2 found unenforced: a join that picks a
// digest entry by matching message text, and a join that re-extracts a code from text.
//
// The module is evaluated in a bare `node:vm` context: no DOM, no clock, no console. The mutations
// are in-memory rewrites of the same source string, so the checkout is never written by this file.
// `MUTATIONS` is exported so a recorded mutation run can apply the identical edit to the shipped
// file instead of a second copy that drifts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/console-join.js', import.meta.url),
  'utf8',
);

// The shipped digest, read as the file the extension ships.
const SHIPPED = JSON.parse(
  readFileSync(
    new URL('../extension/error-digest.json', import.meta.url),
    'utf8',
  ),
);
const SHIPPED_ENTRIES = SHIPPED.entries;

// T001's measurement, read rather than restated: it is the record the join was written against.
const RECORD = JSON.parse(
  readFileSync(
    new URL('../research/raw/m045-console-shapes.json', import.meta.url),
    'utf8',
  ),
);

const JOINED = 'joined';
const CAPTURED_NOTHING = 'captured-nothing';
const NO_DIAGNOSTICS = 'no-diagnostics';

// From the record: `captureErrorPayload` writes `{ code, message, component, timestamp }`, and the
// only code the shipped `/NG0\d{3,}/` regex finds in this message is `NG04002`, which the digest does
// not carry. So this is a real code-with-no-entry, not a contrived one.
const ROUTER_TEXT =
  'NG04002: Cannot match any routes. URL Segment: this-route-does-not-exist';
const MISSING_CODE = 'NG04002';

function shippedTitle(code) {
  const entry = SHIPPED_ENTRIES.find((e) => e.code === code);
  return entry ? entry.title : null;
}

function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiConsoleJoin;
  assert.ok(api, 'module must publish the angularAiConsoleJoin namespace');
  assert.equal(
    typeof api.consoleJoin,
    'function',
    'consoleJoin must be exported',
  );
  return { api, context };
}

// The capture's own payload shape, so the suite never feeds a shape the capture cannot produce.
function diag(code, message, component = null, timestamp = 1) {
  return { code, message, component, timestamp };
}

function host(value) {
  return JSON.parse(JSON.stringify(value));
}

// Each mutation is one edit of the shipped source, applied in memory here and to the file by a
// recorded run. `defect` is the wording the failing pin must contain.
export const MUTATIONS = [
  {
    id: 'body-matching',
    defect: 'message body',
    anchor: 'const entry = matchEntry(entries, code);',
    replacement:
      "const entry = entries.find((e) => typeof e.title === 'string' && text.includes(e.title)) || null;",
  },
  {
    id: 'text-fallback',
    // The mutant wave 2 built: key on the carried code first, then fall back to a digest title the
    // message text happens to contain. Every behavioural pin that fed a message carrying a code the
    // digest has, or a message containing no title, stayed green.
    defect: 'message text',
    anchor: 'const entry = matchEntry(entries, code);',
    replacement:
      "let entry = matchEntry(entries, code);\n      if (!entry) {\n        entry =\n          entries.find(\n            (candidate) =>\n              typeof candidate.title === 'string' &&\n              text.includes(candidate.title),\n          ) || null;\n      }",
  },
  {
    id: 're-extracted-code',
    // The second mutant wave 2 built: when the capture wrote no code, run the capture's own regex
    // over the message again. The pin that asserted `'the app failed'` carries no NG0xxx text stayed
    // green because that message has no code to find.
    defect: 're-extract',
    anchor: 'const code = codeOf(diagnostic);',
    replacement:
      'let code = codeOf(diagnostic);\n      if (code === null) {\n        const fromText = text.match(/NG0\\d{3,}/);\n        if (fromText) code = fromText[0];\n      }',
  },
  {
    id: 'absence-as-count',
    defect: 'count',
    anchor:
      'findings.push({ text: text, code: code, reason: NO_DIGEST_ENTRY });',
    replacement:
      'findings.push({ text: text, reason: NO_DIGEST_ENTRY, count: 1 });',
  },
  {
    id: 'collapsed-empty-capture',
    defect: 'captured-nothing',
    anchor: 'return { state: CAPTURED_NOTHING, findings: [] };',
    replacement: 'return { state: NO_DIAGNOSTICS, findings: [] };',
  },
  {
    id: 'invented-code',
    defect: 'no code',
    anchor: 'findings.push({ text: text + NO_CODE_NOTE });',
    replacement: "findings.push({ text: text, code: 'NG0100' });",
  },
  {
    id: 'deduped-findings',
    defect: 'two findings',
    anchor: 'findings.push({ text: text, code: code, title: entry.title });',
    replacement:
      'if (findings.some((f) => f.code === code)) continue; findings.push({ text: text, code: code, title: entry.title });',
  },
];

function mutant(mutation) {
  const occurrences = SRC.split(mutation.anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `mutation anchor not unique: ${mutation.anchor}`,
  );
  const mutated = SRC.replace(mutation.anchor, mutation.replacement);
  assert.notEqual(
    mutated,
    SRC,
    `mutation ${mutation.id} must change the module`,
  );
  return loadBare(mutated).api;
}

// ---- the pins. Each one asserts one rule, and its assertion message names the defect that breaks
// it, so a mutant run reports the rule it violated rather than a bare mismatch.

function pinKeysOnTheCarriedCode(api) {
  // The body contains another digest entry's title (NG0200, "Circular Dependency in DI", which sits
  // earlier in the entries array) while the code the message carries is NG0401.
  const text =
    'NG0401: Missing Platform. Circular Dependency in DI was also logged.';
  const r = host(api.consoleJoin([diag('NG0401', text)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  assert.equal(
    r.findings[0].code,
    'NG0401',
    'the finding must carry the code the message carried: NG0401',
  );
  assert.equal(
    r.findings[0].title,
    shippedTitle('NG0401'),
    'the join must key on the code the message carries, never on wording in its message body',
  );
}

function pinNamesTheMissingCode(api) {
  const r = host(api.consoleJoin([diag(MISSING_CODE, ROUTER_TEXT)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.ok(
    !('count' in finding) && !('unmatchedCount' in finding),
    'a code the digest lacks must be reported by name, never as a count',
  );
  assert.equal(
    finding.code,
    MISSING_CODE,
    `a code the digest lacks must be reported by name: ${MISSING_CODE}`,
  );
  assert.equal(
    finding.reason,
    'no-digest-entry',
    'a code the digest lacks must carry the reason it was not joined',
  );
  assert.ok(
    !('title' in finding),
    'the digest states no title for NG04002, so a blank one must not be carried',
  );
  assert.match(
    JSON.stringify(finding),
    /NG04002/,
    'the finding must name the unmatched code somewhere in what it renders',
  );
}

function pinKeepsEmptyCaptureDistinct(api) {
  const r = host(api.consoleJoin([], SHIPPED));
  assert.equal(
    r.state,
    CAPTURED_NOTHING,
    'an empty capture must report captured-nothing, and must not be collapsed into no-diagnostics',
  );
  assert.deepEqual(r.findings, []);
}

function pinReportsTheMissingCode(api) {
  const r = host(api.consoleJoin([diag(null, 'the app failed')], SHIPPED));
  assert.equal(r.state, JOINED);
  const finding = r.findings[0];
  assert.ok(
    !('code' in finding),
    'a message that carried no code must not be given one',
  );
  assert.match(
    finding.text,
    /no code/,
    'a message that carried no code must report that it carried no code',
  );
  assert.doesNotMatch(
    JSON.stringify(finding),
    /NG\d/,
    'a message that carried no code must not have a code invented for it',
  );
}

function pinKeepsBothFindings(api) {
  const first = 'NG0100: first report';
  const second = 'NG0100: second report';
  const r = host(
    api.consoleJoin([diag('NG0100', first), diag('NG0100', second)], SHIPPED),
  );
  assert.equal(r.state, JOINED);
  assert.equal(
    r.findings.length,
    2,
    'two diagnostics sharing a code must yield two findings, in capture order',
  );
  assert.deepEqual(
    r.findings.map((f) => f.text),
    [first, second],
    'two diagnostics sharing a code must keep the order the capture reported them in',
  );
  for (const finding of r.findings) {
    assert.equal(
      finding.title,
      shippedTitle('NG0100'),
      'each of the two findings must carry the one title its shared code matched',
    );
  }
}

// The carried code decides which digest entry is read. A message may quote any wording it likes,
// including another entry's title; only the code the capture wrote may choose an entry.
function pinNeverChoosesByMessageText(api) {
  // NG04002 is extractable by the capture's regex and absent from all 64 digest entries, while the
  // message also contains NG0200's shipped title. A join that falls back to matching text picks the
  // title for a code the diagnostic never carried.
  const text = `${MISSING_CODE}: Cannot match any routes. Circular Dependency in DI was also logged.`;
  const r = host(api.consoleJoin([diag(MISSING_CODE, text)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.equal(
    finding.code,
    MISSING_CODE,
    `the finding must carry the code the message carried: ${MISSING_CODE}`,
  );
  assert.equal(
    finding.reason,
    'no-digest-entry',
    'a join must never choose a digest entry by matching message text: the message carried NG04002, the digest lacks it, and the absence must be reported by name',
  );
  assert.ok(
    !('title' in finding),
    'a join must never choose a digest entry by matching message text: a title from another entry is not the title for the carried code',
  );
}

// A code is whatever the capture wrote and nothing else. The message text is evidence the capture
// already read; re-reading it here would be a second rule nobody measured.
function pinNeverReExtractsACode(api) {
  // The capture wrote null for this diagnostic, yet the message contains an extractable code. A join
  // that re-extracts from the text invents the code the capture said was absent.
  const text = 'bootstrap failed after NG0100 while rendering';
  const r = host(api.consoleJoin([diag(null, text)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.ok(
    !('code' in finding),
    'a join must never re-extract a code from message text: the capture wrote no code, and joining one from the text is a second rule nobody measured',
  );
  assert.ok(
    !('title' in finding),
    'a join must never re-extract a code from message text: no digest entry may be chosen from a code the capture did not carry',
  );
  assert.match(
    finding.text,
    /carried no code/,
    'a message the capture recorded with no code must still report that it carried none',
  );
}

const PINS = {
  'body-matching': pinKeysOnTheCarriedCode,
  'text-fallback': pinNeverChoosesByMessageText,
  're-extracted-code': pinNeverReExtractsACode,
  'absence-as-count': pinNamesTheMissingCode,
  'collapsed-empty-capture': pinKeepsEmptyCaptureDistinct,
  'invented-code': pinReportsTheMissingCode,
  'deduped-findings': pinKeepsBothFindings,
};

describe('provenance: the input is the shipped digest and the measured record', () => {
  it('reads the 64-entry digest the extension ships', () => {
    assert.equal(SHIPPED.version, '22.2.x');
    assert.equal(SHIPPED_ENTRIES.length, 64);
    assert.equal(new Set(SHIPPED_ENTRIES.map((e) => e.code)).size, 64);
    assert.equal(typeof shippedTitle('NG0100'), 'string');
    assert.notEqual(shippedTitle('NG0100'), '');
  });

  it('agrees with T001 on the digest and on the missing code', () => {
    assert.equal(RECORD.digest.entryCount, SHIPPED_ENTRIES.length);
    assert.equal(RECORD.digest.uniqueCodeCount, 64);
    assert.ok(
      !RECORD.digest.codes.includes(MISSING_CODE),
      'the record must agree that the digest lacks NG04002',
    );
    assert.equal(
      SHIPPED_ENTRIES.some((e) => e.code === MISSING_CODE),
      false,
      'the shipped digest must lack NG04002 for the absent-entry pin to be real',
    );
  });
});

describe('purity', () => {
  it('loads in a bare context with no DOM, clock or console', () => {
    const { api, context } = loadBare();
    assert.equal(context.document, undefined);
    assert.equal(context.window, undefined);
    assert.equal(context.performance, undefined);
    assert.equal(context.console, undefined);
    assert.equal(typeof api.consoleJoin, 'function');
  });
});

describe('AC1: a message carrying a digest code is joined by that code', () => {
  it('yields one finding naming the shipped digest title', () => {
    const { api } = loadBare();
    const text = 'NG0100: Expression has changed after it was checked.';
    const r = host(api.consoleJoin([diag('NG0100', text)], SHIPPED));
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 1);
    assert.deepEqual(r.findings[0], {
      text: text,
      code: 'NG0100',
      title: shippedTitle('NG0100'),
    });
  });

  it('joins on the code even when the body states none of the digest wording', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag('NG0200', 'boom')], SHIPPED));
    assert.equal(r.findings[0].title, shippedTitle('NG0200'));
  });

  it('reads nothing but code and title from the digest entry', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag('NG0100', 'NG0100')], SHIPPED));
    assert.deepEqual(Object.keys(r.findings[0]).sort(), [
      'code',
      'text',
      'title',
    ]);
  });
});

describe('AC2: a code the digest lacks is reported by name', () => {
  it('names NG04002 with the reason and no title', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag(MISSING_CODE, ROUTER_TEXT)], SHIPPED));
    assert.deepEqual(r.findings[0], {
      text: ROUTER_TEXT,
      code: MISSING_CODE,
      reason: 'no-digest-entry',
    });
  });

  it('reports a count nowhere: every finding value is a string', () => {
    const { api } = loadBare();
    const r = host(
      api.consoleJoin(
        [diag(MISSING_CODE, ROUTER_TEXT), diag('NG0100', 'NG0100')],
        SHIPPED,
      ),
    );
    for (const finding of r.findings) {
      for (const value of Object.values(finding)) {
        assert.equal(
          typeof value,
          'string',
          'an absence is named, never counted',
        );
      }
    }
  });
});

describe('AC3: a message with no code reports that it carried none', () => {
  it('carries no code, no reason and a text saying so', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag(null, 'the app failed')], SHIPPED));
    const finding = r.findings[0];
    assert.ok(!('code' in finding));
    assert.ok(
      !('reason' in finding),
      'reason is reserved for a code the digest lacks; this message carried no code',
    );
    assert.ok(finding.text.startsWith('the app failed'));
    assert.match(finding.text, /carried no code/);
  });

  it('treats undefined, empty and non-string codes the same way', () => {
    const { api } = loadBare();
    const cases = [
      diag(undefined, 'a'),
      diag('', 'b'),
      diag('   ', 'c'),
      diag(42, 'd'),
    ];
    const r = host(api.consoleJoin(cases, SHIPPED));
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 4);
    for (const finding of r.findings) {
      assert.ok(
        !('code' in finding),
        'no code may be invented from a non-code',
      );
      assert.match(finding.text, /no code/);
    }
  });

  it('does not throw on a non-string message (E5)', () => {
    const { api } = loadBare();
    const circular = { toString: null };
    const r = host(
      api.consoleJoin([diag('NG0100', circular), 'raw string'], SHIPPED),
    );
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 2);
    assert.equal(r.findings[0].code, 'NG0100');
    assert.ok(!('code' in r.findings[1]));
  });
});

describe('AC4: two diagnostics sharing a code yield two findings and one match', () => {
  it('keeps both findings, in capture order, with the one matched title', () => {
    const { api } = loadBare();
    const first = 'NG0100: first report';
    const second = 'NG0100: second report';
    const third = ROUTER_TEXT;
    const r = host(
      api.consoleJoin(
        [
          diag('NG0100', first),
          diag(MISSING_CODE, third),
          diag('NG0100', second),
        ],
        SHIPPED,
      ),
    );
    assert.equal(r.findings.length, 3);
    assert.deepEqual(
      r.findings.map((f) => f.text),
      [first, third, second],
    );
    assert.deepEqual(
      r.findings.map((f) => f.code),
      ['NG0100', MISSING_CODE, 'NG0100'],
    );
    assert.equal(r.findings[0].title, r.findings[2].title);
    assert.equal(r.findings[0].title, shippedTitle('NG0100'));
  });
});

describe('states: the two absences are not the same absence', () => {
  it('reports an empty capture as captured-nothing', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([], SHIPPED));
    assert.deepEqual(r, { state: CAPTURED_NOTHING, findings: [] });
  });

  it('reports a capture that was never handed over as no-diagnostics', () => {
    const { api } = loadBare();
    assert.equal(api.consoleJoin(undefined, SHIPPED).state, NO_DIAGNOSTICS);
    assert.equal(api.consoleJoin(null, SHIPPED).state, NO_DIAGNOSTICS);
    assert.equal(api.consoleJoin({}, SHIPPED).state, NO_DIAGNOSTICS);
    assert.equal(api.consoleJoin('NG0100', SHIPPED).state, NO_DIAGNOSTICS);
  });

  it('never confuses the two, and never returns a fourth state', () => {
    const { api } = loadBare();
    assert.notEqual(
      api.consoleJoin([], SHIPPED).state,
      api.consoleJoin(undefined, SHIPPED).state,
    );
    const states = [
      api.consoleJoin(undefined, SHIPPED).state,
      api.consoleJoin([], SHIPPED).state,
      api.consoleJoin([diag('NG0100', 'x')], SHIPPED).state,
    ];
    for (const state of states) {
      assert.ok(
        [JOINED, CAPTURED_NOTHING, NO_DIAGNOSTICS].includes(state),
        `unexpected state: ${state}`,
      );
    }
  });

  it('reports joined for a capture whose only diagnostic has no code', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag(null, 'x')], SHIPPED));
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 1);
  });
});

describe('interface: the answer is state and findings and nothing else', () => {
  it('has exactly two top-level keys', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag('NG0100', 'x')], SHIPPED));
    assert.deepEqual(Object.keys(r).sort(), ['findings', 'state']);
  });

  it('carries no cause, element, remedy, body or count field', () => {
    const { api } = loadBare();
    const r = host(
      api.consoleJoin(
        [diag('NG0100', 'x'), diag(MISSING_CODE, 'y'), diag(null, 'z')],
        SHIPPED,
      ),
    );
    const allowed = ['code', 'reason', 'text', 'title'];
    const forbidden = [
      'body',
      'cause',
      'element',
      'remedy',
      'component',
      'count',
    ];
    for (const finding of r.findings) {
      for (const key of Object.keys(finding)) {
        assert.ok(allowed.includes(key), `unexpected finding key: ${key}`);
        assert.ok(!forbidden.includes(key), `forbidden finding key: ${key}`);
      }
    }
  });

  it('carries reason only where the digest lacks the carried code', () => {
    const { api } = loadBare();
    const r = host(
      api.consoleJoin(
        [diag('NG0100', 'x'), diag(MISSING_CODE, 'y'), diag(null, 'z')],
        SHIPPED,
      ),
    );
    assert.deepEqual(
      r.findings.map((f) => ('reason' in f ? f.reason : null)),
      [null, 'no-digest-entry', null],
    );
  });

  it('carries code exactly where the message carried one', () => {
    const { api } = loadBare();
    const r = host(
      api.consoleJoin([diag('NG0100', 'x'), diag(null, 'y')], SHIPPED),
    );
    assert.deepEqual(
      r.findings.map((f) => ('code' in f ? f.code : null)),
      ['NG0100', null],
    );
  });
});

describe('mutants: each defect reddens the pin that names it', () => {
  for (const mutation of MUTATIONS) {
    it(`${mutation.id} reddens naming "${mutation.defect}"`, () => {
      // The pin is green on the shipped module first, so the failure below is the mutation's.
      const { api } = loadBare();
      PINS[mutation.id](api);

      const mutated = mutant(mutation);
      assert.throws(
        () => PINS[mutation.id](mutated),
        new RegExp(mutation.defect),
        `mutation ${mutation.id} must redden a pin naming "${mutation.defect}"`,
      );
    });
  }

  it('applies every mutation to a source that really changed', () => {
    for (const mutation of MUTATIONS) {
      assert.equal(SRC.split(mutation.anchor).length - 1, 1);
      assert.notEqual(SRC.replace(mutation.anchor, mutation.replacement), SRC);
    }
  });
});
