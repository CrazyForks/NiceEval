import { defineEvalGroup } from "niceeval";
import first from "./01-first.eval.ts";
import second from "./02-second.eval.ts";
import { groupLifecycle, sandboxOnlyToolchain } from "../../plugins/lifecycle.ts";

export default defineEvalGroup({
  evals: [second, first],
  onUnavailable: "stop-group",
  plugins: [
    sandboxOnlyToolchain({ marker: process.env.PLUGIN_GROUP_VARIANT ?? "stable" }),
    groupLifecycle({ marker: "first" }),
    groupLifecycle({ marker: "second" }),
  ],
});
