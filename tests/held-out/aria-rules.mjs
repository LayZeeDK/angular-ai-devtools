// The Aria rules the fixture's surfaces must satisfy, plus the two readers those rules judge.
//
// `parseSurface(src)` parses the component's source tags, which is all the attribute-reading rules need.
// `renderSurface(templateSrc, scope)` goes further: it expands the template's `@for` control flow against
// the scope the component binds, mounts the expansion in jsdom and returns the elements in document
// order — so a rule whose verdict depends on option ORDER reads the tree a browser would build, not the
// source text it is declared in.
//
// The order rule must redden for this mutant, applied to `spikes/ng222-app/src/app/components/aria-surfaces.ts`:
//   - `@for (item of [...listboxItems].reverse(); track item)` — the listbox's rendered order reversed,
//     which leaves the declared `listboxItems` array in `aria-items.ts` untouched.
// The controls rule must redden for this one, applied to the same file:
//   - `aria-controls="components-listbox"` on the `ngMenuTrigger` — an id the file really contains, but the
//     listbox's, not the menu panel's the trigger controls.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const SUITE = 'aria-rules.mjs';

/** The source-tag parse: every opening tag in the surface component, with its attributes. */
export function parseSurface(src) {
  const elements = [];
  const re = /<([A-Za-z][\w-]*)\b([^>]*)>/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const tag = m[1];
    const attrText = m[2];
    const attrs = {};
    const attrRe = /([A-Za-z_:][\w:.-]*)\s*=\s*"([^"]*)"/g;
    let a;
    while ((a = attrRe.exec(attrText)) !== null) {
      attrs[a[1]] = a[2];
    }
    // also capture bare attributes without values
    const bareRe = /(?:^|\s)([A-Za-z_:][\w:.-]*)(?=\s|>|$)/g;
    let b;
    while ((b = bareRe.exec(attrText)) !== null) {
      if (!(b[1] in attrs)) attrs[b[1]] = true;
    }
    elements.push({ tag, attrs, raw: m[0] });
  }
  return { elements };
}

/** Read a literal array of strings out of source text (for example `['Alpha', 'Beta', 'Gamma']`). */
function literalArray(text, where) {
  const match = /^\s*\[([\s\S]*)\]\s*$/.exec(text);
  assert.ok(
    match,
    `${SUITE}: ${where} is not an array literal this suite can read ("${text.trim()}"), so the scope the surface iterates is unknown`,
  );
  return [...match[1].matchAll(/'([^']*)'|"([^"]*)"/g)].map((quoted) => quoted[1] ?? quoted[2]);
}

/** The `template: \`...\`` literal the surface component declares, read out of its own source. */
export function readTemplate(src, surfaceFile) {
  const match = /template:\s*`([\s\S]*?)`/.exec(src);
  assert.ok(
    match,
    `${SUITE}: ${surfaceFile} declares no template literal, so there is no rendered surface to read`,
  );
  return match[1];
}

/**
 * The scope the surface template iterates over: the item arrays `aria-items.ts` exports, then the
 * component's own field initialisers in declaration order, so an alias (`readonly listboxItems =
 * listboxItems`) resolves to the array it aliases.
 */
export function readScope({ itemsSrc, surfaceSrc, itemsFile, surfaceFile }) {
  const scope = {};
  for (const match of itemsSrc.matchAll(/export const (\w+)\s*=\s*(\[[\s\S]*?\]);/g)) {
    scope[match[1]] = literalArray(match[2], `${itemsFile} export ${match[1]}`);
  }
  for (const name of ['listboxItems', 'menuItems']) {
    assert.ok(
      Object.hasOwn(scope, name),
      `${SUITE}: ${itemsFile} no longer declares \`export const ${name} = [...]\`, so the surface has nothing to iterate`,
    );
  }

  for (const match of surfaceSrc.matchAll(/readonly (\w+)\s*=\s*([^;]+);/g)) {
    const [, name, rawValue] = match;
    const value = rawValue.trim();
    if (value.startsWith('[')) {
      scope[name] = literalArray(value, `${surfaceFile} field ${name}`);
    } else {
      assert.ok(
        Object.hasOwn(scope, value),
        `${SUITE}: ${surfaceFile} binds ${name} to "${value}", which this suite cannot resolve to an item array, so the rendered order cannot be observed`,
      );
      scope[name] = scope[value];
    }
  }
  return scope;
}

/** Index of the `)` closing the `(` at `open`, skipping quoted strings. */
function closingParen(src, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '(') depth += 1;
    else if (ch === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Index of the `}` closing the `{` at `open`, skipping `{{ interpolation }}` spans and quoted strings. */
function closingBrace(src, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{' && src[i + 1] === '{') {
      const end = src.indexOf('}}', i + 2);
      assert.notEqual(end, -1, `${SUITE}: an interpolation in the surface template is not closed, so it cannot be rendered`);
      i = end + 1; // skip both closing braces; the loop's increment lands after them
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Angular template expressions are a JS subset; evaluate one against the scope the template binds. */
function evaluateExpression(expression, scope) {
  try {
    const names = Object.keys(scope);
    // eslint-disable-next-line no-new-func -- a template expression is code by definition
    const fn = new Function(...names, `return (${expression});`);
    return fn(...names.map((name) => scope[name]));
  } catch (error) {
    assert.fail(
      `${SUITE}: the template expression "${expression}" could not be evaluated (${error.message}), so the rendered surface cannot be observed`,
    );
  }
}

function renderInterpolations(text, scope) {
  return text.replace(/\{\{([\s\S]*?)\}\}/g, (_all, expression) => String(evaluateExpression(expression.trim(), scope)));
}

/**
 * Read one `@for` block starting at `at`: the loop variable, the iterated expression (with its exact
 * source span, so a review mutant can be applied in memory), the body, and where the block ends.
 */
export function readForBlock(src, at) {
  const openParen = src.indexOf('(', at);
  const closeParen = closingParen(src, openParen);
  assert.notEqual(closeParen, -1, `${SUITE}: the block at offset ${at} has an unbalanced @for header, so the rendered order cannot be read`);
  const header = src.slice(openParen + 1, closeParen);
  const openBrace = src.indexOf('{', closeParen);
  assert.notEqual(openBrace, -1, `${SUITE}: the @for header "${header.trim()}" opens no body, so nothing would render`);
  const closeBrace = closingBrace(src, openBrace);
  assert.notEqual(closeBrace, -1, `${SUITE}: the @for body after "${header.trim()}" is unbalanced, so nothing would render`);
  const parsed = /^\s*([\w$]+)\s+of\s+([\s\S]+?)\s*;\s*track\s+[\s\S]*$/.exec(header);
  assert.ok(
    parsed,
    `${SUITE}: the @for header "${header.trim()}" is not one this suite can read, so the rendered order cannot be observed`,
  );
  const expression = parsed[2];
  const offset = header.indexOf(expression);
  return {
    variable: parsed[1],
    expression,
    expressionStart: openParen + 1 + offset,
    expressionEnd: openParen + 1 + offset + expression.length,
    body: src.slice(openBrace + 1, closeBrace),
    end: closeBrace,
  };
}

/**
 * Apply the order mutant in memory: wrap the `@for` block at `at` in a reverse, the way a reviewer
 * reverses the rendered iteration, and return the mutated template plus what was changed.
 */
export function reverseIteration(templateSrc, at) {
  const block = readForBlock(templateSrc, at);
  const reversedExpression = `[...(${block.expression})].reverse()`;
  return {
    expression: block.expression,
    reversedExpression,
    template:
      templateSrc.slice(0, block.expressionStart) + reversedExpression + templateSrc.slice(block.expressionEnd),
  };
}

/**
 * Expand every `@for` block the way Angular's control flow does — evaluate the iterated expression
 * against the scope and repeat the body once per value, painting its `{{ interpolations }}` — then
 * mount the expansion in jsdom and return the elements in document order.
 */
export function renderSurface(templateSrc, scope) {
  const html = expandControlFlow(templateSrc, scope);
  const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`);
  return [...dom.window.document.body.querySelectorAll('*')];
}

function expandControlFlow(src, scope) {
  let out = '';
  let i = 0;
  for (;;) {
    const at = src.indexOf('@for (', i);
    if (at === -1) return out + src.slice(i);
    out += src.slice(i, at);
    const block = readForBlock(src, at);
    const values = evaluateExpression(block.expression, scope);
    assert.ok(
      Array.isArray(values),
      `${SUITE}: the iterated expression "${block.expression}" did not evaluate to an array, so nothing would render`,
    );
    for (const value of values) {
      const local = { ...scope, [block.variable]: value };
      out += expandControlFlow(renderInterpolations(block.body, local), local);
    }
    i = block.end + 1;
  }
}

/**
 * Everything a rule can read: the source parse the attribute rules judge, the rendered elements in
 * document order their order-reading sibling judges, and the scope the template rendered against.
 */
export function buildSurface({ surfaceSrc, itemsSrc, surfaceFile, itemsFile }) {
  const scope = readScope({ itemsSrc, surfaceSrc, itemsFile, surfaceFile });
  return {
    elements: parseSurface(surfaceSrc).elements,
    rendered: renderSurface(readTemplate(surfaceSrc, surfaceFile), scope),
    scope,
  };
}

/** The listbox options the surface actually rendered, in document order. */
function renderedListboxOptions(surface) {
  const host = (surface.rendered ?? []).find((element) => element.hasAttribute('nglistbox'));
  return host ? [...host.querySelectorAll('[ngoption]')] : [];
}

/** Escape a template reference name so it can be matched literally inside a RegExp. */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The element a `ngMenuTrigger` controls, read off the surface rather than off a flat list of ids: the
 * trigger's `[menu]` binding names the template reference its menu panel declares as `#ref`, and that
 * panel's own `id` attribute is the only id the trigger's `aria-controls` may carry. An id that merely
 * appears somewhere else in the same file is a different element, not the one this trigger controls.
 */
function controlledMenu(elements) {
  const trigger = elements.find((e) => e.raw.includes('ngMenuTrigger'));
  if (!trigger) return { trigger: null, ref: null, id: null };
  const binding = /\[menu\]\s*=\s*"([^"]*)"/.exec(trigger.raw);
  const ref = binding ? binding[1].trim() : null;
  const refPattern = ref ? new RegExp(`#${escapeRegExp(ref)}(?![\\w-])`) : null;
  const panel = refPattern ? elements.find((e) => refPattern.test(e.raw)) : undefined;
  const id = panel && typeof panel.attrs.id === 'string' ? panel.attrs.id : null;
  return { trigger, ref, id };
}

export const ariaRules = [
  {
    id: 'listbox-accessible-name',
    surface: 'listbox',
    attribute: 'aria-label',
    expectedName: 'Components listbox',
    evaluate(surface) {
      const el = surface.elements.find((e) => e.attrs.ngListbox !== undefined || e.raw.includes('ngListbox'));
      const expectedName = 'Components listbox';
      const name = el && (el.attrs['aria-label'] || el.attrs['aria-labelledby']);
      const ok = !!el && (el.attrs['aria-label'] === expectedName || !!el.attrs['aria-labelledby']);
      return { pass: !!ok, detail: ok ? `aria-label="${name}"` : `expected aria-label="${expectedName}", got "${name}"` };
    },
  },
  {
    id: 'listbox-focus-mode',
    surface: 'listbox',
    attribute: 'focusMode',
    evaluate(surface) {
      const el = surface.elements.find((e) => e.raw.includes('ngListbox'));
      const ok = !!el && el.attrs.focusMode === 'activedescendant';
      return { pass: !!ok, detail: ok ? 'focusMode="activedescendant"' : 'missing focusMode="activedescendant"' };
    },
  },
  {
    id: 'menu-trigger-accessible-name',
    surface: 'menu',
    attribute: 'aria-label',
    evaluate(surface) {
      const el = surface.elements.find((e) => e.raw.includes('ngMenuTrigger'));
      const expectedName = 'Open components menu';
      const name = el && (el.attrs['aria-label'] || el.attrs['aria-labelledby']);
      const ok = !!el && (el.attrs['aria-label'] === expectedName || !!el.attrs['aria-labelledby']);
      return { pass: !!ok, detail: ok ? `aria-label="${name}"` : `expected aria-label="${expectedName}", got "${name}"` };
    },
  },
  {
    // `aria-controls` has to name the element this trigger controls — the panel its `[menu]` binding
    // references — not any id the surface file happens to contain (the listbox's id passes no longer).
    id: 'menu-trigger-controls',
    surface: 'menu',
    attribute: 'aria-controls',
    evaluate(surface) {
      const { trigger, ref, id: expectedId } = controlledMenu(surface.elements);
      if (!trigger) {
        return { pass: false, detail: 'missing the ngMenuTrigger itself, so there is no aria-controls to resolve to a menu' };
      }
      if (!ref) {
        return {
          pass: false,
          detail: 'the ngMenuTrigger declares no [menu]="..." binding, so the element it controls cannot be resolved',
        };
      }
      if (!expectedId) {
        return {
          pass: false,
          detail: `the trigger's [menu]="${ref}" names no #${ref} panel carrying an id, so the element it controls cannot be resolved`,
        };
      }
      const ctrl = typeof trigger.attrs['aria-controls'] === 'string' ? trigger.attrs['aria-controls'] : null;
      if (!ctrl) {
        return {
          pass: false,
          detail: `missing aria-controls; the trigger's [menu]="${ref}" controls the panel id="${expectedId}", so aria-controls must be "${expectedId}"`,
        };
      }
      const ok = ctrl === expectedId;
      return {
        pass: ok,
        detail: ok
          ? `aria-controls="${ctrl}" is the id of the #${ref} panel the trigger's [menu]="${ref}" controls`
          : `aria-controls="${ctrl}" is not the menu this trigger controls: expected "${expectedId}" (the id of its #${ref} panel), got "${ctrl}"`,
      };
    },
  },
  {
    // No `attribute`: no single attribute's removal reddens this rule, so the mutation suite's
    // removal loop skips it and its own mutant reverses the rendered iteration instead.
    id: 'listbox-option-order',
    surface: 'listbox',
    evaluate(surface) {
      const renderedOrder = renderedListboxOptions(surface).map((option) => option.textContent.trim());
      const declaredOrder = Array.isArray(surface.scope?.listboxItems) ? surface.scope.listboxItems : [];
      const ok =
        declaredOrder.length > 0 &&
        renderedOrder.length === declaredOrder.length &&
        renderedOrder.every((label, index) => label === declaredOrder[index]);
      const shown = `listbox rendered its options in DOM order (${renderedOrder.join(',') || 'nothing'})`;
      return {
        pass: ok,
        detail: ok
          ? `${shown}, the order the component declares`
          : `${shown}, not the order the component declares (${declaredOrder.join(',') || 'nothing'})`,
      };
    },
  },
];

export function evaluateAll(surface) {
  return ariaRules.map((rule) => ({ id: rule.id, ...rule.evaluate(surface) }));
}
