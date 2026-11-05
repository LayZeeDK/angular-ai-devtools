/**
 * The five page reads as registry tools — M018.
 *
 * `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent`
 * are declarations plus a backing each. The backing calls its reader in `../page-reads` with the
 * injected `PageHost` and maps the answer onto the envelope:
 *
 * - `status: 'result'` → `{ kind: 'result', provenance: 'page-request' }` — the value came from a
 *   request to the page, and the provenance says so rather than presenting it as the panel's own;
 * - `status: 'error'` → `{ kind: 'error' }` carrying the page's own code and message and naming
 *   the tool id, so "the page refused this" and "the page could not be asked" stay distinguishable.
 *
 * A failed read never becomes an empty result and never becomes a fallback read. "I could not ask
 * the page" and "the page has no components" are different answers, and answering the second when
 * the first is true is a lie the whole explainer generation would inherit.
 *
 * `getDirectiveMetadata` and `getComponent` are Tier-0 dev-mode debug APIs: outside dev mode they
 * answer nothing, so their input descriptions state the restriction and the page's own reason is
 * passed through when it reports one. There is deliberately no degraded fallback read.
 *
 * This is the only non-test importer of `../page-reads`, and nothing here edits
 * `tool-registry.ts` — the declaration record is the extension point. The guard in
 * `scripts/registry-reach.test.mjs` observes both facts.
 */
import {
  Injector,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type EnvironmentProviders,
} from '@angular/core';
import {
  PAGE_HOST,
  PAGE_READERS,
  UNAVAILABLE_PAGE_HOST,
  type PageHost,
  type PageReadErrorCode,
  type PageReadKind,
  type PageReader,
  type PageResponse,
} from '../page-reads';
import {
  defineTool,
  provideTools,
  type ToolBacking,
  type ToolEntry,
  type ToolInputSchema,
  type ToolOutcome,
} from './tool-registry';

const OPTIONAL_NAME_FILTER: ToolInputSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description:
        'an optional component-name filter; omit it to read every component the page reports',
    },
  },
  required: [],
};

const REQUIRED_COMPONENT_ID: ToolInputSchema = {
  type: 'object',
  properties: {
    componentId: {
      type: 'string',
      description: 'the id of the component to read',
    },
  },
  required: ['componentId'],
};

const OPTIONAL_COMPONENT_ID: ToolInputSchema = {
  type: 'object',
  properties: {
    componentId: {
      type: 'string',
      description:
        'an optional component id; omit it to read the signals of the whole page',
    },
  },
  required: [],
};

/**
 * The two Tier-0 declarations carry the dev-mode restriction in their input description, where a
 * caller reads the schema before it offers the tool. Outside dev mode these APIs answer nothing,
 * so an empty read is not evidence that the page has no components or directives — and there is
 * no fallback read that would answer with a degraded guess.
 */
const REQUIRED_COMPONENT_ID_TIER0: ToolInputSchema = {
  type: 'object',
  properties: {
    componentId: {
      type: 'string',
      description:
        "the id of the component to read; getDirectiveMetadata is a Tier-0 debug API that answers nothing outside dev mode, so an empty read is not evidence that the page has no directives, and the page's own reason is passed through instead of a fallback read",
    },
  },
  required: ['componentId'],
};

const REQUIRED_COMPONENT_ID_TIER0_COMPONENT: ToolInputSchema = {
  type: 'object',
  properties: {
    componentId: {
      type: 'string',
      description:
        "the id of the component to read; getComponent is a Tier-0 debug API that answers nothing outside dev mode, so an empty read is not evidence that the page has no components, and the page's own reason is passed through instead of a fallback read",
    },
  },
  required: ['componentId'],
};

/**
 * The injector `provideReadTools()` was registered in.
 *
 * The envelope calls a backing as a plain function, outside any injection context, so
 * `inject(PAGE_HOST)` cannot run inside `execute`. The initializer below records the injector the
 * read tools were registered in, and every call resolves `PAGE_HOST` from it — one page's reads go
 * to that page's host, and a caller (a test, or a future transport) supplies its own host by
 * providing the token. No host is cached, so a provider replaced later is honoured.
 */
let readToolsInjector: Injector | null = null;

/** The page host for this call: the provided one, or the honest default when none was provided. */
function pageHost(): PageHost {
  return readToolsInjector?.get(PAGE_HOST) ?? UNAVAILABLE_PAGE_HOST;
}

/** A named failure: the page's own code and message, and the tool id the caller asked for. */
function pageFailure(
  toolId: PageReadKind,
  code: PageReadErrorCode,
  detail: string,
): ToolOutcome {
  return {
    kind: 'error',
    code,
    toolId,
    message: `the page read "${toolId}" answered with ${code}: ${detail}`,
  };
}

function describeFailure(failure: unknown): string {
  if (failure instanceof Error) {
    return failure.message;
  }
  try {
    return String(failure);
  } catch {
    return 'an unprintable failure';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The backing for one request kind: ask, then map. A result keeps the page's value and is labelled
 * `page-request`; an error keeps the page's code and message and names the tool. A host that
 * throws did not ask the page either, so it is reported as `host-unavailable` rather than allowed
 * to look like an answer.
 */
function pageReadBacking(toolId: PageReadKind): ToolBacking {
  const read: PageReader = PAGE_READERS[toolId];
  return {
    execute: async (input: unknown): Promise<ToolOutcome> => {
      const pageInput: Readonly<Record<string, unknown>> = isRecord(input)
        ? input
        : {};
      let response: PageResponse;
      try {
        response = await read(pageHost(), pageInput);
      } catch (failure: unknown) {
        return pageFailure(
          toolId,
          'host-unavailable',
          `the page host failed instead of answering, so the page was not read: ${describeFailure(failure)}`,
        );
      }
      if (response.status === 'result') {
        return {
          kind: 'result',
          value: response.value,
          provenance: 'page-request',
        };
      }
      return pageFailure(toolId, response.code, response.message);
    },
  };
}

/** `find_components`: the components the page reports, optionally filtered by name. */
export const findComponentsTool = defineTool(
  {
    id: 'find_components',
    title: 'Find the components of the inspected application',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
    input: OPTIONAL_NAME_FILTER,
  },
  pageReadBacking('find_components'),
);

/** `inspect_component`: one component's record, by id. */
export const inspectComponentTool = defineTool(
  {
    id: 'inspect_component',
    title: 'Inspect one component of the inspected application',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
    input: REQUIRED_COMPONENT_ID,
  },
  pageReadBacking('inspect_component'),
);

/** `list_signals`: the signals of one component, or of the page when no id is given. */
export const listSignalsTool = defineTool(
  {
    id: 'list_signals',
    title: 'List the signals of a component or of the inspected application',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
    input: OPTIONAL_COMPONENT_ID,
  },
  pageReadBacking('list_signals'),
);

/** `getDirectiveMetadata`: a Tier-0 read that answers only in a dev-mode page. */
export const getDirectiveMetadataTool = defineTool(
  {
    id: 'getDirectiveMetadata',
    title: 'Read the directive metadata of one component (dev mode only)',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
    input: REQUIRED_COMPONENT_ID_TIER0,
  },
  pageReadBacking('getDirectiveMetadata'),
);

/** `getComponent`: a Tier-0 read that answers only in a dev-mode page. */
export const getComponentTool = defineTool(
  {
    id: 'getComponent',
    title: 'Read one component through the Tier-0 debug API (dev mode only)',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
    input: REQUIRED_COMPONENT_ID_TIER0_COMPONENT,
  },
  pageReadBacking('getComponent'),
);

/** The five reads, in the order INTENT.md names them. */
export const READ_TOOLS: readonly ToolEntry[] = [
  findComponentsTool,
  inspectComponentTool,
  listSignalsTool,
  getDirectiveMetadataTool,
  getComponentTool,
];

/**
 * Registers the five reads and records the injector they resolve `PAGE_HOST` through. One line in
 * `app.config.ts`; no `*.component.ts` change anywhere.
 */
export function provideReadTools(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      readToolsInjector = inject(Injector);
    }),
    provideTools(...READ_TOOLS),
  ]);
}
