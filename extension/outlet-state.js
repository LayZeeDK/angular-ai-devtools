// outlet-state.js — the record M062 joins against: per activated route, the outlet the route
// configuration requests, the outlet name the router state matched, and the route path.
//
// Measured at this head: `grep -ri "\boutlet\b" extension/` returned 0 matches before this file, so
// no record in the tree carried an outlet name. The nearest value, `componentName: 'RouterOutlet'` in
// the demo panel record, names a component; the router record M033 reads
// (`extension/router-diagnostic.js`) carries the configured path set and the unmatched URL segment
// only. So the outlet name is a new field on a new record (C3), written here, rather than a wider
// reading of that one — and a name is a recorded field or it is absent (N1), never a value inferred
// from what the page rendered.
//
// An unnamed outlet and the outlet explicitly named `primary` are the same outlet (C2). So this
// module records what the router stated and normalises nothing away: a route configuration that
// states no outlet leaves `requested` null with `outlet-not-requested` named in `absences`, and a
// state whose snapshot states no outlet leaves `matched` null with `outlet-name-absent` named.
// Reporting `primary` for an absent request is the join's own stated decision (M062 T002), never this
// record's silent completion of a field the state did not carry.
//
// This module reads the router state it is given and nothing else (N1): it imports nothing, installs
// no observer and no tap, and publishes no global beyond the one namespace below. It reads no page
// surface — no selector, no computed style, no element — so a bare `node:vm` context with nothing in
// it runs it, which is what its suite proves.
//
// Input shapes, as the agent that already subscribes to the router's stream holds them
// (`extension/agent-main.js` reads `event.state.root` and then `event.snapshot`):
//
//   { state: { root: node } }   the router state snapshot a navigation event carries
//   { snapshot: node }          the activated snapshot an activation event carries
//   { root: node }              a router state snapshot handed in directly
//   node                        an `ActivatedRouteSnapshot` itself
//
//   node = {
//     outlet?: string,                  the outlet name the router state matched
//     routeConfig?: {                   the route this snapshot was activated from
//       path?: string,                  the configured path, '' for a componentless route
//       outlet?: string,                the outlet the route configuration requests
//     } | null,
//     children?: node[],                one activated child per outlet, in declaration order
//     firstChild?: node | null,         the primary child, for a shape carrying no `children`
//   }
//
// A node is recognized as an activated-route snapshot by a field only a snapshot carries
// (`routeConfig`, `children`, `firstChild`, `pathFromRoot`, `params`, `paramMap`, `data`, `title`) —
// not by `url`, which a router state snapshot carries too. An object carrying nothing but an outlet
// name is not a snapshot, and is reported as no chain rather than read as one.
//
// The record is one object, in every state, with exactly these three fields:
//
//   {
//     state: "outlet-recorded" | "outlet-absent" | "cannot-tell",
//     routes: [{ requested, matched, path }, …],   the root first, then depth-first in the order
//                                                  the route's outlets are declared
//     absences: [{ field, path, reason }, …],      every absent field, named
//   }
//
//   requested   the outlet name the route configuration requests, or null. `primary` appears here
//               only when the configuration states it: an unnamed outlet requests nothing, and the
//               absence is named instead.
//   matched     the outlet name the router state matched for this route, or null when the state
//               carries none. Never completed from a neighbouring route, from a position in the
//               chain or from the rendered tree (N1, N2).
//   path        the configured path of the route, `''` for a componentless route and null when the
//               route carries no configuration at all.
//
//   state       "outlet-recorded" when every activated route's `matched` was read from the state,
//               "outlet-absent" when at least one was not (the record still states what it read),
//               and "cannot-tell" when the value carried no activated-route chain to reduce.
//
//   absences    one entry per absent field: `field` is "route" (no chain at all), "requested",
//               "matched" or "path"; `path` is the configured path of the route whose field is
//               absent, null when the path itself is what is absent; `reason` is one of the tokens
//               the namespace exports. An absence is a named hole, never a filled field.
(function () {
  'use strict';

  const OUTLET_RECORDED = 'outlet-recorded';
  const OUTLET_ABSENT = 'outlet-absent';
  const CANNOT_TELL = 'cannot-tell';

  const OUTLET_NOT_REQUESTED = 'outlet-not-requested';
  const OUTLET_NAME_ABSENT = 'outlet-name-absent';
  const OUTLET_NAME_EMPTY = 'outlet-name-empty';
  const ROUTE_CONFIG_ABSENT = 'route-config-absent';
  const PATH_ABSENT = 'path-absent';
  const NO_ROUTE_CHAIN = 'no-route-chain';
  const CHAIN_TRUNCATED = 'chain-truncated';

  const STATES = [OUTLET_RECORDED, OUTLET_ABSENT, CANNOT_TELL];
  const ABSENCES = [
    OUTLET_NOT_REQUESTED,
    OUTLET_NAME_ABSENT,
    OUTLET_NAME_EMPTY,
    ROUTE_CONFIG_ABSENT,
    PATH_ABSENT,
    NO_ROUTE_CHAIN,
    CHAIN_TRUNCATED,
  ];
  const ROUTE_FIELDS = ['requested', 'matched', 'path'];

  // The fields only an `ActivatedRouteSnapshot` carries. `url` is deliberately not one of them: a
  // router state snapshot carries a `url` too, so it separates nothing. An `outlet` name on its own
  // is not a snapshot either, so a lone name is never read as a route.
  const NODE_FIELDS = [
    'routeConfig',
    'children',
    'firstChild',
    'pathFromRoot',
    'params',
    'paramMap',
    'data',
    'title',
  ];

  // Snapshots read from one router state. Angular's own chains are single digits deep; a page-health
  // guard rather than a curation, and what keeps a cyclic chain a truncated record instead of a hang.
  const ROUTE_LIMIT = 64;

  // One field, read without letting a hostile getter throw into the reader (the function throws on
  // no input, so a throwing payload is an absent field and never an exception).
  function field(object, key) {
    if (!object || typeof object !== 'object') return undefined;
    try {
      return object[key];
    } catch (error) {
      return undefined;
    }
  }

  function absent(fieldName, path, reason) {
    return { field: fieldName, path: path, reason: reason };
  }

  // The name a field states, as stated. `null` with a reason when the field is not a string, and
  // `null` with `outlet-name-empty` when it states the empty string — an empty name is no name, so it
  // is recorded as the absence it is rather than completed into one.
  function readName(value, absentReason) {
    if (typeof value !== 'string') return { name: null, reason: absentReason };
    if (value === '') return { name: null, reason: OUTLET_NAME_EMPTY };
    return { name: value, reason: null };
  }

  function isConfig(value) {
    return !!value && typeof value === 'object';
  }

  function isNode(value) {
    if (!value || typeof value !== 'object') return false;
    for (let i = 0; i < NODE_FIELDS.length; i += 1) {
      if (field(value, NODE_FIELDS[i]) !== undefined) return true;
    }
    return false;
  }

  // The root of the chain, in the shapes the agent's own read accepts (`routerSnapshotOf` reads
  // `event.state.root`, then `event.snapshot`): an activated snapshot handed in directly answers
  // itself, an event answers the snapshot it carries, and a router state snapshot answers its own
  // `root`. A node is tested first because an activated snapshot carries its own `root`
  // back-reference, which must not be mistaken for the wrapper.
  function rootOf(value) {
    if (isNode(value)) return value;
    const eventState = field(value, 'state');
    const eventRoot = field(eventState, 'root');
    if (eventRoot && typeof eventRoot === 'object') return eventRoot;
    const snapshot = field(value, 'snapshot');
    if (snapshot && typeof snapshot === 'object') return snapshot;
    const ownRoot = field(value, 'root');
    if (ownRoot && typeof ownRoot === 'object') return ownRoot;
    return value;
  }

  // One activated route reduced to the three fields the record carries, plus the absences that
  // reduction found. The requested name comes from the route configuration and the matched name from
  // the router state: two sources, read separately, so a route whose configuration was renamed after
  // it was activated shows both names rather than one name read twice.
  function reduceRoute(node) {
    const config = field(node, 'routeConfig');
    const configPath = field(config, 'path');
    const path = typeof configPath === 'string' ? configPath : null;

    const requested = isConfig(config)
      ? readName(field(config, 'outlet'), OUTLET_NOT_REQUESTED)
      : readName(undefined, ROUTE_CONFIG_ABSENT);
    const matched = readName(field(node, 'outlet'), OUTLET_NAME_ABSENT);

    const absences = [];
    if (requested.reason !== null) {
      absences.push(absent('requested', path, requested.reason));
    }
    if (matched.reason !== null) {
      absences.push(absent('matched', path, matched.reason));
    }
    if (path === null) {
      absences.push(absent('path', null, PATH_ABSENT));
    }

    return {
      route: {
        requested: requested.name,
        matched: matched.name,
        path: path,
      },
      absences: absences,
    };
  }

  // The activated children of one node, in declaration order: every outlet's chain, not only the
  // primary one, so two outlets declared on one route are both named and neither collapses into the
  // other. A shape carrying no `children` list answers its own `firstChild`.
  function childrenOf(node) {
    const children = field(node, 'children');
    const listed = [];
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i += 1) {
        if (children[i] && typeof children[i] === 'object')
          listed.push(children[i]);
      }
    }
    if (listed.length > 0) return listed;
    const firstChild = field(node, 'firstChild');
    return firstChild && typeof firstChild === 'object' ? [firstChild] : [];
  }

  // Depth-first in declaration order, without recursion: a chain of snapshots is a tree, and a
  // reducer that recursed would turn a deep one into a stack.
  function chainOf(root) {
    const nodes = [];
    const pending = [root];
    while (pending.length > 0 && nodes.length < ROUTE_LIMIT) {
      const node = pending.shift();
      nodes.push(node);
      const children = childrenOf(node);
      for (let i = children.length - 1; i >= 0; i -= 1)
        pending.unshift(children[i]);
    }
    return { nodes: nodes, truncated: pending.length > 0 };
  }

  function outletState(state) {
    const root = rootOf(state);
    if (!isNode(root)) {
      return {
        state: CANNOT_TELL,
        routes: [],
        absences: [absent('route', null, NO_ROUTE_CHAIN)],
      };
    }

    const chain = chainOf(root);
    const routes = [];
    const absences = [];
    let matchedAbsent = false;
    for (let i = 0; i < chain.nodes.length; i += 1) {
      const reduced = reduceRoute(chain.nodes[i]);
      routes.push(reduced.route);
      for (let j = 0; j < reduced.absences.length; j += 1) {
        absences.push(reduced.absences[j]);
      }
      if (reduced.route.matched === null) matchedAbsent = true;
    }
    if (chain.truncated) absences.push(absent('route', null, CHAIN_TRUNCATED));

    return {
      state: matchedAbsent ? OUTLET_ABSENT : OUTLET_RECORDED,
      routes: routes,
      absences: absences,
    };
  }

  const namespace = {
    outletState: outletState,
    STATES: STATES,
    ABSENCES: ABSENCES,
    ROUTE_FIELDS: ROUTE_FIELDS,
  };

  const g = globalThis;
  if (g.angularAiOutletState) {
    Object.assign(g.angularAiOutletState, namespace);
  } else {
    g.angularAiOutletState = namespace;
  }
})();
