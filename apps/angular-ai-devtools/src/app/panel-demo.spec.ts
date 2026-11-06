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
 */
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { PanelDemoComponent } from './panel-demo';

/** The part of the committed recording this spec reads. */
interface OnpushMetadataRecording {
  subjects: {
    declaredDefault: {
      compiled: { typeRef: string };
      runtime: { component: string };
    };
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
});
