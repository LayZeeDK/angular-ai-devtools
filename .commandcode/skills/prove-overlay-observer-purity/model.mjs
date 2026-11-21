// model.mjs — prove-overlay-observer-purity
//
// Claim (property): re-running extension/overlay.js in the same isolated world adds no second host,
// no second observer and never throws; and a mutation the tool itself causes never reaches its own
// observer as a page record.
//
// Harm: a second host is the duplicate overlay the page can see and never gets rid of (AR-3), and a
// tool record that survives the filter is fed to the picker's own logic as if the page had moved —
// the tool starts reacting to itself.
//
// Method: model check over a synthetic DOM. The real extension/observer-filter.js and
// extension/overlay.js are booted in a bare `node:vm` world (declaration order, as the manifest
// lists them), then the model enumerates injection sequences of 1..3 runs (the second and third
// are the SPA re-injection / extension reload case) and delivers every ordered batch of 1..3
// mutation records to the one registered observer. Records are drawn from six shapes: target ∈
// {documentElement, host, a closed-root child}, added/removed, tool-caused and page-caused, in
// every order.
//
// Asserted for every sequence and every batch:
//   P1 exactly one host element under document.documentElement, exactly one MutationObserver
//      instance, exactly one observe() call, and no throw from any injection;
//   P2 the records the observer passes on (its return value — notePageRecords' documented contract,
//      which the platform ignores but overlay.test.mjs reads) share no record with the batch's
//      tool-caused records: pageRecords ∩ toolRecords = ∅.
//
// Coverage (sync commit 7cbb1e6e, main): extension/overlay.js — the injection guard, the single
// observer and its filter callback (notePageRecords path); extension/observer-filter.js — isToolNode
// and isToolRecord in full. Move the sync commit forward only after re-running this model and
// confirming it still describes the code at the new commit.
//
// Run: node .commandcode/skills/prove-overlay-observer-purity/model.mjs   (exit 0 = pass, 1 = fail)

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const EXTENSION_DIR = fileURLToPath(
  new URL('../../../extension/', import.meta.url),
);
const FILTER_SRC = readFileSync(EXTENSION_DIR + 'observer-filter.js', 'utf8');
const OVERLAY_SRC = readFileSync(EXTENSION_DIR + 'overlay.js', 'utf8');
const HOST_ID = 'angular-ai-devtools-host';

// ---- The synthetic DOM ----------------------------------------------------------------
// Only the surface overlay.js and observer-filter.js touch at load time and through the observer
// callback. Closed roots read back as null (`host.shadowRoot`), like the platform; `contains` walks
// shadow-including ancestry, which is the rule the filter's own comment states ("the rule is about
// the host subtree, not about visibility").

function makeWorld() {
  const world = { elements: [], roots: [], observers: [], observeCalls: 0 };

  function makeElement(tag) {
    const el = {
      tagName: String(tag).toUpperCase(),
      id: '',
      style: {},
      parentNode: null,
      childNodes: [],
      shadowRoot: null,
      appendChild(child) {
        if (child.parentNode) child.parentNode.removeChild(child);
        child.parentNode = this;
        this.childNodes.push(child);
        return child;
      },
      removeChild(child) {
        const at = this.childNodes.indexOf(child);
        if (at >= 0) this.childNodes.splice(at, 1);
        child.parentNode = null;
        return child;
      },
      contains(node) {
        let cursor = node;
        while (cursor) {
          if (cursor === this) return true;
          cursor = cursor.parentNode;
        }
        return false;
      },
      attachShadow({ mode }) {
        const root = makeElement('#shadow-root');
        root.parentNode = this; // shadow-including ancestry crosses the boundary
        root.mode = mode;
        if (mode === 'open') el.shadowRoot = root;
        world.roots.push(root);
        return root;
      },
    };
    world.elements.push(el);
    return el;
  }

  const documentElement = makeElement('html');
  const body = makeElement('body');
  documentElement.appendChild(body);

  function findById(node, id) {
    if (node.id === id) return node;
    for (const child of node.childNodes) {
      const hit = findById(child, id);
      if (hit) return hit;
    }
    return null;
  }

  world.document = {
    documentElement,
    body,
    createElement: (tag) => makeElement(tag),
    getElementById: (id) => findById(documentElement, id),
  };
  world.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
  world.MutationObserver = class MutationObserver {
    constructor(callback) {
      this._callback = callback;
      world.observers.push(this);
    }
    observe() {
      world.observeCalls += 1;
    }
    disconnect() {}
    deliver(records) {
      return this._callback(records);
    }
  };
  world.hostsInLightTree = () => {
    const out = [];
    (function walk(node) {
      if (node.id === HOST_ID) out.push(node);
      node.childNodes.forEach(walk);
    })(documentElement);
    return out;
  };
  return world;
}

// One isolated world: observer-filter.js first, then overlay.js — the manifest's declaration order.
function inject(world) {
  const sandbox = {
    document: world.document,
    window: world.window,
    MutationObserver: world.MutationObserver,
    CustomEvent: function (type, options) {
      return { type, detail: options && options.detail };
    },
    console: { log: () => {}, error: () => {}, warn: () => {} },
  };
  const context = vm.createContext(sandbox);
  vm.runInContext(FILTER_SRC, context, { filename: 'observer-filter.js' });
  vm.runInContext(OVERLAY_SRC, context, { filename: 'overlay.js' });
}

// ---- The model's record shapes ---------------------------------------------------------
// Tool-caused: the record names DOM the tool itself moved — the host, or a node the tool created
// inside its own closed root (a stand-in for the picker's style/rect/label nodes). Page-caused: the
// record names only page DOM. TC is the shape the platform measures as never delivered
// (observer-filter.test.mjs pins that jsdom sends no record across a shadow boundary); the model
// enumerates it anyway, so the property holds whatever a browser delivers.
function recordShapes(world) {
  const root = world.roots[0];
  const closedChild = world.document.createElement('span');
  const closedChild2 = world.document.createElement('span');
  root.appendChild(closedChild);
  root.appendChild(closedChild2);
  const pageDiv = world.document.createElement('div');
  const pageDiv2 = world.document.createElement('div');
  world.document.body.appendChild(pageDiv);

  const host = world.document.getElementById(HOST_ID);
  const docEl = world.document.documentElement;
  return [
    {
      name: 'host insertion (target = the document element, host in addedNodes)',
      record: { target: docEl, addedNodes: [host], removedNodes: [] },
      tool: true,
    },
    {
      name: 'host removal (target = the document element, host in removedNodes)',
      record: { target: docEl, addedNodes: [], removedNodes: [host] },
      tool: true,
    },
    {
      name: 'closed-root child change (target = host)',
      record: { target: host, addedNodes: [], removedNodes: [closedChild] },
      tool: true,
    },
    {
      name: 'mutation inside the closed root (target = a closed-root child)',
      record: {
        target: closedChild,
        addedNodes: [closedChild2],
        removedNodes: [],
      },
      tool: true,
    },
    {
      name: 'page node insertion (target = the document element)',
      record: { target: docEl, addedNodes: [pageDiv], removedNodes: [] },
      tool: false,
    },
    {
      name: 'page node removal (target = body)',
      record: {
        target: world.document.body,
        addedNodes: [],
        removedNodes: [pageDiv2],
      },
      tool: false,
    },
  ];
}

// Every ordered batch of 1..3 records over the shapes.
function allBatches(shapes) {
  const batches = [];
  for (let length = 1; length <= 3; length += 1) {
    const index = [];
    (function walk(depth) {
      if (depth === length) {
        batches.push(index.map((i) => shapes[i]));
        return;
      }
      for (let i = 0; i < shapes.length; i += 1) {
        index.push(i);
        walk(depth + 1);
        index.pop();
      }
    })(0);
  }
  return batches;
}

// ---- The check -------------------------------------------------------------------------
const failures = [];
let injectionsChecked = 0;
let batchesChecked = 0;

for (const injectionCount of [1, 2, 3]) {
  const world = makeWorld();
  for (let run = 1; run <= injectionCount; run += 1) {
    try {
      inject(world); // a re-run is the SPA re-injection / extension reload case
    } catch (error) {
      failures.push(
        `injection ${run} of extension/overlay.js threw: ${error && error.message}`,
      );
      break;
    }
    injectionsChecked += 1;
    const hosts = world.hostsInLightTree();
    if (hosts.length !== 1) {
      failures.push(
        `after injection ${run}: ${hosts.length} host elements with id ${HOST_ID} under document.documentElement (AR-3 allows one)`,
      );
    }
    if (world.observers.length !== 1) {
      failures.push(
        `after injection ${run}: ${world.observers.length} MutationObserver instances constructed (AR-4 allows one)`,
      );
    }
    if (world.observeCalls !== 1) {
      failures.push(
        `after injection ${run}: observe() called ${world.observeCalls} times on document.documentElement`,
      );
    }
  }

  const shapes = recordShapes(world);
  const batches = allBatches(shapes);
  const observer = world.observers[0];
  if (!observer) continue;
  for (const batch of batches) {
    batchesChecked += 1;
    let returned;
    try {
      returned = observer.deliver(batch.map((shape) => shape.record));
    } catch (error) {
      failures.push(
        `observer callback threw on batch [${batch.map((s) => s.name).join(' | ')}]: ${error && error.message}`,
      );
      continue;
    }
    for (const record of returned || []) {
      const shape = batch.find((entry) => entry.record === record);
      if (shape && shape.tool) {
        failures.push(
          `pageRecords ∩ toolRecords ≠ ∅: a record the tool itself caused reached its own observer as a page record — ${shape.name} — passed notePageRecords in batch [${batch
            .map((s) => s.name)
            .join(' | ')}]`,
        );
      }
    }
  }
}

// ---- Verdict ----------------------------------------------------------------------------
if (failures.length > 0) {
  console.log(`FAIL — ${failures.length} counterexample(s); first 10:`);
  for (const failure of failures.slice(0, 10)) console.log('  - ' + failure);
  process.exit(1);
}
console.log(
  `PASS — ${injectionsChecked} injection sequences (1..3 runs of overlay.js in one world), ` +
    `${batchesChecked} ordered mutation batches (≤3 records over 6 shapes: target ∈ {documentElement, host, closed-root child}), ` +
    `one host / one observer / one observe() throughout, pageRecords ∩ toolRecords = ∅.`,
);
