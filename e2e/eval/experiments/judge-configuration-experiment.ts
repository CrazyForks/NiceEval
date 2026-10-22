import { defineExperiment } from "niceeval";
import { configurationApplication } from "../evals/judge-configuration.eval.ts";

export default defineExperiment({
  adapter: configurationApplication,
  judge: "experiment-specific-model",
  evals: ["judge-configuration/inherited", "judge-configuration/overridden"],
});
