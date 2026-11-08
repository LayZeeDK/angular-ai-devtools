/**
 * The demo's sample facts name what the recordings name — M035 T005 (INTENT.md SC4).
 *
 * `panel-demo.ts` is what a developer sees first: the surface it renders for `onpush` is the one
 * sample fact checked into the panel. The M035 wave-2 review found it labelling its sample
 * component `DeclaredDefault` while the runtime reads `_DeclaredDefault` — Angular's dev-mode class
 * alias prefixes the subject's class in the development build, and that is the name the fixture
 * page reports (`research/raw/m035-onpush-metadata.json`,
 * `subjects.declaredDefault.runtime.component`). A demo that shows a name the page never reports is
 * the small untruth this milestone exists to avoid, so this spec renders the demo and holds the
 * name it prints to the recording.
 *
 * Reading the recording: the unit-test builder bundles specs for a browser platform and externalizes
 * Node builtins, so `node:fs` is unavailable here (see `jobs/clone-measurement.spec.ts`). The
 * committed recording is therefore inlined from disk at build time through `import.meta.glob` with a
 * `?raw` eager query, anchored to the repo root by walking up from this spec file, and parsed here.
 * The name comes from the committed artifact, not from prose in this spec.
 *
 * M036 T003 extends the same discipline to the `resource` surface's sample fact: the identity and
 * the status the demo prints are the ones `research/raw/m036-resource-graph.json` records for the
 * idle-by-design resource, so a demo that named a resource the fixture never has reddens here.
 *
 * M037 T002 extends it to the `fields` surface's submit state: `research/raw/m031-field-state.json`
 * is the recording the capture re-measured, and the state the pane prints — and the reading the
 * sample fact carries — must be that recording's, so a demo that fell back to the module's default
 * (extension/field-state.js, INTENT.md SC4) reddens here instead of shipping.
 *
 * M038 T003 extends it to the `linked-state` surface: `research/raw/m038-linked-state.json` is T001's
 * measurement of the two linked signals and their shared source, and the signal, the source and the
 * two stored values the demo prints must be that recording's. The word the pane reports is the
 * join's own `reason` — `differing` for the recording's `differing` subject — and never the
 * recording's precomputed `agreesWithItsSource`, which the pane may not read at all.
 *
 * M039 T003 extends it to the `render-phase` surface, and to the separation that surface exists for:
 * `research/raw/m039-render-phase.json` is T001's measurement of the counter fixture's effect, and
 * the effect the demo's sample answer names — its empty label, the edge that named it and the one
 * signal that edge reads — must be that recording's. The change-detection half is
 * `extension/error-digest.json`'s NG0100 entry, which the recording records as the substitute for a
 * capture the page did not produce; the demo's provenance says so, because a digest entry presented
 * as a capture is the small untruth this discipline exists to catch. The pane's three blocks are
 * asserted apart, each holding only its own text (SC5, E7).
 */
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { FACTS, PanelDemoComponent } from './panel-demo';
import { fieldsPanel } from './panel-fields';

/** The part of the committed recording this spec reads. */
interface OnpushMetadataRecording {
  subjects: {
    declaredDefault: {
      compiled: { typeRef: string };
      runtime: { component: string };
    };
  };
}

/** The part of the M036 resource-graph recording this spec reads. */
interface ResourceGraphRecording {
  resources: {
    debugName: string;
    expectedState: string;
    status: string;
  }[];
}

/** The part of the M037 field-state recording this spec reads. */
interface FieldStateRecording {
  submitElementId: string;
  submitDisabled: boolean;
  crossField: {
    fieldsIndividuallyValid: boolean;
    rootInvalid: boolean;
    rootErrors: { kind: string }[];
    submitDisabled: boolean;
  };
}

/** The part of the M038 linked-state recording this spec reads. */
interface LinkedStateRecording {
  subjects: {
    agreeing: { node: { label: string; value: number } };
    differing: { node: { label: string; value: number } };
  };
  source: { node: { label: string; value: number } };
}

/** The part of the M039 render-phase recording this spec reads. */
interface RenderPhaseRecording {
  profiler: {
    effectEvent: { matchingNames: string[]; count: number; absent: boolean };
  };
  effect: {
    freshRead: {
      nodeIndex: number;
      kind: string;
      label: string;
      labelEmpty: boolean;
      signalsTheEdgesName: string[];
      edges: { consumer: number; producer: number }[];
    };
  };
  changeDetection: {
    result: string;
    substitute: {
      kind: string;
      notACapture: boolean;
      code: string;
      entryIndex: number;
    };
  };
}

/** The part of the shipped error digest this spec reads. */
interface ErrorDigest {
  entries: { code: string; title: string; body: string }[];
}

/** The part of the M040 work-events recording this spec reads. */
interface PerformanceRecording {
  pairs: {
    sources: {
      package: string;
      pairs: { label: string; start: number; end: number }[];
    }[];
  };
  identity: {
    namedAbsence: {
      pair: string;
      carriesIdentity: string;
      consequence: string;
    };
  };
  witness: {
    pages: {
      url: string;
      pairs: {
        label: string;
        start: number;
        end: number;
        startInstance: string[];
        endInstance: string[];
      }[];
    }[];
  };
}

/** One interval of the narrator's answer the demo's `performance` sample holds. */
interface PerformanceInterval {
  state: string;
  pair: string;
  componentName?: string;
  absence?: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
}

/** The narrator's answer the demo's `performance` sample fact holds. */
interface PerformanceFact {
  state: string;
  intervals: PerformanceInterval[];
  unresolved: unknown[];
}

/** The vite `import.meta.glob` surface this spec uses, cast rather than declared globally. */
interface GlobSurface {
  glob(
    pattern: string,
    options: { query: '?raw'; import: 'default'; eager: true },
  ): Record<string, unknown>;
}

/**
 * The committed recording and its text, inlined from disk at build time: this spec lives four
 * directories under the repo root (app → src → angular-ai-devtools → apps → root), and the glob is
 * anchored there so the repo root — not the runner's cwd — resolves the file.
 */
function readRecording(): {
  recording: OnpushMetadataRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m035-onpush-metadata.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  // The builder inlines a `?raw` match as the file's text directly; the `{ default }` wrapper the
  // vite docs describe is accepted too, so the read works on either shape.
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m035-onpush-metadata.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as OnpushMetadataRecording, text };
}

/** The M036 resource-graph recording and its text, inlined from disk the same way. */
function readResourceRecording(): {
  recording: ResourceGraphRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m036-resource-graph.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m036-resource-graph.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as ResourceGraphRecording, text };
}

/** The M037 field-state recording and its text, inlined from disk the same way. */
function readFieldRecording(): {
  recording: FieldStateRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m031-field-state.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m031-field-state.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as FieldStateRecording, text };
}

/** The M038 linked-state recording and its text, inlined from disk the same way. */
function readLinkedStateRecording(): {
  recording: LinkedStateRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m038-linked-state.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m038-linked-state.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as LinkedStateRecording, text };
}

/** The M039 render-phase recording and its text, inlined from disk the same way. */
function readRenderPhaseRecording(): {
  recording: RenderPhaseRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m039-render-phase.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m039-render-phase.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as RenderPhaseRecording, text };
}

/** The M040 work-events recording and its text, inlined from disk the same way. */
function readPerformanceRecording(): {
  recording: PerformanceRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m040-work-events.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m040-work-events.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as PerformanceRecording, text };
}

/** The shipped error digest, inlined from disk the same way. */
function readErrorDigest(): { digest: ErrorDigest; text: string } {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/error-digest.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/error-digest.json was not inlined above this spec file',
    );
  }
  return { digest: JSON.parse(text) as ErrorDigest, text };
}

/** The demo rendered for one surface name, once its lazy surface has answered. */
async function renderDemo(surface: string): Promise<PanelDemoComponent> {
  await TestBed.configureTestingModule({
    imports: [PanelDemoComponent],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { data: { surface } } },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(PanelDemoComponent);
  fixture.detectChanges();
  const demo = fixture.componentInstance;
  // The loader is a dynamic import: the pane is 'loading' until that promise settles.
  await vi.waitFor(() => expect(demo.state()).not.toBe('loading'));
  return demo;
}

describe('the panel demo', () => {
  /**
   * The one assertion this task exists for: the name the demo prints is the name the recording's
   * runtime read reports. It is red on the `DeclaredDefault` literal the review found, because the
   * recording names `_DeclaredDefault` — and red if the demo stops rendering the sample at all.
   */
  it("names the sample component the recording's runtime read names", async () => {
    const { recording, text } = readRecording();
    const recorded = recording.subjects.declaredDefault.runtime.component;

    const demo = await renderDemo('onpush');
    expect(demo.state()).toBe('finding');
    const nameLine = demo
      .lines()
      .find((line) => line.startsWith('component: '));
    if (nameLine === undefined) {
      throw new Error(
        `the onpush pane must name its component; it rendered ${demo.lines().join(' | ')}`,
      );
    }
    const name = nameLine.slice('component: '.length);

    expect(name).toBe(recorded);
    // The dev-mode alias is the difference, so the demo must carry it rather than the bare class.
    expect(name).not.toBe('DeclaredDefault');
    // The name is in the committed recording's bytes, not only in a field this spec picked.
    expect(text.includes(name)).toBe(true);
  });

  it('agrees with the compiled type reference the same recording carries', async () => {
    const { recording } = readRecording();

    const demo = await renderDemo('onpush');
    const nameLine = demo
      .lines()
      .find((line) => line.startsWith('component: '));
    if (nameLine === undefined) {
      throw new Error('the onpush pane must name its component');
    }

    // The runtime name and the compiled type reference are the same subject on this build.
    expect(nameLine.slice('component: '.length)).toBe(
      recording.subjects.declaredDefault.compiled.typeRef,
    );
  });

  /**
   * The M036 half: the sample fact behind `/resource` is the idle-by-design finding, and the
   * identity and the status it prints are the ones the recording names. The `params` line is the
   * join's own sentence for that measured case — the recording carries the resource's status, not a
   * params status — so no params value is presented as a measurement it is not.
   */
  it('renders the idle-by-design resource the M036 recording names', async () => {
    const { recording, text } = readResourceRecording();
    const idle = recording.resources.find(
      (resource) => resource.expectedState === 'idle',
    );
    if (idle === undefined) {
      throw new Error('the M036 recording carries no idle-by-design resource');
    }

    const demo = await renderDemo('resource');
    expect(demo.state()).toBe('finding');
    expect(demo.lines()).toEqual([
      `resource: Resource#${idle.debugName}`,
      `status: ${idle.status}`,
      'params: idle (by design)',
    ]);
    // The identity the demo prints is in the committed recording's bytes, not only in this spec.
    expect(text.includes(`Resource#${idle.debugName}`)).toBe(true);
  });

  /**
   * The M037 half: the sample fact behind `/fields` carries the submit state the capture measured —
   * `crossField.submitDisabled` for this exact shape, off the element `submitElementId` names — and
   * the pane prints that state beside the root kind. Both are held to the committed recording, so a
   * demo that went back to the module's `enabled` default, or to a hand-written label, reddens here.
   */
  it('renders the submit state the M037 field-state recording measured', async () => {
    const { recording, text } = readFieldRecording();
    // The case the demo shows is the recording's cross-field one: every field valid, the root
    // invalid with a kind of its own, and the submit element disabled.
    expect(recording.crossField.fieldsIndividuallyValid).toBe(true);
    expect(recording.crossField.rootInvalid).toBe(true);
    expect(recording.crossField.submitDisabled).toBe(true);
    expect(recording.submitElementId).toBe('submit');

    // The fact the pane is handed carries the measured reading, not a label written beside it.
    const fact = FACTS['fields'] as {
      submitElementId?: unknown;
      submitDisabled?: unknown;
      submitState?: unknown;
    };
    expect(fact.submitDisabled).toBe(recording.crossField.submitDisabled);
    expect(fact.submitElementId).toBe(recording.submitElementId);

    const demo = await renderDemo('fields');
    expect(demo.state()).toBe('fields');
    // Every line is derived from the recording: the fields' validity from this fact, the submit
    // state from the measured boolean, and the root kind from the recording's own error list.
    const submit = recording.crossField.submitDisabled ? 'disabled' : 'enabled';
    const rootKind = recording.crossField.rootErrors[0]?.kind;
    expect(rootKind).toBeDefined();
    expect(demo.lines()).toEqual([
      'name: valid',
      'age: valid',
      `submit: ${submit}`,
      `form: error ${rootKind}`,
    ]);
    // The two values the lines were derived from are in the committed recording's bytes, not only
    // in a field this spec picked.
    expect(text.includes('"submitDisabled": true')).toBe(true);
    expect(text.includes(`"${recording.submitElementId}"`)).toBe(true);
  });

  /**
   * The M038 half: the sample fact behind `/linked-state` is the join's answer for the recording's
   * `differing` subject, and the signal, the source and the two stored values the pane prints are
   * that recording's. The word the pane reports is the join's `reason`, and the recording's
   * precomputed agreement is neither printed nor consulted — it says the values differ, which the
   * pane may only know because the join said so.
   */
  it('renders the linked signal, its source and the agreement the M038 recording measures', async () => {
    const { recording, text } = readLinkedStateRecording();
    const signal = recording.subjects.differing.node;
    const source = recording.source.node;

    // The measured pair the demo samples: two different stored values and one shared source.
    expect(signal.label).toBe('differing');
    expect(signal.value).not.toBe(source.value);

    // The fact the pane is handed carries the recording's own labels and values.
    const fact = FACTS['linked-state'] as {
      facts?: { signal?: unknown; source?: unknown; value?: unknown }[];
    };
    const sampled = fact.facts?.[0];
    if (sampled === undefined) {
      throw new Error(
        'the linked-state sample must carry one fact for the pane to render',
      );
    }
    expect(sampled.signal).toBe(signal.label);
    expect(sampled.source).toBe(source.label);
    expect(sampled.value).toBe(signal.value);

    const demo = await renderDemo('linked-state');
    // The pane's state is the join's own word, not the recording's precomputed agreement.
    expect(demo.state()).toBe('differing');
    expect(demo.lines()).toEqual([
      `signal: ${signal.label}`,
      `source: ${source.label}`,
      `value: ${signal.value}`,
      `sourceValue: ${source.value}`,
      'reason: differing',
    ]);
    // Nothing the pane renders names the precomputed field or a cause for the difference.
    expect(demo.text()).not.toContain('agreesWithItsSource');
    expect(demo.text()).not.toMatch(/written|owner|cause/i);
    // The identity and the two values are in the committed recording's bytes, not only here.
    expect(text.includes(`"label": "${signal.label}"`)).toBe(true);
    expect(text.includes(`"label": "${source.label}"`)).toBe(true);
    expect(text.includes(`"value": ${signal.value}`)).toBe(true);
  });

  /**
   * The M039 half: the sample answer behind `/render-phase` is the join's answer for the recording
   * T001 made, and the demo renders it as three blocks that keep their own text. The effect half is
   * the recording's own — the counter fixture's effect node carries no label, one recorded edge and
   * the one signal that edge names — and the change-detection half is the digest's NG0100 entry,
   * which the recording names as a substitute and not as a capture.
   */
  it('renders the effect, the phase and the change-detection finding the M039 record carries, apart', async () => {
    const { recording, text: recordingText } = readRenderPhaseRecording();
    const { digest, text: digestText } = readErrorDigest();
    const fresh = recording.effect.freshRead;

    // The measurement first: the recorded effect is an unlabelled effect node, and the profiler
    // declares no effect event — the negative the phase's absence stands on.
    expect(fresh.kind).toBe('effect');
    expect(fresh.label).toBe('');
    expect(fresh.labelEmpty).toBe(true);
    expect(recording.profiler.effectEvent.absent).toBe(true);
    expect(recording.profiler.effectEvent.count).toBe(0);
    expect(recording.changeDetection.result).toBe('negative');
    expect(recording.changeDetection.substitute.notACapture).toBe(true);

    const entry = digest.entries.find(
      (candidate) =>
        candidate.code === recording.changeDetection.substitute.code,
    );
    if (entry === undefined) {
      throw new Error(
        `the shipped digest no longer carries ${recording.changeDetection.substitute.code}, so the pane has no change-detection message to render`,
      );
    }

    // The sample the pane is handed carries the recording's values, not labels written beside them.
    const fact = FACTS['render-phase'] as {
      findings: Record<string, unknown>[];
      phase: Record<string, unknown>;
    };
    const [effect, change] = fact.findings;
    expect(effect).toEqual({
      state: 'effect',
      effect: null,
      namedBy: 'recorded-edge',
      reads: fresh.signalsTheEdgesName,
    });
    expect(change).toEqual({
      state: 'change-detection',
      code: entry.code,
      message: entry.body,
      provenance: 'digest entry, not a capture',
    });
    expect(fact.phase).toEqual({
      state: 'cannot-tell',
      absence: 'no-effect-event',
    });

    const demo = await renderDemo('render-phase');
    expect(demo.state()).toBe('findings');
    expect(demo.blocks().map((block) => block.state)).toEqual([
      'effect',
      'change-detection',
      'phase',
    ]);
    expect(demo.lines()).toEqual([
      'effect: (the graph gives no label)',
      'namedBy: recorded-edge',
      ...fresh.signalsTheEdgesName.map((signal) => `read: ${signal}`),
      `code: ${entry.code}`,
      `message: ${entry.body}`,
      'provenance: digest entry, not a capture',
      'phase: cannot-tell',
      'absence: no-effect-event',
    ]);

    // E7: each block holds only its own text. The code is in the change-detection block, the phase
    // word in the phase block, and neither reaches the effect block.
    const [effectBlock, changeBlock, phaseBlock] = demo.blocks();
    if (
      effectBlock === undefined ||
      changeBlock === undefined ||
      phaseBlock === undefined
    ) {
      throw new Error('the render-phase pane must render all three blocks');
    }
    expect(effectBlock.lines).not.toContain(`code: ${entry.code}`);
    expect(effectBlock.text).not.toContain('phase:');
    expect(changeBlock.text).not.toContain('namedBy:');
    expect(changeBlock.text).not.toContain('absence:');
    expect(phaseBlock.lines).toEqual([
      'phase: cannot-tell',
      'absence: no-effect-event',
    ]);
    expect(phaseBlock.text).not.toContain(`code: ${entry.code}`);
    expect(new Set(demo.blocks().map((block) => block.text)).size).toBe(3);

    // Nothing here names a phase other than the join's absence, and nothing claims a write.
    expect(demo.text()).not.toMatch(/rendering|after-render|before-render/i);
    expect(demo.text()).not.toMatch(/\b(wrote|written|owner|cause|because)\b/i);
    // The values the pane prints are in the committed files' bytes, not only in this spec.
    expect(recordingText.includes(`"labelEmpty": ${fresh.labelEmpty}`)).toBe(
      true,
    );
    expect(recordingText.includes('"notACapture": true')).toBe(true);
    expect(digestText.includes(JSON.stringify(entry.body))).toBe(true);
  });

  /**
   * The M040 half: the sample answer behind `/performance` is the narrator's answer for the frame
   * `research/raw/m040-work-events.json` measured, and the demo renders it with the component
   * identity and the measured cost in their own cells — nothing else. Every pair and every name the
   * sample carries is derived from that recording here, so a demo that named a component the page
   * never reported, or printed a duration no measurement carries, reddens against the recording's
   * own bytes rather than against a copy of them written in this spec.
   */
  it('renders the frame’s ordered work the M040 record carries, identity and cost apart', async () => {
    const { recording, text: recordingText } = readPerformanceRecording();
    const fact = FACTS['performance'] as unknown as PerformanceFact;

    // The answer's shape: four intervals in the order the frame recorded them, and the frame's own
    // state — a start it never closed makes the frame `unmeasured`, which is the narrator's rule.
    expect(fact.state).toBe('unmeasured');
    expect(fact.unresolved).toEqual([]);
    expect(fact.intervals.map((interval) => interval.state)).toEqual([
      'measured',
      'measured',
      'cannot-tell',
      'unmeasured',
    ]);
    const [appTemplate, routerHook, changeDetection, unclosed] = fact.intervals;
    if (
      appTemplate === undefined ||
      routerHook === undefined ||
      changeDetection === undefined ||
      unclosed === undefined
    ) {
      throw new Error(
        'the performance sample must carry the four intervals the frame recorded',
      );
    }

    // The recording's own measured facts, read rather than restated: the five pairs the installed
    // `ProfilerEvent` derives, and the page whose per-pair rows name the instances each bracket
    // carried — the two the witness measured on `/`.
    const page = recording.witness.pages[0];
    if (page === undefined) {
      throw new Error(
        'the M040 recording must carry the witness page its frames were measured on',
      );
    }
    expect(page.url).toBe('http://localhost:4222/');
    const derivedPairs = recording.pairs.sources[1]?.pairs ?? [];
    expect(derivedPairs.map((pair) => pair.label)).toContain('TemplateUpdate');
    const witnessOf = (interval: PerformanceInterval) => {
      const witnessed = page.pairs.find(
        (candidate) => candidate.label === interval.pair,
      );
      if (witnessed === undefined) {
        throw new Error(
          `the recording measured no ${interval.pair} pair on ${page.url}`,
        );
      }
      return witnessed;
    };

    for (const interval of fact.intervals) {
      // Every pair the sample names is one the installed ProfilerEvent derives.
      expect(derivedPairs.map((pair) => pair.label)).toContain(interval.pair);
      const witnessed = witnessOf(interval);
      if (interval.state === 'measured') {
        const name = interval.componentName ?? '';
        // The identity is one the recording measured for that pair, and it is in the recording's
        // bytes — not a name written beside it here.
        expect(witnessed.startInstance).toContain(name);
        expect(recordingText.includes(name)).toBe(true);
        // The cost is the answer's own two receipt times: no duration is written separately.
        expect(interval.durationMs).toBe(
          (interval.endedAt ?? 0) - interval.startedAt,
        );
        continue;
      }
      // No name and no duration: the answer carries neither, so the demo may print neither.
      expect(interval.componentName).toBeUndefined();
      expect(interval.durationMs).toBeUndefined();
      if (interval.state === 'cannot-tell') {
        // The pair whose own two events named nobody is the one the recording answers as carrying
        // no identity at all, which is why this interval names an absence instead of a component.
        expect(witnessed.startInstance).toEqual(['null']);
        expect(recording.identity.namedAbsence.carriesIdentity).toBe('none');
        expect(interval.absence).toBeDefined();
      }
    }

    const demo = await renderDemo('performance');
    expect(demo.state()).toBe(fact.state);
    // One row per interval, in the answer's order: the state word the answer gave it, then only the
    // cells that hold text. The unnamed interval prints no cost line and the unmeasured one prints
    // no identity line, which is SC5's "nothing it was not given".
    expect(demo.lines()).toEqual([
      `state: ${appTemplate.state}`,
      `identity: ${appTemplate.componentName}`,
      `cost: ${appTemplate.durationMs}`,
      `state: ${routerHook.state}`,
      `identity: ${routerHook.componentName}`,
      `cost: ${routerHook.durationMs}`,
      `state: ${changeDetection.state}`,
      `identity: ${changeDetection.absence}`,
      `state: ${unclosed.state}`,
      `cost: ${unclosed.state}`,
    ]);

    // A measured zero is a measurement: the second row's cost is `0`, never a blank.
    expect(routerHook.durationMs).toBe(0);
    expect(demo.lines()).toContain('cost: 0');

    // Exactly two columns: the pair name the answer carried identifies the work and is never
    // printed as a third one, and no cost line appears for the two intervals the page did not
    // measure.
    const costLines = demo.lines().filter((line) => line.startsWith('cost: '));
    expect(costLines).toEqual([
      `cost: ${appTemplate.durationMs}`,
      `cost: ${routerHook.durationMs}`,
      `cost: ${unclosed.state}`,
    ]);
    for (const pair of page.pairs) {
      expect(demo.text()).not.toContain(pair.label);
    }

    // The instance the recording measured for the pair the frame never closed is printed nowhere:
    // an unmeasured interval has no component, and borrowing its bracket's name would be the small
    // untruth this scenario exists to catch.
    const printed = fact.intervals
      .map((interval) => interval.componentName)
      .filter((name): name is string => typeof name === 'string');
    const unprinted = page.pairs
      .flatMap((pair) => pair.startInstance)
      .filter((name) => name !== 'null' && !printed.includes(name));
    expect(unprinted).toEqual(['_Counter']);
    for (const name of unprinted) expect(demo.text()).not.toContain(name);
  });

  /**
   * held-out E5 (INTENT.md SC5): a fact the join cannot read a state out of renders `cannot tell`
   * with its reason in the pane — never a blank pane and never a default. The control beside it is
   * the same fact with the root's error kind present, which the pane does render.
   */
  it('E5: an unrenderable fact yields cannot-tell in the pane, never a blank or a default', () => {
    const unreadable = fieldsPanel({
      fields: { name: { valid: true, invalid: false, errors: [] } },
      root: { valid: false, invalid: true, errors: [] },
    });
    if (unreadable.kind !== 'cannot-tell') {
      throw new Error(
        `the pane must answer cannot-tell for a root that carries no error kind; it answered ${unreadable.kind}: ${unreadable.text}`,
      );
    }
    expect(unreadable.state).toBe('cannot-tell');
    expect(unreadable.reason).toBe('root-invalid-without-error-kind');
    // Never blank: the pane says what it could not tell, and names the reason.
    expect(unreadable.lines.length).toBeGreaterThan(0);
    expect(unreadable.text.trim().length).toBeGreaterThan(0);
    expect(unreadable.text).toMatch(/cannot tell/);
    expect(unreadable.lines).toContain(`reason: ${unreadable.reason}`);
    // Never a default: the fact carried no submit state, so the pane prints none of the two states
    // it could have invented (extension/field-state.js, SC4).
    expect(unreadable.text).not.toMatch(/\benabled\b/);
    expect(unreadable.text).not.toMatch(/\bdisabled\b/);

    const tellable = fieldsPanel({
      fields: { name: { valid: true, invalid: false, errors: [] } },
      root: {
        valid: false,
        invalid: true,
        errors: [{ kind: 'name-too-short-for-age' }],
      },
    });
    expect(tellable.state).toBe('fields');
    expect(tellable.text).toContain('form: error name-too-short-for-age');
  });
});
