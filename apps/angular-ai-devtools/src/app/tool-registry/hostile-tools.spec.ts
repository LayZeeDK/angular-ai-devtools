import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  CONFIRM_WRITE_LEDGER,
  HOSTILE_TOOLS,
  asyncScan,
  confirmWrite,
  dualHostRead,
  pageStateSchema,
  pageStateSchemaInput,
  snapshotImage,
  wrappedThirdParty,
  wrappedThirdPartyTool,
  type ThirdPartyTool,
} from './hostile-tools';
import {
  TOOL_REGISTRY,
  ToolDeclarationError,
  provideTools,
  provideToolRegistry,
  type ToolDeclaration,
  type ToolEntry,
  type ToolHost,
  type ToolKind,
  type ToolOutcome,
  type ToolOutcomeKind,
  type ToolRegistry,
} from './tool-registry';

// The declared fields each shape is pinned on. Never the title and never a message: the whole
// point of E1 is that the envelope's structured fields are what a consumer reads.
type Shape = {
  readonly id: string;
  readonly entry: ToolEntry;
  readonly kind: ToolKind;
  readonly host: readonly ToolHost[];
  readonly outcome: ToolOutcomeKind;
};

const SHAPES: readonly Shape[] = [
  {
    id: 'confirm_write',
    entry: confirmWrite,
    kind: 'write',
    host: ['panel'],
    outcome: 'confirm-required',
  },
  { id: 'async_scan', entry: asyncScan, kind: 'read', host: ['worker'], outcome: 'async-handle' },
  { id: 'snapshot_image', entry: snapshotImage, kind: 'read', host: ['page'], outcome: 'image' },
  {
    id: 'dual_host_read',
    entry: dualHostRead,
    kind: 'read',
    host: ['page', 'panel'],
    outcome: 'result',
  },
  {
    id: 'wrapped_third_party',
    entry: wrappedThirdParty,
    kind: 'read',
    host: ['extension-API'],
    outcome: 'result',
  },
  {
    id: 'page_state_schema',
    entry: pageStateSchema,
    kind: 'read',
    host: ['page'],
    outcome: 'result',
  },
];

const ALL_HOSTILE_IDS = [
  'confirm_write',
  'async_scan',
  'snapshot_image',
  'dual_host_read',
  'wrapped_third_party',
  'page_state_schema',
];

/**
 * A TestBed of the spec's own: the hostile shapes are registered through `provideTools()` here and
 * nowhere else, so neither `app.config.ts` nor `tool-registry.ts` is touched to make them work.
 */
function newRegistry(entries: readonly ToolEntry[] = HOSTILE_TOOLS): ToolRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideTools(...entries)] });
  return TestBed.inject(TOOL_REGISTRY);
}

/** An empty registry, so a rejected declaration is the only one it could ever hold. */
function emptyRegistry(): ToolRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideToolRegistry()] });
  return TestBed.inject(TOOL_REGISTRY);
}

/** Replaces one shape by id, so a variant can keep the declaration's id without duplicating it. */
function withReplacement(replacement: ToolEntry): readonly ToolEntry[] {
  return HOSTILE_TOOLS.map((entry) =>
    entry.declaration.id === replacement.declaration.id ? replacement : entry,
  );
}

/**
 * Waits for an async handle to settle. The envelope stores the backing's promise, so this drains
 * microtasks in a bounded loop: no timers, and a handle that never settles fails the test rather
 * than hanging it.
 */
async function settle(registry: ToolRegistry, handle: string): Promise<ToolOutcome> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const outcome = await registry.awaitHandle(handle);
    if (outcome.kind !== 'async-handle') {
      return outcome;
    }
    await Promise.resolve();
  }
  throw new Error(`the async handle "${handle}" never settled`);
}

function outcomeErrorOf(registry: ToolRegistry, candidate: ToolDeclaration): ToolDeclarationError {
  let thrown: unknown;
  try {
    registry.declare(candidate);
  } catch (error: unknown) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(ToolDeclarationError);
  return thrown as ToolDeclarationError;
}

describe('hostile tools against the envelope', () => {
  it('declares exactly six internal shapes and exports each one on its own', () => {
    expect(HOSTILE_TOOLS).toHaveLength(SHAPES.length);
    expect(HOSTILE_TOOLS.map((entry) => entry.declaration.id)).toEqual(ALL_HOSTILE_IDS);
    expect(HOSTILE_TOOLS).toEqual(SHAPES.map((shape) => shape.entry));

    for (const shape of SHAPES) {
      expect(shape.entry.declaration.id).toBe(shape.id);
      expect(shape.entry.declaration.publish).toBe('internal');
    }

    // The page-state shape is the only declaration whose input depends on the page; the other five
    // carry a static schema, which is what keeps it from being a re-label of a Tier-0 read.
    expect(typeof pageStateSchema.declaration.input).toBe('function');
    for (const shape of SHAPES) {
      if (shape.id !== 'page_state_schema') {
        expect(typeof shape.entry.declaration.input).toBe('object');
      }
    }
  });

  it('N1 gives the six shapes pairwise distinct kind, host and outcome triples', () => {
    const triples = HOSTILE_TOOLS.map(
      ({ declaration }) =>
        `${declaration.kind}|${declaration.host.join('+')}|${declaration.outcome}`,
    );

    expect(new Set(triples).size).toBe(triples.length);
    expect(triples).toEqual([
      'write|panel|confirm-required',
      'read|worker|async-handle',
      'read|page|image',
      'read|page+panel|result',
      'read|extension-API|result',
      'read|page|result',
    ]);
    // Only one shape needs two hosts, and only the page-state shape shares its triple with a
    // plain Tier-0 page read — the difference is carried by `input`, not by the triple.
    expect(HOSTILE_TOOLS.filter((entry) => entry.declaration.host.length > 1)).toHaveLength(1);
  });

  it('E1 every hostile shape declares its kind, host and outcome, and a declaration missing one field fails naming the tool id', () => {
    for (const shape of SHAPES) {
      const declaration = shape.entry.declaration;
      expect(declaration.kind).toBe(shape.kind);
      expect(declaration.host).toEqual(shape.host);
      expect(declaration.outcome).toBe(shape.outcome);
    }

    const requiredFields = ['kind', 'host', 'outcome', 'publish', 'input'] as const;
    for (const shape of SHAPES) {
      for (const field of requiredFields) {
        const registry = emptyRegistry();
        const broken: Record<string, unknown> = { ...shape.entry.declaration };
        delete broken[field];

        const error = outcomeErrorOf(registry, broken as unknown as ToolDeclaration);

        expect(error.field, `${shape.id} without its ${field}`).toBe(field);
        expect(error.toolId, `${shape.id} without its ${field}`).toBe(shape.id);
        expect(registry.tools()).toEqual([]);
      }
    }
  });

  it('performs no write until a confirmation token is presented, writes exactly once, and refuses a second use of that token', async () => {
    const registry = newRegistry();
    const performedBefore = CONFIRM_WRITE_LEDGER.length;

    const started = await registry.execute('confirm_write', {});

    expect(started).toMatchObject({ kind: 'confirm-required' });
    expect(CONFIRM_WRITE_LEDGER.length).toBe(performedBefore);
    if (started.kind !== 'confirm-required') {
      throw new Error('the write answered something other than a confirmation request');
    }
    expect(started.token.length).toBeGreaterThan(0);
    expect(started.summary.length).toBeGreaterThan(0);

    const confirmed = await registry.execute('confirm_write', { token: started.token });

    expect(confirmed).toMatchObject({ kind: 'result', provenance: 'panel' });
    expect(CONFIRM_WRITE_LEDGER.length).toBe(performedBefore + 1);
    expect(CONFIRM_WRITE_LEDGER[performedBefore]).toBe(started.token);

    const repeated = await registry.execute('confirm_write', { token: started.token });

    expect(repeated).toMatchObject({ kind: 'error', code: 'invalid-input' });
    expect(CONFIRM_WRITE_LEDGER.length).toBe(performedBefore + 1);

    const invented = await registry.execute('confirm_write', { token: 'confirm_write#999' });

    expect(invented).toMatchObject({ kind: 'error', code: 'invalid-input' });
    expect(CONFIRM_WRITE_LEDGER.length).toBe(performedBefore + 1);
  });

  it('answers an async handle at once and settles that handle to the shape result', async () => {
    const registry = newRegistry();

    const started = await registry.execute('async_scan', { scope: 'main' });

    expect(started).toMatchObject({ kind: 'async-handle' });
    if (started.kind !== 'async-handle') {
      throw new Error('the scan answered something other than an async handle');
    }
    expect(started.handle.length).toBeGreaterThan(0);

    await expect(settle(registry, started.handle)).resolves.toMatchObject({
      kind: 'result',
      provenance: 'page-request',
    });
    await expect(settle(registry, started.handle)).resolves.toMatchObject({ kind: 'result' });
  });

  it('answers an image outcome carrying a mime type and a data URL for a 1×1 transparent PNG', async () => {
    const registry = newRegistry();

    const outcome = await registry.execute('snapshot_image', {});

    expect(outcome).toMatchObject({ kind: 'image', mimeType: 'image/png' });
    if (outcome.kind !== 'image') {
      throw new Error('the snapshot answered something other than an image');
    }
    const prefix = 'data:image/png;base64,';
    expect(outcome.dataUrl.startsWith(prefix)).toBe(true);

    // The data URL is a real PNG: magic bytes, then a 1×1 IHDR, not a placeholder string.
    const bytes = Uint8Array.from(atob(outcome.dataUrl.slice(prefix.length)), (character) =>
      character.charCodeAt(0),
    );
    expect(String.fromCharCode(...bytes.subarray(0, 8))).toBe('\x89PNG\r\n\x1a\n');
    expect([bytes[16], bytes[17], bytes[18], bytes[19]]).toEqual([0, 0, 0, 1]);
    expect([bytes[20], bytes[21], bytes[22], bytes[23]]).toEqual([0, 0, 0, 1]);
  });

  it('builds the page-state schema from the page facts and reports host-unavailable, never an empty result, without them', async () => {
    const registry = newRegistry();

    const forCheckoutPage = pageStateSchemaInput({ forms: ['checkout', 'search'] });
    const forSignupPage = pageStateSchemaInput({ forms: ['signup'] });
    const withoutFacts = pageStateSchemaInput({});

    expect(forCheckoutPage.properties['form']?.enum).toEqual(['checkout', 'search']);
    expect(forCheckoutPage.required).toEqual(['form']);
    expect(forSignupPage.properties['form']?.enum).toEqual(['signup']);
    expect(forSignupPage).not.toEqual(forCheckoutPage);
    expect(withoutFacts).toEqual({ type: 'object', properties: {}, required: [] });

    await expect(
      registry.execute(
        'page_state_schema',
        { form: 'checkout' },
        { facts: { forms: ['checkout', 'search'] }, provenance: 'page-published' },
      ),
    ).resolves.toMatchObject({
      kind: 'result',
      value: { form: 'checkout' },
      provenance: 'page-published',
    });

    const absent = await registry.execute(
      'page_state_schema',
      { form: 'checkout' },
      { facts: {}, provenance: 'page-published' },
    );

    expect(absent).toMatchObject({
      kind: 'error',
      code: 'host-unavailable',
      toolId: 'page_state_schema',
    });
    expect(absent.kind).not.toBe('result');
  });

  it('labels a wrapped third-party success third-party and normalises a throw or a rejection without throwing', async () => {
    const registry = newRegistry();

    await expect(
      registry.execute('wrapped_third_party', { query: 'outline' }),
    ).resolves.toMatchObject({
      kind: 'result',
      provenance: 'third-party',
      value: { tool: 'outline-extension' },
    });

    const throwing: ThirdPartyTool = {
      name: 'broken-extension',
      invoke: (): unknown => {
        throw new Error('the extension is not listening');
      },
    };
    const rejecting: ThirdPartyTool = {
      name: 'flaky-extension',
      invoke: (): unknown => Promise.reject('socket closed'),
    };

    await expect(
      newRegistry(withReplacement(wrappedThirdPartyTool(throwing))).execute(
        'wrapped_third_party',
        {},
      ),
    ).resolves.toMatchObject({
      kind: 'error',
      code: 'third-party-failed',
      toolId: 'wrapped_third_party',
    });
    await expect(
      newRegistry(withReplacement(wrappedThirdPartyTool(rejecting))).execute(
        'wrapped_third_party',
        {},
      ),
    ).resolves.toMatchObject({
      kind: 'error',
      code: 'third-party-failed',
      toolId: 'wrapped_third_party',
    });
  });

  it('registers every shape through provideTools in this spec’s own TestBed, each with a backing', async () => {
    const registry = newRegistry();

    expect(registry.tools().map((declaration) => declaration.id)).toEqual(ALL_HOSTILE_IDS);

    for (const entry of HOSTILE_TOOLS) {
      expect(typeof entry.backing.execute).toBe('function');
      const outcome = await registry.execute(entry.declaration.id, {});
      // A declared tool with no backing would answer `not-implemented`; none of the six does.
      expect(outcome).not.toMatchObject({ kind: 'error', code: 'not-implemented' });
    }
  });
});
