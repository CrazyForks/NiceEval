import { defineExperiment } from "niceeval";
import { groupWaveSandbox, groupWaveAgent } from "../agents/group-wave-gap.ts";

export default defineExperiment({
  agent: groupWaveAgent,
  sandbox: groupWaveSandbox,
  evals: ["group-checkpoint"],
  maxConcurrency: 1,
});
