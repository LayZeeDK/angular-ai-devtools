import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appRoutes } from './app.routes';
import { PanelDemoComponent } from './panel-demo';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes), provideHttpClient()],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

/**
 * The ordered route table, pinned where the app's own suite reads it — M032 T003 (INTENT.md SC4).
 *
 * The chat-entry suite carries the same ordered pin; this one is the app suite's own view of the
 * M032 addition: the `lint` surface is appended last, it loads lazily, and it is installed through
 * `PanelDemoComponent` with its own name in route data — never the surface function itself, which
 * a route accepts and renders nothing for. M034 appends `legacy` after it, M035 appends `onpush`
 * after that, M036 appends `resource` after that, M038 appends `linked-state`, M039 appends
 * `render-phase` after that, M040 appends `performance` last, M041 appends `navigation` after
 * that, M042 appends `error-boundary` after that and M043 appends `stability` after that, the same
 * way. M045 appends `console` after `stability`, M046 appends `console-read` after that, M047
 * appends `components` after that and M048 appends `copy-check` after that, which is why the count
 * moved from twenty-four to twenty-eight. M049 appends `interaction-story` after that, which is why
 * the count moves from twenty-eight to twenty-nine, and M050 appends `dead-click` after that, which
 * is why it moves from twenty-nine to thirty. M051 appends `what-changed` after that, which is why it
 * moves from thirty to thirty-one; M052's `webmcp` sits between `console-read` and `components`
 * rather than last, because every line `app.routes.ts` is cited at by `m047..m052` keeps its number
 * there, which is why the count moves from thirty-one to thirty-two without moving a citation. M053's
 * `webmcp-rehearsal` sits between `console-read` and `webmcp` for the same reason, which is why the
 * count moves from thirty-two to thirty-three without moving one. M054's `visual-qa` sits between
 * `console-read` and `webmcp-rehearsal` for the same reason — the route records cite the routes below
 * the list — which is why the count moves from thirty-three to thirty-four without moving a citation.
 * M055's `tutor-foundations` follows `visual-qa` for the same reason, which is why the count moves
 * from thirty-four to thirty-five without moving one. M057's `tutor-signals` follows
 * `tutor-foundations` for the same reason and is paid for out of that paragraph's own note, which is
 * why the count moves from thirty-five to thirty-six without moving a citation. M058's
 * `tutor-routing` follows `tutor-signals` for the same reason and is paid for by folding the M053
 * note into that paragraph and deleting its line, which is why the count moves from thirty-six to
 * thirty-seven without moving one. M059's `teardown-leak` follows `webmcp` for the same reason and is
 * paid for by folding the M047 note's three lines into one, which is why the count moves from
 * thirty-seven to thirty-eight without moving a cited line. M060's `error-routing` sits between
 * `interaction-story` and `dead-click` for the same reason — the route records cite the loader's
 * two lines, the `copy-check`, `interaction-story` and `dead-click` path lines and the declaration
 * and mapped-literal lines below the list — and is paid for by folding two lines of the M050 note
 * into their neighbours' text, which is why the count moves from thirty-eight to thirty-nine
 * without moving a cited line. M061's `locale-correctness` sits between `error-routing` and the
 * dead-click note for the same reason — the route records cite the path lines above it, the
 * `dead-click` and `what-changed` path lines below it and the declaration and mapped-literal lines
 * below the list — and is paid for by folding the M050 note's four lines into two, which is why the
 * count moves from thirty-nine to forty without moving a cited line.
 */
describe('the route table', () => {
  it('appends the panel surfaces last and installs each through the demo component', async () => {
    expect(appRoutes.map((route) => route.path)).toEqual([
      '',
      'signal-provenance',
      'di-doctor',
      'error-explainer',
      'stale-view',
      'interop',
      'chat',
      'picker',
      'image-budget',
      'after-render',
      'sanitizer',
      'redirect',
      'fields',
      'lint', // M032 SC4 surface: the diagnostic joined to its input, or its absence state
      'router', // M033 SC4 surface: the navigation failure and the routes it failed to match
      'legacy', // M034 SC4 surface: the component's structure and the form the table sources
      'onpush', // M035 SC4 surface: the strategy the def reports and its readiness facts
      'resource', // M036 SC5 surface: the resource, its state and the params status beside it
      'linked-state', // M038 SC4 surface: the linked signal, its source and the agreement between
      'render-phase', // M039 SC5 surface: the effect and its reads, the phase absence, the change-detection finding
      'performance', // M040 SC5 surface: the frame's ordered work, its component identity and its measured cost apart
      'navigation', // M041 SC1-3 surface: a navigation's stage, the holder it cannot name, its terminal and its loads
      'error-boundary', // M042 SC1-4 surface: the declaring and throwing components apart, the error, the fallback, each named absence
      'stability', // M043 SC5 surface: the state and its emission, the settle time or its absence, the repeated work, apart
      'console', // M045 SC3-5 surface: the join's state and one block per captured diagnostic, the unmatched code named
      'console-read', // M046 SC1-3 surface: the control that names what will be sent, the body the pane drew, and the absence or the cannot-tell reason
      'visual-qa', // M054 SC1-3 surface: each measured property's computed value beside the baseline declaration, or the three absences named apart
      'tutor-foundations', // M055 SC1-3 surface: the artefact file, the milestone and the criterion a record states for a question, or the four absences named apart
      'tutor-signals', // M057 SC1, SC3 surface: the effect node by label and index, its upstream nodes, the ordering absence, or the three absences named apart
      'tutor-routing', // M058 SC1, SC3 surface: the terminal event by class and id, the route node by its own path and stated fields, the two absences side by side, or the cannot-tell state
      'webmcp-rehearsal', // M053 SC1-3 surface: the tool the model chose beside the result the tool returned, or the absent handle, the refusal or the unreadable list, each named
      'webmcp', // M052 SC1-2 surface: each declared tool with the name and description the API reported, the empty list it answered, or the reason's code and detail
      'teardown-leak', // M059 SC1, SC3 surface: the console code and the body the record carries, the owner only where a message field names one, both absences as their own lines, and the release then the diagnostic, or the code searched for and the count read
      'components', // M047 SC1-2 surface: the names the record carries, filtered and counted, or the empty page, or the cannot-tell reason
      'copy-check', // M048 SC1-2 surface: the count compared when every string is explained, each unexplained string with its surface, or the reason
      'interaction-story', // M049 SC1-2 surface: the steps in the order the shared `at` reading supports, the empty streams named beside them, or the cannot-tell reason
      'error-routing', // M060 SC6 surface: the message and the code an uncaught error's own text carried, the owner or its absence, the phase or `phase-not-recorded`, and each absence of the join as its own line
      'locale-correctness', // M061 SC4, SC2 surface: the provider entry's token, kind and import path or the absence that stands where no entry carries the token, each absence in its own line, and no locale value
      'dead-click', // M050 SC1-2 surface: each start with no terminal and the window it was judged over, the count compared, or the cannot-tell reason, with the refused chains named
      'what-changed', // M051 SC1-2 surface: each field the two records disagree on with its before and after (or the one value that exists), the count compared, or the cannot-tell reason
    ]);
    expect(appRoutes.filter((route) => route.path === 'lint')).toHaveLength(1);

    const lint = appRoutes.find((route) => route.path === 'lint');
    expect(lint?.component).toBeUndefined();
    if (lint?.loadComponent === undefined) {
      throw new Error('the lint surface must load lazily');
    }
    expect(await lint.loadComponent()).toBe(PanelDemoComponent);
    expect(lint.data?.['surface']).toBe('lint');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(lint.data?.['surface']).not.toBe('fields');

    const router = appRoutes.find((route) => route.path === 'router');
    expect(router?.component).toBeUndefined();
    if (router?.loadComponent === undefined) {
      throw new Error('the router surface must load lazily');
    }
    expect(await router.loadComponent()).toBe(PanelDemoComponent);
    expect(router.data?.['surface']).toBe('router');

    const legacy = appRoutes.find((route) => route.path === 'legacy');
    expect(legacy?.component).toBeUndefined();
    if (legacy?.loadComponent === undefined) {
      throw new Error('the legacy surface must load lazily');
    }
    expect(await legacy.loadComponent()).toBe(PanelDemoComponent);
    expect(legacy.data?.['surface']).toBe('legacy');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(legacy.data?.['surface']).not.toBe('router');

    const onpush = appRoutes.find((route) => route.path === 'onpush');
    expect(onpush?.component).toBeUndefined();
    if (onpush?.loadComponent === undefined) {
      throw new Error('the onpush surface must load lazily');
    }
    expect(await onpush.loadComponent()).toBe(PanelDemoComponent);
    expect(onpush.data?.['surface']).toBe('onpush');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(onpush.data?.['surface']).not.toBe('legacy');

    const resource = appRoutes.find((route) => route.path === 'resource');
    expect(resource?.component).toBeUndefined();
    if (resource?.loadComponent === undefined) {
      throw new Error('the resource surface must load lazily');
    }
    expect(await resource.loadComponent()).toBe(PanelDemoComponent);
    expect(resource.data?.['surface']).toBe('resource');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(resource.data?.['surface']).not.toBe('onpush');

    const linkedState = appRoutes.find(
      (route) => route.path === 'linked-state',
    );
    expect(linkedState?.component).toBeUndefined();
    if (linkedState?.loadComponent === undefined) {
      throw new Error('the linked-state surface must load lazily');
    }
    expect(await linkedState.loadComponent()).toBe(PanelDemoComponent);
    expect(linkedState.data?.['surface']).toBe('linked-state');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(linkedState.data?.['surface']).not.toBe('resource');

    const renderPhase = appRoutes.find(
      (route) => route.path === 'render-phase',
    );
    expect(renderPhase?.component).toBeUndefined();
    if (renderPhase?.loadComponent === undefined) {
      throw new Error('the render-phase surface must load lazily');
    }
    expect(await renderPhase.loadComponent()).toBe(PanelDemoComponent);
    expect(renderPhase.data?.['surface']).toBe('render-phase');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(renderPhase.data?.['surface']).not.toBe('linked-state');

    const performance = appRoutes.find((route) => route.path === 'performance');
    expect(performance?.component).toBeUndefined();
    if (performance?.loadComponent === undefined) {
      throw new Error('the performance surface must load lazily');
    }
    expect(await performance.loadComponent()).toBe(PanelDemoComponent);
    expect(performance.data?.['surface']).toBe('performance');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(performance.data?.['surface']).not.toBe('render-phase');

    const navigation = appRoutes.find((route) => route.path === 'navigation');
    expect(navigation?.component).toBeUndefined();
    if (navigation?.loadComponent === undefined) {
      throw new Error('the navigation surface must load lazily');
    }
    expect(await navigation.loadComponent()).toBe(PanelDemoComponent);
    expect(navigation.data?.['surface']).toBe('navigation');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(navigation.data?.['surface']).not.toBe('performance');

    const errorBoundary = appRoutes.find(
      (route) => route.path === 'error-boundary',
    );
    expect(errorBoundary?.component).toBeUndefined();
    if (errorBoundary?.loadComponent === undefined) {
      throw new Error('the error-boundary surface must load lazily');
    }
    expect(await errorBoundary.loadComponent()).toBe(PanelDemoComponent);
    expect(errorBoundary.data?.['surface']).toBe('error-boundary');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(errorBoundary.data?.['surface']).not.toBe('navigation');

    const stability = appRoutes.find((route) => route.path === 'stability');
    expect(stability?.component).toBeUndefined();
    if (stability?.loadComponent === undefined) {
      throw new Error('the stability surface must load lazily');
    }
    expect(await stability.loadComponent()).toBe(PanelDemoComponent);
    expect(stability.data?.['surface']).toBe('stability');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(stability.data?.['surface']).not.toBe('error-boundary');

    const consoleRoute = appRoutes.find((route) => route.path === 'console');
    expect(consoleRoute?.component).toBeUndefined();
    if (consoleRoute?.loadComponent === undefined) {
      throw new Error('the console surface must load lazily');
    }
    expect(await consoleRoute.loadComponent()).toBe(PanelDemoComponent);
    expect(consoleRoute.data?.['surface']).toBe('console');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(consoleRoute.data?.['surface']).not.toBe('stability');

    const consoleRead = appRoutes.find(
      (route) => route.path === 'console-read',
    );
    expect(consoleRead?.component).toBeUndefined();
    if (consoleRead?.loadComponent === undefined) {
      throw new Error('the console-read surface must load lazily');
    }
    expect(await consoleRead.loadComponent()).toBe(PanelDemoComponent);
    expect(consoleRead.data?.['surface']).toBe('console-read');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(consoleRead.data?.['surface']).not.toBe('console');

    const webmcpRehearsal = appRoutes.find(
      (route) => route.path === 'webmcp-rehearsal',
    );
    expect(webmcpRehearsal?.component).toBeUndefined();
    if (webmcpRehearsal?.loadComponent === undefined) {
      throw new Error('the webmcp-rehearsal surface must load lazily');
    }
    expect(await webmcpRehearsal.loadComponent()).toBe(PanelDemoComponent);
    expect(webmcpRehearsal.data?.['surface']).toBe('webmcp-rehearsal');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(webmcpRehearsal.data?.['surface']).not.toBe('console-read');
    // One entry, so the route this task adds is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'webmcp-rehearsal'),
    ).toHaveLength(1);

    const webmcp = appRoutes.find((route) => route.path === 'webmcp');
    expect(webmcp?.component).toBeUndefined();
    if (webmcp?.loadComponent === undefined) {
      throw new Error('the webmcp surface must load lazily');
    }
    expect(await webmcp.loadComponent()).toBe(PanelDemoComponent);
    expect(webmcp.data?.['surface']).toBe('webmcp');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(webmcp.data?.['surface']).not.toBe('console-read');
    // One entry, so the route this task adds is the only one that answers at that path.
    expect(appRoutes.filter((route) => route.path === 'webmcp')).toHaveLength(
      1,
    );

    const components = appRoutes.find((route) => route.path === 'components');
    expect(components?.component).toBeUndefined();
    if (components?.loadComponent === undefined) {
      throw new Error('the components surface must load lazily');
    }
    expect(await components.loadComponent()).toBe(PanelDemoComponent);
    expect(components.data?.['surface']).toBe('components');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(components.data?.['surface']).not.toBe('console-read');

    const copyCheck = appRoutes.find((route) => route.path === 'copy-check');
    expect(copyCheck?.component).toBeUndefined();
    if (copyCheck?.loadComponent === undefined) {
      throw new Error('the copy-check surface must load lazily');
    }
    expect(await copyCheck.loadComponent()).toBe(PanelDemoComponent);
    expect(copyCheck.data?.['surface']).toBe('copy-check');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(copyCheck.data?.['surface']).not.toBe('components');

    const interactionStory = appRoutes.find(
      (route) => route.path === 'interaction-story',
    );
    expect(interactionStory?.component).toBeUndefined();
    if (interactionStory?.loadComponent === undefined) {
      throw new Error('the interaction-story surface must load lazily');
    }
    expect(await interactionStory.loadComponent()).toBe(PanelDemoComponent);
    expect(interactionStory.data?.['surface']).toBe('interaction-story');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(interactionStory.data?.['surface']).not.toBe('copy-check');

    const deadClick = appRoutes.find((route) => route.path === 'dead-click');
    expect(deadClick?.component).toBeUndefined();
    if (deadClick?.loadComponent === undefined) {
      throw new Error('the dead-click surface must load lazily');
    }
    expect(await deadClick.loadComponent()).toBe(PanelDemoComponent);
    expect(deadClick.data?.['surface']).toBe('dead-click');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(deadClick.data?.['surface']).not.toBe('interaction-story');
    // One entry, so the route this task appends is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'dead-click'),
    ).toHaveLength(1);

    const whatChanged = appRoutes.find(
      (route) => route.path === 'what-changed',
    );
    expect(whatChanged?.component).toBeUndefined();
    if (whatChanged?.loadComponent === undefined) {
      throw new Error('the what-changed surface must load lazily');
    }
    expect(await whatChanged.loadComponent()).toBe(PanelDemoComponent);
    expect(whatChanged.data?.['surface']).toBe('what-changed');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(whatChanged.data?.['surface']).not.toBe('dead-click');
    // One entry, so the route this task appends is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'what-changed'),
    ).toHaveLength(1);

    const visualQa = appRoutes.find((route) => route.path === 'visual-qa');
    expect(visualQa?.component).toBeUndefined();
    if (visualQa?.loadComponent === undefined) {
      throw new Error('the visual-qa surface must load lazily');
    }
    expect(await visualQa.loadComponent()).toBe(PanelDemoComponent);
    expect(visualQa.data?.['surface']).toBe('visual-qa');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(visualQa.data?.['surface']).not.toBe('what-changed');
    // One entry, so the route this task appends is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'visual-qa'),
    ).toHaveLength(1);

    const tutorFoundations = appRoutes.find(
      (route) => route.path === 'tutor-foundations',
    );
    expect(tutorFoundations?.component).toBeUndefined();
    if (tutorFoundations?.loadComponent === undefined) {
      throw new Error('the tutor-foundations surface must load lazily');
    }
    expect(await tutorFoundations.loadComponent()).toBe(PanelDemoComponent);
    expect(tutorFoundations.data?.['surface']).toBe('tutor-foundations');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(tutorFoundations.data?.['surface']).not.toBe('visual-qa');
    // One entry, so the route this task appends is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'tutor-foundations'),
    ).toHaveLength(1);

    const tutorSignals = appRoutes.find(
      (route) => route.path === 'tutor-signals',
    );
    expect(tutorSignals?.component).toBeUndefined();
    if (tutorSignals?.loadComponent === undefined) {
      throw new Error('the tutor-signals surface must load lazily');
    }
    expect(await tutorSignals.loadComponent()).toBe(PanelDemoComponent);
    expect(tutorSignals.data?.['surface']).toBe('tutor-signals');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(tutorSignals.data?.['surface']).not.toBe('tutor-foundations');
    // One entry, so the route this task appends is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'tutor-signals'),
    ).toHaveLength(1);

    const tutorRouting = appRoutes.find(
      (route) => route.path === 'tutor-routing',
    );
    expect(tutorRouting?.component).toBeUndefined();
    if (tutorRouting?.loadComponent === undefined) {
      throw new Error('the tutor-routing surface must load lazily');
    }
    expect(await tutorRouting.loadComponent()).toBe(PanelDemoComponent);
    expect(tutorRouting.data?.['surface']).toBe('tutor-routing');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(tutorRouting.data?.['surface']).not.toBe('tutor-signals');
    // One entry, so the route this task appends is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'tutor-routing'),
    ).toHaveLength(1);

    const errorRouting = appRoutes.find(
      (route) => route.path === 'error-routing',
    );
    expect(errorRouting?.component).toBeUndefined();
    if (errorRouting?.loadComponent === undefined) {
      throw new Error('the error-routing surface must load lazily');
    }
    expect(await errorRouting.loadComponent()).toBe(PanelDemoComponent);
    expect(errorRouting.data?.['surface']).toBe('error-routing');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(errorRouting.data?.['surface']).not.toBe('teardown-leak');
    // One entry, so the route this task appends is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'error-routing'),
    ).toHaveLength(1);

    const localeCorrectness = appRoutes.find(
      (route) => route.path === 'locale-correctness',
    );
    expect(localeCorrectness?.component).toBeUndefined();
    if (localeCorrectness?.loadComponent === undefined) {
      throw new Error('the locale-correctness surface must load lazily');
    }
    expect(await localeCorrectness.loadComponent()).toBe(PanelDemoComponent);
    expect(localeCorrectness.data?.['surface']).toBe('locale-correctness');
    // Its own name, so a copy of another surface's route cannot stand in for it.
    expect(localeCorrectness.data?.['surface']).not.toBe('error-routing');
    // One entry, so the route this task adds is the only one that answers at that path.
    expect(
      appRoutes.filter((route) => route.path === 'locale-correctness'),
    ).toHaveLength(1);
  });
});
