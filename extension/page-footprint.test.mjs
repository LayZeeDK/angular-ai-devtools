// extension/page-footprint.test.mjs — T010: the page footprint with and without the overlay (SC5),
// the tool-element count across a second boot (SC4), and the recording the milestone quotes (SC5).
//
// Why a differential and not an assertion: the overlay is the only programme-1 code an inspected page
// can observe, so its footprint is a compatibility surface. "The tool ships no Angular of its own" is
// therefore a statement about a *difference* — the same document booted without overlay.js and with it
// must produce the same four readings:
//
//   1. `ɵsetProfiler` subscriber list — read from a stub `ng` whose `ɵsetProfiler` records every
//      subscriber, so a second subscriber is a second array entry and not a claim.
//   2. The published feature record — the `features` object of the `angular-ai:state` the page-realm
//      recorder dispatches on the page's window, which is eight `typeof` reads on that same `ng`.
//   3. The page globals the scripts add — own property names of `window`, measured as a delta over a
//      baseline taken after the page's own `ng` exists and before any content script boots.
//   4. The element nodes outside the tool's host subtree — the page's own DOM, so a node the overlay
//      appends elsewhere in the document is a difference.
//
// A difference is the failure, and the message names the arm that differs ("withOverlay"). A
// differential that cannot fail is a restatement of the code, so the second test below applies four
// mutations to overlay.js — a profiler subscription, a removed feature name, a page global and a node
// outside the host subtree — and asserts each one reddens the surface it should.
//
// What the arms are, exactly. Both arms boot the two isolated-world modules the overlay's own
// content_scripts declaration shares with it (`observer-filter.js`, `overlay-geometry.js`) and then the
// MAIN-world recorder (`agent-main.js`); the withOverlay arm boots `overlay.js` between them, in the
// manifest's order (`document_start`, then `document_idle`). The only variable between the arms is
// therefore overlay.js: a global those two shipped modules install is charged to neither arm, and
// everything overlay.js adds is charged to it. The tool's one created element is the host, and the DOM
// surface excludes the host subtree by construction — the "exactly one tool-created element" half of
// AR-3 is the second-boot count, asserted separately.
//
// The stub `ng` reports Angular 22.2.2, the version T001 measured on the fixture
// (`research/raw/m022-ng-context.json`); the recording pins it so a page that starts reporting another
// version is a stale recording and not a silent footgun.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';

const { JSDOM } = await import('jsdom').catch(() => {
  throw new Error(
    'page-footprint.test.mjs needs jsdom, which this checkout does not have — provision it with `npm ci --include=dev` (the shell exports NODE_ENV=production, so the flag is not optional)',
  );
});

const OVERLAY = readFileSync(new URL('./overlay.js', import.meta.url), 'utf8');
const FILTER = readFileSync(
  new URL('./observer-filter.js', import.meta.url),
  'utf8',
);
const GEOMETRY = readFileSync(
  new URL('./overlay-geometry.js', import.meta.url),
  'utf8',
);
const RECORDER = readFileSync(
  new URL('./agent-main.js', import.meta.url),
  'utf8',
);
const MANIFEST = JSON.parse(
  readFileSync(new URL('./manifest.json', import.meta.url), 'utf8'),
);

const RECORDING_URL = new URL(
  '../research/raw/m022-page-footprint.json',
  import.meta.url,
);
const HOST_ID = 'angular-ai-devtools-host';
const RETIRED_MARKER_ID = 'angular-ai-devtools-marker';
const ANGULAR_VERSION = '22.2.2';

/** The page every arm boots: enough markup for the recorder's `document` reads, nothing Angular. */
const PAGE_HTML =
  '<!doctype html><html><head><title>page</title></head><body><app-root id="page">page</app-root></body></html>';

/** The eight `featuresOf(ng)` names, in the order `agent-main.js` declares them. */
const FEATURE_NAMES = [
  'setProfiler',
  'getSignalGraph',
  'getHostElement',
  'getInjector',
  'getDirectiveMetadata',
  'getInjectorResolutionPath',
  'getInjectorMetadata',
  'getInjectorProviders',
];

/** The commands the recording pins: the two gates this task owns, the build they measure against, and
 * the arm command. A recording that names a different command is refused. */
const COMMANDS = {
  arms: 'node --test extension/page-footprint.test.mjs',
  check: 'npm run check',
  test: 'npm test',
  build: 'npx nx run angular-ai-devtools:build-extension',
};

/**
 * The four surfaces the differential compares, each with the reading it stands for. Adding a fifth
 * surface is a change to the measurement, not a detail of it.
 */
const SURFACES = [
  {
    surface: 'profilerSubscribers',
    describes: 'the ɵsetProfiler subscriber list',
  },
  {
    surface: 'featureRecord',
    describes: 'the published feature record (`angular-ai:state`.`features`)',
  },
  {
    surface: 'pageGlobals',
    describes: "the global names the scripts add to the page's window",
  },
  {
    surface: 'pageNodes',
    describes: "the element nodes outside the tool's host subtree",
  },
];

/**
 * The recording's compared paths. Each one is compared whole, so a doctored recording is refused by
 * name rather than by a deep-equal blob nobody can read.
 */
const RECORDED_PATHS = [
  'angularVersion',
  'commands',
  'arms.sharedModules',
  'arms.withoutOverlay',
  'arms.withOverlay',
  'differential',
  'secondBoot',
];

/** A payload built inside the jsdom realm carries that window's prototypes; copy it into this realm. */
function plain(value) {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value));
}

/**
 * A value as a key-order-independent string: two readings are the same footprint when this string is
 * the same, so re-ordering a recording's keys is not a disagreement while a changed value is.
 */
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') {
    return (
      '{' +
      Object.keys(value)
        .sort()
        .map((key) => JSON.stringify(key) + ':' + canonical(value[key]))
        .join(',') +
      '}'
    );
  }
  return JSON.stringify(value === undefined ? null : value);
}

/** Every own property name of the page's global object, sorted. */
function ownGlobalNames(window) {
  return Object.getOwnPropertyNames(window).sort();
}

/** The names `script`'s boot added: present now, absent from the baseline. */
function addedGlobalNames(baseline, window) {
  const seen = new Set(baseline);
  return ownGlobalNames(window).filter((name) => !seen.has(name));
}

/** One element as `tag#id.class`, so the DOM surface is a readable list and not a node tree. */
function describeElement(element) {
  const tag = String(element.tagName).toLowerCase();
  const id = element.id ? '#' + element.id : '';
  const className =
    typeof element.className === 'string' && element.className.trim().length > 0
      ? '.' + element.className.trim().split(/\s+/).join('.')
      : '';
  return tag + id + className;
}

/** Every element node the page keeps outside the tool's host subtree — the page's own DOM. */
function pageNodes(document, host) {
  const nodes = [];
  for (const element of document.querySelectorAll('*')) {
    if (element === host) continue;
    if (host && host.contains(element)) continue;
    nodes.push(describeElement(element));
  }
  return nodes;
}

/**
 * Boots one arm: the same document shape, the same stub `ng`, the same recorder. `overlay` boots the
 * overlay's two shared modules and `overlay.js` before the recorder, which is the manifest's order.
 * `source` boots a mutated copy of overlay.js for the red-half proofs.
 */
function bootArm({ overlay = false, source = OVERLAY } = {}) {
  const dom = new JSDOM(PAGE_HTML, { runScripts: 'outside-only' });
  const { window } = dom;
  const document = window.document;
  const states = [];
  const created = [];
  const bootErrors = [];

  const rawCreateElement = document.createElement.bind(document);
  document.createElement = (tagName, options) => {
    created.push(String(tagName).toLowerCase());
    return rawCreateElement(tagName, options);
  };
  window.console = {
    log: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };

  // The tool's observers, held so they can be disconnected before the document goes away: a record
  // delivered to a callback after `window.close()` would throw into this test's output, and the
  // measurement has already been taken by then.
  const platformObservers = [];
  const PlatformMutationObserver = window.MutationObserver;
  window.MutationObserver = class {
    constructor(callback) {
      this.platform = new PlatformMutationObserver(callback);
      platformObservers.push(this);
    }
    observe(target, options) {
      this.platform.observe(target, options);
    }
    disconnect() {
      this.platform.disconnect();
    }
  };

  // The page's own Angular, reduced to the surface the recorder reads: `ɵsetProfiler` records its
  // subscribers instead of calling them, and the other seven names are the `typeof` reads `featuresOf`
  // makes. `getInjector` answers a zone-less app, which is what the recorder supports.
  const subscribers = [];
  window.ng = {
    VERSION: { full: ANGULAR_VERSION, major: 22, minor: 2, patch: 2 },
    ɵsetProfiler(callback) {
      subscribers.push(callback);
      return () => {};
    },
    ɵgetSignalGraph() {
      return null;
    },
    getHostElement() {
      return { tagName: 'APP-ROOT' };
    },
    getDirectiveMetadata() {
      return { changeDetection: 1 };
    },
    getInjector() {
      return { get: () => null };
    },
  };

  // The one event the recorder publishes on the page's own window, captured the way the page's
  // isolated-world relay would capture it: the published feature record is this payload's `features`.
  window.addEventListener('angular-ai:state', (event) =>
    states.push(plain(event.detail)),
  );

  const globalsBefore = ownGlobalNames(window);
  const modules = ['observer-filter.js', 'overlay-geometry.js'];
  const run = (module, code) => {
    try {
      window.eval(code);
    } catch (error) {
      bootErrors.push({
        module,
        message: error && error.message ? error.message : String(error),
      });
    }
  };
  run('observer-filter.js', FILTER);
  run('overlay-geometry.js', GEOMETRY);
  if (overlay) {
    run('overlay.js', source);
    modules.push('overlay.js');
  }
  run('agent-main.js', RECORDER);
  modules.push('agent-main.js');

  const host = document.getElementById(HOST_ID);
  const measured = {
    modules,
    profilerSubscriberCount: subscribers.length,
    profilerSubscribers: subscribers.map(
      (subscriber) => subscriber.name || '(anonymous)',
    ),
    featureRecord: states.length > 0 ? states[0].features : null,
    pageGlobals: addedGlobalNames(globalsBefore, window),
    pageNodes: pageNodes(document, host),
    createdElementTags: created,
  };

  return {
    window,
    document,
    host,
    states,
    subscribers,
    created,
    bootErrors,
    measured,
    close() {
      try {
        if (
          window.__ngRecorder &&
          typeof window.__ngRecorder.reset === 'function'
        )
          window.__ngRecorder.reset();
      } catch (error) {
        /* a timer left behind must not fail the measurement that already happened */
      }
      for (const observer of platformObservers) {
        try {
          observer.disconnect();
        } catch (error) {
          /* a disconnected observer is the goal, not the assertion */
        }
      }
      try {
        window.close();
      } catch (error) {
        /* a closed window is the goal, not the assertion */
      }
    },
  };
}

/** The four surface readings of one arm, as plain data a recording can hold. */
function readings(arm) {
  return {
    profilerSubscribers: arm.measured.profilerSubscribers,
    featureRecord: plain(arm.measured.featureRecord),
    pageGlobals: arm.measured.pageGlobals,
    pageNodes: arm.measured.pageNodes,
  };
}

/** Every surface whose reading is not the same in the two arms, with both readings kept. */
function differential(withoutOverlay, withOverlay) {
  const before = readings(withoutOverlay);
  const after = readings(withOverlay);
  const differences = [];
  for (const { surface, describes } of SURFACES) {
    if (canonical(before[surface]) === canonical(after[surface])) continue;
    differences.push({
      surface,
      describes,
      withoutOverlay: before[surface],
      withOverlay: after[surface],
    });
  }
  return differences;
}

/** One difference as a sentence, truncated so a long DOM surface stays readable in a failure. */
function summarise(value) {
  const text = JSON.stringify(value);
  return text.length > 240 ? text.slice(0, 240) + '…' : text;
}

function describeDifferences(differences) {
  return differences
    .map(
      (difference) =>
        difference.surface +
        ' (' +
        difference.describes +
        '): withoutOverlay ' +
        summarise(difference.withoutOverlay) +
        ' / withOverlay ' +
        summarise(difference.withOverlay),
    )
    .join('; ');
}

/** SC5: the two arms' readings are the same, or the test fails naming the arm that differs. */
function assertSamePageFootprint(withoutOverlay, withOverlay) {
  const differences = differential(withoutOverlay, withOverlay);
  assert.deepEqual(
    differences.map((difference) => difference.surface),
    [],
    'the page footprint is not the same with and without the overlay; the arm that differs is "withOverlay" — ' +
      describeDifferences(differences),
  );
}

/** The bites this pin has to prove. Each one is a page-visible leak the overlay must never have. */
const BITES = [
  {
    name: 'the overlay subscribes to the profiler',
    surface: 'profilerSubscribers',
    line: 'try { globalThis.ng.ɵsetProfiler(function overlayProfilerSubscriber() {}); } catch (error) {}',
  },
  {
    name: 'the overlay removes a feature name',
    surface: 'featureRecord',
    line: 'try { delete globalThis.ng.ɵgetSignalGraph; } catch (error) {}',
  },
  {
    name: 'the overlay adds a feature name',
    surface: 'featureRecord',
    line: 'try { globalThis.ng.ɵgetInjectorProviders = function overlayOwnedFeature() {}; } catch (error) {}',
  },
  {
    name: 'the overlay writes a page global',
    surface: 'pageGlobals',
    line: 'globalThis.__angularAiOverlayFootprintProbe = 1;',
  },
  {
    name: 'the overlay creates a node outside its host subtree',
    surface: 'pageNodes',
    line: 'document.body.appendChild(document.createElement("span"));',
  },
];

/** Where a bite is injected: the overlay's last statement before it publishes its command channel. */
const BITE_ANCHOR = 'document.documentElement.appendChild(host);';

/**
 * Applies one bite. A bite whose anchor has moved fails loudly rather than silently: a pin that no
 * longer mutates anything proves nothing about its own failing half.
 */
function bittenOverlay(bite) {
  const occurrences = OVERLAY.split(BITE_ANCHOR).length - 1;
  assert.equal(
    occurrences,
    1,
    'the "' +
      bite.name +
      '" bite anchor is gone from overlay.js (or is no longer unique) — restate the bite here instead of deleting it',
  );
  return OVERLAY.replace(BITE_ANCHOR, BITE_ANCHOR + ' ' + bite.line);
}

/** The second boot's readings: the three page-visible halves of SC4. */
function secondBootOf(arm) {
  const host = arm.document.getElementById(HOST_ID);
  const marker = arm.document.getElementById(RETIRED_MARKER_ID);
  return {
    toolElements: arm.document.querySelectorAll('[id^="angular-ai-devtools"]')
      .length,
    markerIdResolvesTo: marker === null ? null : marker.id,
    closedRootReadable: host === null ? null : host.shadowRoot !== null,
  };
}

/** One arm as the recording holds it: a closed field list, so nothing accidental leaks into evidence. */
function recordedArm(arm) {
  return {
    modules: arm.measured.modules,
    profilerSubscriberCount: arm.measured.profilerSubscriberCount,
    profilerSubscribers: arm.measured.profilerSubscribers,
    featureRecord: plain(arm.measured.featureRecord),
    pageGlobals: arm.measured.pageGlobals,
    pageNodes: arm.measured.pageNodes,
    createdElementTags: arm.measured.createdElementTags,
  };
}

/**
 * The whole measurement, in the shape `research/raw/m022-page-footprint.json` records: both arms, the
 * Angular version the stub reports, the commands, the differential and the second boot's count.
 */
function measureMilestone() {
  const withoutOverlay = bootArm({ overlay: false });
  const withOverlay = bootArm({ overlay: true });
  try {
    assert.deepEqual(
      withoutOverlay.bootErrors,
      [],
      'the withoutOverlay arm must boot every module cleanly',
    );
    assert.deepEqual(
      withOverlay.bootErrors,
      [],
      'the withOverlay arm must boot every module cleanly',
    );
    const differences = differential(withoutOverlay, withOverlay);

    const createdBefore = withOverlay.created.length;
    assert.doesNotThrow(
      () => withOverlay.window.eval(OVERLAY),
      'a second boot must never throw into the page it inspects (N3)',
    );

    return {
      angularVersion: ANGULAR_VERSION,
      commands: COMMANDS,
      arms: {
        sharedModules: ['observer-filter.js', 'overlay-geometry.js'],
        withoutOverlay: recordedArm(withoutOverlay),
        withOverlay: recordedArm(withOverlay),
      },
      differential: {
        identical: differences.length === 0,
        surfaces: SURFACES.map(({ surface }) => surface),
        differences,
      },
      secondBoot: {
        ...secondBootOf(withOverlay),
        createdBySecondBoot: withOverlay.created.length - createdBefore,
      },
    };
  } finally {
    withoutOverlay.close();
    withOverlay.close();
  }
}

/**
 * Reads the recording. A missing or unreadable file throws — never skips: the recording is the
 * milestone's quoted evidence, and a suite that shrugs at its absence pins nothing.
 */
function readRecording(url = RECORDING_URL) {
  let text;
  try {
    text = readFileSync(url, 'utf8');
  } catch (error) {
    throw new Error(
      'the page-footprint recording is absent or unreadable (' +
        url.pathname +
        ') — write research/raw/m022-page-footprint.json from the measurement this file prints: run `node --test extension/page-footprint.test.mjs`',
    );
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      'research/raw/m022-page-footprint.json is not JSON: ' +
        (error && error.message ? error.message : String(error)),
    );
  }
}

/** Reads one dotted path out of the recording or the measurement, `undefined` when it is absent. */
function at(root, path) {
  return path
    .split('.')
    .reduce(
      (node, key) =>
        node === null || node === undefined ? undefined : node[key],
      root,
    );
}

/** Every recorded path that disagrees with the measurement, each with both readings. */
function recordingMismatches(recorded, measured) {
  const mismatches = [];
  for (const path of RECORDED_PATHS) {
    const was = at(recorded, path);
    const now = at(measured, path);
    if (canonical(was) === canonical(now)) continue;
    mismatches.push({ path, recorded: was, measured: now });
  }
  return mismatches;
}

function describeMismatches(mismatches) {
  return mismatches
    .map(
      (mismatch) =>
        mismatch.path +
        ': recorded ' +
        summarise(mismatch.recorded) +
        ' / measured ' +
        summarise(mismatch.measured),
    )
    .join('; ');
}

/**
 * The measured block, ready to stand in the recording. Printed only when the recording has to be
 * written again (absent, or disagreeing), so the re-record is a copy of evidence and never a guess.
 */
function measuredBlock(measured) {
  return (
    "page-footprint measured block — write it to research/raw/m022-page-footprint.json, keeping the file's descriptive keys:\n" +
    JSON.stringify(measured, null, 2)
  );
}

describe('the page footprint with and without the overlay (SC5)', () => {
  it('reads the same ɵsetProfiler list and the same feature record in both arms', () => {
    const withoutOverlay = bootArm({ overlay: false });
    const withOverlay = bootArm({ overlay: true });
    try {
      assert.deepEqual(
        withoutOverlay.bootErrors,
        [],
        'the withoutOverlay arm must boot every module cleanly',
      );
      assert.deepEqual(
        withOverlay.bootErrors,
        [],
        'the withOverlay arm must boot every module cleanly',
      );

      // The measurement is not vacuous: each arm booted one recorder against the stub, the stub saw
      // exactly that one subscriber, and the feature record is the eight-name object and not an empty
      // one. A differential over two empty readings would pass for the wrong reason.
      assert.equal(
        withoutOverlay.subscribers.length,
        1,
        'the recorder subscribes once, so the stub records exactly one subscriber without the overlay',
      );
      assert.equal(
        withOverlay.subscribers.length,
        1,
        'and the overlay adds none, so the stub still records exactly one',
      );
      assert.ok(
        withoutOverlay.measured.featureRecord !== null,
        'the recorder must publish a feature record in both arms',
      );
      assert.deepEqual(
        Object.keys(withoutOverlay.measured.featureRecord),
        FEATURE_NAMES,
        'the feature record is the eight names `featuresOf` reads',
      );
      assert.deepEqual(
        Object.keys(withOverlay.measured.featureRecord),
        FEATURE_NAMES,
        'and the overlay adds or removes none of them',
      );

      assertSamePageFootprint(withoutOverlay, withOverlay);
    } finally {
      withoutOverlay.close();
      withOverlay.close();
    }
  });

  it("counts the overlay as the document's one tool-created element, outside the DOM surface", () => {
    const withoutOverlay = bootArm({ overlay: false });
    const withOverlay = bootArm({ overlay: true });
    try {
      assert.deepEqual(
        withoutOverlay.created,
        [],
        'without the overlay nothing the tool owns creates a node',
      );
      assert.deepEqual(
        withOverlay.created,
        ['div'],
        'with the overlay exactly one node is created — the host',
      );
      assert.equal(
        withoutOverlay.document.getElementById(HOST_ID),
        null,
        'the withoutOverlay arm has no host',
      );
      assert.ok(withOverlay.host, 'the withOverlay arm attaches its host');
      assert.equal(
        withOverlay.document.getElementById(RETIRED_MARKER_ID),
        null,
        'and the retired marker is not there either',
      );
    } finally {
      withoutOverlay.close();
      withOverlay.close();
    }
  });

  for (const bite of BITES) {
    it('reddens when ' + bite.name + ' (SC5)', () => {
      const withoutOverlay = bootArm({ overlay: false });
      const clean = bootArm({ overlay: true });
      const bitten = bootArm({ overlay: true, source: bittenOverlay(bite) });
      try {
        // Green before the bite: otherwise the bite would be credited with a pre-existing difference.
        assertSamePageFootprint(withoutOverlay, clean);

        const differences = differential(withoutOverlay, bitten);
        assert.ok(
          differences.length > 0,
          'the "' +
            bite.name +
            '" bite must redden the differential, and it read identical — the surface it should have moved is ' +
            bite.surface,
        );
        assert.ok(
          differences.some((difference) => difference.surface === bite.surface),
          'the "' +
            bite.name +
            '" bite must redden ' +
            bite.surface +
            '; it reddened ' +
            JSON.stringify(
              differences.map((difference) => difference.surface),
            ) +
            ' — ' +
            describeDifferences(differences),
        );
      } finally {
        withoutOverlay.close();
        clean.close();
        bitten.close();
      }
    });
  }
});

describe('the tool-element count across a second boot (SC4)', () => {
  it('leaves exactly one tool-created element, no marker id and a closed root that cannot be read back', () => {
    const withoutOverlay = bootArm({ overlay: false });
    const arm = bootArm({ overlay: true });
    try {
      // Both content scripts have booted at this point: the overlay's declaration, then the recorder.
      assert.deepEqual(
        arm.bootErrors,
        [],
        'the arm must boot every module cleanly',
      );
      assert.ok(arm.host, 'the withOverlay arm attaches its host');
      assert.equal(
        arm.host.shadowRoot,
        null,
        'the root is closed, so it cannot be read back before the second boot either',
      );
      assert.equal(
        secondBootOf(arm).toolElements,
        1,
        'one tool-created element before the second boot',
      );

      const createdBefore = arm.created.length;
      assert.doesNotThrow(
        () => arm.window.eval(OVERLAY),
        'a second boot must never throw into the page it inspects (N3)',
      );

      const after = secondBootOf(arm);
      assert.equal(
        after.toolElements,
        1,
        'the document still holds exactly one tool-created element (AR-3, E7)',
      );
      assert.equal(
        after.markerIdResolvesTo,
        null,
        'the retired marker id resolves to null and stays that way',
      );
      assert.equal(
        after.closedRootReadable,
        false,
        'the closed root cannot be read back, so the second run cannot adopt it',
      );
      assert.equal(
        arm.created.length - createdBefore,
        0,
        'the second boot creates no node',
      );
      assert.equal(
        arm.document.getElementById(HOST_ID),
        arm.host,
        "the first run's host is still the one host",
      );
      assert.equal(
        withoutOverlay.document.getElementById(HOST_ID),
        null,
        'and the withoutOverlay arm never had one',
      );
    } finally {
      withoutOverlay.close();
      arm.close();
    }
  });
});

describe('the recorded footprint (SC5)', () => {
  it('refuses an absent recording instead of skipping', () => {
    assert.throws(
      () =>
        readRecording(
          new URL('./m022-page-footprint-absent.json', import.meta.url),
        ),
      /absent or unreadable[\s\S]*research\/raw\/m022-page-footprint\.json[\s\S]*node --test extension\/page-footprint\.test\.mjs/,
      'a missing recording must fail naming the command that produces it',
    );
  });

  it('refuses a recording that disagrees, field by field', () => {
    const recorded = readRecording();
    const measured = measureMilestone();
    const doctored = JSON.parse(JSON.stringify(recorded));
    assert.equal(
      doctored.angularVersion,
      measured.angularVersion,
      'the recording must be current before it is doctored here',
    );
    doctored.angularVersion = '21.0.0';
    doctored.commands.test = 'npx vitest run';
    doctored.arms.withOverlay.profilerSubscriberCount =
      measured.arms.withOverlay.profilerSubscriberCount + 1;
    doctored.arms.withoutOverlay.featureRecord.getSignalGraph =
      !measured.arms.withoutOverlay.featureRecord.getSignalGraph;
    doctored.secondBoot.toolElements = 2;

    const paths = recordingMismatches(doctored, measured).map(
      (mismatch) => mismatch.path,
    );
    for (const path of [
      'angularVersion',
      'commands',
      'arms.withOverlay',
      'arms.withoutOverlay',
      'secondBoot',
    ]) {
      assert.ok(
        paths.includes(path),
        'a doctored ' +
          path +
          ' must be refused by name; the refusal named ' +
          JSON.stringify(paths),
      );
    }
  });

  it('matches research/raw/m022-page-footprint.json with what it measures', () => {
    const measured = measureMilestone();

    // The measurement the recording is written from, printed so a stale recording is re-recorded from
    // evidence and not from a guess. The one-line summary is always printed; the whole block only when
    // the recording has to be written again, so a green run stays readable.
    console.log(
      'page-footprint: ' +
        JSON.stringify({
          angularVersion: measured.angularVersion,
          subscriberCounts: {
            withoutOverlay:
              measured.arms.withoutOverlay.profilerSubscriberCount,
            withOverlay: measured.arms.withOverlay.profilerSubscriberCount,
          },
          featureRecordIdentical:
            JSON.stringify(measured.arms.withoutOverlay.featureRecord) ===
            JSON.stringify(measured.arms.withOverlay.featureRecord),
          identical: measured.differential.identical,
          toolElementsAfterSecondBoot: measured.secondBoot.toolElements,
        }),
    );

    let recorded;
    try {
      recorded = readRecording();
    } catch (error) {
      console.log(measuredBlock(measured));
      throw error;
    }
    const mismatches = recordingMismatches(recorded, measured);
    if (mismatches.length > 0) console.log(measuredBlock(measured));
    assert.deepEqual(
      mismatches,
      [],
      "research/raw/m022-page-footprint.json disagrees with this file's measurement — re-record it from the block this test printed; the fields that differ are: " +
        describeMismatches(mismatches),
    );
    assert.equal(
      measured.differential.identical,
      true,
      'and the measurement the recording claims is the one the differential finds',
    );
  });
});

describe("the manifest's declaration order this harness models", () => {
  it("loads the overlay's shared modules before overlay.js at document_start, and the recorder at document_idle", () => {
    const declarations = MANIFEST.content_scripts || [];
    const overlayEntry = declarations.find((entry) =>
      (entry.js || []).includes('overlay.js'),
    );
    assert.ok(
      overlayEntry,
      'the manifest must declare overlay.js; without it the withOverlay arm models nothing',
    );
    assert.equal(
      overlayEntry.run_at,
      'document_start',
      'the overlay attaches at document_start',
    );
    assert.deepEqual(
      overlayEntry.js,
      ['observer-filter.js', 'overlay-geometry.js', 'overlay.js'],
      'the shared modules load before overlay.js, which is the order this harness boots',
    );
    assert.equal(
      overlayEntry.world,
      undefined,
      'and in the ISOLATED world (AR-2)',
    );

    const recorderEntry = declarations.find((entry) =>
      (entry.js || []).includes('agent-main.js'),
    );
    assert.ok(
      recorderEntry,
      'the manifest must declare the page-realm recorder',
    );
    assert.equal(
      recorderEntry.world,
      'MAIN',
      'the recorder is the MAIN-world script (decision 4)',
    );
    assert.equal(
      recorderEntry.run_at,
      'document_idle',
      "and boots after the overlay's document_start entry",
    );
  });
});
