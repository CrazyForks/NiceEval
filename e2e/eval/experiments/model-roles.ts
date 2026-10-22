import { defineExperiment } from "niceeval";
import { roles } from "../fixtures/model-roles.ts";

export default defineExperiment({
  adapter: roles,
  models: {
    unused: { model: "fixture/unused" },
    reviewer: { model: "fixture/shared" },
    planner: { model: "fixture/shared", reasoningEffort: "high" },
  },
  evals: ["model-role-selection", "model-role-invalid"],
  attempts: 1,
});
