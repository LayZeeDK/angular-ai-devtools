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
 * moves from thirty to thirty-one.
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
      'components', // M047 SC1-2 surface: the names the record carries, filtered and counted, or the empty page, or the cannot-tell reason
      'copy-check', // M048 SC1-2 surface: the count compared when every string is explained, each unexplained string with its surface, or the reason
      'interaction-story', // M049 SC1-2 surface: the steps in the order the shared `at` reading supports, the empty streams named beside them, or the cannot-tell reason
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
  });
});
