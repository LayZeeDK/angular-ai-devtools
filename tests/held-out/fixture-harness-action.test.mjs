// Held-out proof for SC1 / E4 (HAR-4): the fixture's action must change what the page renders.
//
// The harness that observes the action does not exist yet (the A8 ruling defers it), so this suite
// replays the probe's own template semantics instead of asserting text in the source file. It compiles
// the real `HarnessProbe` class out of `spikes/ng222-app/src/app/components/harness-probe.ts`, mounts the
// component's own `template` into a jsdom document, binds the template's `(event)` handlers and
// `{{ interpolation }}` text nodes to that instance, dispatches a real click on the `[data-action]`
// element, and asserts the text the `[data-state]` element renders afterwards.
//
// Prohibition N7: nothing here reads `count()` or `signal()` state. The only subject is the text the
// page shows, before and after the action.
//
// Mutant this suite must redden for: `advance(): void {}` in `harness-probe.ts` — the action's effect
// removed. It was seen failing under that mutant and passing when the mutant was reverted (task Log).
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const probePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'harness-probe.ts');
const SUITE = 'fixture-harness-action.test.mjs';

const ACTION = '[data-action="advance"]';
const STATE = '[data-state="count"]';

let loaded; // cached { HarnessProbe, template }
const tempDirs = [];

after(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

/** The template literal the probe component declares, read out of its own source. */
function readTemplate(source) {
  const match = /template:\s*`([\s\S]*?)`/.exec(source);
  assert.ok(match, `${SUITE}: ${probePath} declares no template literal, so the action has no rendered effect to observe`);
  return match[1];
}

/** Remove the `@Component({...})` decorator so the class can be instantiated without Angular JIT. */
function stripComponentDecorator(source) {
  const at = source.indexOf('@Component(');
  assert.notEqual(at, -1, `${SUITE}: ${probePath} declares no @Component decorator, so its template cannot be read`);
  const open = at + '@Component'.length;
  let depth = 0;
  let quote = null;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '(') depth += 1;
    else if (ch === ')') {
      depth -= 1;
      if (depth === 0) return source.slice(0, at) + source.slice(i + 1);
    }
  }
  assert.fail(`${SUITE}: the @Component decorator in ${probePath} is not balanced, so the class cannot be compiled`);
}

/**
 * Compile the probe's real class out of its TypeScript source and import it.
 *
 * `@angular/core` in the transpiled module resolves to the workspace's own install, so the class runs
 * against the same `signal()` implementation the fixture ships.
 */
async function loadProbe() {
  if (loaded) return loaded;
  const source = readFileSync(probePath, 'utf8');
  const template = readTemplate(source);
  const coreUrl = import.meta.resolve('@angular/core');
  const withoutDecorator = stripComponentDecorator(source).replace(
    /from\s+['"]@angular\/core['"]/,
    `from ${JSON.stringify(coreUrl)}`,
  );
  const { outputText, diagnostics } = ts.transpileModule(withoutDecorator, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
    },
    fileName: 'harness-probe.ts',
    reportDiagnostics: true,
  });
  const fatal = (diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  assert.equal(fatal.length, 0, `${SUITE}: ${probePath} does not compile, so the action cannot be driven`);
  const dir = mkdtempSync(join(tmpdir(), 'm023-harness-probe-'));
  tempDirs.push(dir);
  const file = join(dir, 'harness-probe.mjs');
  writeFileSync(file, outputText, 'utf8');
  const module = await import(pathToFileURL(file).href);
  assert.equal(typeof module.HarnessProbe, 'function', `${SUITE}: ${probePath} no longer exports HarnessProbe, so the action cannot be driven`);
  loaded = { HarnessProbe: module.HarnessProbe, template };
  return loaded;
}

/** Angular template expressions are a JS subset; evaluate one against the component instance. */
function evaluate(expression, probe) {
  // eslint-disable-next-line no-new-func -- a template expression is code by definition
  const fn = new Function('ctx', `with (ctx) { return (${expression}); }`);
  return fn(probe);
}

function renderInterpolations(text, probe) {
  return text.replace(/\{\{([\s\S]*?)\}\}/g, (_all, expression) => String(evaluate(expression.trim(), probe)));
}

function textNodes(document) {
  const walker = document.createTreeWalker(document.body, 4 /** NodeFilter.SHOW_TEXT */);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

/**
 * Mount the probe's template the way the page would: each `{{ ... }}` text node keeps its template
 * expression and is repainted from the instance, and each `(event)` binding is wired to a listener that
 * runs the bound expression and repaints.
 */
async function mount() {
  const { HarnessProbe, template } = await loadProbe();
  const dom = new JSDOM(`<!doctype html><html><body>${template}</body></html>`);
  const { document } = dom.window;
  const probe = new HarnessProbe();
  const errors = [];

  const bindings = textNodes(document)
    .map((node) => ({ node, expression: node.nodeValue ?? '' }))
    .filter(({ expression }) => expression.includes('{{'));
  const paint = () => {
    for (const { node, expression } of bindings) node.nodeValue = renderInterpolations(expression, probe);
  };

  for (const element of document.querySelectorAll('*')) {
    for (const attribute of [...element.attributes]) {
      const binding = /^\(([\w.-]+)\)$/.exec(attribute.name);
      if (!binding) continue;
      const expression = attribute.value;
      element.removeAttribute(attribute.name);
      element.addEventListener(binding[1], () => {
        try {
          evaluate(expression, probe);
          paint();
        } catch (error) {
          errors.push(error);
        }
      });
    }
  }
  paint();

  const action = document.querySelector(ACTION);
  const state = document.querySelector(STATE);
  assert.ok(action, `${SUITE}: the fixture template renders no ${ACTION} element, so there is no action to drive`);
  assert.ok(state, `${SUITE}: the fixture template renders no ${STATE} element, so the action's effect is unobservable`);

  return {
    document,
    click: () => action.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })),
    stateText: () => state.textContent.trim(),
    noErrors: () => assert.deepEqual(errors.map(String), [], `${SUITE}: the action's own binding threw, so its effect never landed`),
  };
}

function assertNumericRender(text, when) {
  assert.match(text, /^\d+$/, `${SUITE}: mutant (state element no longer interpolates its value) — ${when} the ${STATE} element rendered "${text}", not a number, so the action's effect is not observable`);
}

test('the count state element renders its value from the template interpolation', async () => {
  const page = await mount();
  const text = page.stateText();
  assertNumericRender(text, 'before any click');
  assert.equal(text, '0', `${SUITE}: mutant (state element no longer interpolates count()) — the fixture's initial ${STATE} text must be "0", got "${text}"`);
});

test('clicking the advance action changes the text the count state renders (HAR-4 effect)', async () => {
  const page = await mount();
  const before = page.stateText();
  assertNumericRender(before, 'before the click');

  page.click();
  page.noErrors();
  const after = page.stateText();

  assert.notEqual(
    after,
    before,
    `${SUITE}: mutant (advance() made a no-op) — clicking ${ACTION} did not change the text ${STATE} renders: it stayed "${before}", so the action's effect never landed`,
  );
  assert.equal(after, '1', `${SUITE}: mutant (advance() no longer increments) — after one click on ${ACTION} the ${STATE} element must render "1", got "${after}"`);
});

test('each click advances the rendered count again, so the effect is the action and not a constant', async () => {
  const page = await mount();
  page.click();
  page.noErrors();
  const afterFirst = page.stateText();
  assertNumericRender(afterFirst, 'after the first click');
  page.click();
  page.noErrors();
  const afterSecond = page.stateText();
  assert.notEqual(afterSecond, afterFirst, `${SUITE}: mutant (advance() sets a constant instead of advancing) — the second click on ${ACTION} left ${STATE} at "${afterSecond}", so the action does not advance on every click`);
  assert.equal(afterSecond, '2', `${SUITE}: mutant (advance() sets a constant instead of advancing) — after two clicks on ${ACTION} the ${STATE} element must render "2", got "${afterSecond}"`);
});
