import { defineExperiment } from "niceeval";
import { incusSandbox, shell } from "niceeval/sandbox";
import { preContextErrorAgent } from "../../agents/deterministic.ts";

export default defineExperiment({
  adapter: preContextErrorAgent,
  sandboxCache: { before: "use" },
  sandbox: incusSandbox({
    image: "niceeval/docker-execution-v1@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    project: "niceeval-eval-dev",
    storagePool: "niceeval-sandbox-dev",
    acceptDevelopmentDomain: true,
  }).before(shell({ id: "prepare-fixture", command: "true", changeFrequency: 10 })),
  evals: ["greet/hello"],
  attempts: 3,
});
