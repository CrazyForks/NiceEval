import { defineExperiment } from "niceeval";
import { groupWaveAgent, groupWaveSandbox } from "../agents/group-wave-gap.ts";

export default defineExperiment({
  agent: groupWaveAgent,
  sandbox: groupWaveSandbox,
  sandboxReuse: true,
  attempts: 3,
  maxConcurrency: 1,
  evals: ["reuse-memory"],
});
