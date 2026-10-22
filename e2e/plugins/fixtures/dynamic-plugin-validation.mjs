import { defineEval } from "niceeval";
import { definePlugin } from "niceeval/plugin";
import { sandboxLayer } from "niceeval/sandbox";
function rejects(factory, pattern) {
  try { factory(); return false; } catch (error) { return pattern.test(String(error)); }
}
const sandboxOnly = definePlugin({ name: "e2e.dynamic.sandbox-only", identity: {}, sandbox: { before() {} } });
const groupScoped = definePlugin({ name: "e2e.dynamic.group-scoped", identity: {}, group: { before() {} } });
process.stdout.write(JSON.stringify({
  sandboxOnlyCreated: typeof sandboxOnly === "object",
  emptyRejected: rejects(() => definePlugin({ name: "empty", identity: {} }), /at least one behavior/u),
  hostOwnersNotWidened: rejects(() => defineEval({ plugins: [groupScoped], test() {} }), /group.*not allowed.*eval/u),
  templateRejected: rejects(() => definePlugin({ name: "layer", identity: {}, sandbox: sandboxLayer() }), /before or after/u),
  unbrandedRejected: rejects(() => definePlugin({ name: "legacy", identity: {}, sandbox: () => ({ before() {} }) }), /object/u),
}));
