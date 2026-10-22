import { randomUUID } from "node:crypto";
import { Data, Effect, Schema, Stream } from "effect";
import { ChildProcess } from "effect/unstable/process";

const FORMAT = "concord.repository-engine/v1";
const MAX_BYTES = 32 * 1024 * 1024;
const MAX_STDERR_BYTES = 1024 * 1024;
const TIMEOUT_MS = 30 * 60 * 1000;

export class ConcordEngineRequestInvalid extends Data.TaggedError("ConcordEngineRequestInvalid")<{ readonly op: string; readonly message: string }> {}
export class ConcordEngineResponseInvalid extends Data.TaggedError("ConcordEngineResponseInvalid")<{ readonly op: string; readonly message: string }> {}
export class ConcordEngineFailed extends Data.TaggedError("ConcordEngineFailed")<{ readonly op: string; readonly message: string }> {}
export class ConcordEngineTimeout extends Data.TaggedError("ConcordEngineTimeout")<{ readonly op: string; readonly message: string }> {}
export class ConcordEngineOutputLimit extends Data.TaggedError("ConcordEngineOutputLimit")<{ readonly op: string; readonly message: string }> {}

/** Transport syntax/budgets only. Governance validation belongs to the CLI. */
export function parseConcordEngineJson(text: string): unknown {
  if (Buffer.byteLength(text, "utf8") > MAX_BYTES) throw new Error("JSON exceeds 32 MiB");
  let position = 0;
  let nodes = 0;
  const whitespace = () => { while (/[\t\n\r ]/u.test(text[position] ?? "\0")) position++; };
  const invalid = (message: string): never => { throw new Error(`${message} at offset ${position}`); };
  const string = (): string => {
    const start = position++;
    for (; position < text.length; position++) {
      const char = text[position];
      if (char === "\\") { position++; continue; }
      if (char === '"') return JSON.parse(text.slice(start, ++position)) as string;
    }
    return invalid("Unterminated JSON string");
  };
  const value = (depth: number): unknown => {
    if (++nodes > 200000) return invalid("JSON exceeds 200000 nodes");
    whitespace();
    const char = text[position];
    if ((char === "{" || char === "[") && depth >= 64) return invalid("JSON exceeds depth 64");
    if (char === '"') return string();
    if (char === "{") {
      position++; whitespace();
      const object: Record<string, unknown> = Object.create(null);
      if (text[position] === "}") { position++; return object; }
      for (;;) {
        whitespace();
        if (text[position] !== '"') return invalid("Expected JSON object key");
        const key = string();
        if (Object.hasOwn(object, key)) return invalid("Duplicate JSON key");
        whitespace();
        if (text[position++] !== ":") return invalid("Expected JSON colon");
        object[key] = value(depth + 1);
        whitespace();
        const separator = text[position++];
        if (separator === "}") return object;
        if (separator !== ",") return invalid("Expected JSON object separator");
      }
    }
    if (char === "[") {
      position++; whitespace();
      const array: unknown[] = [];
      if (text[position] === "]") { position++; return array; }
      for (;;) {
        if (array.length >= 50000) return invalid("JSON array exceeds 50000 items");
        array.push(value(depth + 1));
        whitespace();
        const separator = text[position++];
        if (separator === "]") return array;
        if (separator !== ",") return invalid("Expected JSON array separator");
      }
    }
    for (const [token, decoded] of [["true", true], ["false", false], ["null", null]] as const) {
      if (text.startsWith(token, position)) { position += token.length; return decoded; }
    }
    const number = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/u.exec(text.slice(position));
    if (!number) return invalid("Expected JSON value");
    position += number[0].length;
    const decoded = Number(number[0]);
    if (!Number.isFinite(decoded)) return invalid("Non-finite JSON number");
    return decoded;
  };
  const decoded = value(0);
  whitespace();
  if (position !== text.length) return invalid("Trailing JSON output");
  return decoded;
}

const EnvelopeSchema = Schema.Struct({
  format: Schema.Literal(FORMAT),
  requestId: Schema.String,
  op: Schema.String,
  implementationDigest: Schema.String.check(Schema.isPattern(/^sha256:[0-9a-f]{64}$/u)),
  result: Schema.Unknown.check(Schema.makeFilter(value => value !== undefined)),
});

function collectOutput<E>(stream: Stream.Stream<Uint8Array, E>, op: string, channel: string, limit: number) {
  return Effect.gen(function*() {
    let size = 0;
    const chunks: Uint8Array[] = [];
    yield* Stream.runForEach(stream, chunk => {
      size += chunk.byteLength;
      if (size > limit) return Effect.fail(new ConcordEngineOutputLimit({ op, message: `${channel} exceeds ${limit} bytes` }));
      chunks.push(chunk);
      return Effect.void;
    });
    return Buffer.concat(chunks);
  });
}

export const requestConcordEngine = Effect.fn("requestConcordEngine")(function*(
  root: string,
  op: "declarations" | "case-id" | "preview",
  payload: unknown,
) {
  const requestId = randomUUID();
  const input = yield* Effect.try({
    try: () => {
      const text = JSON.stringify({ format: FORMAT, requestId, op, payload }, (_key, value: unknown) => {
        if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Non-finite request number");
        if (value === undefined) throw new Error("Undefined request field");
        return value;
      });
      parseConcordEngineJson(text);
      return Buffer.from(text, "utf8");
    },
    catch: error => new ConcordEngineRequestInvalid({ op, message: String(error) }),
  });
  const output = yield* Effect.scoped(Effect.gen(function*() {
    const environment = { ...process.env };
    for (const name of Object.keys(environment)) if (name.startsWith("GIT_") || name === "NODE_TEST_CONTEXT") delete environment[name];
    const child = yield* ChildProcess.make("concord", ["repo", "engine", "--json"], {
      cwd: root, shell: false, env: environment,
      killSignal: "SIGTERM", forceKillAfter: "2 seconds",
    });
    const [stdout, , exitCode] = yield* Effect.all([
      collectOutput(child.stdout, op, "stdout", MAX_BYTES),
      collectOutput(child.stderr, op, "stderr", MAX_STDERR_BYTES),
      child.exitCode,
      Stream.run(Stream.make(input), child.stdin),
    ], { concurrency: "unbounded" });
    // Stderr is bounded and drained, but never echoed: it may contain input data.
    if (Number(exitCode) !== 0) return yield* new ConcordEngineFailed({ op, message: `concord repo engine --json exited ${exitCode}` });
    return stdout;
  })).pipe(
    Effect.timeoutOrElse({ duration: TIMEOUT_MS, orElse: () => Effect.fail(new ConcordEngineTimeout({ op, message: `engine exceeded ${TIMEOUT_MS} ms` })) }),
    Effect.mapError(error => error instanceof ConcordEngineOutputLimit || error instanceof ConcordEngineFailed || error instanceof ConcordEngineTimeout
      ? error : new ConcordEngineFailed({ op, message: "Unable to run concord repo engine --json" })),
  );
  const value = yield* Effect.try({
    try: () => parseConcordEngineJson(new TextDecoder("utf-8", { fatal: true }).decode(output)),
    catch: error => new ConcordEngineResponseInvalid({ op, message: String(error) }),
  });
  const response = yield* Schema.decodeUnknownEffect(EnvelopeSchema, { onExcessProperty: "error" })(value).pipe(
    Effect.mapError(() => new ConcordEngineResponseInvalid({ op, message: "Invalid engine response envelope" })),
  );
  if (response.requestId !== requestId || response.op !== op || !Object.hasOwn(response, "result")) {
    return yield* new ConcordEngineResponseInvalid({ op, message: "Engine response does not match this request" });
  }
  return response.result;
});

const IssueSchema = Schema.Struct({
  repository: Schema.String, number: Schema.Number, url: Schema.String, nodeId: Schema.String,
  titleDigest: Schema.String, checkedAt: Schema.String, provenance: Schema.Literal("direct"),
});
const AnnotatedCaseSchema = Schema.Struct({
  caseId: Schema.String, declarationPath: Schema.String, testFile: Schema.String,
  contract: Schema.String, contractKind: Schema.Literals(["feature", "use-case"]),
  regressions: Schema.Array(Schema.String), issues: Schema.Array(IssueSchema), title: Schema.String,
  declarationStart: Schema.Natural, annotationStart: Schema.Natural, annotationEnd: Schema.Natural,
  annotationRanges: Schema.Array(Schema.Struct({ start: Schema.Natural, end: Schema.Natural })),
});
export type ConcordAnnotatedCase = typeof AnnotatedCaseSchema.Type;
export const ConcordDeclarationsSchema = Schema.Struct({
  annotated: Schema.Array(AnnotatedCaseSchema),
  supported: Schema.Array(Schema.Struct({ title: Schema.String, start: Schema.Natural })),
});
