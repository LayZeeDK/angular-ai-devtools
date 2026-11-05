/**
 * The tool-registry envelope — M018.
 *
 * One registry every explainer reads through. A tool is two records:
 *
 * - a `ToolDeclaration`: the public claim about the tool, carrying the quadruple
 *   `kind` (read, write, confirm), `host` (page, iframe, panel, worker, extension-API, tester),
 *   `outcome` (result, confirm-required, async-handle, image, error) and `publish`
 *   (model, panel, internal), plus its input schema;
 * - a `ToolBacking`: the code that runs when the tool is called.
 *
 * The declaration is the only extension point: every tool module composes `defineTool` and
 * `provideTools`, and never edits this file.
 *
 * Two rules hold by construction and are the reason this module exists:
 *
 * 1. `execute` never throws. An unknown id, an unknown handle, an input that breaks the
 *    declared schema and a backing that fails all answer a named `ToolOutcome` of kind
 *    `'error'` with a `ToolErrorCode`; a declared tool with no backing answers
 *    `'not-implemented'` naming the tool. There is no path that yields an empty result and
 *    no path that yields a rejection, because a consumer cannot tell "the page has nothing"
 *    from "the call went wrong" once the outcome is empty.
 * 2. Failures carry structure, not prose: `ToolDeclarationError` exposes `toolId` and `field`
 *    so a caller can assert what was rejected without matching a sentence.
 *
 * The envelope is records, validation and execution — nothing else. It imports only
 * `@angular/core`, touches no page-realm global and exports no reader, so a reach check can
 * observe imports rather than trust a convention.
 */
import {
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  signal,
  type EnvironmentProviders,
  type Provider,
  type Signal,
} from '@angular/core';

/** What the tool does to the inspected application. */
export type ToolKind = 'read' | 'write' | 'confirm';

/** Where the tool runs — the reach it needs before it can be offered. */
export type ToolHost =
  'page' | 'iframe' | 'panel' | 'worker' | 'extension-API' | 'tester';

/** The shape of what the tool answers — exactly one of the `ToolOutcome` variants. */
export type ToolOutcomeKind =
  'result' | 'confirm-required' | 'async-handle' | 'image' | 'error';

/** Who may call the tool. The model loop filters on `'model'`. */
export type ToolPublish = 'model' | 'panel' | 'internal';

/** Where the value in a `ToolOutcome` came from. Page-published state is never trusted silently. */
export type ToolProvenance =
  'panel' | 'page-published' | 'page-request' | 'third-party';

/** The failure vocabulary. Every failure an `execute` call can report is one of these. */
export type ToolErrorCode =
  | 'not-implemented'
  | 'declaration-invalid'
  | 'invalid-input'
  | 'host-unavailable'
  | 'third-party-failed';

/** Page state a declaration may read to decide its own input schema. Never trusted implicitly. */
export type ToolFacts = Readonly<Record<string, unknown>>;

/** The input a tool accepts: a JSON-schema-shaped object, resolved at call time. */
export type ToolInputSchema = {
  readonly type: 'object';
  readonly properties: Readonly<
    Record<
      string,
      {
        readonly type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        readonly description?: string;
        readonly enum?: readonly string[];
      }
    >
  >;
  readonly required: readonly string[];
};

/** A tool's public claim: what it does, where it runs, what it answers and who may call it. */
export type ToolDeclaration = {
  readonly id: string;
  readonly title: string;
  readonly kind: ToolKind;
  readonly host: readonly ToolHost[];
  readonly outcome: ToolOutcomeKind;
  readonly publish: ToolPublish;
  readonly input: ToolInputSchema | ((facts: ToolFacts) => ToolInputSchema);
};

/** Every answer a tool can give. There is no throw and no bare empty value. */
export type ToolOutcome =
  | {
      readonly kind: 'result';
      readonly value: unknown;
      readonly provenance: ToolProvenance;
    }
  | {
      readonly kind: 'confirm-required';
      readonly token: string;
      readonly summary: string;
    }
  | { readonly kind: 'async-handle'; readonly handle: string }
  | {
      readonly kind: 'image';
      readonly mimeType: string;
      readonly dataUrl: string;
      readonly provenance: ToolProvenance;
    }
  | {
      readonly kind: 'error';
      readonly code: ToolErrorCode;
      readonly toolId: string;
      readonly message: string;
    };

/** What the backing is told about the call: the facts it may read and where they came from. */
export type ToolContext = {
  readonly facts: ToolFacts;
  readonly provenance: ToolProvenance;
};

/** The code behind a declaration. One method, and it answers an outcome rather than throwing. */
export type ToolBacking = {
  readonly execute: (
    input: unknown,
    context: ToolContext,
  ) => Promise<ToolOutcome>;
};

/** The registry surface. `tools` is the only observable surface; there is no second one. */
export type ToolRegistry = {
  readonly tools: Signal<readonly ToolDeclaration[]>;
  declare(declaration: ToolDeclaration): void;
  attach(toolId: string, backing: ToolBacking): void;
  execute(
    toolId: string,
    input?: unknown,
    context?: ToolContext,
  ): Promise<ToolOutcome>;
  awaitHandle(handle: string): Promise<ToolOutcome>;
};

/** A declaration paired with its backing — what `defineTool` produces and `provideTools` takes. */
export type ToolEntry = {
  readonly declaration: ToolDeclaration;
  readonly backing: ToolBacking;
};

/**
 * A rejected declaration. Carries the tool id and the offending field so a caller can assert
 * both without matching the message; the message names both as well.
 */
export class ToolDeclarationError extends Error {
  readonly toolId: string;
  readonly field: 'id' | 'kind' | 'host' | 'outcome' | 'publish' | 'input';

  constructor(
    toolId: string,
    field: 'id' | 'kind' | 'host' | 'outcome' | 'publish' | 'input',
    detail: string,
  ) {
    super(
      `tool declaration rejected: tool "${toolId}" field "${field}" ${detail}`,
    );
    this.name = 'ToolDeclarationError';
    this.toolId = toolId;
    this.field = field;
  }
}

/** Stands in for the id when a declaration carries no usable one, so both values stay assertable. */
const MISSING_TOOL_ID = '<missing-id>';

const TOOL_KINDS: readonly ToolKind[] = ['read', 'write', 'confirm'];
const TOOL_HOSTS: readonly ToolHost[] = [
  'page',
  'iframe',
  'panel',
  'worker',
  'extension-API',
  'tester',
];
const TOOL_OUTCOMES: readonly ToolOutcomeKind[] = [
  'result',
  'confirm-required',
  'async-handle',
  'image',
  'error',
];
const TOOL_PUBLISHES: readonly ToolPublish[] = ['model', 'panel', 'internal'];

type ToolInputProperty = ToolInputSchema['properties'][string];

const SCHEMA_TYPES: readonly ToolInputProperty['type'][] = [
  'string',
  'number',
  'boolean',
  'object',
  'array',
];

const EMPTY_FACTS: ToolFacts = Object.freeze({});

/** The token the panel and every tool module resolve the registry through. */
export const TOOL_REGISTRY = new InjectionToken<ToolRegistry>(
  'angular-ai-devtools:tool-registry',
);

/** Entries contributed by `provideTools`, gathered before the registry is built. */
const TOOL_ENTRIES = new InjectionToken<readonly (readonly ToolEntry[])[]>(
  'angular-ai-devtools:tool-registry.entries',
);

/** Pairs a declaration with its backing. The authoring surface every tool module uses. */
export function defineTool(
  declaration: ToolDeclaration,
  backing: ToolBacking,
): ToolEntry {
  return { declaration, backing };
}

/** Registers entries with the registry the injector builds; outlives no injector. */
export function provideTools(
  ...entries: readonly ToolEntry[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TOOL_ENTRIES, useValue: entries, multi: true },
    ...registryProviders(),
  ]);
}

/** Provides the registry itself, with no tools of its own. */
export function provideToolRegistry(): EnvironmentProviders {
  return makeEnvironmentProviders(registryProviders());
}

function registryProviders(): Provider[] {
  return [
    {
      provide: TOOL_REGISTRY,
      useFactory: (): ToolRegistry => {
        const registry = createToolRegistry();
        const batches = inject(TOOL_ENTRIES, { optional: true }) ?? [];
        for (const entries of batches) {
          for (const entry of entries) {
            registry.declare(entry.declaration);
            registry.attach(entry.declaration.id, entry.backing);
          }
        }
        return registry;
      },
    },
  ];
}

function createToolRegistry(): ToolRegistry {
  const declarations = signal<readonly ToolDeclaration[]>([]);
  const declaredIds = new Set<string>();
  const backings = new Map<string, ToolBacking>();
  // Handle bookkeeping lives on the instance: one promise per handle, and the outcome once it
  // has settled. No timers and no polling — a pending handle is answered from the map, a settled
  // one from the recorded outcome.
  const pendingHandles = new Map<string, Promise<ToolOutcome>>();
  const settledHandles = new Map<string, ToolOutcome>();
  let handleCount = 0;

  return {
    tools: declarations.asReadonly(),

    declare: (declaration: ToolDeclaration): void => {
      assertDeclaration(declaration, declaredIds);
      declaredIds.add(declaration.id);
      declarations.update((current) => [...current, declaration]);
    },

    attach: (toolId: string, backing: ToolBacking): void => {
      if (!declaredIds.has(toolId)) {
        throw new ToolDeclarationError(
          toolId,
          'id',
          'has no declaration; declare() the tool before attaching a backing',
        );
      }
      backings.set(toolId, backing);
    },

    execute: async (
      toolId: string,
      input?: unknown,
      context?: ToolContext,
    ): Promise<ToolOutcome> => {
      const declaration = declarations().find(
        (candidate) => candidate.id === toolId,
      );
      if (declaration === undefined) {
        return errorOutcome(
          'invalid-input',
          toolId,
          `no tool is declared with the id "${toolId}"`,
        );
      }

      const backing = backings.get(toolId);
      if (backing === undefined) {
        return errorOutcome(
          'not-implemented',
          toolId,
          `the tool "${toolId}" is declared but has no backing, so there is nothing to run`,
        );
      }

      const facts = context?.facts ?? EMPTY_FACTS;
      const check = checkInput(declaration, facts, input);
      if (!check.ok) {
        return errorOutcome(
          check.code,
          toolId,
          `the input for tool "${toolId}" is unusable: ${check.detail}`,
        );
      }
      const resolved: ToolContext = {
        facts,
        provenance: context?.provenance ?? 'panel',
      };

      let running: Promise<ToolOutcome>;
      try {
        running = Promise.resolve(backing.execute(input, resolved));
      } catch (error: unknown) {
        return failureOutcome(toolId, error);
      }

      if (declaration.outcome === 'async-handle') {
        handleCount += 1;
        const handle = `${toolId}#${handleCount}`;
        const tracked = running.then(
          (outcome) => {
            settledHandles.set(handle, outcome);
            return outcome;
          },
          (error: unknown) => {
            const outcome = failureOutcome(toolId, error);
            settledHandles.set(handle, outcome);
            return outcome;
          },
        );
        pendingHandles.set(handle, tracked);
        return { kind: 'async-handle', handle };
      }

      try {
        return await running;
      } catch (error: unknown) {
        return failureOutcome(toolId, error);
      }
    },

    awaitHandle: async (handle: string): Promise<ToolOutcome> => {
      if (!pendingHandles.has(handle)) {
        return errorOutcome(
          'invalid-input',
          handle,
          `no async handle "${handle}" is registered with this registry`,
        );
      }
      const settled = settledHandles.get(handle);
      if (settled !== undefined) {
        return settled;
      }
      return { kind: 'async-handle', handle };
    },
  };
}

type InputCheck =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: ToolErrorCode;
      readonly detail: string;
    };

/**
 * Checks the call's input against the declaration's schema. A static schema was already
 * validated by `declare`; a schema built from the facts is resolved here, and a schema function
 * that fails is reported rather than thrown.
 */
function checkInput(
  declaration: ToolDeclaration,
  facts: ToolFacts,
  input: unknown,
): InputCheck {
  const source = declaration.input;
  let resolvedSchema: unknown;
  if (typeof source === 'function') {
    try {
      resolvedSchema = source(facts);
    } catch (error: unknown) {
      return {
        ok: false,
        code: 'declaration-invalid',
        detail: `building the input schema from the facts failed: ${describeFailure(error)}`,
      };
    }
  } else {
    resolvedSchema = source;
  }
  if (!isRecord(resolvedSchema)) {
    return {
      ok: false,
      code: 'declaration-invalid',
      detail: 'the input schema is not an object',
    };
  }

  const rawRequired: unknown = resolvedSchema['required'];
  const required: readonly string[] = Array.isArray(rawRequired)
    ? rawRequired.filter((entry): entry is string => typeof entry === 'string')
    : [];
  const rawProperties: unknown = resolvedSchema['properties'];
  const properties: Readonly<Record<string, unknown>> = isRecord(rawProperties)
    ? rawProperties
    : {};

  const value: unknown = input === undefined ? {} : input;
  if (!isRecord(value)) {
    return {
      ok: false,
      code: 'invalid-input',
      detail: 'input must be an object',
    };
  }
  for (const name of required) {
    if (value[name] === undefined) {
      return {
        ok: false,
        code: 'invalid-input',
        detail: `it is missing the required property "${name}"`,
      };
    }
  }
  for (const [name, rawProperty] of Object.entries(properties)) {
    const actual = value[name];
    if (actual === undefined) {
      continue;
    }
    const property: Readonly<Record<string, unknown>> = isRecord(rawProperty)
      ? rawProperty
      : {};
    const declaredType = property['type'];
    if (!matchesSchemaType(actual, declaredType)) {
      return {
        ok: false,
        code: 'invalid-input',
        detail: `the property "${name}" must be of type "${String(declaredType)}"`,
      };
    }
    const allowed: unknown = property['enum'];
    if (Array.isArray(allowed) && !allowed.includes(actual)) {
      return {
        ok: false,
        code: 'invalid-input',
        detail: `the property "${name}" must be one of ${allowed.map((entry: unknown) => String(entry)).join(', ')}`,
      };
    }
  }
  return { ok: true };
}

function matchesSchemaType(value: unknown, declaredType: unknown): boolean {
  switch (declaredType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return isRecord(value);
    default:
      // A type outside the schema vocabulary cannot be checked. `declare` rejects it for a
      // static schema; a schema built from the facts is not the caller's fault.
      return true;
  }
}

function assertDeclaration(
  declaration: ToolDeclaration,
  declaredIds: ReadonlySet<string>,
): void {
  const record: Partial<ToolDeclaration> = declaration ?? {};

  const rawId: unknown = record.id;
  if (typeof rawId !== 'string' || rawId.trim().length === 0) {
    throw new ToolDeclarationError(
      MISSING_TOOL_ID,
      'id',
      'is missing or empty',
    );
  }
  const toolId = rawId;

  const kind: unknown = record.kind;
  if (kind === undefined || kind === null) {
    throw new ToolDeclarationError(toolId, 'kind', 'is missing');
  }
  if (!isOneOf(kind, TOOL_KINDS)) {
    throw new ToolDeclarationError(
      toolId,
      'kind',
      `is "${String(kind)}", which is not one of ${TOOL_KINDS.join(', ')}`,
    );
  }

  const host: unknown = record.host;
  if (host === undefined || host === null) {
    throw new ToolDeclarationError(toolId, 'host', 'is missing');
  }
  if (!Array.isArray(host)) {
    throw new ToolDeclarationError(toolId, 'host', 'must be a list of hosts');
  }
  if (host.length === 0) {
    throw new ToolDeclarationError(
      toolId,
      'host',
      'is empty; a declaration must name at least one host',
    );
  }
  for (const entry of host as readonly unknown[]) {
    if (!isOneOf(entry, TOOL_HOSTS)) {
      throw new ToolDeclarationError(
        toolId,
        'host',
        `contains "${String(entry)}", which is not one of ${TOOL_HOSTS.join(', ')}`,
      );
    }
  }

  const outcome: unknown = record.outcome;
  if (outcome === undefined || outcome === null) {
    throw new ToolDeclarationError(toolId, 'outcome', 'is missing');
  }
  if (!isOneOf(outcome, TOOL_OUTCOMES)) {
    throw new ToolDeclarationError(
      toolId,
      'outcome',
      `is "${String(outcome)}", which is not one of ${TOOL_OUTCOMES.join(', ')}`,
    );
  }

  const publish: unknown = record.publish;
  if (publish === undefined || publish === null) {
    throw new ToolDeclarationError(toolId, 'publish', 'is missing');
  }
  if (!isOneOf(publish, TOOL_PUBLISHES)) {
    throw new ToolDeclarationError(
      toolId,
      'publish',
      `is "${String(publish)}", which is not one of ${TOOL_PUBLISHES.join(', ')}`,
    );
  }

  assertInputSchema(toolId, record.input);

  if (declaredIds.has(toolId)) {
    throw new ToolDeclarationError(
      toolId,
      'id',
      'is already declared; tool ids are unique within a registry',
    );
  }
}

function assertInputSchema(toolId: string, input: unknown): void {
  if (typeof input === 'function') {
    return;
  }
  if (!isRecord(input)) {
    throw new ToolDeclarationError(
      toolId,
      'input',
      'is missing; a declaration must carry an input schema or a function that builds one from the facts',
    );
  }
  if (input['type'] !== 'object') {
    throw new ToolDeclarationError(
      toolId,
      'input',
      'must have the type "object"',
    );
  }
  const properties: unknown = input['properties'];
  if (!isRecord(properties)) {
    throw new ToolDeclarationError(
      toolId,
      'input',
      'must carry a properties record',
    );
  }
  if (!Array.isArray(input['required'])) {
    throw new ToolDeclarationError(
      toolId,
      'input',
      'must carry a required list',
    );
  }
  for (const [name, rawProperty] of Object.entries(properties)) {
    if (!isRecord(rawProperty)) {
      throw new ToolDeclarationError(
        toolId,
        'input',
        `describes "${name}" without a property record`,
      );
    }
    if (!isOneOf(rawProperty['type'], SCHEMA_TYPES)) {
      throw new ToolDeclarationError(
        toolId,
        'input',
        `describes "${name}" with a type outside ${SCHEMA_TYPES.join(', ')}`,
      );
    }
    const allowed: unknown = rawProperty['enum'];
    if (
      allowed !== undefined &&
      (!Array.isArray(allowed) ||
        allowed.some((entry: unknown) => typeof entry !== 'string'))
    ) {
      throw new ToolDeclarationError(
        toolId,
        'input',
        `describes "${name}" with an enum that is not a list of strings`,
      );
    }
  }
}

function errorOutcome(
  code: ToolErrorCode,
  toolId: string,
  message: string,
): ToolOutcome {
  return { kind: 'error', code, toolId, message };
}

/** A backing that failed to answer is still an outcome, never a rejection. */
function failureOutcome(toolId: string, failure: unknown): ToolOutcome {
  return errorOutcome(
    'third-party-failed',
    toolId,
    `the backing for tool "${toolId}" failed instead of returning an outcome: ${describeFailure(failure)}`,
  );
}

function describeFailure(failure: unknown): string {
  if (failure instanceof Error) {
    return failure.message;
  }
  try {
    return String(failure);
  } catch {
    return 'unknown failure';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return (
    typeof value === 'string' && (allowed as readonly string[]).includes(value)
  );
}
