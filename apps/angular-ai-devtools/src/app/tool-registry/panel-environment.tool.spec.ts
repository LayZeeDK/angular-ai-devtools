import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  PANEL_ENVIRONMENT,
  PANEL_ENVIRONMENT_TOOL_ID,
  providePanelEnvironmentTool,
  type PanelEnvironment,
} from './panel-environment.tool';
import { TOOL_REGISTRY, type ToolRegistry } from './tool-registry';

/**
 * A fresh registry that registers `panel_environment` exactly the way `app.config.ts` does. When a
 * realm is supplied it replaces the tool's own globals through `PANEL_ENVIRONMENT`, so the extension
 * case, the served-app case and the unreadable case are all driven through the registry's execute
 * path rather than by reaching into the backing.
 */
function newRegistry(realm?: PanelEnvironment): ToolRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers:
      realm === undefined
        ? [providePanelEnvironmentTool()]
        : [
            providePanelEnvironmentTool(),
            { provide: PANEL_ENVIRONMENT, useValue: () => realm },
          ],
  });
  return TestBed.inject(TOOL_REGISTRY);
}

/** A panel inside the DevTools extension: the extension API supplies a tab id and runtime. */
const EXTENSION_REALM: PanelEnvironment = {
  inspectedTabId: 42,
  chromeRuntime: true,
  pathname: '/panel/index.html',
};

/** The panel served as an ordinary app: no extension API, no runtime, a real location. */
const SERVED_REALM: PanelEnvironment = {
  inspectedTabId: null,
  chromeRuntime: false,
  pathname: '/panel/',
};

/** Neither the extension API nor a location: the one case that must be an error, not an empty result. */
const UNREADABLE_REALM: PanelEnvironment = {
  inspectedTabId: null,
  chromeRuntime: false,
  pathname: null,
};

describe('panel_environment declaration', () => {
  it('is declared as a panel read that publishes a result to the panel', () => {
    const declaration = newRegistry()
      .tools()
      .find((tool) => tool.id === PANEL_ENVIRONMENT_TOOL_ID);

    expect(declaration).toBeDefined();
    expect(declaration?.id).toBe('panel_environment');
    expect(declaration?.kind).toBe('read');
    expect(declaration?.host).toEqual(['panel', 'extension-API']);
    expect(declaration?.outcome).toBe('result');
    expect(declaration?.publish).toBe('panel');
    expect(declaration?.input).toEqual({
      type: 'object',
      properties: {},
      required: [],
    });
  });

  it('is listed by the registry the panel builds through provideTools', () => {
    expect(
      newRegistry()
        .tools()
        .map((tool) => tool.id),
    ).toEqual(['panel_environment']);
  });
});

describe('panel_environment result', () => {
  it('reports the DevTools tab id, the route base and chrome.runtime inside the extension', async () => {
    const outcome = await newRegistry(EXTENSION_REALM).execute(
      PANEL_ENVIRONMENT_TOOL_ID,
    );

    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    expect(outcome.provenance).toBe('panel');
    const value = outcome.value as Record<string, unknown>;
    expect(value['tool']).toBe('panel_environment');
    expect(value['extension']).toBe(true);
    expect(value['inspectedTabId']).toBe(42);
    expect(value['chromeRuntime']).toBe(true);
    expect(value['routeBase']).toBe('/panel/');
    expect(value['provenance']).toBe('panel');
  });

  it('reports the served app through its own location and never guesses a tab id', async () => {
    const outcome = await newRegistry(SERVED_REALM).execute(
      PANEL_ENVIRONMENT_TOOL_ID,
    );

    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    expect(outcome.provenance).toBe('panel');
    const value = outcome.value as Record<string, unknown>;
    expect(value['extension']).toBe(false);
    expect(value['inspectedTabId']).toBeNull();
    expect(value['chromeRuntime']).toBe(false);
    expect(value['routeBase']).toBe('/panel/');
    expect(value['provenance']).toBe('panel');
  });

  it('derives the route base from the served pathname rather than a hard-coded one', async () => {
    const served = await newRegistry({
      ...SERVED_REALM,
      pathname: '/panel',
    }).execute(PANEL_ENVIRONMENT_TOOL_ID);
    const root = await newRegistry({ ...SERVED_REALM, pathname: '/' }).execute(
      PANEL_ENVIRONMENT_TOOL_ID,
    );

    expect(served.kind).toBe('result');
    expect(root.kind).toBe('result');
    expect(
      (served as { value: Record<string, unknown> }).value['routeBase'],
    ).toBe('/panel/');
    expect(
      (root as { value: Record<string, unknown> }).value['routeBase'],
    ).toBe('/');
  });
});

describe('panel_environment unreadable realm', () => {
  it('answers host-unavailable naming the tool when there is neither an extension API nor a location', async () => {
    const outcome = await newRegistry(UNREADABLE_REALM).execute(
      PANEL_ENVIRONMENT_TOOL_ID,
    );

    expect(outcome.kind).toBe('error');
    if (outcome.kind !== 'error') {
      return;
    }
    expect(outcome.code).toBe('host-unavailable');
    expect(outcome.toolId).toBe(PANEL_ENVIRONMENT_TOOL_ID);
    expect(outcome.message).toContain('panel_environment');
  });
});

describe('panel_environment shipped realm reader', () => {
  it('answers a result from this realm without a supplied source, and writes nothing', async () => {
    const outcome = await newRegistry().execute(PANEL_ENVIRONMENT_TOOL_ID);

    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    expect(outcome.provenance).toBe('panel');
    const value = outcome.value as Record<string, unknown>;
    // The test realm is not inside the DevTools extension, so no tab id is invented for it.
    expect(value['inspectedTabId']).toBeNull();
    expect(value['extension']).toBe(false);
    // Whatever the test realm's location is, the reported base is a path it actually has.
    const routeBase = value['routeBase'];
    if (routeBase !== null) {
      expect(typeof routeBase).toBe('string');
      expect(String(routeBase).startsWith('/')).toBe(true);
      expect(String(routeBase).endsWith('/')).toBe(true);
    }
  });
});
