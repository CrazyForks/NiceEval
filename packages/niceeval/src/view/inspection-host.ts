// @concord-file ne-surface-view-inspection-host
// @concord-implements docs/feature/inspection/architecture.md
// @concord-implements docs/feature/run-inspection/README.md
import { Effect, Result } from "effect";

import { decodeInspectionRequest, QUERY_PROTOCOL } from "../inspection/codec.ts";
import { openHostOwnedInspectionSource } from "../inspection/source.ts";
import { selectInspectionOperation } from "../inspection/select.ts";
import { bindProjectInput } from "../inspection/project-input.ts";
import type { InspectionDocument } from "../inspection/protocol.ts";
import type { ViewGeneration } from "./revision.ts";

// @concord-code ne-surface-inspect-view-generation
// @concord-implements docs/feature/inspection/architecture.md
export async function inspectViewGeneration(generation: ViewGeneration, input: unknown): Promise<InspectionDocument> {
  const decoded = decodeInspectionRequest(input);
  if (Result.isFailure(decoded)) throw decoded.failure;
  return Effect.runPromise(Effect.scoped(Effect.gen(function* () {
    const opened = yield* openHostOwnedInspectionSource(generation.recordPath);
    const facts = decoded.success.operation.kind === "project.get" && generation.target.kind === "current"
      ? Object.freeze({ ...opened, kind: "project-record" as const })
      : opened;
    const cutoff = facts.cutoff();
    if (cutoff.identity !== generation.sourceCutoffIdentity) {
      return yield* Effect.fail(new Error("Pinned generation cutoff did not match its descriptor"));
    }
    if (decoded.success.operation.kind === "project.get" && generation.target.kind === "current") {
      if (generation.target.input.cutoffIdentity !== cutoff.identity ||
          generation.target.input.target.identity !== generation.target.identity) {
        return yield* Effect.fail(new Error("Pinned current target did not match its descriptor"));
      }
      bindProjectInput(facts, generation.target.input);
    }
    return selectInspectionOperation(facts, decoded.success.operation);
  })).pipe(Effect.catch((cause) => Effect.succeed(Object.freeze({
    protocol: QUERY_PROTOCOL,
    outcome: "failure" as const,
    operation: decoded.success.operation.kind,
    failure: Object.freeze({
      code: "inspection-operation-failed" as const,
      reason: "Inspection could not be completed for this generation.",
      correction: "retry" as const,
    }),
  })))));
}
