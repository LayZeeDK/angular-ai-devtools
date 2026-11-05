/**
 * The tool-group projection — M020 T005 (INTENT.md SC2).
 *
 * The registry holds eight declarations and no group concept, and the envelope that would carry a
 * `group` field is SHA-256 pinned (`scripts/registry-envelope-pin.test.mjs`), so grouping is a
 * read-only projection beside it: a static table of group declarations plus one pure function over
 * the declarations a caller hands in. Nothing here calls `provideTools`, `declare` or `attach` — a
 * second declaration of an id throws `ToolDeclarationError` at injector construction, not at
 * render — and nothing here reads the registry itself, so the table and the function stay testable
 * without an injector.
 *
 * Four decisions the shape records:
 *
 * 1. **Membership by id, never by field.** `TOOL_GROUPS` lists `memberIds` of ids the envelope
 *    already declares; the projection resolves those ids against the declarations it was handed
 *    and drops the ones that are not declared. A group is therefore never "offered and empty".
 * 2. **Only `publish === 'model'` members are counted.** `publish` is the axis no consumer applies
 *    today, and one shipped tool (`panel_environment`) declares `publish: 'panel'`. A group that
 *    listed every declaration would offer the model a tool it may not call, so a group left with
 *    no model-visible member is withheld with a reason naming `publish` instead of being listed
 *    empty (SC2's failure mode, INTENT.md SC2 and prohibition N1).
 * 3. **The gate order is version, then facts, then publish, and it is observable.** An absent or
 *    unparseable version withholds every group with a "cannot tell" reason — an unknown version
 *    excludes, it never opens. When the facts carry a `supported` boolean, they decide next:
 *    `supported: false` withholds the group quoting the page's own reason, and a `requiredFeature`
 *    that is not `true` withholds it naming the bit. The facts win over a passing version (N2),
 *    because a production page can carry a version whose debug surface is gone. A page that
 *    published no bits at all therefore keeps the groups that need none and loses the ones that do:
 *    an unpublished bit is not `true`, and silence never opens a group whose support the panel
 *    cannot confirm.
 * 4. **`angularVersionGate` is deliberately not reused.** `src/main-world/stale-view-scan.ts`
 *    answers `supported: true` for an unknown version, which is the opposite of this gate's ruling
 *    (INTENT § Corrections, 2026-11-02); the two gates keep their own meaning rather than sharing
 *    an answer that is permissive on one side and strict on the other.
 *
 * `requiredFeature` is redundant on today's fixtures — all eight bits flip together, so
 * `supported` already covers them — and is kept because an injected or later partial payload can
 * gate one group, which is exactly what gives N2 a concrete meaning.
 *
 * The module carries no runtime import: `ToolDeclaration` and `PanelContext` are type-only imports,
 * so the held-out suite loads this file with `node --test` and the panel's bundle gains no
 * dependency it did not already have.
 */
import type { PanelContext } from './panel-context';
import type { ToolDeclaration } from './tool-registry/tool-registry';
import { isRecord } from './record-guard';

/**
 * One declared group: the ids it lists, the `[ng-version]` floor it needs, and — when the page
 * publishes a bit the whole group depends on — the feature that must read `true`.
 */
export type ToolGroupDeclaration = {
  readonly id: string;
  readonly title: string;
  readonly memberIds: readonly string[];
  readonly minVersion: string;
  readonly requiredFeature?: string;
};

/** A group the model may be offered, holding only the ids that survived every gate. */
export type ToolGroupView = {
  readonly id: string;
  readonly title: string;
  readonly toolIds: readonly string[];
};

/** One withheld group and the sentence saying why, so an empty list can explain itself. */
export type ToolGroupExclusion = {
  readonly groupId: string;
  readonly reason: string;
};

/**
 * The projection: what may be offered, one entry per withheld group, and the reason the list is
 * empty — which is non-null exactly when `groups` is.
 */
export type ToolGroupProjection = {
  readonly groups: readonly ToolGroupView[];
  readonly excluded: readonly ToolGroupExclusion[];
  readonly emptyReason: string | null;
};

/** The name every reason uses for where the page's facts came from, as `app-facts.ts` writes it. */
const PAGE_CHANNEL = 'the page channel (angular-ai:state)';

/** The name every reason uses for where the version came from. */
const VERSION_SOURCE = 'the [ng-version] the relay read';

/**
 * The declared groups, in the order the chat's list offers them.
 *
 * Every floor is `22.1.3`: the version below which the extension hard-blocks the page
 * (`extension/agent-main.js`) and publishes `supported: false` instead of state, so no group can
 * be offered there and no higher floor is evidenced by the repository. The `requiredFeature`
 * entries name bits of `APP_FACT_FEATURES` (the eight the page measures), never a panel-local
 * capability: naming a capability `app_facts` cannot support would be a claim the page never made.
 *
 * `panel-environment` is declared so the publish rule is measured rather than asserted: its only
 * member reads the panel's own realm and is `publish: 'panel'`, so the projection withholds it with
 * a reason naming `publish` and the model is never offered a tool it may not call.
 */
export const TOOL_GROUPS: readonly ToolGroupDeclaration[] = [
  {
    id: 'app-support',
    title: 'The app-facts support record',
    memberIds: ['app_facts'],
    minVersion: '22.1.3',
  },
  {
    id: 'component-reads',
    title: 'Component reads',
    memberIds: ['find_components', 'inspect_component'],
    minVersion: '22.1.3',
    requiredFeature: 'getHostElement',
  },
  {
    id: 'signal-reads',
    title: 'Signal reads',
    memberIds: ['list_signals'],
    minVersion: '22.1.3',
    requiredFeature: 'getSignalGraph',
  },
  {
    id: 'dev-mode-reads',
    title: 'Tier-0 debug reads (dev mode only)',
    memberIds: ['getComponent', 'getDirectiveMetadata'],
    minVersion: '22.1.3',
    requiredFeature: 'getDirectiveMetadata',
  },
  {
    id: 'error-reference',
    title: 'The Angular error reference',
    memberIds: ['error_digest_lookup'],
    minVersion: '22.1.3',
  },
  {
    id: 'panel-environment',
    title: "The panel's own environment",
    memberIds: ['panel_environment'],
    minVersion: '22.1.3',
  },
];

/** Three numeric parts, compared as numbers rather than as text. */
type ParsedVersion = {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
};

/**
 * A version the gate can compare: exactly three numeric parts, optionally followed by a
 * prerelease or build suffix (`22.3.0-next.0`). Anything else — `22.2`, `unknown`, an empty
 * string — is not a version, and the caller is told so instead of being given a guess.
 */
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z.-]+)?$/;

/**
 * Projects the declared groups over the declarations the caller hands in.
 *
 * Pure: `tools` and `context` are only read — never written, never kept — nothing is remembered
 * between calls, and every array and record returned is freshly built, so two identical calls are
 * deep-equal and a caller may keep the result.
 */
export function projectToolGroups(
  tools: readonly ToolDeclaration[],
  context: PanelContext,
): ToolGroupProjection {
  const version = parseVersion(context.version);
  const groups: ToolGroupView[] = [];
  const excluded: ToolGroupExclusion[] = [];

  for (const group of TOOL_GROUPS) {
    const refusal = refuseGroup(group, version, context, tools);
    if (refusal !== null) {
      excluded.push({ groupId: group.id, reason: refusal });
      continue;
    }
    groups.push({
      id: group.id,
      title: group.title,
      toolIds: modelVisibleIds(group, tools),
    });
  }

  return {
    groups,
    excluded,
    emptyReason: groups.length === 0 ? describeEmptyList(excluded) : null,
  };
}

/**
 * The gates, in the order that keeps the failure observable: the version first (an unknown or
 * unusable version withholds everything with the cannot-tell reason), then the facts (they win over
 * a passing version, N2), then membership and `publish`.
 *
 * Answers `null` when the group may be offered, and the reason sentence when it is withheld.
 */
function refuseGroup(
  group: ToolGroupDeclaration,
  version: ParsedVersion | null,
  context: PanelContext,
  tools: readonly ToolDeclaration[],
): string | null {
  const minimum = parseVersion(group.minVersion);
  if (minimum === null) {
    return `the group "${group.id}" declares minVersion "${group.minVersion}", which is not a three-part version, so the gate cannot be compared and the group is withheld rather than opened`;
  }

  if (version === null) {
    const read =
      context.version === null
        ? 'nothing'
        : `"${context.version}", which is not a three-part version`;
    return `${VERSION_SOURCE} is ${read}, so the minimum version "${group.minVersion}" of the group "${group.id}" cannot be compared, and this projection cannot tell whether the group applies: an unknown version withholds the group, it never opens it`;
  }

  if (isBelow(version, minimum)) {
    return `${VERSION_SOURCE} is "${String(context.version).trim()}", which is below the minimum version "${group.minVersion}" the group "${group.id}" declares, so the group is withheld rather than offered with no tools`;
  }

  const factsRefusal = refuseOnFacts(group, context);
  if (factsRefusal !== null) {
    return factsRefusal;
  }

  return refuseOnMembership(group, tools);
}

/**
 * The facts gate. Only what the page actually published is read: a fact that is absent is not a
 * contradicting fact, so with no `supported` boolean the version alone decides, exactly as the
 * recorded order says. A `supported: false` withholds the group quoting the page's own reason; a
 * `requiredFeature` that is not `true` withholds it naming the bit — published `false` and
 * unpublished are both not `true`, and neither is read as support.
 */
function refuseOnFacts(
  group: ToolGroupDeclaration,
  context: PanelContext,
): string | null {
  const facts = context.facts;
  const supported: unknown = facts['supported'];
  const versionText = String(context.version).trim();

  if (supported === false) {
    const rawReason: unknown = facts['reason'];
    const pageReason =
      typeof rawReason === 'string' ? rawReason : 'no reason given';
    return `${PAGE_CHANNEL} reported supported: false ("${pageReason}"), and the facts win over ${VERSION_SOURCE} "${versionText}", so the group "${group.id}" is withheld`;
  }

  const requiredFeature = group.requiredFeature;
  if (requiredFeature === undefined) {
    return null;
  }

  const rawFeatures: unknown = facts['features'];
  const features: Readonly<Record<string, unknown>> = isRecord(rawFeatures)
    ? rawFeatures
    : {};
  const bit: unknown = features[requiredFeature];
  if (bit === true) {
    return null;
  }

  const published =
    bit === undefined
      ? `${PAGE_CHANNEL} published no features.${requiredFeature} bit`
      : `${PAGE_CHANNEL} published features.${requiredFeature} = ${String(bit)}`;
  return `${published}, not true, and the facts win over ${VERSION_SOURCE} "${versionText}", so the group "${group.id}" requires that bit and is withheld`;
}

/**
 * Membership and the publish axis. Ids the caller did not hand in are dropped, and of the
 * declarations that did resolve only `publish === 'model'` counts — a panel- or internal-published
 * tool is not the model's to call. A group left with nothing is withheld with a sentence naming
 * which rule removed its members, so it is never present with no tools.
 */
function refuseOnMembership(
  group: ToolGroupDeclaration,
  tools: readonly ToolDeclaration[],
): string | null {
  const resolved = resolveMembers(group, tools);
  if (resolved.length === 0) {
    const listed = group.memberIds.map((toolId) => `"${toolId}"`).join(', ');
    return `none of the ids the group "${group.id}" lists (${listed}) is declared in the registry it was handed, so the group has no member and is withheld rather than offered with no tools`;
  }

  if (resolved.some((declaration) => declaration.publish === 'model')) {
    return null;
  }

  const published = resolved
    .map(
      (declaration) =>
        `"${declaration.id}" declares publish = '${declaration.publish}'`,
    )
    .join(', ');
  return `every declaration the group "${group.id}" resolved is hidden from the model by its publish value (${published}), and only publish = 'model' members may be offered, so the group is withheld rather than offered with no tools`;
}

/** The declarations for a group's ids, in the order the group lists them. */
function resolveMembers(
  group: ToolGroupDeclaration,
  tools: readonly ToolDeclaration[],
): readonly ToolDeclaration[] {
  const resolved: ToolDeclaration[] = [];
  for (const toolId of group.memberIds) {
    const declaration = tools.find((candidate) => candidate.id === toolId);
    if (declaration !== undefined) {
      resolved.push(declaration);
    }
  }
  return resolved;
}

/** The ids a group may offer: its members in declaration order, filtered to `publish === 'model'`. */
function modelVisibleIds(
  group: ToolGroupDeclaration,
  tools: readonly ToolDeclaration[],
): readonly string[] {
  return resolveMembers(group, tools)
    .filter((declaration) => declaration.publish === 'model')
    .map((declaration) => declaration.id);
}

/**
 * The sentence an empty list carries. It names every withheld group and that group's own reason,
 * so "no groups" is never indistinguishable from "the list broke": the count, the group ids and
 * the cause are all in the text.
 */
function describeEmptyList(excluded: readonly ToolGroupExclusion[]): string {
  if (excluded.length === 0) {
    return 'no tool group is declared, so the chat has no group to offer and the list is empty';
  }

  const withheld =
    excluded.length === 1
      ? 'the one declared group was withheld'
      : `all ${excluded.length} declared groups were withheld`;
  const reasons = excluded
    .map((exclusion) => `"${exclusion.groupId}" — ${exclusion.reason}`)
    .join('; ');
  return `no tool group is offered on this page, because ${withheld} from the list: ${reasons}`;
}

/** Parses the three numeric parts of a version, or `null` when the text is not one. */
function parseVersion(version: string | null): ParsedVersion | null {
  if (typeof version !== 'string') {
    return null;
  }
  const match = VERSION_PATTERN.exec(version.trim());
  if (match === null) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/** Whether `version` is older than `minimum`, compared part by part as numbers. */
function isBelow(version: ParsedVersion, minimum: ParsedVersion): boolean {
  if (version.major !== minimum.major) {
    return version.major < minimum.major;
  }
  if (version.minor !== minimum.minor) {
    return version.minor < minimum.minor;
  }
  return version.patch < minimum.patch;
}
