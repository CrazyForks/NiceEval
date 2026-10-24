import { randomUUID } from "node:crypto";
import type { JsonValue } from "../shared/types.ts";
import {
  type SandboxSetupPrefixCacheEligibility,
  type SandboxSetupPrefixCacheManifest,
  type SandboxSetupPrefixCacheOperation,
} from "../sandbox/backend.ts";
import { mergeSandboxActionState, type SandboxActionState } from "../sandbox/action.ts";
import { digestOf } from "../sandbox/identity.ts";
import type { ScheduledSandboxBefore } from "../sandbox/link.ts";
import type { LinkedRunPlan } from "../sandbox/plan.ts";

export const SETUP_PREFIX_INTERPRETER_REVISION = "niceeval.sandbox-step-interpreter/v1";
export const SETUP_PREFIX_QUIESCE_REVISION = "niceeval.setup-prefix-quiesce/v1";

/** Consumer attribution is never part of an artifact's content identity. */
export function setupPrefixAttribution(entry: ScheduledSandboxBefore) {
  const owner = Object.freeze({ kind: entry.owner.kind, id: entry.owner.id });
  return Object.freeze({
    owner,
    declarationOrder: Object.freeze({ owner, ordinal: entry.ordinal }),
    executionOrder: entry.executionOrder,
    changeFrequency: entry.metadata.changeFrequency,
    schedulingReason: entry.schedulingReason,
    dependencies: entry.dependencies,
  });
}

/** The ordered capture facts shared by runtime identity and the dry/debug plan. */
export function setupPrefixActionManifest(
  entry: Extract<ScheduledSandboxBefore, { readonly kind: "action" }>,
  cumulativeState: SandboxActionState,
) {
  return Object.freeze({
    capabilities: {
      requires: [...entry.metadata.requires],
      provides: [...entry.metadata.provides],
    },
    action: {
      id: entry.data.plan.id,
      family: entry.data.plan.family,
      declaredState: entry.data.plan.state,
      cumulativeState,
      input: entry.data.plan.input,
      fingerprint: { ...entry.data.plan.fingerprint },
      steps: entry.data.plan.steps.map((step) => {
        if (step.kind === "exec") {
          const { args, envKeys, ...fields } = step;
          return { ...fields, args: [...args], ...(envKeys === undefined ? {} : { envKeys: [...envKeys] }) };
        }
        if (step.kind === "checkoutGit") {
          const { sparse, ...fields } = step;
          return { ...fields, ...(sparse === undefined ? {} : {
            sparse: { include: [...sparse.include], exclude: [...sparse.exclude] },
          }) };
        }
        return { ...step };
      }),
    },
  });
}

export interface PlannedSetupPrefixAction {
  readonly entry: Extract<ScheduledSandboxBefore, { readonly kind: "action" }>;
  readonly key: string;
  readonly manifest: SandboxSetupPrefixCacheManifest;
  /** Current consumer's declarations, aligned with the prefix's action order. */
  readonly attributionManifest: readonly ReturnType<typeof setupPrefixAttribution>[];
}

/**
 * The one provider-neutral SetupPrefix key planner. CaseKey, BuildKey and an
 * occurrence cohort deliberately stay out of this identity: the exact Base,
 * provider preparation identity and ordered action content are sufficient.
 */
export function plannedSetupPrefixActions(
  plan: Extract<LinkedRunPlan, { readonly _tag: "Sandbox" }>,
  entries: readonly Extract<ScheduledSandboxBefore, { readonly kind: "action" }>[],
  eligibility: Extract<SandboxSetupPrefixCacheEligibility, { readonly _tag: "Eligible" }>,
): readonly PlannedSetupPrefixAction[] {
  const baseImageId = eligibility.baseImageId;
  const keyScope = eligibility.keyScope;
  const keyScopeIdentity: JsonValue = { ...keyScope };
  const provider = plan.providerPlan;
  const targetIdentity: JsonValue = {
    source: provider.target.source,
    platform: { ...provider.target.platform },
  };
  const revisions = Object.freeze({
    storage: keyScope.storageSchemaRevision,
    interpreter: SETUP_PREFIX_INTERPRETER_REVISION,
    quiesce: SETUP_PREFIX_QUIESCE_REVISION,
    capture: keyScope.artifactFormatRevision,
  });
  let parentKey = `base:${digestOf({
    protocol: "niceeval.setup-prefix-key/v3",
    baseImageId,
    provider: {
      id: provider.provider,
      plannerRevision: provider.plannerRevision,
    },
    target: targetIdentity,
    revisions,
    preparationIdentity: keyScopeIdentity,
  })}`;
  const planned: PlannedSetupPrefixAction[] = [];
  const actionManifest: JsonValue[] = [];
  const attributionManifest: ReturnType<typeof setupPrefixAttribution>[] = [];
  let cumulativeState: SandboxActionState | undefined;
  for (const entry of entries) {
    cumulativeState = mergeSandboxActionState(cumulativeState, entry.data.plan.state);
    actionManifest.push(setupPrefixActionManifest(entry, cumulativeState));
    attributionManifest.push(setupPrefixAttribution(entry));
    const declarationMetadata: JsonValue = Object.freeze({
      protocol: "niceeval.setup-prefix-manifest/v3",
      parentKey,
      baseImageId,
      provider: {
        id: provider.provider,
        plannerRevision: provider.plannerRevision,
      },
      actionManifest: [...actionManifest],
      // Replacement collapses only physical generations of the exact declared
      // content. Different canonical inputs remain independently addressable.
      replacementScope: Object.freeze({
        protocol: "niceeval.setup-prefix-replacement/v3",
        baseImageId,
        provider: {
          id: provider.provider,
          plannerRevision: provider.plannerRevision,
        },
        target: targetIdentity,
        preparationIdentity: keyScopeIdentity,
        actionManifest: [...actionManifest],
      }),
      requiredState: cumulativeState,
      target: targetIdentity,
      revisions,
      preparationIdentity: keyScopeIdentity,
    });
    const key = `prefix:${digestOf(declarationMetadata)}`;
    const manifest: SandboxSetupPrefixCacheManifest = Object.freeze({
      baseImageId,
      setupPrefixKey: key,
      setupManifestDigest: `sha256:${digestOf(declarationMetadata)}`,
      requiredState: cumulativeState,
      storageSchemaRevision: keyScope.storageSchemaRevision,
      artifactFormatRevision: keyScope.artifactFormatRevision,
      changeFrequency: entry.metadata.changeFrequency.value,
      declarationMetadata,
    });
    planned.push(Object.freeze({ entry, key, manifest, attributionManifest: Object.freeze([...attributionManifest]) }));
    parentKey = key;
  }
  return Object.freeze(planned);
}

export function setupPrefixOperation(
  planned: PlannedSetupPrefixAction,
  knownSensitiveValues?: readonly string[],
): SandboxSetupPrefixCacheOperation {
  return Object.freeze({
    operationId: `setup-prefix-${randomUUID()}`,
    manifest: planned.manifest,
    ...(knownSensitiveValues === undefined || knownSensitiveValues.length === 0
      ? {}
      : { knownSensitiveValues: Object.freeze([...knownSensitiveValues]) }),
  });
}
