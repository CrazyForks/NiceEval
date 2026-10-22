import { randomUUID } from "node:crypto";
import { Context, Data, Effect, Schema } from "effect";
import { repoRootDir } from "./discovery.ts";
import { runOwnedProcess, hasSuccessfulOwnedProcessResult } from "./owned-process.ts";
import { bridgeJson, parseBridgeJson, BRIDGE_BYTES } from "./bridge-json.ts";
import { decodeWire, EngineEnvelopeSchema, IdentitySchema, SuiteSchema, SourceSchema, ProjectionSchema, DeclarationsSchema, type EngineDescriptor } from "./bridge-wire.ts";

export class RepositoryEngineError extends Data.TaggedError("RepositoryEngineError")<{ readonly detail: string }> {}
export const bridgeBoundary = <A, E, R>(program: Effect.Effect<A, E, R>) => program.pipe(Effect.catchDefect(cause => Effect.fail(engineError(cause))));
export const engineError = (cause: unknown) => new RepositoryEngineError({ detail: cause instanceof Error ? cause.message : String(cause) });
export const ConcordEngine = Context.Reference<EngineDescriptor | null>("niceeval/e2e/ConcordEngine", { defaultValue: () => null });
const request = Effect.fn("concord.engine.request")(function*(descriptor: EngineDescriptor | null, root: string, op: string, payload: unknown) {
  const requestId = randomUUID();
  const stdin = yield* Effect.try({ try: () => bridgeJson({ format: "concord.repository-engine/v1", requestId, op, payload }), catch: engineError });
  const result = yield* runOwnedProcess(descriptor?.argv ?? ["concord", "repo", "engine", "--json"], { cwd: root, env: process.env, output: "capture", stream: false, stdin, strictUtf8: true, stdoutBytes: BRIDGE_BYTES, stderrBytes: 1024 * 1024, timeoutMs: 30 * 60_000 }).pipe(Effect.mapError(engineError));
  if (!hasSuccessfulOwnedProcessResult(result)) return yield* new RepositoryEngineError({ detail: `Concord engine ${op} failed: ${result.error ?? result.signal ?? result.exitCode}: ${result.stderr}` });
  const response = yield* Effect.try({ try: () => decodeWire(EngineEnvelopeSchema, parseBridgeJson(result.stdout)), catch: engineError });
  if (response.requestId !== requestId || response.op !== op || !/^sha256:[a-f0-9]{64}$/u.test(response.implementationDigest) || (descriptor !== null && response.implementationDigest !== descriptor.implementationDigest)) return yield* new RepositoryEngineError({ detail: "Concord engine response identity mismatch" });
  return response;
});
export const engineCall = Effect.fn("concord.engine.call")(function*<S extends Schema.ConstraintDecoder<unknown>>(op: string, payload: unknown, schema: S, root = repoRootDir()) {
  const configured = yield* ConcordEngine;
  const identity = configured === null ? yield* request(null, root, "identity", {}) : null;
  const descriptor = configured ?? { argv: ["concord", "repo", "engine", "--json"] as const, implementationDigest: identity!.implementationDigest };
  if (identity !== null) {
    const decoded = yield* Effect.try({ try: () => decodeWire(IdentitySchema, identity.result), catch: engineError });
    if (decoded.implementationDigest !== identity.implementationDigest) return yield* new RepositoryEngineError({ detail: "Concord engine identity result mismatch" });
  }
  const response = op === "identity" && identity !== null ? identity : yield* request(descriptor, root, op, payload);
  if (op === "identity") {
    const identityResponse = response;
    const decoded = yield* Effect.try({ try: () => decodeWire(IdentitySchema, identityResponse.result), catch: engineError });
    if (decoded.implementationDigest !== identityResponse.implementationDigest) return yield* new RepositoryEngineError({ detail: "Concord engine identity result mismatch" });
  }
  return yield* Effect.try({ try: () => decodeWire(schema, response.result), catch: engineError });
});
export const managedImplementationDigest = Effect.fn("managedImplementationDigest")(function*(root: string) {
  const identity = yield* engineCall("identity", {}, IdentitySchema, root);
  if (identity.adapterDigest === null || !/^sha256:[a-f0-9]{64}$/u.test(identity.adapterDigest)) return yield* new RepositoryEngineError({ detail: "Concord engine identity requires a configured adapter digest" });
  return identity.adapterDigest;
});
export const governanceSuiteForFile = (root: string, file: string) => engineCall("suite", { file }, SuiteSchema, root);
export const resolveRepositorySourceIdentity = (root: string, selector: string) => engineCall("source", { selector }, SourceSchema, root);
export const decodeRepositorySourceIdentityV4 = (value: unknown) => engineCall("source-validate", { value }, SourceSchema);
export const sameRepositorySourceIdentity = (left: unknown, right: unknown) => engineCall("same-source", { left, right }, Schema.Struct({ same: Schema.Boolean })).pipe(Effect.map((result) => result.same));
export const projectExecutionSources = (directory: string, suiteRoot: string) => engineCall("projection", { directory, suiteRoot }, ProjectionSchema);
export const readDeclarations = (file: string, source: string) => engineCall("declarations", { file, source }, DeclarationsSchema);
export const deriveTestReference = (nativePath: string, declarationPath: string, title: string) => engineCall("case-id", { nativePath, declarationPath, title }, Schema.String);
