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
 * a route accepts and renders nothing for.
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
  });
});
