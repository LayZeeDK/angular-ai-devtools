/**
 * The clone measurement artifact — spec (M019 / T006).
 *
 * SC3's "one fresh clone per prompt" is, per the Orchestrator ruling recorded in the T006 task
 * Log, one fresh language-model session per prompt — which is what the panel's prompt path
 * already does (`runPrompt` opens `lm.create()`, prompts once and destroys the session per
 * prompt). A `LanguageModelSession.clone()` call is an optimisation research/01 §7 records only
 * as inferred, and no M019 task owns `extension-prompt.service.ts`, so nothing here adds one.
 *
 * This spec re-runs the committed measurement rather than restating it: one
 * `service.explain(['fact one','fact two'])` through the real `ExtensionPromptService` (TestBed,
 * mocked `globalThis.LanguageModel`), with counting spies on every primitive that could
 * constitute a clone — `lm.create`, `session.prompt`, `session.destroy`, `session.clone` and
 * `globalThis.structuredClone`. It then reads the committed artifact
 * `research/raw/clone-measurement-m019.json` and asserts the committed `observed` equals the
 * measured fresh-session count and the committed `samples` equal what the spies saw. The
 * artifact — not prose — is the evidence (N4).
 *
 * Reading the artifact: the unit-test builder bundles specs for a browser platform and
 * externalizes Node builtins for browser compatibility, so a `node:fs` import compiles (once
 * `@types/node` is referenced) but fails at runtime ("No such built-in module") — node:fs is
 * unavailable in this unit-test environment. The committed JSON is therefore inlined from disk
 * at build time through `import.meta.glob` with a `?raw` eager query, anchored to the repo root
 * by walking up from this spec file, and parsed here. The bytes still come from the committed
 * artifact; no count is restated from prose.
 */
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ExtensionPromptService } from '../extension-prompt.service';

declare global {
  /** The vite `import.meta.glob` surface this spec uses (not typed by vitest/globals). */
  interface ImportMeta {
    glob(pattern: string, options: { query: '?raw'; import: 'default'; eager: true }): Record<
      string,
      unknown
    >;
  }
}

/** Shape of the committed artifact `research/raw/clone-measurement-m019.json`. */
interface CloneMeasurementArtifact {
  metric: string;
  observed: number;
  method: string;
  command: string;
  samples: Record<string, number>;
}

/** The spied primitives, keyed exactly as the artifact's `samples` are. */
type PrimitiveCounts = Record<
  'lm.create' | 'session.prompt' | 'session.destroy' | 'structuredClone' | 'session.clone',
  number
>;

/** Zeroed counts for the five primitives the measurement spies on. */
function zeroCounts(): PrimitiveCounts {
  return { 'lm.create': 0, 'session.prompt': 0, 'session.destroy': 0, structuredClone: 0, 'session.clone': 0 };
}

/** The mocked session, with a `clone` the real panel session interface does not declare. */
interface CountingSession {
  prompt(): Promise<string>;
  destroy(): void;
  clone(): CountingSession;
}

/**
 * A mocked `globalThis.LanguageModel` whose every method counts its own invocations, including a
 * `session.clone` the real panel session interface does not declare — so a clone the prompt path
 * ever made would be counted instead of assumed away.
 */
function countingLanguageModel(counts: PrimitiveCounts): unknown {
  const session: CountingSession = {
    prompt: async (): Promise<string> => {
      counts['session.prompt'] += 1;
      return 'response from the Prompt API';
    },
    destroy: (): void => {
      counts['session.destroy'] += 1;
    },
    clone: (): CountingSession => {
      counts['session.clone'] += 1;
      return session;
    },
  };
  return {
    availability: async (): Promise<string> => 'available',
    create: async (): Promise<CountingSession> => {
      counts['lm.create'] += 1;
      return session;
    },
  };
}

/**
 * The committed artifact, inlined from disk at build time: this spec lives five directories
 * under the repo root (jobs → app → src → angular-ai-devtools → apps → root), and the glob is
 * anchored there so the repo root — not the runner's cwd — resolves the file.
 */
function readArtifact(): CloneMeasurementArtifact {
  const modules = import.meta.glob('../../../../../research/raw/clone-measurement-m019.json', {
    query: '?raw',
    import: 'default',
    eager: true,
  });
  const entry: unknown = Object.values(modules)[0];
  // The builder's glob inlines a `?raw` match as the file's text directly; the `{ default }`
  // wrapper the vite docs describe is accepted too, so the read works on either shape.
  const raw =
    typeof entry === 'string' ? entry : (entry as { default?: unknown } | undefined)?.default;
  if (typeof raw !== 'string') {
    throw new Error('research/raw/clone-measurement-m019.json was not inlined above this spec file');
  }
  return JSON.parse(raw) as CloneMeasurementArtifact;
}

describe('clone measurement artifact (M019 / T006)', () => {
  // E5 / SC3: the title is the acceptance row verbatim — the artifact carries the observed
  // count; prose does not.
  it('The clone measurement is a committed artifact with the observed count, not a number restated in prose', async () => {
    const counts = zeroCounts();

    // The same measurement the artifact records: one prompt assembly through the real service.
    const globalLm = globalThis as unknown as { LanguageModel?: unknown; structuredClone?: unknown };
    const originalStructuredClone = globalLm.structuredClone;
    globalLm.LanguageModel = countingLanguageModel(counts);
    globalLm.structuredClone = (...args: unknown[]): unknown => {
      counts['structuredClone'] += 1;
      return typeof originalStructuredClone === 'function'
        ? (originalStructuredClone as (...cloneArgs: unknown[]) => unknown)(...args)
        : undefined;
    };

    let result: Awaited<ReturnType<ExtensionPromptService['explain']>> | undefined;
    try {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const service = TestBed.inject(ExtensionPromptService);
      result = await service.explain(['fact one', 'fact two']);
    } finally {
      globalLm.LanguageModel = undefined;
      globalLm.structuredClone = originalStructuredClone;
    }

    // The measurement itself: one fresh language-model session per prompt, used and released.
    expect(result?.ok).toBe(true);
    expect(counts['lm.create']).toBe(1);
    expect(counts['session.prompt']).toBe(1);
    expect(counts['session.destroy']).toBe(1);
    // No clone primitive exists on the prompt path.
    expect(counts['structuredClone']).toBe(0);
    expect(counts['session.clone']).toBe(0);

    // The committed artifact carries the observed count and the raw samples, and they match what
    // the spies saw here (N4: the count is evidence only when it is reproducible).
    const artifact = readArtifact();
    expect(artifact.metric).toBe('fresh language-model sessions per prompt');
    expect(artifact.observed).toBe(counts['lm.create']);
    expect(artifact.observed).toBe(1);
    expect(artifact.samples).toEqual(counts);
    expect(artifact.command).toContain('npx nx run angular-ai-devtools:test');
    expect(artifact.command).toContain('apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts');
  });
});
