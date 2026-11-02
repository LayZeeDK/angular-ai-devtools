/**
 * The DOM role and accessible-name computation — M018.
 *
 * A later Aria explainer has to name what it observed: "this element is a button and its
 * accessible name is X", or "this element is a button and it has no accessible name". This module
 * is that sentence's two halves, computed from the live element on every call.
 *
 * ## Role
 *
 * An explicit `role` attribute wins and its first token is returned exactly as the author wrote
 * it (a `role="tab panel"` answers `"tab"`), because the author's token is an observation while a
 * re-mapped role would be this module's opinion. With no `role` attribute — or with one that
 * holds no token at all — the implicit role comes from this HTML-AAM subset and nothing else:
 *
 * | element                                  | implicit role |
 * |------------------------------------------|---------------|
 * | `button`                                 | `button`      |
 * | `a[href]`                                | `link`        |
 * | `input[type=text]`, and a missing type   | `textbox`     |
 * | `input[type=checkbox]`                   | `checkbox`    |
 * | `input[type=radio]`                      | `radio`       |
 * | `select`, single line                    | `combobox`    |
 * | `select[multiple]`, `select[size>1]`     | `listbox`     |
 * | `textarea`                               | `textbox`     |
 * | `h1`–`h6`                                | `heading`     |
 * | `img`                                    | `img`         |
 * | `table`                                  | `table`       |
 * | `ul`, `ol`                               | `list`        |
 * | `li`                                     | `listitem`    |
 * | `nav`                                    | `navigation`  |
 * | `main`                                   | `main`        |
 * | `dialog`                                 | `dialog`      |
 *
 * Everything else answers `null`. There is no `generic`, no `presentation`, no "closest thing" and
 * no default: an element this subset does not name is reported unnamed, which is what lets a
 * reviewer see the gap instead of reading a guess that looks like a measurement. A missing
 * `input` type is `text` because that is HTML's own default for the element, not a guess about
 * intent.
 *
 * ## Name
 *
 * Naming follows the observed role, not one universal order:
 *
 * 1. `aria-labelledby` — the text of each referenced element, in the order the ids are listed;
 * 2. `aria-label`;
 * 3. the native source — a `<label for>` pointing at the control, a `<label>` wrapping it, an
 *    `img`'s `alt`, or the `<caption>` of a `table`;
 * 4. content — only for the roles whose naming source includes it (`CONTENT_NAMED_ROLES`:
 *    `button`, `link`, `heading`, `option`, `tab`, `menuitem`, `cell`, `columnheader`,
 *    `rowheader`, `tooltip`).
 *
 * Every source is collapsed (`\s+` → one space) and trimmed, and a source that reads empty after
 * collapsing does not name the element, so the next source is tried. Sources this subset does not
 * model are not consulted at all: `title`, `placeholder`, an `input`'s `value`,
 * `<legend>`/`<fieldset>`, `<figcaption>`, and the decorative `img[alt=""]` → `presentation`
 * mapping. None of them can therefore quietly supply a name.
 *
 * ## N3 — no `textContent` fallback for an author-named role
 *
 * A role named by an author source never falls back to content. A `button` whose `aria-label`
 * differs from its text answers the label; a textbox or a checkbox with text but no label answers
 * `{ name: null, reason: 'no accessible name' }`. A fallback that always returned something would
 * hide exactly the case the Aria explainer must report: an unlabelled control is a finding, not an
 * empty string.
 *
 * ## E6 — read at call time
 *
 * Every call reads the element it is handed. There is no `WeakMap`, no memo, no snapshot taken
 * earlier and no field on a result a caller could reuse; the result record is built fresh per
 * call. `role-name.spec.ts` mutates a label between two reads of one element and asserts the
 * second answer differs, which no cache can pass.
 *
 * ## No DOM writes, no observer, no append (AR-3, AR-4)
 *
 * This module has no imports at all — not Angular, not a helper — and every statement in it reads:
 * no attribute, style, class or node is written, no `MutationObserver` is registered and nothing is
 * appended anywhere. The overlay is M022's and is the only DOM the tool ever adds to an inspected
 * page; with no observer here there is no host subtree for AR-4 to exclude. The spec proves the
 * read-only claim by observing the fixture's own tree and finding no mutation record.
 */

/** Where a control's accessible name came from. `null` when it has none. */
export type AccessibleNameSource = 'aria-labelledby' | 'aria-label' | 'native' | 'content';

/** The one reason this module reports for an element it cannot name. */
export type AccessibleNameReason = 'no accessible name';

/**
 * The reason text, named once and exported so the spec asserts this string instead of re-typing
 * it, and so no second "no name" wording drifts in beside it.
 */
export const NO_ACCESSIBLE_NAME_REASON = 'no accessible name';

/**
 * What one read observed. A non-null `name` always carries a non-null `source` and a null
 * `reason`; a null `name` always carries a null `source` and the `no accessible name` reason.
 * There is no third combination, so a caller never has to guess which case it holds.
 */
export type RoleNameResult = {
  readonly role: string | null;
  readonly name: string | null;
  readonly source: AccessibleNameSource | null;
  readonly reason: AccessibleNameReason | null;
};

/**
 * The roles whose own naming source includes their content (ARIA's "name from author: content"
 * roles). Naming reads content for these and for nothing else, so a wrapper or a textbox is never
 * named by its text (N3).
 */
export const CONTENT_NAMED_ROLES: readonly string[] = [
  'button',
  'link',
  'heading',
  'option',
  'tab',
  'menuitem',
  'cell',
  'columnheader',
  'rowheader',
  'tooltip',
];

const CONTENT_NAMED = new Set<string>(CONTENT_NAMED_ROLES);

/** The controls a `<label>` element can name. A `button` takes its name from content instead. */
const LABEL_NAMED_CONTROLS = new Set<string>(['input', 'select', 'textarea']);

/**
 * The elements that are controls in their own right. A wrapping `<label>`'s text skips them, so a
 * nested `textarea`'s text is not read as if it were the label's own words.
 */
const EMBEDDED_CONTROLS = new Set<string>([
  'button',
  'input',
  'meter',
  'output',
  'progress',
  'select',
  'textarea',
]);

/** `Node.nodeType` values, spelled here so the walk reads no global `Node` object. */
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

/**
 * The separators inside a space-separated attribute — a `role` token list or an `aria-labelledby`
 * id list — and the run of whitespace every name is collapsed by. Global because `collapse`
 * replaces every run, not just the first; `split` ignores the flag.
 */
const WHITESPACE = /\s+/g;

/**
 * The role of one element: the author's `role` token when there is one, otherwise the implicit
 * role from the subset documented above, otherwise `null`. Never a guessed default.
 */
export function computeRole(element: Element): string | null {
  const explicit = explicitRole(element);
  if (explicit !== null) {
    return explicit;
  }
  return implicitRole(element);
}

/**
 * The accessible name of one element under `role`, and where the name came from. `role` defaults
 * to `computeRole(element)`, so a caller that already observed the role can pass it and a caller
 * that has not gets the same role the module would report.
 */
export function computeAccessibleName(
  element: Element,
  role: string | null = computeRole(element),
): RoleNameResult {
  const fromLabelledBy = nameFromLabelledBy(element);
  if (fromLabelledBy !== null) {
    return named(role, fromLabelledBy, 'aria-labelledby');
  }

  const fromAttribute = collapsed(element.getAttribute('aria-label'));
  if (fromAttribute !== null) {
    return named(role, fromAttribute, 'aria-label');
  }

  const fromNativeSource = nativeName(element);
  if (fromNativeSource !== null) {
    return named(role, fromNativeSource, 'native');
  }

  // Content names only the roles whose own naming source includes it. A textbox, a checkbox or a
  // wrapper with text and no label is unnamed, and saying so is the finding (N3).
  if (isContentNamed(role)) {
    const fromContent = collapsed(contentText(element));
    if (fromContent !== null) {
      return named(role, fromContent, 'content');
    }
  }

  return { role, name: null, source: null, reason: NO_ACCESSIBLE_NAME_REASON };
}

/**
 * Both halves in one call, for an explainer that has an element and nothing else: the role, then
 * the name computed under that role.
 */
export function describeElement(element: Element): RoleNameResult {
  return computeAccessibleName(element, computeRole(element));
}

function named(role: string | null, name: string, source: AccessibleNameSource): RoleNameResult {
  return { role, name, source, reason: null };
}

function isContentNamed(role: string | null): boolean {
  return role !== null && CONTENT_NAMED.has(role.trim().toLowerCase());
}

/** The author's own token: the first one in the list, verbatim, or `null` when there is none. */
function explicitRole(element: Element): string | null {
  const attribute = element.getAttribute('role');
  if (attribute === null) {
    return null;
  }
  const tokens = attribute.split(WHITESPACE).filter((token) => token.length > 0);
  return tokens.length === 0 ? null : (tokens[0] ?? null);
}

/** The implicit role of the subset, by element — never by "what the element looks like". */
function implicitRole(element: Element): string | null {
  switch (element.localName) {
    case 'button':
      return 'button';
    case 'a':
      // Without an href an anchor is not a link, and nothing else in the subset names it.
      return element.hasAttribute('href') ? 'link' : null;
    case 'input':
      return inputRole(element);
    case 'select':
      return selectRole(element);
    case 'textarea':
      return 'textbox';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'img':
      return 'img';
    case 'table':
      return 'table';
    case 'ul':
    case 'ol':
      return 'list';
    case 'li':
      return 'listitem';
    case 'nav':
      return 'navigation';
    case 'main':
      return 'main';
    case 'dialog':
      return 'dialog';
    default:
      return null;
  }
}

function inputRole(element: Element): string | null {
  switch (inputType(element)) {
    case 'text':
      return 'textbox';
    case 'checkbox':
      return 'checkbox';
    case 'radio':
      return 'radio';
    default:
      // A type outside the subset (`number`, `range`, `submit`, …) is unnamed rather than guessed.
      return null;
  }
}

/** An `input`'s type as HTML reads it: absent or empty is `text`, anything else verbatim. */
function inputType(element: Element): string {
  const type = (element.getAttribute('type') ?? '').trim().toLowerCase();
  return type === '' ? 'text' : type;
}

/** A `select` is a listbox when it shows a list, a combobox when it is a single line. */
function selectRole(element: Element): string {
  if (element.hasAttribute('multiple')) {
    return 'listbox';
  }
  const size = Number.parseInt((element.getAttribute('size') ?? '').trim(), 10);
  return Number.isNaN(size) || size <= 1 ? 'combobox' : 'listbox';
}

/**
 * The native naming source of one element, or `null` when this subset gives it none: `alt` for an
 * image, `<caption>` for a table, and a `label` element for a labelable control.
 */
function nativeName(element: Element): string | null {
  switch (element.localName) {
    case 'img':
      return collapsed(element.getAttribute('alt'));
    case 'table':
      return captionText(element);
    default:
      return LABEL_NAMED_CONTROLS.has(element.localName) ? labelText(element) : null;
  }
}

/** The text of every `<label>` that names the control: `for=` matches first, then a wrapper. */
function labelText(element: Element): string | null {
  const id = element.getAttribute('id');
  if (id !== null && id.length > 0) {
    const parts: string[] = [];
    for (const label of Array.from(treeRoot(element).querySelectorAll('label'))) {
      if (label.getAttribute('for') === id) {
        parts.push(contentText(label, true));
      }
    }
    const fromLabels = collapsed(parts.join(' '));
    if (fromLabels !== null) {
      return fromLabels;
    }
  }

  for (
    let ancestor = element.parentElement;
    ancestor !== null;
    ancestor = ancestor.parentElement
  ) {
    if (ancestor.localName === 'label') {
      const fromWrapper = collapsed(contentText(ancestor, true));
      if (fromWrapper !== null) {
        return fromWrapper;
      }
    }
  }
  return null;
}

/** The first `<caption>` child's text, which is a table's native name. */
function captionText(element: Element): string | null {
  for (const child of Array.from(element.children)) {
    if (child.localName === 'caption') {
      const text = collapsed(contentText(child));
      if (text !== null) {
        return text;
      }
    }
  }
  return null;
}

/** The text of every element `aria-labelledby` names, in the order of the ids, or `null`. */
function nameFromLabelledBy(element: Element): string | null {
  const attribute = element.getAttribute('aria-labelledby');
  if (attribute === null) {
    return null;
  }
  const parts: string[] = [];
  for (const id of attribute.split(WHITESPACE).filter((token) => token.length > 0)) {
    const referenced = elementById(element, id);
    if (referenced !== null) {
      // An id that resolves to nothing contributes nothing: it does not invent a name.
      parts.push(contentText(referenced));
    }
  }
  return collapsed(parts.join(' '));
}

/** The first element in the same tree as `element` that carries `id`, excluding `element` itself. */
function elementById(element: Element, id: string): Element | null {
  for (const candidate of Array.from(treeRoot(element).querySelectorAll('[id]'))) {
    if (candidate !== element && candidate.getAttribute('id') === id) {
      return candidate;
    }
  }
  return null;
}

/**
 * The tree the element lives in: the inspected document, or the detached holder a caller built the
 * element in. Scoping the `label` and id lookups to it means an element that is not attached yet
 * is still named by the label beside it, and a neighbouring tree is never consulted.
 */
function treeRoot(element: Element): Element | Document | DocumentFragment {
  const root = element.getRootNode();
  if (root instanceof Element || root instanceof Document || root instanceof DocumentFragment) {
    return root;
  }
  return element.ownerDocument;
}

/**
 * The readable text of a node: descendant text, with an `img` contributing its `alt`. Fragments are
 * joined with a space and collapsed by the caller, so `<span>Save</span><span>now</span>` reads
 * "Save now" rather than "Savenow".
 *
 * With `skipControls`, descendant controls are skipped: a wrapping `<label>`'s words are the
 * label's own, not the `textarea` it wraps.
 */
function contentText(node: Node, skipControls = false): string {
  const parts: string[] = [];
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === TEXT_NODE) {
      parts.push(child.textContent ?? '');
      continue;
    }
    if (child.nodeType !== ELEMENT_NODE) {
      continue;
    }
    const childElement = child as Element;
    if (childElement.localName === 'img') {
      parts.push(childElement.getAttribute('alt') ?? '');
      continue;
    }
    if (skipControls && EMBEDDED_CONTROLS.has(childElement.localName)) {
      continue;
    }
    parts.push(contentText(childElement, skipControls));
  }
  return parts.join(' ');
}

/** Whitespace collapsed to single spaces and trimmed — the form every name is reported in. */
function collapse(value: string): string {
  return value.replace(WHITESPACE, ' ').trim();
}

/** `collapse`, with an empty result read as "this source does not name the element". */
function collapsed(value: string | null): string | null {
  const text = collapse(value ?? '');
  return text.length === 0 ? null : text;
}
