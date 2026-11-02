/**
 * Six hostile tools — the envelope's conformance suite, not a capability.
 *
 * Each shape exists because it carries a `kind`, a `host` or an `outcome` the other five do not,
 * so these six are the only defence the envelope gets before the generation-1 explainers inherit
 * it. No explainer uses them: every one is `publish: 'internal'` and they are registered by
 * `hostile-tools.spec.ts` in its own TestBed rather than by `app.config.ts`, which keeps them off
 * the panel's initial-bundle path (AR-1) and keeps the shipped tool list honest.
 *
 * Every declaration is authored through `defineTool`, and nothing here edits `tool-registry.ts`:
 * the declaration record is the only extension point this suite exists to prove. The backings are
 * a few lines each by design — the deliverable is the envelope under stress, not six tools.
 */
import {
  defineTool,
  type ToolBacking,
  type ToolEntry,
  type ToolErrorCode,
  type ToolFacts,
  type ToolInputSchema,
  type ToolOutcome,
} from './tool-registry';

/** A failure that names the tool it belongs to. `execute` never throws, so every failure is this. */
function failure(toolId: string, code: ToolErrorCode, message: string): ToolOutcome {
  return { kind: 'error', code, toolId, message };
}

/** A wrapped third-party throw or rejection is reported, not rethrown. */
function describeFailure(failureValue: unknown): string {
  if (failureValue instanceof Error) {
    return failureValue.message;
  }
  try {
    return String(failureValue);
  } catch {
    return 'an unprintable failure';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * `confirm_write` — a write that must not happen until a confirmation presents its token.
 *
 * AR-6: confirmations live in the panel, never in the page, so the first call performs nothing and
 * answers `confirm-required`; presenting that token through `execute` performs the write exactly
 * once; a second use of the same token is refused as `invalid-input` rather than performed again.
 * There is no panel component for it — the shape is what this suite proves, not the UI.
 */
const CONFIRM_WRITE_ID = 'confirm_write';

/**
 * Every write `confirm_write` has actually performed, in order. A page write can only be observed
 * through a ledger, so the shape keeps one; only the conformance spec reads it.
 */
export const CONFIRM_WRITE_LEDGER: string[] = [];

function confirmWriteBacking(): ToolBacking {
  // Tokens live on the entry's closure: issued ones are remembered so a presented token can be
  // checked, and spent ones so a second use is refused instead of writing twice.
  const issued = new Set<string>();
  const spent = new Set<string>();
  let tokenCount = 0;

  return {
    execute: async (input: unknown): Promise<ToolOutcome> => {
      const presented: unknown = isRecord(input) ? input['token'] : undefined;

      if (presented === undefined) {
        tokenCount += 1;
        const token = `${CONFIRM_WRITE_ID}#${tokenCount}`;
        issued.add(token);
        return {
          kind: 'confirm-required',
          token,
          summary: 'Append one row to the page audit log.',
        };
      }

      if (typeof presented !== 'string' || !issued.has(presented) || spent.has(presented)) {
        return failure(
          CONFIRM_WRITE_ID,
          'invalid-input',
          `the confirmation token "${String(presented)}" was not issued by a pending call, or has already been spent`,
        );
      }

      spent.add(presented);
      CONFIRM_WRITE_LEDGER.push(presented);
      return { kind: 'result', value: { written: 1 }, provenance: 'panel' };
    },
  };
}

export const confirmWrite = defineTool(
  {
    id: CONFIRM_WRITE_ID,
    title: 'Write once a panel confirmation presents its token',
    kind: 'write',
    host: ['panel'],
    outcome: 'confirm-required',
    publish: 'internal',
    input: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'the token a previous call answered' },
      },
      required: [],
    },
  },
  confirmWriteBacking(),
);

/**
 * `async_scan` — a read that answers with an async handle instead of a value.
 *
 * The backing's promise is what the registry stores, so `awaitHandle` settles to the result with
 * no timer, no worker boundary and no progress reporting: M019 owns jobs and cancellation.
 */
export const asyncScan = defineTool(
  {
    id: 'async_scan',
    title: 'Scan the page for interactive elements',
    kind: 'read',
    host: ['worker'],
    outcome: 'async-handle',
    publish: 'internal',
    input: {
      type: 'object',
      properties: { scope: { type: 'string', description: 'the subtree to scan' } },
      required: [],
    },
  },
  {
    execute: async (): Promise<ToolOutcome> => ({
      kind: 'result',
      value: { interactive: 12 },
      provenance: 'page-request',
    }),
  },
);

/** A constant 1×1 transparent PNG: no canvas, no network and no `document` (AR-3). */
const TRANSPARENT_PIXEL_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/**
 * `snapshot_image` — a read whose answer is not a value but an image outcome. Nothing is drawn and
 * nothing is fetched; the shape is that `outcome: 'image'` carries a mime type and a data URL.
 */
export const snapshotImage = defineTool(
  {
    id: 'snapshot_image',
    title: 'Read a snapshot of the page as an image',
    kind: 'read',
    host: ['page'],
    outcome: 'image',
    publish: 'internal',
    input: { type: 'object', properties: {}, required: [] },
  },
  {
    execute: async (): Promise<ToolOutcome> => ({
      kind: 'image',
      mimeType: 'image/png',
      dataUrl: `data:image/png;base64,${TRANSPARENT_PIXEL_PNG}`,
      provenance: 'page-request',
    }),
  },
);

/**
 * `dual_host_read` — one read that needs two hosts at once: the panel's own record and the title
 * the page published. Its `host` is the pair, so no single-host read can stand in for it.
 *
 * An outcome carries one provenance, so the merged answer reports the provenance the caller
 * assigned to the call; the page half is never silently presented as the panel's own.
 */
export const dualHostRead = defineTool(
  {
    id: 'dual_host_read',
    title: 'Read the page title alongside the panel record',
    kind: 'read',
    host: ['page', 'panel'],
    outcome: 'result',
    publish: 'internal',
    input: { type: 'object', properties: {}, required: [] },
  },
  {
    execute: async (_input: unknown, context): Promise<ToolOutcome> => {
      const title = context.facts['title'];
      return {
        kind: 'result',
        value: {
          pageTitle: typeof title === 'string' ? title : '(the page published no title)',
          panelRecord: { view: 'panel', framework: 'angular' },
        },
        provenance: context.provenance,
      };
    },
  },
);

/** A third-party tool as the page's extension API hands it over: a name and one `invoke`. */
export type ThirdPartyTool = {
  readonly name: string;
  readonly invoke: (input: unknown) => unknown;
};

const WRAPPED_THIRD_PARTY_ID = 'wrapped_third_party';

/**
 * `wrapped_third_party` — a read that wraps a tool the panel does not own. A throw or a rejected
 * promise is normalised at the wrap into `third-party-failed`, so a rejection never reaches the
 * registry, and a success keeps `provenance: 'third-party'` rather than being relabelled as the
 * panel's own answer.
 */
export function wrappedThirdPartyTool(thirdParty: ThirdPartyTool): ToolEntry {
  return defineTool(
    {
      id: WRAPPED_THIRD_PARTY_ID,
      title: 'Read through a third-party extension tool',
      kind: 'read',
      host: ['extension-API'],
      outcome: 'result',
      publish: 'internal',
      input: {
        type: 'object',
        properties: { query: { type: 'string', description: 'what to ask the wrapped tool' } },
        required: [],
      },
    },
    {
      execute: async (input: unknown): Promise<ToolOutcome> => {
        try {
          return {
            kind: 'result',
            value: await thirdParty.invoke(input),
            provenance: 'third-party',
          };
        } catch (error: unknown) {
          return failure(
            WRAPPED_THIRD_PARTY_ID,
            'third-party-failed',
            `the third-party tool "${thirdParty.name}" failed: ${describeFailure(error)}`,
          );
        }
      },
    },
  );
}

/** The declaration's own third party — what the conformance spec registers by default. */
export const wrappedThirdParty = wrappedThirdPartyTool({
  name: 'outline-extension',
  invoke: (input: unknown): unknown => ({
    tool: 'outline-extension',
    outline: ['header', 'main', 'footer'],
    input,
  }),
});

/**
 * `page_state_schema` — a read whose `input` is a function of `ToolFacts`, so one declaration
 * compiles to a different schema per page. The fact it needs is the list of forms the page
 * published; when that fact is absent the schema cannot be built, and `execute` says so with
 * `host-unavailable` naming the tool rather than answering an empty result.
 */
const PAGE_FORMS_FACT = 'forms';

const PAGE_STATE_SCHEMA_ID = 'page_state_schema';

function knownForms(facts: ToolFacts): readonly string[] | undefined {
  const forms = facts[PAGE_FORMS_FACT];
  if (!Array.isArray(forms)) {
    return undefined;
  }
  const known = forms.filter((entry): entry is string => typeof entry === 'string');
  return known.length === 0 ? undefined : known;
}

/** The declaration's schema builder: permissive without the fact, enumerated with it. */
export const pageStateSchemaInput = (facts: ToolFacts): ToolInputSchema => {
  const forms = knownForms(facts);
  if (forms === undefined) {
    // Nothing can be enumerated, so the schema requires nothing. `execute` reports the missing
    // fact as `host-unavailable`; a permissive schema here must not turn that into `invalid-input`.
    return { type: 'object', properties: {}, required: [] };
  }
  return {
    type: 'object',
    properties: {
      form: { type: 'string', enum: forms, description: 'a form the page published' },
    },
    required: ['form'],
  };
};

export const pageStateSchema = defineTool(
  {
    id: PAGE_STATE_SCHEMA_ID,
    title: 'Read a form the current page publishes',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'internal',
    input: pageStateSchemaInput,
  },
  {
    execute: async (input: unknown, context): Promise<ToolOutcome> => {
      const forms = knownForms(context.facts);
      if (forms === undefined) {
        return failure(
          PAGE_STATE_SCHEMA_ID,
          'host-unavailable',
          'the page published no form list, so this tool cannot say which forms exist',
        );
      }
      const form: unknown = isRecord(input) ? input['form'] : undefined;
      if (typeof form !== 'string' || !forms.includes(form)) {
        return failure(
          PAGE_STATE_SCHEMA_ID,
          'invalid-input',
          `"${String(form)}" is not one of the forms this page published (${forms.join(', ')})`,
        );
      }
      return {
        kind: 'result',
        value: { form, forms },
        provenance: 'page-published',
      };
    },
  },
);

/**
 * The six hostile shapes in declaration order: one write with confirm, one async handle, one
 * image, one two-host read, one wrapped third-party tool and one page-state-dependent schema.
 */
export const HOSTILE_TOOLS: readonly ToolEntry[] = [
  confirmWrite,
  asyncScan,
  snapshotImage,
  dualHostRead,
  wrappedThirdParty,
  pageStateSchema,
];
