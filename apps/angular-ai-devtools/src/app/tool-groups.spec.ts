import { describe, expect, it } from 'vitest';
import type { PanelContext } from './panel-context';
import {
  TOOL_GROUPS,
  projectToolGroups,
  type ToolGroupDeclaration,
  type ToolGroupProjection,
} from './tool-groups';
import type {
  ToolDeclaration,
  ToolPublish,
} from './tool-registry/tool-registry';
import { appFactsTool } from './tool-registry/app-facts';
import { errorDigestTool } from './tool-registry/error-digest.tool';
import { panelEnvironmentTool } from './tool-registry/panel-environment.tool';
import {
  findComponentsTool,
  getComponentTool,
  getDirectiveMetadataTool,
  inspectComponentTool,
  listSignalsTool,
} from './tool-registry/read-tools';

/**
 * The registry's eight declarations in `app.config.ts` order, taken from the modules that declare
 * them rather than restated here: a `publish` value that drifts in the registry has to reach this
 * spec, and `panel_environment`'s `publish: 'panel'` is the one this whole axis exists for.
 */
const REGISTERED: readonly ToolDeclaration[] = [
  appFactsTool.declaration,
  findComponentsTool.declaration,
  inspectComponentTool.declaration,
  listSignalsTool.declaration,
  getDirectiveMetadataTool.declaration,
  getComponentTool.declaration,
  panelEnvironmentTool.declaration,
  errorDigestTool.declaration,
];

/** The eight page-published bits, all `true`: a dev-mode fixture page. */
const ALL_FEATURES_TRUE: Readonly<Record<string, boolean>> = {
  setProfiler: true,
  getSignalGraph: true,
  getHostElement: true,
  getInjector: true,
  getDirectiveMetadata: true,
  getInjectorResolutionPath: true,
  getInjectorMetadata: true,
  getInjectorProviders: true,
};

/** A page the panel heard from, with the values a case varies. */
function page(values: {
  readonly version?: string | null;
  readonly supported?: boolean;
  readonly reason?: string;
  readonly features?: Readonly<Record<string, boolean>> | null;
}): PanelContext {
  const facts: Record<string, unknown> = {};
  if (values.supported !== undefined) {
    facts['supported'] = values.supported;
  }
  if (values.reason !== undefined) {
    facts['reason'] = values.reason;
  }
  if (values.features !== undefined && values.features !== null) {
    facts['features'] = values.features;
  }
  return {
    facts,
    version: values.version === undefined ? '22.2.2' : values.version,
    stateReceived: true,
    replayOutcome: 'answered',
    // No group gate reads the companion answer: it is the extra surface's own record (M021 T005).
    companion: null,
  };
}

/** A declaration fixture, so a case can make a group's members visible or hidden at will. */
function declarationOf(id: string, publish: ToolPublish): ToolDeclaration {
  return {
    id,
    title: `fixture declaration for ${id}`,
    kind: 'read',
    host: ['page'],
    outcome: 'result',
    publish,
    input: { type: 'object', properties: {}, required: [] },
  };
}

/** Every group's members as model-visible declarations — the shape a gate-only case needs. */
function allGroupsVisible(): readonly ToolDeclaration[] {
  return TOOL_GROUPS.flatMap((group) =>
    group.memberIds.map((toolId) => declarationOf(toolId, 'model')),
  );
}

/** The reason recorded for a group, or `''` when the group was offered (so assertions stay string-typed). */
function reasonFor(projection: ToolGroupProjection, groupId: string): string {
  return (
    projection.excluded.find((exclusion) => exclusion.groupId === groupId)
      ?.reason ?? ''
  );
}

/** The ids the projection offers, in order. */
function offeredIds(projection: ToolGroupProjection): readonly string[] {
  return projection.groups.map((group) => group.id);
}

/**
 * `minVersion` with its patch part one lower, borrowing a minor when the patch is `0` — the
 * boundary pair E4 drives, written as arithmetic so it follows the declaration instead of
 * hard-coding a version the table might move away from.
 */
function onePatchBelow(minVersion: string): string {
  const [major, minor, patch] = minVersion
    .split('.')
    .map((part) => Number(part));
  if (patch !== undefined && patch > 0) {
    return `${String(major)}.${String(minor)}.${String(patch - 1)}`;
  }
  return `${String(major)}.${String(Number(minor) - 1)}.99`;
}

/** The fixture everything is projected over when the declaration set is not the case under test. */
const DEV_PAGE = page({
  version: '22.2.2',
  supported: true,
  features: ALL_FEATURES_TRUE,
});

describe('projectToolGroups', () => {
  it('offers the model-visible groups and withholds the one whose only member is panel-published', () => {
    const projection = projectToolGroups(REGISTERED, DEV_PAGE);

    expect(offeredIds(projection)).toEqual([
      'app-support',
      'component-reads',
      'signal-reads',
      'dev-mode-reads',
      'error-reference',
    ]);
    expect(projection.groups).toEqual([
      {
        id: 'app-support',
        title: 'The app-facts support record',
        toolIds: ['app_facts'],
      },
      {
        id: 'component-reads',
        title: 'Component reads',
        toolIds: ['find_components', 'inspect_component'],
      },
      { id: 'signal-reads', title: 'Signal reads', toolIds: ['list_signals'] },
      {
        id: 'dev-mode-reads',
        title: 'Tier-0 debug reads (dev mode only)',
        toolIds: ['getComponent', 'getDirectiveMetadata'],
      },
      {
        id: 'error-reference',
        title: 'The Angular error reference',
        toolIds: ['error_digest_lookup'],
      },
    ]);

    // AC2: `panel_environment` declares `publish: 'panel'`, so it reaches no group at all.
    for (const group of projection.groups) {
      expect(group.toolIds).not.toContain('panel_environment');
    }
    // The group is withheld, not offered empty, and its reason names the publish rule.
    expect(offeredIds(projection)).not.toContain('panel-environment');
    const publishReason = reasonFor(projection, 'panel-environment');
    expect(publishReason).toContain('publish');
    expect(publishReason).toContain("'panel'");
    expect(publishReason).toContain('panel_environment');
    // Nothing is withheld for a second reason: the version and the facts passed.
    expect(projection.excluded).toHaveLength(1);
    expect(projection.emptyReason).toBeNull();
  });

  it('never offers a group with no tools, and never a tool the model may not call', () => {
    const projection = projectToolGroups(REGISTERED, DEV_PAGE);

    expect(projection.groups.length).toBeGreaterThan(0);
    for (const group of projection.groups) {
      expect(group.toolIds.length).toBeGreaterThan(0);
      for (const toolId of group.toolIds) {
        const declaration = REGISTERED.find(
          (candidate) => candidate.id === toolId,
        );
        expect(declaration?.publish).toBe('model');
      }
    }
  });

  it('drops the ids it was not handed, and withholds a group none of whose ids is declared', () => {
    const projection = projectToolGroups(
      [appFactsTool.declaration, findComponentsTool.declaration],
      DEV_PAGE,
    );

    expect(offeredIds(projection)).toEqual(['app-support', 'component-reads']);
    // A partially handed registry shrinks a group to what resolved rather than inventing a member.
    expect(projection.groups[1]?.toolIds).toEqual(['find_components']);

    const missingReason = reasonFor(projection, 'signal-reads');
    expect(missingReason).toContain('list_signals');
    expect(missingReason).toContain('declared in the registry it was handed');
    expect(projection.groups.map((group) => group.id)).not.toContain(
      'signal-reads',
    );
  });

  it('withholds every group at once when the registry handed in is empty', () => {
    const projection = projectToolGroups([], DEV_PAGE);

    expect(projection.groups).toEqual([]);
    expect(projection.excluded).toHaveLength(TOOL_GROUPS.length);
    expect(projection.emptyReason).not.toBeNull();
    expect(projection.emptyReason ?? '').toContain(
      'no tool group is offered on this page',
    );
  });

  it('E4: a version exactly at a group minimum includes it, and one patch below withholds it', () => {
    const tools = allGroupsVisible();

    for (const group of TOOL_GROUPS) {
      const at = projectToolGroups(
        tools,
        page({
          version: group.minVersion,
          supported: true,
          features: ALL_FEATURES_TRUE,
        }),
      );
      const offered = at.groups.find((candidate) => candidate.id === group.id);
      expect(offered).toBeDefined();
      expect(offered?.toolIds).toEqual([...group.memberIds]);
      expect(at.excluded.map((exclusion) => exclusion.groupId)).not.toContain(
        group.id,
      );

      const below = onePatchBelow(group.minVersion);
      const under = projectToolGroups(
        tools,
        page({ version: below, supported: true, features: ALL_FEATURES_TRUE }),
      );
      // Absent from the list, not present with no tools.
      expect(under.groups.map((candidate) => candidate.id)).not.toContain(
        group.id,
      );
      expect(
        under.groups.every((candidate) => candidate.toolIds.length > 0),
      ).toBe(true);
      const reason = reasonFor(under, group.id);
      expect(reason).toBeDefined();
      expect(reason).toContain(below);
      expect(reason).toContain(group.minVersion);
      expect(reason).toContain('below the minimum version');
    }
  });

  it('E5: when every gate fails the list is empty, every group is explained, and the list says why', () => {
    const tools = allGroupsVisible();
    const projection = projectToolGroups(
      tools,
      page({ version: '0.0.1', supported: true, features: ALL_FEATURES_TRUE }),
    );

    expect(projection.groups).toEqual([]);
    expect(projection.excluded.map((exclusion) => exclusion.groupId)).toEqual(
      TOOL_GROUPS.map((group) => group.id),
    );
    for (const exclusion of projection.excluded) {
      expect(exclusion.reason.length).toBeGreaterThan(20);
      expect(exclusion.reason).toContain('0.0.1');
    }
    // The list explains itself: the count, every group id and each group's own reason.
    const emptyReason = projection.emptyReason ?? '';
    expect(projection.emptyReason).not.toBeNull();
    expect(emptyReason).toContain(
      `all ${TOOL_GROUPS.length} declared groups were withheld`,
    );
    expect(emptyReason).toContain('no tool group is offered on this page');
    for (const group of TOOL_GROUPS) {
      expect(emptyReason).toContain(`"${group.id}"`);
    }
  });

  it('opens nothing on a missing or unparseable version and says it cannot tell', () => {
    const tools = allGroupsVisible();
    const unreadable: readonly (string | null)[] = [
      null,
      '',
      '   ',
      'unknown',
      'twenty-two',
      '22.2',
    ];

    for (const version of unreadable) {
      const projection = projectToolGroups(
        tools,
        page({ version, supported: true, features: ALL_FEATURES_TRUE }),
      );

      expect(projection.groups).toEqual([]);
      expect(projection.excluded).toHaveLength(TOOL_GROUPS.length);
      for (const exclusion of projection.excluded) {
        expect(exclusion.reason).toContain('cannot tell');
        expect(exclusion.reason).toContain('never opens');
      }
      expect(projection.emptyReason).not.toBeNull();
    }
  });

  it('N2: the page own supported: false wins over a passing version and is quoted verbatim', () => {
    const projection = projectToolGroups(
      allGroupsVisible(),
      page({
        version: '22.2.2',
        supported: false,
        reason: 'the debug surface is gone on this page',
        features: ALL_FEATURES_TRUE,
      }),
    );

    expect(projection.groups).toEqual([]);
    expect(projection.excluded).toHaveLength(TOOL_GROUPS.length);
    for (const exclusion of projection.excluded) {
      expect(exclusion.reason).toContain('supported: false');
      expect(exclusion.reason).toContain(
        '"the debug surface is gone on this page"',
      );
      expect(exclusion.reason).toContain('the facts win over');
    }
  });

  it('N2: a requiredFeature that is not true withholds its group and names the bit', () => {
    const features = { ...ALL_FEATURES_TRUE, getSignalGraph: false };
    const projection = projectToolGroups(
      allGroupsVisible(),
      page({ version: '22.2.2', supported: true, features }),
    );

    expect(offeredIds(projection)).not.toContain('signal-reads');
    const reason = reasonFor(projection, 'signal-reads');
    expect(reason).toBeDefined();
    expect(reason).toContain('features.getSignalGraph = false');
    expect(reason).toContain('not true');
    // The groups that require no bit, or a bit that is still true, stay offered.
    expect(offeredIds(projection)).toContain('app-support');
    expect(offeredIds(projection)).toContain('error-reference');
    expect(offeredIds(projection)).toContain('component-reads');
  });

  it('N2: a requiredFeature the page never published is not true either', () => {
    const withEmptyMap = projectToolGroups(
      allGroupsVisible(),
      page({ version: '22.2.2', supported: true, features: {} }),
    );
    const withNoMap = projectToolGroups(
      allGroupsVisible(),
      page({ version: '22.2.2', supported: true, features: null }),
    );

    for (const projection of [withEmptyMap, withNoMap]) {
      expect(offeredIds(projection)).toEqual([
        'app-support',
        'error-reference',
        'panel-environment',
      ]);
      const reason = reasonFor(projection, 'component-reads');
      expect(reason).toBeDefined();
      expect(reason).toContain('published no features.getHostElement bit');
    }
  });

  it('reads a page that published no facts as "no bit is true", not as a passing gate', () => {
    const projection = projectToolGroups(REGISTERED, {
      facts: {},
      version: '22.2.2',
      stateReceived: false,
      replayOutcome: 'answered',
      companion: null,
    });

    // No `supported` boolean is not a contradicting fact, so the version still decides: the groups
    // that require no page-published bit stay offered.
    expect(offeredIds(projection)).toEqual(['app-support', 'error-reference']);
    // But a missing bit is not `true`, so every group that needs one is withheld naming that bit —
    // silence never opens a group whose support the panel cannot confirm.
    for (const groupId of [
      'component-reads',
      'signal-reads',
      'dev-mode-reads',
    ]) {
      expect(reasonFor(projection, groupId)).toContain(
        'published no features.',
      );
    }
    expect(reasonFor(projection, 'panel-environment')).toContain('publish');
    expect(projection.excluded).toHaveLength(4);
  });

  it('is pure: two identical calls are deep-equal and neither input is mutated', () => {
    const tools = allGroupsVisible();
    const context = page({
      version: '22.2.2',
      supported: true,
      features: ALL_FEATURES_TRUE,
    });
    const toolsBefore = JSON.stringify(tools);
    const contextBefore = JSON.stringify(context);
    const groupsBefore = JSON.stringify(TOOL_GROUPS);

    const first = projectToolGroups(tools, context);
    const second = projectToolGroups(tools, context);

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
    expect(second.groups).not.toBe(first.groups);
    expect(second.excluded).not.toBe(first.excluded);
    expect(JSON.stringify(tools)).toBe(toolsBefore);
    expect(JSON.stringify(context)).toBe(contextBefore);
    expect(JSON.stringify(TOOL_GROUPS)).toBe(groupsBefore);
  });

  it('carries an emptyReason exactly when the list is empty', () => {
    const offered = projectToolGroups(REGISTERED, DEV_PAGE);
    const withheld = projectToolGroups(
      REGISTERED,
      page({ version: '1.0.0', supported: true }),
    );

    expect(offered.groups.length).toBeGreaterThan(0);
    expect(offered.emptyReason).toBeNull();
    expect(withheld.groups).toHaveLength(0);
    expect(withheld.emptyReason).not.toBeNull();
  });

  it('declares its table in the order the chat offers it, with ids that are unique', () => {
    const ids = TOOL_GROUPS.map((group: ToolGroupDeclaration) => group.id);

    expect(new Set(ids).size).toBe(ids.length);
    // The floor is the version below which the extension blocks the page, on every group.
    for (const group of TOOL_GROUPS) {
      expect(group.minVersion).toBe('22.1.3');
      expect(group.memberIds.length).toBeGreaterThan(0);
      expect(group.title.length).toBeGreaterThan(0);
    }
  });
});
