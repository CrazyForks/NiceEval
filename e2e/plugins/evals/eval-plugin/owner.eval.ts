import { defineEval } from "niceeval";
import { defaultEvalLifecycle, evalLifecycle } from "../../plugins/lifecycle.ts";

export default defineEval({
  plugins: [defaultEvalLifecycle, evalLifecycle({ marker: "owner-a" }), evalLifecycle({ marker: "owner-b" })],
  async test(t) {
    const turn = await t.send("verify multiple Eval Plugin lifecycles");
    await turn.succeeded().orStop();
  },
});
