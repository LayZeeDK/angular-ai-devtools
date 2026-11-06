import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  TOOL_REGISTRY,
  ToolDeclarationError,
  defineTool,
  provideTools,
  provideToolRegistry,
  type ToolBacking,
  type ToolContext,
  type ToolDeclaration,
  type ToolErrorCode,
  type ToolFacts,
  type ToolHost,
  type ToolInputSchema,
  type ToolKind,
  type ToolOutcome,
  type ToolOutcomeKind,
  type ToolProvenance,
  type ToolPublish,
  type ToolRegistry,
} from './tool-registry';

// The vocabulary the envelope fixes (INTENT Scope in). Used both to pin membership and to
// type-check that every union is exported with exactly these members.
const KINDS: readonly ToolKind[] = ['read', 'write', 'confirm'];
const HOSTS: readonly ToolHost[] = [
  'page',
  'iframe',
  'panel',
  'worker',
  'extension-API',
  'tester',
];
const OUTCOMES: readonly ToolOutcomeKind[] = [
  'result',
  'confirm-required',
  'async-handle',
  'image',
  'error',
];
const PUBLISHES: readonly ToolPublish[] = ['model', 'panel', 'internal'];
const PROVENANCES: readonly ToolProvenance[] = [
  'panel',
  'page-published',
  'page-request',
  'third-party',
];
const ERROR_CODES: readonly ToolErrorCode[] = [
  'not-implemented',
  'declaration-invalid',
  'invalid-input',
  'host-unavailable',
  'third-party-failed',
];

const EMPTY_SCHEMA: ToolInputSchema = {
  type: 'object',
  properties: {},
  required: [],
};

/**
 * Builds a declaration from a known-good base. Keys set to `undefined` are removed rather than
 * left undefined, so `declaration({ kind: undefined })` is a declaration missing its `kind`.
 */
function declaration(overrides: Record<string, unknown> = {}): ToolDeclaration {
  const merged: Record<string, unknown> = {
    id: 'page.read_title',
    title: 'Read the page title',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
    input: EMPTY_SCHEMA,
    ...overrides,
  };
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined) {
      delete merged[key];
    }
  }
  return merged as unknown as ToolDeclaration;
}

/** A fresh registry per test, resolved the way the panel resolves it. */
function newRegistry(): ToolRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideToolRegistry()] });
  return TestBed.inject(TOOL_REGISTRY);
}

function captureDeclarationError(
  registry: ToolRegistry,
  candidate: ToolDeclaration,
): ToolDeclarationError {
  let thrown: unknown;
  try {
    registry.declare(candidate);
  } catch (error: unknown) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(ToolDeclarationError);
  return thrown as ToolDeclarationError;
}

function resultBacking(
  value: unknown,
  provenance: ToolProvenance = 'panel',
): ToolBacking {
  return {
    execute: async (): Promise<ToolOutcome> => ({
      kind: 'result',
      value,
      provenance,
    }),
  };
}

describe('tool registry envelope', () => {
  it('exposes the authoring surface, the registry token and a signal for the declarations', () => {
    expect(typeof defineTool).toBe('function');
    expect(typeof provideTools).toBe('function');
    expect(typeof provideToolRegistry).toBe('function');
    expect(TOOL_REGISTRY).toBeInstanceOf(InjectionToken);

    const registry = newRegistry();
    expect(typeof registry.tools).toBe('function');
    expect(registry.tools()).toEqual([]);
  });

  it('accepts every member of the declared vocabulary and keeps registration order', () => {
    const registry = newRegistry();
    const candidates: ToolDeclaration[] = [
      ...HOSTS.map((host) =>
        declaration({ id: `probe.host.${host}`, host: [host] }),
      ),
      ...KINDS.map((kind) => declaration({ id: `probe.kind.${kind}`, kind })),
      ...OUTCOMES.map((outcome) =>
        declaration({ id: `probe.outcome.${outcome}`, outcome }),
      ),
      ...PUBLISHES.map((publish) =>
        declaration({ id: `probe.publish.${publish}`, publish }),
      ),
    ];

    for (const candidate of candidates) {
      registry.declare(candidate);
    }

    expect(registry.tools().map((tool) => tool.id)).toEqual(
      candidates.map((tool) => tool.id),
    );
    expect(registry.tools()).toHaveLength(
      HOSTS.length + KINDS.length + OUTCOMES.length + PUBLISHES.length,
    );
    expect(PROVENANCES).toEqual([
      'panel',
      'page-published',
      'page-request',
      'third-party',
    ]);
    expect(ERROR_CODES).toEqual([
      'not-implemented',
      'declaration-invalid',
      'invalid-input',
      'host-unavailable',
      'third-party-failed',
    ]);
  });

  describe('declare', () => {
    it.each([
      ['id', '<missing-id>'],
      ['kind', 'page.read_title'],
      ['host', 'page.read_title'],
      ['outcome', 'page.read_title'],
      ['publish', 'page.read_title'],
    ] as [string, string][])(
      'rejects a declaration missing its %s field, naming the tool id and the field (E1)',
      (field, expectedToolId) => {
        const registry = newRegistry();
        const error = captureDeclarationError(
          registry,
          declaration({ [field]: undefined }),
        );

        expect(error.field).toBe(field);
        expect(error.toolId).toBe(expectedToolId);
        expect(error.message).toContain(expectedToolId);
        expect(error.message).toContain(field);
        expect(registry.tools()).toEqual([]);
      },
    );

    it.each([
      ['an empty host list', { host: [] }, 'host'],
      ['a host outside the six', { host: ['page', 'webview'] }, 'host'],
      ['a kind outside the three', { kind: 'mutate' }, 'kind'],
      ['an outcome outside the five', { outcome: 'stream' }, 'outcome'],
      ['a publish outside the three', { publish: 'toolbar' }, 'publish'],
    ] as [
      string,
      Record<string, unknown>,
      'host' | 'kind' | 'outcome' | 'publish',
    ][])(
      'rejects %s as a declaration error naming the id and the field',
      (_label, overrides, field) => {
        const registry = newRegistry();
        const error = captureDeclarationError(registry, declaration(overrides));

        expect(error.field).toBe(field);
        expect(error.toolId).toBe('page.read_title');
        expect(error.message).toContain('page.read_title');
        expect(error.message).toContain(field);
      },
    );

    it('rejects a duplicate id naming the id and the id field', () => {
      const registry = newRegistry();
      registry.declare(declaration());

      const error = captureDeclarationError(
        registry,
        declaration({ title: 'Read it again' }),
      );

      expect(error.field).toBe('id');
      expect(error.toolId).toBe('page.read_title');
      expect(registry.tools()).toHaveLength(1);
    });

    it('rejects a declaration whose input is not an object schema, naming the input field', () => {
      const registry = newRegistry();
      const error = captureDeclarationError(
        registry,
        declaration({
          input: { type: 'object', properties: {}, required: 'title' },
        }),
      );

      expect(error.field).toBe('input');
      expect(error.toolId).toBe('page.read_title');
    });
  });

  describe('execute', () => {
    it('E2 a declared tool with no backing returns a not-implemented outcome, never an empty result and never a throw', async () => {
      const registry = newRegistry();
      registry.declare(
        declaration({ id: 'page.read_landmarks', publish: 'model' }),
      );

      const outcome = await registry.execute('page.read_landmarks', {});

      expect(outcome.kind).not.toBe('result');
      expect(outcome).toMatchObject({
        kind: 'error',
        code: 'not-implemented',
        toolId: 'page.read_landmarks',
      });
      await expect(
        registry.execute('page.read_landmarks', {}),
      ).resolves.toMatchObject({
        kind: 'error',
        code: 'not-implemented',
        toolId: 'page.read_landmarks',
      });
    });

    it('answers an unregistered id with an invalid-input error naming that id, never a throw', async () => {
      const registry = newRegistry();

      await expect(
        registry.execute('page.no_such_tool', {}),
      ).resolves.toMatchObject({
        kind: 'error',
        code: 'invalid-input',
        toolId: 'page.no_such_tool',
      });
    });

    it('answers the backing outcome for a valid call, carrying the provenance it was given', async () => {
      const registry = newRegistry();
      registry.declare(declaration({ id: 'page.read_title' }));
      registry.attach(
        'page.read_title',
        resultBacking('Sign in', 'page-request'),
      );

      await expect(
        registry.execute(
          'page.read_title',
          {},
          { facts: {}, provenance: 'page-request' },
        ),
      ).resolves.toEqual({
        kind: 'result',
        value: 'Sign in',
        provenance: 'page-request',
      });
    });

    it('rejects an input that breaks the declared schema with an invalid-input error, never a throw', async () => {
      const registry = newRegistry();
      registry.declare(
        declaration({
          id: 'page.set_value',
          kind: 'write',
          input: {
            type: 'object',
            properties: {
              selector: { type: 'string' },
              mode: { type: 'string', enum: ['set', 'clear'] },
            },
            required: ['selector'],
          },
        }),
      );
      registry.attach('page.set_value', resultBacking(true, 'page-request'));

      await expect(
        registry.execute('page.set_value', {}),
      ).resolves.toMatchObject({
        kind: 'error',
        code: 'invalid-input',
        toolId: 'page.set_value',
      });
      await expect(
        registry.execute('page.set_value', { selector: 42 }),
      ).resolves.toMatchObject({
        kind: 'error',
        code: 'invalid-input',
      });
      await expect(
        registry.execute('page.set_value', { selector: '#a', mode: 'append' }),
      ).resolves.toMatchObject({ kind: 'error', code: 'invalid-input' });
      await expect(
        registry.execute('page.set_value', { selector: '#a', mode: 'clear' }),
      ).resolves.toMatchObject({
        kind: 'result',
        value: true,
        provenance: 'page-request',
      });
    });

    it('builds the input schema from the facts when the declaration supplies a function', async () => {
      const registry = newRegistry();
      registry.declare(
        declaration({
          id: 'page.inspect_widget',
          input: (facts: ToolFacts): ToolInputSchema => {
            const widgets: unknown = facts['widgets'];
            const known = Array.isArray(widgets)
              ? widgets.filter(
                  (entry): entry is string => typeof entry === 'string',
                )
              : [];
            return {
              type: 'object',
              properties: { widget: { type: 'string', enum: known } },
              required: ['widget'],
            };
          },
        }),
      );
      registry.attach(
        'page.inspect_widget',
        resultBacking({ widget: 'chart' }, 'page-request'),
      );
      const context: ToolContext = {
        facts: { widgets: ['chart'] },
        provenance: 'page-published',
      };

      await expect(
        registry.execute('page.inspect_widget', { widget: 'chart' }, context),
      ).resolves.toMatchObject({ kind: 'result' });
      await expect(
        registry.execute('page.inspect_widget', { widget: 'unknown' }, context),
      ).resolves.toMatchObject({ kind: 'error', code: 'invalid-input' });
    });

    it('turns a failing backing into an error outcome instead of a throw', async () => {
      const registry = newRegistry();
      registry.declare(declaration({ id: 'page.reject_read' }));
      registry.declare(declaration({ id: 'page.throw_read' }));
      registry.attach('page.reject_read', {
        execute: () => Promise.reject(new Error('transport closed')),
      });
      registry.attach('page.throw_read', {
        execute: () => {
          throw new Error('no channel');
        },
      });

      await expect(
        registry.execute('page.reject_read', {}),
      ).resolves.toMatchObject({
        kind: 'error',
        toolId: 'page.reject_read',
      });
      await expect(
        registry.execute('page.throw_read', {}),
      ).resolves.toMatchObject({
        kind: 'error',
        toolId: 'page.throw_read',
      });
    });
  });

  describe('awaitHandle', () => {
    it('answers an unsettled handle with the handle and a settled handle with the backing outcome', async () => {
      const registry = newRegistry();
      let release: (outcome: ToolOutcome) => void = () => undefined;
      const backend = new Promise<ToolOutcome>((resolve) => {
        release = resolve;
      });
      registry.declare(
        declaration({ id: 'page.crawl_links', outcome: 'async-handle' }),
      );
      registry.attach('page.crawl_links', { execute: () => backend });

      const started = await registry.execute('page.crawl_links', {});
      expect(started.kind).toBe('async-handle');
      const handle = started.kind === 'async-handle' ? started.handle : '';
      expect(handle).not.toBe('');

      await expect(registry.awaitHandle(handle)).resolves.toEqual({
        kind: 'async-handle',
        handle,
      });

      release({
        kind: 'result',
        value: ['/a', '/b'],
        provenance: 'page-request',
      });
      await backend;

      await expect(registry.awaitHandle(handle)).resolves.toEqual({
        kind: 'result',
        value: ['/a', '/b'],
        provenance: 'page-request',
      });
    });

    it('answers an unknown handle with an invalid-input error naming it, never a throw', async () => {
      const registry = newRegistry();

      await expect(
        registry.awaitHandle('page.crawl_links#99'),
      ).resolves.toMatchObject({
        kind: 'error',
        code: 'invalid-input',
        toolId: 'page.crawl_links#99',
      });
    });
  });

  describe('provideTools', () => {
    it('registers its entries through the same envelope and resolves through the token', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideTools(
            defineTool(
              declaration({ id: 'panel.app_facts', host: ['panel'] }),
              {
                execute: async (): Promise<ToolOutcome> => ({
                  kind: 'result',
                  value: { framework: 'angular' },
                  provenance: 'panel',
                }),
              },
            ),
          ),
        ],
      });

      const registry = TestBed.inject(TOOL_REGISTRY);

      expect(
        registry.tools().map((tool) => [tool.id, tool.host, tool.publish]),
      ).toEqual([['panel.app_facts', ['panel'], 'model']]);
      await expect(registry.execute('panel.app_facts', {})).resolves.toEqual({
        kind: 'result',
        value: { framework: 'angular' },
        provenance: 'panel',
      });
    });
  });
});
