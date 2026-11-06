import { describe, expect, it } from 'vitest';
import {
  CONTENT_NAMED_ROLES,
  NO_ACCESSIBLE_NAME_REASON,
  computeAccessibleName,
  computeRole,
  describeElement,
  type RoleNameResult,
} from './role-name';

/**
 * Every fixture is built per case with `document.createElement`, inside its own detached holder.
 * Nothing is shared between cases: a shared node would mask a cache (E6), and a shared holder
 * would let one case's `<label>` name another case's control. Nothing is attached to
 * `document.body` either — these are read-only fixtures, not page content.
 */
function holder(): HTMLElement {
  return document.createElement('div');
}

function make(
  tagName: string,
  attributes: Readonly<Record<string, string>> = {},
  text = '',
): HTMLElement {
  const element = document.createElement(tagName);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  if (text.length > 0) {
    element.textContent = text;
  }
  return element;
}

/** A `<label for>` and its control, plus anything else the case needs, in one detached tree. */
function inTree(...children: Element[]): HTMLElement {
  const root = holder();
  root.append(...children);
  return root;
}

const NO_NAME = {
  name: null,
  source: null,
  reason: 'no accessible name',
} satisfies Partial<RoleNameResult>;

describe('computeRole', () => {
  it('reads the author’s role token verbatim, first token first', () => {
    expect(computeRole(make('div', { role: 'tab   panel' }))).toBe('tab');
    expect(computeRole(make('div', { role: '  menuitem  ' }))).toBe('menuitem');
    // The author's token wins even when the element itself would name another role.
    expect(computeRole(make('button', { role: 'link' }, 'Go'))).toBe('link');
    // A role attribute that holds no token names nothing, so the implicit role is looked for.
    expect(computeRole(make('dialog', { role: '' }))).toBe('dialog');
  });

  it('names the implicit role of the HTML-AAM subset, element by element', () => {
    const cases: readonly (readonly [Element, string])[] = [
      [make('button'), 'button'],
      [make('a', { href: '/docs' }), 'link'],
      [make('input'), 'textbox'],
      [make('input', { type: 'text' }), 'textbox'],
      [make('input', { type: 'checkbox' }), 'checkbox'],
      [make('input', { type: 'radio' }), 'radio'],
      [make('select'), 'combobox'],
      [make('select', { multiple: '' }), 'listbox'],
      [make('select', { size: '4' }), 'listbox'],
      [make('textarea'), 'textbox'],
      [make('img', { alt: 'A chart' }), 'img'],
      [make('table'), 'table'],
      [make('ul'), 'list'],
      [make('ol'), 'list'],
      [make('li'), 'listitem'],
      [make('nav'), 'navigation'],
      [make('main'), 'main'],
      [make('dialog'), 'dialog'],
    ];
    for (const [element, role] of cases) {
      expect(
        computeRole(element),
        `${element.localName} should be ${role}`,
      ).toBe(role);
    }
    for (const level of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      expect(computeRole(make(level))).toBe('heading');
    }
  });

  it('answers null — never generic — for an element the subset does not name', () => {
    const unnamed: readonly Element[] = [
      make('div'),
      make('span'),
      make('p'),
      make('section'),
      // An anchor without an href is not a link, and nothing else in the subset names it.
      make('a'),
      // An input type outside the subset is unnamed rather than guessed at.
      make('input', { type: 'number' }),
      make('input', { type: 'submit' }),
      make('input', { type: 'range' }),
    ];
    for (const element of unnamed) {
      const role = computeRole(element);
      expect(
        role,
        `${element.localName}[${element.getAttribute('type') ?? ''}]`,
      ).toBeNull();
      expect(role).not.toBe('generic');
    }
  });

  it('reads the role attribute at call time, not a snapshot', () => {
    const element = make('div');
    expect(computeRole(element)).toBeNull();
    element.setAttribute('role', 'tab');
    expect(computeRole(element)).toBe('tab');
    element.setAttribute('role', 'tabpanel');
    expect(computeRole(element)).toBe('tabpanel');
    element.removeAttribute('role');
    expect(computeRole(element)).toBeNull();
  });
});

describe('computeAccessibleName — the role’s own order', () => {
  it('reads aria-labelledby first, in the order the ids are listed', () => {
    const first = make('span', { id: 'first' }, 'First');
    const second = make('span', { id: 'second' }, 'Second');
    const control = make(
      'button',
      { 'aria-labelledby': 'second first', 'aria-label': 'Fallback' },
      'Content',
    );
    inTree(first, second, control);

    expect(computeAccessibleName(control)).toEqual({
      role: 'button',
      name: 'Second First',
      source: 'aria-labelledby',
      reason: null,
    });
  });

  it('reads aria-label second, and answers the label even when the text differs', () => {
    const label = make('label', { for: 'email' }, 'Email address');
    const control = make('input', {
      id: 'email',
      type: 'text',
      'aria-label': 'Work email',
    });
    inTree(label, control);

    expect(computeAccessibleName(control)).toEqual({
      role: 'textbox',
      name: 'Work email',
      source: 'aria-label',
      reason: null,
    });
  });

  it('reads the native source third: a label for, a wrapping label, an alt, a caption', () => {
    const forLabel = make('label', { for: 'email' }, 'Email address');
    const forControl = make('input', { id: 'email', type: 'text' });
    inTree(forLabel, forControl);
    expect(computeAccessibleName(forControl)).toEqual({
      role: 'textbox',
      name: 'Email address',
      source: 'native',
      reason: null,
    });

    // A wrapping label's own words name the control; the control's text is not its label's text.
    const wrapping = make('label');
    const wrapped = make('textarea');
    wrapped.textContent = 'the user typed this';
    wrapping.append('Comment', wrapped);
    inTree(wrapping);
    expect(computeAccessibleName(wrapped)).toEqual({
      role: 'textbox',
      name: 'Comment',
      source: 'native',
      reason: null,
    });

    expect(
      computeAccessibleName(make('img', { alt: 'A chart of the build' })),
    ).toEqual({
      role: 'img',
      name: 'A chart of the build',
      source: 'native',
      reason: null,
    });

    const table = make('table');
    table.append(make('caption', {}, 'Q3 revenue'), make('tbody'));
    expect(computeAccessibleName(table)).toEqual({
      role: 'table',
      name: 'Q3 revenue',
      source: 'native',
      reason: null,
    });
  });

  it('reads content last, and only for the roles whose naming source includes it', () => {
    expect(
      computeAccessibleName(make('a', { href: '/docs' }, 'Read the docs')),
    ).toEqual({
      role: 'link',
      name: 'Read the docs',
      source: 'content',
      reason: null,
    });
    expect(computeAccessibleName(make('h2', {}, 'Deploy notes'))).toEqual({
      role: 'heading',
      name: 'Deploy notes',
      source: 'content',
      reason: null,
    });

    for (const role of CONTENT_NAMED_ROLES) {
      expect(
        computeAccessibleName(
          make('div', { role }, 'Named by its own content'),
        ),
      ).toEqual({
        role,
        name: 'Named by its own content',
        source: 'content',
        reason: null,
      });
    }

    // A wrapper role is not named by its content: its text is a finding, not a name (N3).
    const panel = make('div', { role: 'tabpanel' });
    panel.append(make('p', {}, 'Panel content'));
    expect(computeAccessibleName(panel)).toEqual({
      role: 'tabpanel',
      ...NO_NAME,
    });
    expect(
      computeAccessibleName(make('div', { role: 'listbox' }, 'Option one'))
        .name,
    ).toBeNull();
  });

  it('collapses whitespace and trims every source', () => {
    expect(
      computeAccessibleName(
        make('button', { 'aria-label': '  Save \n\t  changes  ' }),
      ).name,
    ).toBe('Save changes');

    const contentNamed = make('button');
    contentNamed.append(
      make('span', {}, '  Save '),
      make('span', {}, ' changes  '),
    );
    expect(computeAccessibleName(contentNamed).name).toBe('Save changes');

    const referenced = make('span', { id: 'ref' }, '  First\n  name ');
    const referencing = make('button', { 'aria-labelledby': ' ref  ' });
    inTree(referenced, referencing);
    expect(computeAccessibleName(referencing).name).toBe('First name');

    const padded = make('label', { for: 'padded' }, '  Work\n email ');
    const paddedControl = make('input', { id: 'padded', type: 'text' });
    inTree(padded, paddedControl);
    expect(computeAccessibleName(paddedControl).name).toBe('Work email');
  });

  it('falls through a source that reads empty instead of answering an empty name', () => {
    expect(
      computeAccessibleName(make('button', { 'aria-label': '   ' }, 'Send')),
    ).toEqual({
      role: 'button',
      name: 'Send',
      source: 'content',
      reason: null,
    });
    expect(
      computeAccessibleName(
        make('button', { 'aria-labelledby': 'nowhere' }, 'Dangling'),
      ),
    ).toEqual({
      role: 'button',
      name: 'Dangling',
      source: 'content',
      reason: null,
    });
  });

  it('computes the role itself when the caller passes only an element', () => {
    const button = make('button', {}, 'Send');
    expect(computeAccessibleName(button)).toEqual(
      computeAccessibleName(button, computeRole(button)),
    );

    // An observed role the element does not itself carry is honoured: an explainer names the
    // element under the role it measured.
    expect(computeAccessibleName(make('div', {}, 'Anything'), 'link')).toEqual({
      role: 'link',
      name: 'Anything',
      source: 'content',
      reason: null,
    });
  });
});

describe('N3 — no textContent fallback for a role named by an author source', () => {
  it('returns the aria-label of a button even when the button’s text says something else', () => {
    expect(
      computeAccessibleName(
        make('button', { 'aria-label': 'Save changes' }, 'Discard'),
      ),
    ).toEqual({
      role: 'button',
      name: 'Save changes',
      source: 'aria-label',
      reason: null,
    });
  });

  it('answers no accessible name for a textbox and a checkbox that have text but no label', () => {
    const textarea = make('textarea');
    textarea.textContent = 'the user typed this';
    expect(computeAccessibleName(textarea)).toEqual({
      role: 'textbox',
      ...NO_NAME,
    });

    const textbox = make('div', { role: 'textbox' }, 'the user typed this');
    expect(computeAccessibleName(textbox)).toEqual({
      role: 'textbox',
      ...NO_NAME,
    });

    const checkbox = make('div', { role: 'checkbox' }, 'Accept the terms');
    expect(computeAccessibleName(checkbox)).toEqual({
      role: 'checkbox',
      ...NO_NAME,
    });

    const nativeCheckbox = make('input', { type: 'checkbox', value: 'accept' });
    expect(computeAccessibleName(nativeCheckbox)).toEqual({
      role: 'checkbox',
      ...NO_NAME,
    });
  });

  it('never reads value, placeholder or title as a name', () => {
    const unnamed: readonly Element[] = [
      make('input', { type: 'text', value: 'hello' }),
      make('input', { type: 'text', placeholder: 'Email' }),
      make('button', { title: 'Close' }),
      make('img', { alt: '' }),
    ];
    for (const element of unnamed) {
      const result = computeAccessibleName(element);
      expect(result.name).toBeNull();
      expect(result.source).toBeNull();
      expect(result.reason).toBe('no accessible name');
    }
  });
});

describe('the result shape', () => {
  it('reports the reason as the literal text a reviewer can look for', () => {
    expect(NO_ACCESSIBLE_NAME_REASON).toBe('no accessible name');
  });

  it('pairs a non-null name with a source and a null name with the reason', () => {
    const labelled = make(
      'button',
      { 'aria-label': 'Save changes' },
      'Discard',
    );
    const byId = make('button', { 'aria-labelledby': 'caption' });
    const caption = make('span', { id: 'caption' }, 'Named by reference');
    inTree(caption, byId);
    const native = make('img', { alt: 'A chart of the build' });
    const content = make('button', {}, 'Send');
    const unnamed = make('input', { type: 'text' });

    const results: readonly RoleNameResult[] = [
      computeAccessibleName(labelled),
      computeAccessibleName(byId),
      computeAccessibleName(native),
      computeAccessibleName(content),
      computeAccessibleName(unnamed),
      describeElement(unnamed),
    ];

    for (const result of results) {
      expect(Object.keys(result).sort()).toEqual([
        'name',
        'reason',
        'role',
        'source',
      ]);
      if (result.name === null) {
        expect(result.source).toBeNull();
        expect(result.reason).toBe(NO_ACCESSIBLE_NAME_REASON);
        continue;
      }
      expect(result.name.length).toBeGreaterThan(0);
      expect(result.name).toBe(result.name.replace(/\s+/g, ' ').trim());
      expect(result.source).not.toBeNull();
      expect(result.reason).toBeNull();
    }

    expect(results.map((result) => result.source)).toEqual([
      'aria-label',
      'aria-labelledby',
      'native',
      'content',
      null,
      null,
    ]);
  });
});

describe('E5', () => {
  it('E5 a labelled control and a content-named control both yield a role and a name, and an unlabelled control yields no accessible name', () => {
    const labelled = describeElement(
      make('button', { 'aria-label': 'Save changes' }, 'Discard'),
    );
    const contentNamed = describeElement(
      make('a', { href: '/docs' }, 'Read the docs'),
    );
    const unlabelled = describeElement(make('input', { type: 'text' }));

    // Two fixtures, two roles, two names — the observation the Aria explainer has to make.
    expect(labelled.role).toBe('button');
    expect(labelled.name).toBe('Save changes');
    expect(labelled.source).toBe('aria-label');

    expect(contentNamed.role).toBe('link');
    expect(contentNamed.name).toBe('Read the docs');
    expect(contentNamed.source).toBe('content');

    for (const result of [labelled, contentNamed]) {
      expect(typeof result.role).toBe('string');
      expect(result.role).not.toBeNull();
      expect(typeof result.name).toBe('string');
      expect((result.name ?? '').length).toBeGreaterThan(0);
      expect(result.reason).toBeNull();
    }

    // The unlabelled control still has a role, and its missing name is stated, not empty.
    expect(unlabelled.role).toBe('textbox');
    expect(unlabelled.name).toBeNull();
    expect(unlabelled.source).toBeNull();
    expect(unlabelled.reason).toBe('no accessible name');
    expect(unlabelled).toEqual({ role: 'textbox', ...NO_NAME });
  });
});

describe('E6', () => {
  it('E6 the name is read from the DOM at call time, so changing the label changes the next result', () => {
    // aria-label, changed on the same element between two reads.
    const ariaLabelled = make('button', { 'aria-label': 'Save' }, 'Save');
    const beforeLabel = computeAccessibleName(ariaLabelled);
    ariaLabelled.setAttribute('aria-label', 'Publish');
    const afterLabel = computeAccessibleName(ariaLabelled);
    expect(beforeLabel.name).toBe('Save');
    expect(afterLabel.name).toBe('Publish');
    // A fresh record per call: nothing here is reusable, so nothing here can be a cache.
    expect(afterLabel).not.toBe(beforeLabel);
    expect(afterLabel).not.toEqual(beforeLabel);

    // Content, changed under a content-named control.
    const contentNamed = make('button');
    const words = make('span', {}, 'Save');
    contentNamed.append(words);
    expect(computeAccessibleName(contentNamed).name).toBe('Save');
    words.textContent = 'Publish';
    expect(computeAccessibleName(contentNamed).name).toBe('Publish');

    // The native source: the text of the `<label for>` that names the control.
    const label = make('label', { for: 'email' }, 'Email');
    const control = make('input', { id: 'email', type: 'text' });
    inTree(label, control);
    expect(computeAccessibleName(control).name).toBe('Email');
    label.textContent = 'Work email';
    expect(computeAccessibleName(control).name).toBe('Work email');

    // aria-labelledby: the text of the referenced element.
    const referenced = make('span', { id: 'ref' }, 'First');
    const referencing = make('button', { 'aria-labelledby': 'ref' });
    inTree(referenced, referencing);
    expect(computeAccessibleName(referencing).name).toBe('First');
    referenced.textContent = 'Second';
    expect(computeAccessibleName(referencing).name).toBe('Second');

    // The role too: the name follows the role the element carries at this call, so a role that
    // stops being content-named stops being named by its content.
    const roleChanging = make('div', {}, 'Anything');
    expect(computeRole(roleChanging)).toBeNull();
    expect(computeAccessibleName(roleChanging).name).toBeNull();
    roleChanging.setAttribute('role', 'tab');
    expect(computeRole(roleChanging)).toBe('tab');
    expect(computeAccessibleName(roleChanging).name).toBe('Anything');
    roleChanging.setAttribute('role', 'tabpanel');
    expect(computeAccessibleName(roleChanging).name).toBeNull();
  });
});

describe('read-only', () => {
  it('reads the element without writing it, appending a node or reporting a change', async () => {
    const root = inTree(
      make('label', { for: 'email' }, 'Email address'),
      make('input', { id: 'email', type: 'text', 'aria-label': 'Work email' }),
      make('table'),
      make('button', { 'aria-labelledby': 'nowhere' }, 'Send'),
    );
    const markupBefore = root.innerHTML;
    const bodyChildrenBefore = document.body.childElementCount;

    const records: MutationRecord[] = [];
    const observer = new MutationObserver((entries) => {
      records.push(...entries);
    });
    observer.observe(root, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    const bodyObserver = new MutationObserver((entries) => {
      records.push(...entries);
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    for (const element of Array.from(root.querySelectorAll('*'))) {
      computeRole(element);
      computeAccessibleName(element);
      describeElement(element);
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
    observer.disconnect();
    bodyObserver.disconnect();

    // AR-3/AR-4: the computation wrote no attribute, no text and no node, and appended nothing —
    // the only DOM the tool may add to an inspected page is M022's overlay.
    expect(records).toEqual([]);
    expect(root.innerHTML).toBe(markupBefore);
    expect(document.body.childElementCount).toBe(bodyChildrenBefore);
  });
});
