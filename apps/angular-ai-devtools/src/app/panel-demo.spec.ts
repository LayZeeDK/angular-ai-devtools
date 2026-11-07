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
