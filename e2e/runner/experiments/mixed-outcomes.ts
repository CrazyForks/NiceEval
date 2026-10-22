import { defineExperiment } from "niceeval";
import { nativeReuse } from "../applications/native-reuse.ts";

export default defineExperiment({
  adapter: nativeReuse,
  evals: ["mixed-outcomes"],
  attempts: 2,
  earlyExit: false,
  maxConcurrency: 4,
});
