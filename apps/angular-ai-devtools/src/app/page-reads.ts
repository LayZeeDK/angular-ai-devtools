/**
 * The page-read port — M018.
 *
 * Five reads of an inspected Angular application are panel→page requests: `find_components`,
 * `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent`. This module is
 * the one place that says so. It holds three records and nothing else:
 *
 * - `PageRequest`: which of the five is being asked, with the input the declaration accepted;
 * - `PageResponse`: either the page's value or a named failure — `host-unavailable` when the page
 *   could not be asked, `invalid-input` when the page refused what it was asked;
 * - `PageHost`: the code that carries the request. It is an injection token (`PAGE_HOST`) so the
 *   transport can arrive later without a caller changing.
 *
 * **This build has no page-request transport.** `extension/relay.js` forwards page→extension
 * events and `extension/background.js` handles no request message, so a request sent from the
 * panel is dropped; `angular-ai:di-query` has no caller and no responder. The default provider
 * therefore answers `host-unavailable` with `PAGE_HOST_UNAVAILABLE_REASON` rather than pretending
 * a read happened. That is the whole point of the port existing before the transport: "I could
 * not ask the page" and "the page has no components" are different answers, and only one of them
 * is true today.
 *
 * Two rules this module keeps:
 *
 * 1. No reader computes a fallback. A reader builds a request and hands back the host's answer,
 *    so nothing here can turn a failed ask into an empty list, a guessed value or a degraded read.
 * 2. No DOM and no observer (AR-3, AR-4). Readers only ask; the overlay is M022's and the panel
 *    adds nothing to the inspected page.
 *
 * The module imports `@angular/core` only and is imported by `tool-registry/read-tools.ts` alone,
 * which `scripts/registry-reach.test.mjs` observes rather than trusts.
 */
import { InjectionToken } from '@angular/core';

/**
 * The five request kinds. These are the tool ids from INTENT.md, verbatim: `getDirectiveMetadata`
 * and `getComponent` keep their camelCase spelling because an id is an interface, not a style
 * choice.
 */
export type PageReadKind =
  | 'find_components'
  | 'inspect_component'
  | 'list_signals'
  | 'getDirectiveMetadata'
  | 'getComponent';

/** The five request kinds in declaration order — the order the tools are registered in. */
export const PAGE_READ_KINDS: readonly PageReadKind[] = [
  'find_components',
  'inspect_component',
  'list_signals',
  'getDirectiveMetadata',
  'getComponent',
];

/** One ask of the page: which read, and the input the caller supplied. */
export type PageRequest = {
  readonly kind: PageReadKind;
  readonly input: Readonly<Record<string, unknown>>;
};

/** The two failures a page can report. Both are `ToolErrorCode` members. */
export type PageReadErrorCode = 'host-unavailable' | 'invalid-input';

/**
 * The page's answer. A failure is a value, not an exception and not an empty result, because a
 * thrown error or an empty value cannot be told apart from "the page has nothing".
 */
export type PageResponse =
  | { readonly status: 'result'; readonly value: unknown }
  | { readonly status: 'error'; readonly code: PageReadErrorCode; readonly message: string };

/** Whatever carries a request to the page. One method: ask, and answer with a `PageResponse`. */
export type PageHost = {
  request(request: PageRequest): Promise<PageResponse>;
};

/** One reader per request kind: it fixes the kind and hands the input to the host. */
export type PageReader = (
  host: PageHost,
  input: Readonly<Record<string, unknown>>,
) => Promise<PageResponse>;

/**
 * Why every read answers `host-unavailable` in this build. Named once and exported so the spec
 * asserts this text instead of re-typing it, and so no second reason drifts in beside it.
 */
export const PAGE_HOST_UNAVAILABLE_REASON =
  'no page-request transport exists in this build: the panel has no channel that carries a request to the inspected page, so the page could not be asked and this is not an empty read';

/**
 * The page host this build ships: it reports, by name, that the page was never asked. It is the
 * token's own default provider (`PAGE_HOST` below), so a read that runs with no transport
 * configured answers honestly instead of throwing or returning an empty result.
 */
export const UNAVAILABLE_PAGE_HOST: PageHost = {
  request: async (request: PageRequest): Promise<PageResponse> => ({
    status: 'error',
    code: 'host-unavailable',
    message: `the page was not asked for "${request.kind}": ${PAGE_HOST_UNAVAILABLE_REASON}`,
  }),
};

/**
 * The token a tool backing resolves the page host through. Its default factory is the
 * `host-unavailable` host above; a transport landing later provides this token and no reader,
 * declaration or backing changes.
 */
export const PAGE_HOST = new InjectionToken<PageHost>('angular-ai-devtools:page-host', {
  providedIn: 'root',
  factory: () => UNAVAILABLE_PAGE_HOST,
});

function ask(
  host: PageHost,
  kind: PageReadKind,
  input: Readonly<Record<string, unknown>>,
): Promise<PageResponse> {
  return host.request({ kind, input });
}

/** Reads the components on the page, optionally filtered by name. */
export function readComponents(
  host: PageHost,
  input: Readonly<Record<string, unknown>> = {},
): Promise<PageResponse> {
  return ask(host, 'find_components', input);
}

/** Reads one component's record by id. */
export function readComponent(
  host: PageHost,
  input: Readonly<Record<string, unknown>> = {},
): Promise<PageResponse> {
  return ask(host, 'inspect_component', input);
}

/** Reads the signals of one component, or of the page when no component id is given. */
export function readSignals(
  host: PageHost,
  input: Readonly<Record<string, unknown>> = {},
): Promise<PageResponse> {
  return ask(host, 'list_signals', input);
}

/** Reads one component's directive metadata — a Tier-0 debug API, dev-mode only. */
export function readDirectiveMetadata(
  host: PageHost,
  input: Readonly<Record<string, unknown>> = {},
): Promise<PageResponse> {
  return ask(host, 'getDirectiveMetadata', input);
}

/** Reads one component through the Tier-0 `getComponent` debug API, dev-mode only. */
export function readPageComponent(
  host: PageHost,
  input: Readonly<Record<string, unknown>> = {},
): Promise<PageResponse> {
  return ask(host, 'getComponent', input);
}

/** The readers by request kind: one reader per kind, with no kind reachable a second way. */
export const PAGE_READERS: Readonly<Record<PageReadKind, PageReader>> = {
  find_components: readComponents,
  inspect_component: readComponent,
  list_signals: readSignals,
  getDirectiveMetadata: readDirectiveMetadata,
  getComponent: readPageComponent,
};
