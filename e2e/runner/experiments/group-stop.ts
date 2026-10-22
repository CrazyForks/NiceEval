import { defineExperiment } from "niceeval";
import { orStopParallelAgent, orStopParallelSandbox } from "../agents/or-stop-parallel.ts";
export default defineExperiment({
  adapter: orStopParallelAgent,
  sandbox: orStopParallelSandbox,
  evals: ["group-stop-"],
  maxConcurrency: 3,
});
