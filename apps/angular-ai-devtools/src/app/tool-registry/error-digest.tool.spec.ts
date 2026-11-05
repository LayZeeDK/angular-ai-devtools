import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  digestForCode,
  findEntry,
  type DigestEntry,
  type ErrorDigest,
} from '../../../../../src/main-world/error-digest';
import { provideAppFactsTool } from './app-facts';
import {
  ERROR_DIGEST_TOOL_ID,
  SHIPPED_ERROR_DIGEST,
  errorDigestLookupOutcome,
  normaliseErrorCode,
  provideErrorDigestTool,
  stripLicenceNotice,
  type ErrorDigestLookupResult,
} from './error-digest.tool';
import { HOSTILE_TOOLS } from './hostile-tools';
import {
  PANEL_ENVIRONMENT_TOOL_ID,
  providePanelEnvironmentTool,
} from './panel-environment.tool';
import { provideReadTools } from './read-tools';
import {
  TOOL_REGISTRY,
  provideTools,
  type ToolRegistry,
} from './tool-registry';

/** The five fields every cohort is snapshotted on: the declaration's public claim, nothing else. */
type DeclarationSnapshot = {
  readonly id: string;
  readonly kind: string;
  readonly host: readonly string[];
  readonly outcome: string;
  readonly publish: string;
};

/** `error_digest_lookup` on its own, registered exactly the way `app.config.ts` registers it. */
function newRegistry(): ToolRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideErrorDigestTool()] });
  return TestBed.inject(TOOL_REGISTRY);
}

/**
 * Every cohort that exists at this commit in one TestBed — `app_facts`, the five read wrappers, the
 * six hostile shapes, `panel_environment` and the tool this task adds. The second addition is only
 * proven harmless if the first one and everything before it still declares what it declared.
 */
function newCohortRegistry(): ToolRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideAppFactsTool(),
      provideReadTools(),
      provideTools(...HOSTILE_TOOLS),
      providePanelEnvironmentTool(),
      provideErrorDigestTool(),
    ],
  });
  return TestBed.inject(TOOL_REGISTRY);
}

function snapshotOf(registry: ToolRegistry): DeclarationSnapshot[] {
  return registry.tools().map((tool) => ({
    id: tool.id,
    kind: tool.kind,
    host: [...tool.host],
    outcome: tool.outcome,
    publish: tool.publish,
  }));
}

/**
 * The declaration record of every cohort that existed before this task, as each one stands today.
 * These are literals on purpose: a declaration that changes fails here, so the second added tool
 * cannot quietly reshape a cohort it was supposed to leave alone.
 */
const EARLIER_COHORT_SNAPSHOT: readonly DeclarationSnapshot[] = [
  {
    id: 'app_facts',
    kind: 'read',
    host: ['panel', 'extension-API'],
    outcome: 'result',
    publish: 'model',
  },
  {
    id: 'find_components',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
  },
  {
    id: 'inspect_component',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
  },
  {
    id: 'list_signals',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
  },
  {
    id: 'getDirectiveMetadata',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
  },
  {
    id: 'getComponent',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'model',
  },
  {
    id: 'confirm_write',
    kind: 'write',
    host: ['panel'],
    outcome: 'confirm-required',
    publish: 'internal',
  },
  {
    id: 'async_scan',
    kind: 'read',
    host: ['worker'],
    outcome: 'async-handle',
    publish: 'internal',
  },
  {
    id: 'snapshot_image',
    kind: 'read',
    host: ['page'],
    outcome: 'image',
    publish: 'internal',
  },
  {
    id: 'dual_host_read',
    kind: 'read',
    host: ['page', 'panel'],
    outcome: 'result',
    publish: 'internal',
  },
  {
    id: 'wrapped_third_party',
    kind: 'read',
    host: ['extension-API'],
    outcome: 'result',
    publish: 'internal',
  },
  {
    id: 'page_state_schema',
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish: 'internal',
  },
  {
    id: PANEL_ENVIRONMENT_TOOL_ID,
    kind: 'read',
    host: ['panel', 'extension-API'],
    outcome: 'result',
    publish: 'panel',
  },
];

/** What this task's own declaration says, on the same five fields. */
const ADDED_TOOL_SNAPSHOT: DeclarationSnapshot = {
  id: ERROR_DIGEST_TOOL_ID,
  kind: 'read',
  host: ['panel'],
  outcome: 'result',
  publish: 'model',
};

/** Marker strings the project's digest rule keeps out of every answer. */
const LICENCE_NOTICE_MARKERS: readonly RegExp[] = [
  /MIT License/i,
  /Google LLC/i,
  /licensed under/i,
];

function expectNoLicenceNotice(text: string): void {
  for (const marker of LICENCE_NOTICE_MARKERS) {
    expect(text).not.toMatch(marker);
  }
}

describe('error_digest_lookup declaration', () => {
  it('is declared as a read of the panel that publishes a result to the model', () => {
    const declaration = newRegistry()
      .tools()
      .find((tool) => tool.id === ERROR_DIGEST_TOOL_ID);

    expect(declaration).toBeDefined();
    expect(declaration?.id).toBe('error_digest_lookup');
    expect(declaration?.kind).toBe('read');
    expect(declaration?.host).toEqual(['panel']);
    expect(declaration?.outcome).toBe('result');
    expect(declaration?.publish).toBe('model');
  });

  it('declares one required "code" string as its input', () => {
    const input = newRegistry()
      .tools()
      .find((tool) => tool.id === ERROR_DIGEST_TOOL_ID)?.input;

    expect(typeof input).not.toBe('function');
    if (typeof input === 'function' || input === undefined) {
      return;
    }
    expect(input.type).toBe('object');
    expect(input.required).toEqual(['code']);
    expect(Object.keys(input.properties)).toEqual(['code']);
    expect(input.properties['code']?.type).toBe('string');
  });

  it('adds itself without disturbing a single earlier cohort in the same TestBed', () => {
    const snapshot = snapshotOf(newCohortRegistry());

    // Everything that existed before this commit still declares exactly what it declared.
    expect(
      snapshot.filter((entry) => entry.id !== ERROR_DIGEST_TOOL_ID),
    ).toEqual(EARLIER_COHORT_SNAPSHOT);
    // And the second addition is one declaration, with the fields it claims.
    expect(
      snapshot.filter((entry) => entry.id === ERROR_DIGEST_TOOL_ID),
    ).toEqual([ADDED_TOOL_SNAPSHOT]);
    expect(snapshot).toHaveLength(EARLIER_COHORT_SNAPSHOT.length + 1);
  });

  it('runs both added tools through TOOL_REGISTRY.execute in one TestBed', async () => {
    const registry = newCohortRegistry();

    const environment = await registry.execute(PANEL_ENVIRONMENT_TOOL_ID);
    const digest = await registry.execute(ERROR_DIGEST_TOOL_ID, {
      code: 'NG0100',
    });

    expect(environment.kind).toBe('result');
    expect(digest.kind).toBe('result');
    if (environment.kind !== 'result' || digest.kind !== 'result') {
      return;
    }
    expect(environment.provenance).toBe('panel');
    expect(digest.provenance).toBe('panel');
  });
});

describe('error_digest_lookup code normalisation', () => {
  it('reads the NG0#### form, the bare digits and a lower-cased prefix as one entry', async () => {
    const registry = newRegistry();

    for (const form of [
      'NG0100',
      'ng0100',
      'Ng0100',
      '  NG0100  ',
      '0100',
      ' 0100 ',
    ]) {
      const outcome = await registry.execute(ERROR_DIGEST_TOOL_ID, {
        code: form,
      });
      expect(outcome.kind).toBe('result');
      if (outcome.kind !== 'result') {
        continue;
      }
      const value = outcome.value as ErrorDigestLookupResult;
      expect(value.code).toBe('NG0100');
      expect(value.tool).toBe(ERROR_DIGEST_TOOL_ID);
      expect(value.provenance).toBe('panel');
    }
  });

  it('reads the five-digit form the digest also ships, in both spellings', async () => {
    const registry = newRegistry();

    for (const form of ['NG01002', '01002']) {
      const outcome = await registry.execute(ERROR_DIGEST_TOOL_ID, {
        code: form,
      });
      expect(outcome.kind).toBe('result');
      if (outcome.kind !== 'result') {
        continue;
      }
      expect((outcome.value as ErrorDigestLookupResult).code).toBe('NG01002');
    }
  });

  it('normalises without looking anything up', () => {
    expect(normaliseErrorCode('ng8001')).toEqual({ ok: true, code: 'NG8001' });
    expect(normaliseErrorCode('8001')).toEqual({ ok: true, code: 'NG8001' });
    expect(normaliseErrorCode(' NG01002 ')).toEqual({
      ok: true,
      code: 'NG01002',
    });

    for (const rejected of [
      '',
      '   ',
      'NG0',
      '100',
      'NG0100 00',
      'NG0x10',
      'abcde',
      'NG010011',
    ]) {
      expect(normaliseErrorCode(rejected).ok).toBe(false);
    }
    expect(normaliseErrorCode(100).ok).toBe(false);
    expect(normaliseErrorCode(undefined).ok).toBe(false);
    expect(normaliseErrorCode(null).ok).toBe(false);
  });
});

describe('error_digest_lookup result', () => {
  it('returns the entry the shipped error explainer reads, with panel provenance', async () => {
    const shipped = findEntry(SHIPPED_ERROR_DIGEST, 'NG0100');
    expect(shipped).not.toBeNull();
    if (shipped === null) {
      return;
    }

    const outcome = await newRegistry().execute(ERROR_DIGEST_TOOL_ID, {
      code: 'NG0100',
    });

    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    expect(outcome.provenance).toBe('panel');
    const value = outcome.value as ErrorDigestLookupResult;
    expect(value.tool).toBe(ERROR_DIGEST_TOOL_ID);
    expect(value.provenance).toBe('panel');
    // The tool reads one digest: its entry deep-equals the one the explainer shows, field for field.
    expect({ code: value.code, title: value.title, body: value.body }).toEqual(
      shipped,
    );
    expect(value.body).toBe(digestForCode(SHIPPED_ERROR_DIGEST, 'NG0100'));
  });

  it('answers every entry the digest ships, and no answer carries the licence notice', async () => {
    const registry = newRegistry();
    expect(SHIPPED_ERROR_DIGEST.entries.length).toBeGreaterThan(0);

    for (const entry of SHIPPED_ERROR_DIGEST.entries) {
      const outcome = await registry.execute(ERROR_DIGEST_TOOL_ID, {
        code: entry.code,
      });
      expect(outcome.kind).toBe('result');
      if (outcome.kind !== 'result') {
        continue;
      }
      const value = outcome.value as ErrorDigestLookupResult;
      expect(value.code).toBe(entry.code);
      expect(value.title).toBe(entry.title);
      expect(value.body).toBe(digestForCode(SHIPPED_ERROR_DIGEST, entry.code));
      expectNoLicenceNotice(value.title);
      expectNoLicenceNotice(value.body);
    }
  });
});

describe('error_digest_lookup unanswerable codes', () => {
  it('answers invalid-input naming the tool for a malformed code, never an empty result', async () => {
    const registry = newRegistry();

    for (const code of [
      '',
      '   ',
      'NG',
      '100',
      'NG0',
      'NG0x10',
      'abcd',
      'NG010011',
      100,
    ]) {
      const outcome = await registry.execute(ERROR_DIGEST_TOOL_ID, { code });
      expect(outcome.kind).toBe('error');
      if (outcome.kind !== 'error') {
        continue;
      }
      expect(outcome.code).toBe('invalid-input');
      expect(outcome.toolId).toBe(ERROR_DIGEST_TOOL_ID);
      expect(outcome.message).toContain('error_digest_lookup');
    }
  });

  it('answers invalid-input naming the tool and the code for a well-formed code with no entry', async () => {
    const registry = newRegistry();
    expect(findEntry(SHIPPED_ERROR_DIGEST, 'NG9999')).toBeNull();

    const outcome = await registry.execute(ERROR_DIGEST_TOOL_ID, {
      code: '9999',
    });

    expect(outcome.kind).toBe('error');
    if (outcome.kind !== 'error') {
      return;
    }
    expect(outcome.code).toBe('invalid-input');
    expect(outcome.toolId).toBe(ERROR_DIGEST_TOOL_ID);
    expect(outcome.message).toContain('error_digest_lookup');
    expect(outcome.message).toContain('NG9999');
  });

  it('answers invalid-input naming the tool when the required code is missing', async () => {
    const registry = newRegistry();

    for (const input of [undefined, {}, { code: null }]) {
      const outcome = await registry.execute(ERROR_DIGEST_TOOL_ID, input);
      expect(outcome.kind).toBe('error');
      if (outcome.kind !== 'error') {
        continue;
      }
      expect(outcome.code).toBe('invalid-input');
      expect(outcome.toolId).toBe(ERROR_DIGEST_TOOL_ID);
      expect(outcome.message).toContain('error_digest_lookup');
    }
  });
});

describe('error_digest_lookup licence notice', () => {
  it('strips a notice that reaches it, so the rule is not vacuous', () => {
    const shipped = findEntry(SHIPPED_ERROR_DIGEST, 'NG0100');
    expect(shipped).not.toBeNull();
    if (shipped === null) {
      return;
    }

    const notice =
      'MIT License. Copyright (c) 2010-2024 Google LLC. Angular is licensed under the MIT License.';
    const carrying: DigestEntry = {
      code: shipped.code,
      title: shipped.title,
      body: `${shipped.body}\n${notice}`,
    };
    const digest: ErrorDigest = {
      version: 'test-fixture',
      entries: [carrying],
    };

    // The fixture really carries the notice, so the removal below is a removal and not a coincidence.
    expect(carrying.body).toMatch(/MIT License/);
    expect(carrying.body).toMatch(/Google LLC/);
    expect(carrying.body).toMatch(/licensed under/i);

    const outcome = errorDigestLookupOutcome(digest, 'NG0100');

    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    const value = outcome.value as ErrorDigestLookupResult;
    expectNoLicenceNotice(value.title);
    expectNoLicenceNotice(value.body);
    // The explanation itself survives: only the notice goes.
    expect(value.body).toContain('ExpressionChangedAfterItHasBeenCheckedError');
    expect(value.body.length).toBeLessThan(carrying.body.length);
  });

  it('leaves a notice-free entry byte for byte, and the digest it reads ships no notice', () => {
    // The shipped digest is already notice-free (its generator strips the notice), so stripping is
    // the identity there — which is exactly why every result can still deep-equal the entry the
    // shipped explainer shows. The case above is what proves the removal itself is implemented.
    expectNoLicenceNotice(JSON.stringify(SHIPPED_ERROR_DIGEST));
    for (const entry of SHIPPED_ERROR_DIGEST.entries) {
      expect(stripLicenceNotice(entry.title)).toBe(entry.title);
      expect(stripLicenceNotice(entry.body)).toBe(entry.body);
    }
  });
});
