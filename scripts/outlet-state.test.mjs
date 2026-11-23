// M062 T001 — the outlet record: the outlet each activated route requests, the outlet name the
// router state matched, and the route path (INTENT.md SC1, SC2, SC3; AC1-AC3; held-out edge E5).
//
// What this suite measures. `extension/outlet-state.js` reduces the router state the page agent
// already holds to `{ requested, matched, path }` per activated route. This file holds it to the
// three criteria that record owns, and every one of them is proved with a mutant that has to redden
// the pin and name the field that moved — an assertion a broken behaviour would still pass is not
// evidence, so each test states its own red half:
//
//   SC3  no other module under `extension/` produces an outlet name. The pin is a scan of the tree;
//        the mutant plants a second reader in a directory the same scan reads, and the red names
//        the file it found.
//   SC1  a route that declares a second named outlet yields `requested`, `matched` and `path`.
//        Mutants: the outlet is renamed in the route configuration (the field that moves is
//        `requested`), `requested` is read from the state instead of the configuration, and
//        `matched` is read from the configuration instead of the state.
//   SC2  an outlet the state does not carry leaves `matched` absent, with the absence named. The
//        mutant fills `matched` from a selector over the rendered tree and reddens the absence.
//
// Purity is measured the way the other readers' suites measure it: the module is loaded in a bare
// `node:vm` context with no page surface in it, and nothing in this file hands it one except the
// mutant that is supposed to use one.
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const MODULE_URL = new URL('../extension/outlet-state.js', import.meta.url);
const SRC = readFileSync(MODULE_URL, 'utf8');
const EXTENSION_DIR = fileURLToPath(new URL('../extension/', import.meta.url));
const OWN_MODULE = 'outlet-state.js';
const SECOND_READER_FILE = 'outlet-mirror.js';

// The names the fixture's route configurations and snapshots state, and the renamed one its mutant
// states, written once so a red names the value rather than a literal nobody can check.
const PRIMARY = 'primary';
const SIDEBAR = 'sidebar';
const SETTINGS = 'settings';
const ASIDE = 'aside';

// Depth-first positions in the fixture's chain (below), named so an assertion reads as a route.
const ROOT = 0;
const CONTRACT = 1;
const LIST = 2;
const SIDEBAR_ROUTE = 3;

/** Loads a module source in a context holding nothing but what the caller hands it. */
function load(source, globals) {
  const context = createContext(globals ?? {});
  runInContext(source, context);
  return { api: context.angularAiOutletState, context: context };
}

function loadBare(globals) {
  const loaded = load(SRC, globals);
  assert.ok(
    loaded.api && typeof loaded.api.outletState === 'function',
    'the module must publish outletState on the one namespace it installs',
  );
  return loaded;
}

/** A record as it crosses the boundary: plain values, the way the panel will receive it. */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/** A value as a message may name it, without asking it to convert itself. */
function label(value) {
  const written = JSON.stringify(value);
  return written === undefined ? String(value) : written;
}

/** The one error the assertion under test threw; a pin that did not redden is its own failure. */
function failureOf(run) {
  try {
    run();
  } catch (error) {
    return error;
  }
  throw new Error('the assertion under test did not redden the mutant');
}

/** A copy of the module with one anchored substitution, refused unless the anchor is unique. */
function mutatedSource(anchor, replacement) {
  const occurrences = SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `the mutant anchor ${JSON.stringify(anchor)} must appear once in extension/${OWN_MODULE}; it appears ${occurrences} time(s) — restate the mutant instead of deleting it`,
  );
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(mutated, SRC, 'the mutation must change the module');
  return mutated;
}

/**
 * One activated-route snapshot, in the fields Angular's own `ActivatedRouteSnapshot` carries: the
 * outlet name the router state matched, the route configuration it was activated from, and its
 * children — one per outlet the enclosing component's template declares, in declaration order.
 */
function activatedRoute(config, outlet, children) {
  const list = children ?? [];
  return {
    outlet: outlet,
    routeConfig: config,
    url: [],
    params: {},
    data: {},
    pathFromRoot: [],
    firstChild: list.length > 0 ? list[0] : null,
    children: list,
  };
}

/**
 * The router state this milestone's verification target produces: the app component's componentless
 * root, whose template declares two outlets the router filled — the primary chain
 * (`contract` -> `list`, the shape T001 measured on the portal as `[null, "contract", "", "list"]`)
 * and a second, named outlet `sidebar` beside it, whose route configuration requests `sidebar` and
 * whose snapshot the state matched as `sidebar`.
 */
function routerState() {
  return {
    state: {
      root: activatedRoute(null, PRIMARY, [
        activatedRoute({ path: 'contract' }, PRIMARY, [
          activatedRoute({ path: 'list', outlet: PRIMARY }, PRIMARY, []),
        ]),
        activatedRoute({ path: SETTINGS, outlet: SIDEBAR }, SIDEBAR, []),
      ]),
    },
  };
}

/**
 * The SC1 mutant, as a review describes it: the outlet is renamed in the route configuration and
 * nowhere else, so the route asked for one name and the state matched another. Only
 * `routeConfig.outlet` moves; every snapshot keeps the name the router matched.
 */
function renameConfiguredOutlet(state, from, to) {
  let renamed = 0;
  const walk = (node) => {
    const config = node.routeConfig;
    if (config && config.outlet === from) {
      config.outlet = to;
      renamed += 1;
    }
    for (const child of node.children) walk(child);
  };
  walk(state.state.root);
  assert.equal(
    renamed,
    1,
    `the fixture must declare the outlet ${JSON.stringify(from)} on exactly one route configuration; it declares it on ${renamed}`,
  );
  return state;
}

/** The fixture with the second outlet's snapshot carrying no outlet name at all. */
function routerStateWithoutMatchedOutlet() {
  const state = routerState();
  delete state.state.root.children[1].outlet;
  return state;
}

// ---------------------------------------------------------------------------------------------
// SC3 — the record is the only source of an outlet name
// ---------------------------------------------------------------------------------------------

/**
 * The identity of a producer: the exported reduction and the namespace it installs. A module that
 * carried either is a second place an outlet name comes from.
 */
const PRODUCER_MARKERS = ['angularAiOutletState', 'outletState'];

/**
 * The second reader SC3's mutant plants: it installs the same namespace and reduces the same state,
 * so it is exactly the "one more place a name comes from" the scan is meant to catch.
 */
const SECOND_READER = `(function () {
  'use strict';
  function outletState(state) {
    return { state: 'cannot-tell', routes: [], absences: [] };
  }
  globalThis.angularAiOutletState = { outletState: outletState };
})();
`;

/** The authored modules in a directory: no built output, no suite, in a stable order. */
function authoredModules(directory) {
  return readdirSync(directory)
    .filter((name) => name.endsWith('.js') && !/\.(test|spec)\.js$/.test(name))
    .sort((left, right) => left.localeCompare(right, 'en'));
}

/** The modules of a directory that produce an outlet record, the record module itself aside. */
function producersIn(directory, own) {
  return authoredModules(directory)
    .filter((name) => name !== own)
    .filter((name) => {
      const text = readFileSync(join(directory, name), 'utf8');
      return PRODUCER_MARKERS.some((marker) => text.includes(marker));
    });
}

describe('SC3 — the outlet record is the only source of an outlet name', () => {
  it('is the only module under extension/ that produces one, and a second reader reddens the scan', () => {
    // The scan is not vacuous: with the record module not excluded it finds it, so the empty list
    // below is a fact about this tree rather than about a directory nothing was read from.
    assert.deepEqual(
      producersIn(EXTENSION_DIR, null),
      [OWN_MODULE],
      'the scan must find extension/outlet-state.js when it is not excluded, or it is reading nothing',
    );
    assert.deepEqual(
      producersIn(EXTENSION_DIR, OWN_MODULE),
      [],
      'no module under extension/ but outlet-state.js produces an outlet record: an outlet name is a recorded field of this record or it is absent (N1, N3)',
    );
  });

  it('SC3 mutant — a second reader beside the shipped modules reddens the scan and is named', (t) => {
    const directory = mkdtempSync(join(tmpdir(), 'outlet-state-'));
    try {
      // The mutant tree is the shipped tree, module for module, plus one reader. The only
      // difference between the scan above and this one is therefore the planted file.
      const shipped = authoredModules(EXTENSION_DIR);
      for (const name of shipped) {
        writeFileSync(
          join(directory, name),
          readFileSync(join(EXTENSION_DIR, name)),
        );
      }
      writeFileSync(join(directory, SECOND_READER_FILE), SECOND_READER);
      assert.equal(
        authoredModules(directory).length,
        shipped.length + 1,
        `the mutant tree must carry every shipped module plus one; it carries ${authoredModules(directory).length} where the tree carries ${shipped.length}`,
      );

      const found = producersIn(directory, OWN_MODULE);
      assert.deepEqual(
        found,
        [SECOND_READER_FILE],
        'the scan must find the planted second reader and no shipped module, so the red below is about the reader rather than about the directory',
      );

      const failure = failureOf(() =>
        assert.deepEqual(
          found,
          [],
          `a second reader produces an outlet name: ${JSON.stringify(found)} — the record is the only source (N1, N3)`,
        ),
      );
      assert.match(failure.message, /outlet-mirror\.js/);
      t.diagnostic(`SC3 mutant red: ${failure.message.split('\n')[0]}`);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------------------------
// SC1 — the requested and matched outlet, and the path, for a route with a second named outlet
// ---------------------------------------------------------------------------------------------

describe('SC1 — a route that declares a second named outlet names both names and the path', () => {
  it('reduces every activated route to requested, matched and path, in declaration order', () => {
    const { api } = loadBare();
    const record = host(api.outletState(routerState()));

    assert.deepEqual(
      Object.keys(record).sort(),
      ['absences', 'routes', 'state'],
      'the record carries exactly the three fields the join reads (state, routes, absences)',
    );
    assert.equal(
      record.state,
      'outlet-recorded',
      'every route in this state carried a matched outlet name, so the record is `outlet-recorded`',
    );
    assert.deepEqual(
      record.routes.map((route) => route.matched),
      [PRIMARY, PRIMARY, PRIMARY, SIDEBAR],
      'both outlets the root declares are named, in declaration order, and the second one never collapses into the first (E2)',
    );
    assert.deepEqual(
      record.routes.map((route) => route.path),
      [null, 'contract', 'list', SETTINGS],
      'each route carries its own configured path, and null where the route carries no configuration',
    );

    const aux = record.routes[SIDEBAR_ROUTE];
    assert.deepEqual(
      Object.keys(aux).sort(),
      ['matched', 'path', 'requested'],
      'one activated route reduces to exactly requested, matched and path',
    );
    assert.equal(
      aux.requested,
      SIDEBAR,
      'requested: the outlet the route configuration requests',
    );
    assert.equal(
      aux.matched,
      SIDEBAR,
      'matched: the outlet name the router state matched',
    );
    assert.equal(aux.path, SETTINGS, 'path: the configured route path');
  });

  it('SC1 mutant — renaming the outlet in the route configuration reddens the pin, naming `requested`', (t) => {
    const { api } = loadBare();
    const renamed = host(
      api.outletState(renameConfiguredOutlet(routerState(), SIDEBAR, ASIDE)),
    );
    const aux = renamed.routes[SIDEBAR_ROUTE];

    // The two sources are read separately: only the configuration moved.
    assert.equal(
      aux.matched,
      SIDEBAR,
      'matched: the router state still matched "sidebar" after the configuration was renamed',
    );
    assert.equal(
      aux.requested,
      ASIDE,
      'requested: the renamed configuration now requests "aside"',
    );

    const failure = failureOf(() =>
      assert.equal(
        aux.requested,
        SIDEBAR,
        `requested moved: the record names requested ${JSON.stringify(aux.requested)} where the route configuration of ${JSON.stringify(SETTINGS)} requests ${JSON.stringify(SIDEBAR)}`,
      ),
    );
    assert.match(failure.message, /requested moved/);
    assert.match(failure.message, /"aside"/);
    assert.match(failure.message, /"sidebar"/);
    t.diagnostic(`SC1 mutant red: ${failure.message.split('\n')[0]}`);
  });

  it('SC1 mutant — reading `requested` from the state instead of the configuration reddens the pin', (t) => {
    const source = mutatedSource(
      "      ? readName(field(config, 'outlet'), OUTLET_NOT_REQUESTED)",
      "      ? readName(field(node, 'outlet'), OUTLET_NOT_REQUESTED)",
    );
    const { api } = load(source);
    const renamed = host(
      api.outletState(renameConfiguredOutlet(routerState(), SIDEBAR, ASIDE)),
    );
    const read = renamed.routes[SIDEBAR_ROUTE].requested;
    assert.equal(
      read,
      SIDEBAR,
      "the mutant reads requested from the state, so the configuration's name is lost — the mutant bites",
    );

    const failure = failureOf(() =>
      assert.equal(
        read,
        ASIDE,
        `requested moved: the record names requested ${JSON.stringify(read)} where the route configuration requests ${JSON.stringify(ASIDE)} — requested is the configuration's name, never the state's`,
      ),
    );
    assert.match(failure.message, /requested moved/);
    assert.match(failure.message, /"sidebar"/);
    t.diagnostic(`SC1 mutant red: ${failure.message.split('\n')[0]}`);
  });

  it('SC1 mutant — reading `matched` from the route configuration instead of the state reddens the pin', (t) => {
    const source = mutatedSource(
      "    const matched = readName(field(node, 'outlet'), OUTLET_NAME_ABSENT);",
      "    const matched = readName(field(config, 'outlet'), OUTLET_NAME_ABSENT);",
    );
    const { api } = load(source);
    const renamed = host(
      api.outletState(renameConfiguredOutlet(routerState(), SIDEBAR, ASIDE)),
    );
    const read = renamed.routes[SIDEBAR_ROUTE].matched;
    assert.equal(
      read,
      ASIDE,
      "the mutant reads matched from the route configuration, so the state's name is lost — the mutant bites",
    );

    const failure = failureOf(() =>
      assert.equal(
        read,
        SIDEBAR,
        `matched moved: the record names matched ${JSON.stringify(read)} where the router state matched ${JSON.stringify(SIDEBAR)} — matched is the state's name, never the configuration's`,
      ),
    );
    assert.match(failure.message, /matched moved/);
    assert.match(failure.message, /"aside"/);
    t.diagnostic(`SC1 mutant red: ${failure.message.split('\n')[0]}`);
  });
});

// ---------------------------------------------------------------------------------------------
// SC2 — an outlet the state does not carry is an absence, never the rendered tree
// ---------------------------------------------------------------------------------------------

describe('SC2 — an outlet the router state does not carry leaves matched absent', () => {
  it('names the absence for that route and never borrows the nearest outlet in the tree', () => {
    const { api } = loadBare();
    const record = host(api.outletState(routerStateWithoutMatchedOutlet()));

    assert.equal(
      record.state,
      'outlet-absent',
      'a state that carries no matched outlet name for one route is reported as absent, not as recorded',
    );
    assert.deepEqual(
      record.routes.map((route) => route.matched),
      [PRIMARY, PRIMARY, PRIMARY, null],
      'matched must be absent for the route whose snapshot carries no outlet name, and nothing may be borrowed for it',
    );
    const aux = record.routes[SIDEBAR_ROUTE];
    assert.equal(
      aux.requested,
      SIDEBAR,
      "requested is still the configuration's own name",
    );
    assert.equal(
      aux.path,
      SETTINGS,
      "and the path is still the route's own path",
    );
    assert.deepEqual(
      record.absences.filter((absence) => absence.field === 'matched'),
      [{ field: 'matched', path: SETTINGS, reason: 'outlet-name-absent' }],
      'the absence is named with the field, the route path and the reason — an absence is never a filled field',
    );
  });

  it('SC2 mutant — filling `matched` from a selector over the rendered tree reddens the absence, naming `matched`', (t) => {
    const source = mutatedSource(
      "    const matched = readName(field(node, 'outlet'), OUTLET_NAME_ABSENT);",
      "    const rendered = document.querySelector('[data-outlet]');\n    const matched = readName(rendered && rendered.getAttribute('name'), OUTLET_NAME_ABSENT);",
    );
    const { api } = load(source, {
      document: {
        querySelector: () => ({ getAttribute: () => SIDEBAR }),
      },
    });
    const record = host(api.outletState(routerStateWithoutMatchedOutlet()));
    const read = record.routes[SIDEBAR_ROUTE].matched;
    assert.equal(
      read,
      SIDEBAR,
      'the mutant fills matched from the rendered tree, which is the behaviour the pin below must catch',
    );

    const failure = failureOf(() =>
      assert.equal(
        read,
        null,
        `matched moved: the record names matched ${JSON.stringify(read)} from the rendered tree where the router state carries no outlet name — matched is the state's name or it is absent (N1, N2)`,
      ),
    );
    assert.match(failure.message, /matched moved/);
    assert.match(failure.message, /"sidebar"/);
    t.diagnostic(`SC2 mutant red: ${failure.message.split('\n')[0]}`);

    assert.deepEqual(
      record.absences.filter((absence) => absence.field === 'matched'),
      [],
      'and the named absence the unmutated module states is gone, which is the same red seen from the other side',
    );
  });
});

// ---------------------------------------------------------------------------------------------
// The record states what the router stated, and nothing else
// ---------------------------------------------------------------------------------------------

describe('an unnamed outlet and one named primary are the same outlet, kept as stated', () => {
  it('leaves requested absent for the unnamed outlet and names it where the configuration states it', () => {
    const { api } = loadBare();
    const record = host(api.outletState(routerState()));

    assert.equal(
      record.routes[CONTRACT].requested,
      null,
      'the contract route declares no outlet, so nothing is requested and nothing is invented',
    );
    assert.equal(
      record.routes[CONTRACT].matched,
      PRIMARY,
      'and the state matched it to primary, which is the same outlet',
    );
    assert.equal(
      record.routes[LIST].requested,
      PRIMARY,
      'the list route states primary explicitly, so requested says so',
    );
    assert.equal(
      record.routes[CONTRACT].matched,
      record.routes[LIST].matched,
      'both statements name the same outlet, so the record keeps both rather than normalising one into the other (C2)',
    );
    assert.deepEqual(
      record.absences.find(
        (absence) =>
          absence.field === 'requested' && absence.path === 'contract',
      ),
      { field: 'requested', path: 'contract', reason: 'outlet-not-requested' },
      "the absent request is named as an absence, not filled with primary: reporting primary is the join's stated decision (T002), not this record's",
    );
  });
});

describe('the record names absences from a closed set and reads no page surface', () => {
  it('publishes the states, the route fields and the absence tokens it uses', () => {
    const { api } = loadBare();
    assert.deepEqual(host(api.STATES), [
      'outlet-recorded',
      'outlet-absent',
      'cannot-tell',
    ]);
    assert.deepEqual(host(api.ROUTE_FIELDS), ['requested', 'matched', 'path']);
    const record = host(api.outletState(routerStateWithoutMatchedOutlet()));
    for (const absence of record.absences) {
      assert.ok(
        api.ABSENCES.includes(absence.reason),
        `the record names the absence ${JSON.stringify(absence.reason)} and the namespace does not export it`,
      );
      assert.ok(
        ['route', 'requested', 'matched', 'path'].includes(absence.field),
        `the record names the field ${JSON.stringify(absence.field)}, which is not one of the record's fields`,
      );
    }
  });

  it('loads in a context with no page surface and needs none', () => {
    const loaded = loadBare();
    assert.equal(loaded.context.document, undefined);
    assert.equal(loaded.context.window, undefined);
    assert.equal(loaded.context.performance, undefined);
    assert.equal(loaded.context.console, undefined);
    assert.equal(typeof loaded.api.outletState, 'function');
  });
});

describe('no input makes the function throw', () => {
  it('answers cannot-tell for every unreadable value rather than throwing', () => {
    const { api } = loadBare();
    const unreadable = [
      undefined,
      null,
      0,
      42,
      NaN,
      '',
      PRIMARY,
      true,
      [],
      {},
      { state: null },
      { state: {} },
      { snapshot: 7 },
      { outlet: SIDEBAR },
      Object.create(null),
      new Date(0),
    ];
    for (const input of unreadable) {
      let record;
      try {
        record = host(api.outletState(input));
      } catch (error) {
        assert.fail(
          `outletState(${label(input)}) must not throw, and it threw ${String(error && error.message)}`,
        );
      }
      assert.equal(
        record.state,
        'cannot-tell',
        `outletState(${label(input)}) must answer cannot-tell: the value carries no activated-route chain`,
      );
      assert.deepEqual(
        record.routes,
        [],
        'and no route record is invented for a value that carried no chain',
      );
      assert.deepEqual(
        record.absences,
        [{ field: 'route', path: null, reason: 'no-route-chain' }],
        'the absence of a chain is named, which is what `cannot-tell` means here',
      );
    }
  });

  it('reads a payload whose getters throw as an absent field, never as an exception', () => {
    const { api } = loadBare();
    const hostile = {
      routeConfig: {
        get outlet() {
          throw new Error('hostile getter');
        },
        path: SETTINGS,
      },
      get outlet() {
        throw new Error('hostile getter');
      },
      children: [],
    };
    const record = host(api.outletState(hostile));
    assert.equal(record.state, 'outlet-absent');
    assert.deepEqual(record.routes[0], {
      requested: null,
      matched: null,
      path: SETTINGS,
    });
    assert.deepEqual(record.absences, [
      { field: 'requested', path: SETTINGS, reason: 'outlet-not-requested' },
      { field: 'matched', path: SETTINGS, reason: 'outlet-name-absent' },
    ]);
  });

  it('reads a cyclic chain as a truncated record rather than hanging', () => {
    const { api } = loadBare();
    const node = activatedRoute({ path: 'loop' }, PRIMARY, []);
    node.children = [node];
    node.firstChild = node;
    const record = host(api.outletState(node));
    assert.equal(record.routes.length, 64, 'the chain is read to its bound');
    assert.deepEqual(
      record.absences.filter((absence) => absence.reason === 'chain-truncated'),
      [{ field: 'route', path: null, reason: 'chain-truncated' }],
      'and the bound is named as an absence rather than passed over',
    );
  });
});
