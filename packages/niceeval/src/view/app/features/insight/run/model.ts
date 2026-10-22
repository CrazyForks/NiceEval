import type { InspectionSuccessDocumentFor } from "../../../../../inspection/public.ts";
import type { AdapterIdentity } from "../../../../../record/model/run-context.ts";

export interface RunPageModel {
  readonly runId: string;
  readonly experimentId: string;
  readonly adapter: AdapterIdentity | null;
  readonly members: readonly RunMemberModel[];
}

export interface RunMemberModel {
  readonly key: string;
  readonly slotId: string;
  readonly evalId: string;
  readonly attemptOrdinal: number;
  readonly state: "executed" | "carried" | "accepted" | "not-dispatched" | "interrupted" | "pending";
  readonly locator: string | null;
  readonly outcome: "completed" | "errored" | "cancelled" | "interrupted" | null;
  readonly verdict: "passed" | "failed" | "errored" | "skipped" | null;
  readonly score?: InspectionSuccessDocumentFor<"run.get">["run"]["slots"][number]["score"];
}

export function closeRun(
  run: InspectionSuccessDocumentFor<"run.get">,
): RunPageModel {
  return Object.freeze({
    runId: run.run.value.runId,
    experimentId: run.run.value.experimentId,
    adapter: run.run.value.context?.execution.adapter ?? null,
    members: Object.freeze(run.run.slots.map((member, index) => Object.freeze({
      key: `${member.slotId}:${index}`,
      slotId: member.slotId,
      evalId: member.evalId,
      attemptOrdinal: member.attemptOrdinal,
      state: member.state,
      locator: member.locator,
      outcome: member.outcome,
      verdict: member.verdict,
      ...(member.score === null ? {} : { score: member.score }),
    }))),
  });
}
