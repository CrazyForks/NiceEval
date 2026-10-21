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

export interface PlannedSetupPrefixAction {
  readonly entry: Extract<ScheduledSandboxBefore, { readonly kind: "action" }>;
  readonly key: string;
  readonly manifest: SandboxSetupPrefixCacheManifest;
}

/**
 * The one provider-neutral SetupPrefix key planner. CaseKey, BuildKey and an
 * occurrence cohort deliberately stay out of this identity: the exact Base,
 * provider preparation identity and ordered action declarations are sufficient.
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
    protocol: "niceeval.setup-prefix-key/v2",
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
  let cumulativeState: SandboxActionState | undefined;
  for (const entry of entries) {
    cumulativeState = mergeSandboxActionState(cumulativeState, entry.data.plan.state);
    actionManifest.push(Object.freeze({
      owner: {
        kind: entry.owner.kind,
        id: entry.owner.id,
        ordinal: entry.ordinal,
      },
      order: entry.executionOrder.topologicalOrdinal,
      changeFrequency: {
        value: entry.metadata.changeFrequency.value,
        source: entry.metadata.changeFrequency.source,
        ...(entry.metadata.changeFrequency.preset === undefined
          ? {}
          : { preset: entry.metadata.changeFrequency.preset }),
      },
      dependencyEdges: entry.dependencies.map((dependency) => ({ ...dependency })),
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
    }));
    const declarationMetadata: JsonValue = Object.freeze({
      protocol: "niceeval.setup-prefix-manifest/v2",
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
        protocol: "niceeval.setup-prefix-replacement/v2",
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
    planned.push(Object.freeze({ entry, key, manifest }));
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
