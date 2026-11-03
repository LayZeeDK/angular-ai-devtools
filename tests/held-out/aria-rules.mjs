import { readFileSync } from 'node:fs';

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

function find(surface, predicate) {
  return surface.elements.filter(predicate);
}

export const ariaRules = [
  {
    id: 'listbox-accessible-name',
    surface: 'listbox',
    attribute: 'aria-label',
    evaluate(surface) {
      const el = surface.elements.find((e) => e.attrs.ngListbox !== undefined || e.raw.includes('ngListbox'));
      const ok = !!el && (el.attrs['aria-label'] || el.attrs['aria-labelledby']);
      return { pass: !!ok, detail: ok ? 'aria-label present' : 'missing aria-label' };
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
      const ok = !!el && (el.attrs['aria-label'] || el.attrs['aria-labelledby']);
      return { pass: !!ok, detail: ok ? 'aria-label present' : 'missing aria-label' };
    },
  },
  {
    id: 'menu-trigger-controls',
    surface: 'menu',
    attribute: 'aria-controls',
    evaluate(surface) {
      const el = surface.elements.find((e) => e.raw.includes('ngMenuTrigger'));
      const ctrl = el && el.attrs['aria-controls'];
      const ids = surface.elements.map((e) => e.attrs.id).filter(Boolean);
      const ok = !!ctrl && ids.includes(ctrl);
      return { pass: !!ok, detail: ok ? `aria-controls="${ctrl}" resolves` : 'missing or unresolved aria-controls' };
    },
  },
];

export function evaluateAll(surface) {
  return ariaRules.map((rule) => ({ id: rule.id, ...rule.evaluate(surface) }));
}
