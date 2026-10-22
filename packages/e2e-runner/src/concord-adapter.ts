import { realpathSync } from "node:fs";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Cause, Effect, Layer, Schema } from "effect";
import { bridgeJson, parseBridgeJson, BRIDGE_BYTES } from "./bridge-json.ts";
import { decodeWire, EngineDescriptorSchema } from "./bridge-wire.ts";
import { ConcordEngine, engineError, governanceSuiteForFile } from "./concord-engine.ts";
import { ReadGuards } from "./bridge-guards.ts";
import { canonicalRepoId, repoRootDir, discoverAllRepos, e2eRootDir } from "./discovery.ts";
import { ownedProcessLayer, runOwnedProcess, hasSuccessfulOwnedProcessResult } from "./owned-process.ts";
import * as inventory from "./inventory-api.ts";

const Text = Schema.String.check(Schema.isMinLength(1));
const RequestSchema = Schema.Struct({ format: Schema.Literal("concord.repository-adapter/v1"), requestId: Text, root: Text, engine: EngineDescriptorSchema, processGroup: Schema.Struct({ leaderPid: Schema.Int }), op: Schema.Literals(["collect-repo", "collect-workspace", "read-inventory", "read-red", "read-takeover"]), payload: Schema.Json });
const CollectRepoSchema = Schema.Struct({ suiteId: Text, checkout: Text });
const CollectWorkspaceSchema = Schema.Struct({ checkout: Text });
const InventoryReadSchema = Schema.Struct({ inventoryId: Text, selector: Text });
const EvidenceReadSchema = Schema.Struct({ id: Text });
const readRequest = Effect.callback<unknown, Error>((resume) => {
  const chunks: Buffer[] = []; let bytes = 0;
  const data = (chunk: Buffer) => {
    bytes += chunk.length;
    if (bytes > BRIDGE_BYTES) { cleanup(); process.stdin.pause(); resume(Effect.fail(new Error("adapter request exceeds 32 MiB"))); }
    else chunks.push(chunk);
  };
  const error = (cause: Error) => { cleanup(); resume(Effect.fail(cause)); };
  const end = () => { cleanup(); resume(Effect.try({ try: () => parseBridgeJson(Buffer.concat(chunks)), catch: engineError })); };
  const cleanup = () => { process.stdin.off("data", data); process.stdin.off("error", error); process.stdin.off("end", end); };
  process.stdin.on("data", data); process.stdin.once("error", error); process.stdin.once("end", end);
  return Effect.sync(() => { cleanup(); process.stdin.pause(); });
});
const execute = Effect.fn("repositoryAdapter.execute")(function*(request: typeof RequestSchema.Type, guards: ReadGuards) {
  switch (request.op) {
    case "collect-repo": {
      const payload = decodeWire(CollectRepoSchema, request.payload);
      const discovered = yield* discoverAllRepos(e2eRootDir());
      if (discovered.errors.length > 0) throw new Error(discovered.errors.join("; "));
      const matches: string[] = [];
      for (const repo of discovered.repos) {
        const suite = yield* governanceSuiteForFile(request.root, `e2e/${repo.manifest.id}`);
        if (suite.id === payload.suiteId) matches.push(canonicalRepoId(suite.root));
      }
      if (matches.length !== 1 || matches[0] === "") throw new Error("collect-repo suite must resolve to exactly one native Repo");
      return yield* inventory.collectRepoCaseInventory(matches[0]!, payload.checkout);
    }
    case "collect-workspace": return yield* inventory.collectWorkspaceCaseInventory(decodeWire(CollectWorkspaceSchema, request.payload).checkout);
    case "read-inventory": {
      const payload = decodeWire(InventoryReadSchema, request.payload);
      return yield* inventory.readManagedInventoryReceipt(request.root, payload.inventoryId, payload.selector, guards);
    }
    case "read-red": {
      const evidence = yield* inventory.readManagedRedEvidence(request.root, decodeWire(EvidenceReadSchema, request.payload).id, guards);
      return { ...evidence, candidatePath: guards.wirePath(evidence.candidatePath) };
    }
    case "read-takeover": {
      const evidence = yield* inventory.readManagedTakeoverEvidence(request.root, decodeWire(EvidenceReadSchema, request.payload).id, guards);
      return { ...evidence, candidatePath: guards.wirePath(evidence.candidatePath), receipts: [...evidence.receipts].map(([key, receipt]) => ({ key, receipt })) };
    }
  }
});
const program = Effect.gen(function*() {
  const request = decodeWire(RequestSchema, yield* readRequest);
  if (request.requestId.length === 0 || !/^sha256:[a-f0-9]{64}$/u.test(request.engine.implementationDigest) || request.engine.argv.some(arg => arg.length === 0)) throw new Error("invalid adapter request identity");
  const root = realpathSync(repoRootDir());
  if (request.root !== root || realpathSync(process.cwd()) !== root) throw new Error("adapter root mismatch");
  if (process.platform === "win32" || request.processGroup.leaderPid !== process.pid) throw new Error("RepositoryAdapterProcessGroupUnsupported: adapter must be its POSIX group leader");
  const runtime = Layer.mergeAll(NodeServices.layer, ownedProcessLayer({ inheritedGroup: process.pid }));
  const response = yield* Effect.gen(function*() {
    const observed = yield* runOwnedProcess(["ps", "-o", "pgid=", "-p", String(process.pid)], { cwd: root, output: "capture", stream: false, timeoutMs: 10_000, stdoutBytes: 1024, stderrBytes: 1024 });
    if (!hasSuccessfulOwnedProcessResult(observed) || Number(observed.stdout.trim()) !== process.pid) throw new Error("RepositoryAdapterProcessGroupUnsupported: cannot verify adapter POSIX process group");
    const guards = new ReadGuards(root);
    const result = yield* execute(request, guards);
    const reads = guards.finish();
    if (request.op.startsWith("read-") && reads.length === 0) throw new Error("read adapter response requires guards");
    const response = bridgeJson({ format: request.format, requestId: request.requestId, root, op: request.op, engineDigest: request.engine.implementationDigest, result, guards: reads });
    if (Buffer.byteLength(response) + 1 > BRIDGE_BYTES) throw new Error("adapter response exceeds 32 MiB");
    return response;
  }).pipe(Effect.provideService(ConcordEngine, request.engine), Effect.provide(runtime), Effect.scoped);
  // Publish only after native Scope finalizers have completed.
  yield* Effect.tryPromise({ try: () => new Promise<void>((resolve, reject) => process.stdout.write(response + "\n", error => error ? reject(error) : resolve())), catch: engineError });
}).pipe(Effect.catchCause(cause => Effect.sync(() => { process.stderr.write(Cause.pretty(cause) + "\n"); process.exitCode = 1; })));
NodeRuntime.runMain(program, { disableErrorReporting: true });
