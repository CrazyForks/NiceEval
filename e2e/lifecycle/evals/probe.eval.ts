import { defineEval } from "niceeval";
import { includes } from "niceeval/expect";

export default defineEval({
  description: "next consumer after interrupt",
  async test(t) {
    const turn = await t.send("probe");
    await turn.succeeded().orStop();
    t.check(turn.reply, includes("lifecycle-fixture-ok"));
  },
});
