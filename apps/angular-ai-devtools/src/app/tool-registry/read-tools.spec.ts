import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  PAGE_HOST,
  PAGE_HOST_UNAVAILABLE_REASON,
  PAGE_READERS,
  PAGE_READ_KINDS,
  readComponent,
  readComponents,
  readDirectiveMetadata,
  readPageComponent,
  readSignals,
  type PageHost,
  type PageRequest,
  type PageResponse,
} from '../page-reads';
import { provideReadTools } from './read-tools';
import { TOOL_REGISTRY, type ToolInputSchema, type ToolRegistry } from './tool-registry';

/** The five ids INTENT.md names, verbatim — the last two keep their camelCase spelling. */
const READ_TOOL_IDS = [
  'find_components',
  'inspect_component',
  'list_signals',
  'getDirectiveMetadata',
  'getComponent',
] as const;

const TIER0_IDS = ['getDirectiveMetadata', 'getComponent'] as const;

/** Input that satisfies each declared schema: the id-taking reads need a component id. */
function validInput(toolId: string): Record<string, unknown> {
  return toolId === 'find_components' || toolId === 'list_signals'
    ? {}
    : { componentId: 'cmp-1' };
}

/** A registry that registers the five reads exactly the way `app.config.ts` does. */
function newRegistry(host?: PageHost): ToolRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers:
      host === undefined
        ? [provideReadTools()]
        : [provideReadTools(), { provide: PAGE_HOST, useValue: host }],
  });
  return TestBed.inject(TOOL_REGISTRY);
}

/** A fake page host that records every request it is asked and answers from `answer`. */
function fakeHost(answer: (request: PageRequest) => PageResponse | Promise<PageResponse>): {
  host: PageHost;
  seen: PageRequest[];
} {
  const seen: PageRequest[] = [];
  return {
    seen,
    host: {
      request: async (request: PageRequest): Promise<PageResponse> => {
        seen.push(request);
        return answer(request);
      },
    },
  };
}

function schemaOf(registry: ToolRegistry, toolId: string): ToolInputSchema {
  const declaration = registry.tools().find((tool) => tool.id === toolId);
  const input = declaration?.input;
  if (input === undefined || typeof input === 'function') {
    throw new Error(`expected a static input schema on "${toolId}"`);
  }
  return input;
}

describe('read tool declarations', () => {
  it('declares the five reads with INTENT ids verbatim as page reads publishing results to the model', () => {
    const registry = newRegistry();
    expect(registry.tools().map((tool) => tool.id)).toEqual([...READ_TOOL_IDS]);
    for (const declaration of registry.tools()) {
      expect(declaration.kind).toBe('read');
      expect(declaration.host).toEqual(['page']);
      expect(declaration.outcome).toBe('result');
      expect(declaration.publish).toBe('model');
      expect(declaration.title.length).toBeGreaterThan(0);
    }
  });

  it('gives every read an input schema whose required list matches the reads that need an id', () => {
    const registry = newRegistry();
    for (const toolId of READ_TOOL_IDS) {
      const schema = schemaOf(registry, toolId);
      expect(schema.type).toBe('object');
      expect(Array.isArray(schema.required)).toBe(true);
      const needsId = toolId !== 'find_components' && toolId !== 'list_signals';
      expect(schema.required).toEqual(needsId ? ['componentId'] : []);
      expect(schema.properties['componentId'] ?? schema.properties['name']).toBeDefined();
    }
  });

  it('states the dev-mode restriction in the two Tier-0 declarations and nowhere else', () => {
    const registry = newRegistry();
    for (const toolId of TIER0_IDS) {
      const description = schemaOf(registry, toolId).properties['componentId']?.description ?? '';
      expect(description).toContain(toolId);
      expect(description).toMatch(/outside dev mode/);
      // The caveat says what an empty read is not evidence of, so no consumer reads it as absence.
      expect(description).toMatch(/not evidence that the page has no (components|directives)/);
      expect(description).toMatch(/instead of a fallback read/);
    }
    for (const toolId of ['find_components', 'inspect_component', 'list_signals']) {
      for (const property of Object.values(schemaOf(registry, toolId).properties)) {
        expect(property.description ?? '').not.toMatch(/outside dev mode/);
      }
    }
  });
});

describe('read tool results', () => {
  it('maps each page payload to a result labelled page-request and asks for that tool only', async () => {
    for (const toolId of READ_TOOL_IDS) {
      const payload = { read: toolId, components: [] };
      const { host, seen } = fakeHost(() => ({ status: 'result', value: payload }));
      const outcome = await newRegistry(host).execute(toolId, validInput(toolId));
      expect(seen).toEqual([{ kind: toolId, input: validInput(toolId) }]);
      expect(outcome.kind).toBe('result');
      if (outcome.kind !== 'result') {
        throw new Error(`expected a result for "${toolId}", got ${outcome.kind}`);
      }
      expect(outcome.provenance).toBe('page-request');
      expect(outcome.value).toBe(payload);
    }
  });

  it('keeps an empty page answer an empty result rather than inventing components', async () => {
    const { host } = fakeHost(() => ({ status: 'result', value: { components: [] } }));
    const outcome = await newRegistry(host).execute('find_components', {});
    expect(outcome).toMatchObject({ kind: 'result', provenance: 'page-request' });
    if (outcome.kind !== 'result') {
      return;
    }
    expect(outcome.value).toEqual({ components: [] });
  });

  it('names the tool and keeps the page code when the page refuses an unknown component id', async () => {
    const { host } = fakeHost(() => ({
      status: 'error',
      code: 'invalid-input',
      message: 'the page has no component "cmp-404"',
    }));
    const outcome = await newRegistry(host).execute('inspect_component', { componentId: 'cmp-404' });
    expect(outcome).toMatchObject({
      kind: 'error',
      code: 'invalid-input',
      toolId: 'inspect_component',
    });
    if (outcome.kind !== 'error') {
      return;
    }
    expect(outcome.message).toContain('the page has no component "cmp-404"');
    expect(outcome).not.toHaveProperty('value');
  });

  it('refuses input outside the declared schema, naming the tool, before the page is asked', async () => {
    const { host, seen } = fakeHost(() => ({ status: 'result', value: null }));
    const registry = newRegistry(host);
    const rejected: readonly (readonly [string, unknown])[] = [
      ['inspect_component', { componentId: 42 }],
      ['inspect_component', {}],
      ['getDirectiveMetadata', {}],
      ['getComponent', { componentId: false }],
      ['list_signals', { componentId: 7 }],
      ['find_components', { name: 42 }],
    ];
    for (const [toolId, input] of rejected) {
      const outcome = await registry.execute(toolId, input);
      expect(outcome).toMatchObject({ kind: 'error', code: 'invalid-input', toolId });
      expect(outcome).not.toHaveProperty('value');
    }
    // The envelope rejected the calls, so nothing reached the page.
    expect(seen).toEqual([]);
  });

  it('passes the page own dev-mode reason through instead of answering a fallback read', async () => {
    for (const toolId of TIER0_IDS) {
      const { host, seen } = fakeHost(() => ({
        status: 'error',
        code: 'host-unavailable',
        message: `the page is not in dev mode, so ${toolId} answered nothing`,
      }));
      const outcome = await newRegistry(host).execute(toolId, { componentId: 'cmp-1' });
      expect(seen.length).toBe(1);
      expect(outcome).toMatchObject({ kind: 'error', code: 'host-unavailable', toolId });
      if (outcome.kind !== 'error') {
        return;
      }
      expect(outcome.message).toContain('the page is not in dev mode');
      expect(outcome.message).toContain(toolId);
      expect(outcome).not.toHaveProperty('value');
    }
  });
});

describe('the page-read port before the transport exists', () => {
  it('answers host-unavailable with its named reason for every read, never an empty result', async () => {
    const registry = newRegistry();
    for (const toolId of READ_TOOL_IDS) {
      const outcome = await registry.execute(toolId, validInput(toolId));
      expect(outcome).toMatchObject({ kind: 'error', code: 'host-unavailable', toolId });
      if (outcome.kind !== 'error') {
        continue;
      }
      expect(outcome.message).toContain(PAGE_HOST_UNAVAILABLE_REASON);
      expect(outcome).not.toHaveProperty('value');
    }
  });

  it('is the default PAGE_HOST, whose request resolves the same named reason', async () => {
    newRegistry();
    const host = TestBed.inject(PAGE_HOST);
    const response = await host.request({ kind: 'find_components', input: {} });
    expect(response.status).toBe('error');
    if (response.status !== 'error') {
      return;
    }
    // The spec asserts the exported text rather than re-typing it: one reason, no drift.
    expect(response.code).toBe('host-unavailable');
    expect(response.message).toContain(PAGE_HOST_UNAVAILABLE_REASON);
    expect(PAGE_HOST_UNAVAILABLE_REASON).toMatch(/no page-request transport exists in this build/);
  });

  it('reports a host that throws as host-unavailable naming the tool, never as a throw', async () => {
    const host: PageHost = {
      request: async (): Promise<PageResponse> => {
        throw new Error('no channel carries a request to the page');
      },
    };
    const outcome = await newRegistry(host).execute('list_signals', {});
    expect(outcome).toMatchObject({
      kind: 'error',
      code: 'host-unavailable',
      toolId: 'list_signals',
    });
    if (outcome.kind !== 'error') {
      return;
    }
    expect(outcome.message).toContain('no channel carries a request to the page');
  });
});

describe('page-reads readers', () => {
  it('exports one reader per request kind, and each reader asks for its own kind', async () => {
    expect(Object.keys(PAGE_READERS).sort()).toEqual([...PAGE_READ_KINDS].sort());
    for (const reader of [
      readComponents,
      readComponent,
      readSignals,
      readDirectiveMetadata,
      readPageComponent,
    ]) {
      expect(typeof reader).toBe('function');
    }
    for (const kind of PAGE_READ_KINDS) {
      const { host, seen } = fakeHost(() => ({ status: 'result', value: kind }));
      const response = await PAGE_READERS[kind](host, { componentId: 'cmp-1' });
      expect(seen).toEqual([{ kind, input: { componentId: 'cmp-1' } }]);
      expect(response).toEqual({ status: 'result', value: kind });
    }
  });

  it('hands back the host answer unchanged, so no reader can invent a fallback', async () => {
    for (const kind of PAGE_READ_KINDS) {
      const answer: PageResponse = {
        status: 'error',
        code: 'host-unavailable',
        message: `no host for ${kind}`,
      };
      const { host } = fakeHost(() => answer);
      expect(await PAGE_READERS[kind](host, {})).toEqual(answer);
    }
  });
});
