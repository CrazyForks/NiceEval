import { captureLinkedRunRenameFingerprintIdentity } from "../sandbox/plan.ts";
import type { PreparedRunPair } from "./sandbox-selection.ts";
import type { IdentityRebuildInput } from "./identity-domains.ts";
import { Schema } from "effect";
import type { EvalManifest } from "../record/manifest.ts";
import { IdentityManifestEntrySchema, type IdentityManifestEntry } from "../record/family/identity-manifests/schema.ts";
import { CURRENT_IDENTITY_DOMAINS } from "./identity-domains.ts";

/** Schema decoding detaches the manifest from the mutable planning maps. */
export function identityManifestEntry(evalId: string, manifest: EvalManifest): IdentityManifestEntry {
  return Schema.decodeUnknownSync(IdentityManifestEntrySchema, { onExcessProperty: "error" })({
    evalId,
    domains: { ...CURRENT_IDENTITY_DOMAINS, fingerprintAlgorithm: manifest.algorithmVersion, fingerprintCoverage: manifest.coverageVersion },
    config: manifest.config,
    ...(manifest.plan === undefined ? {} : { plan: manifest.plan }),
    ...(manifest.plugins === undefined ? {} : { plugins: manifest.plugins }),
    source: manifest.source,
    data: manifest.data,
  });
}

/** Capture typed Experiment-owner rewriting before opening the Record reader. */
export function captureRenameRebuildInput(
  pair: PreparedRunPair, input: IdentityRebuildInput,
  renameFingerprint: ((experimentId: string) => string | undefined) | undefined,
): (experimentId: string) => IdentityRebuildInput | undefined {
  const project = captureLinkedRunRenameFingerprintIdentity(pair.plan);
  return Object.freeze((experimentId: string) => {
    if (renameFingerprint?.(experimentId) === undefined) return undefined;
    const pairPlan = project(experimentId);
    if (pairPlan === undefined) return undefined;
    return Object.freeze({ ...input, experimentId, fingerprintPayload: Object.freeze({ ...input.fingerprintPayload, pairPlan }) });
  });
}
