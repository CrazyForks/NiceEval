import { queryOptions } from "@tanstack/react-query";
import { inspectionQueryOptions, type ViewGenerationBinding } from "../data/index.ts";
import { runOperation } from "../data/operations.ts";
import { closeRun, type RunPageModel } from "./model.ts";

export function runQueryOptions(generation: ViewGenerationBinding, runId: string) {
  const operation = runOperation(runId);
  return queryOptions({
    queryKey: ["insight-run", generation.identity, runId] as const,
    queryFn: async (): Promise<RunPageModel> => {
      const run = await generation.queryClient.fetchQuery(inspectionQueryOptions(generation, operation));
      return closeRun(run);
    },
  });
}
