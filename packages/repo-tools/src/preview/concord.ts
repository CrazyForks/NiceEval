import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Effect, Schema } from "effect";
import { parseConcordEngineJson, requestConcordEngine } from "../concord-engine.js";
import { ConcordComparisonSchema, NICEEVAL_REPOSITORY_URL, PreviewHttpError, PreviewInputError, PreviewIoError, PreviewVerificationError, type ConcordComparison, type PreviewPlatform } from "./model.js";
import { requirePreviewSuccess } from "./process.js";

export type { ConcordComparison } from "./model.js";
const PREVIEW_DATA_LIMIT = 8 * 1024 * 1024;

/** Validate the entire captured public document before projecting consumed fields. */
export const validateConcordChanges = Effect.fn("preview.validateConcordChanges")(function*(root: string, bytes: Uint8Array) {
  const value = yield* Effect.try({
    try: () => {
      if (bytes.byteLength > PREVIEW_DATA_LIMIT) throw new Error("Concord data exceeds 8 MiB");
      return parseConcordEngineJson(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    }, catch: error => new PreviewInputError({ message: `Invalid Concord data: ${String(error)}` }),
  });
  const validated = yield* requestConcordEngine(root, "preview", { value }).pipe(
    Effect.mapError(error => new PreviewVerificationError({ subject: "Concord changes", message: String(error) })),
  );
  // Concord owns the full ChangePreview schema. Only comparison is consumed here.
  const projected = yield* Schema.decodeUnknownEffect(Schema.Struct({ comparison: Schema.Unknown }), { onExcessProperty: "ignore" })(validated).pipe(
    Effect.mapError(() => new PreviewInputError({ message: "Engine preview result has no comparison" })),
  );
  return yield* Schema.decodeUnknownEffect(ConcordComparisonSchema, { onExcessProperty: "error" })(projected.comparison).pipe(
    Effect.mapError(() => new PreviewInputError({ message: "Engine preview result has an invalid comparison" })),
  );
});

const Oid = Schema.String.check(Schema.isPattern(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u));
const PullRequestProjection = Schema.Struct({
  number: Schema.Int,
  state: Schema.Literal("open"),
  base: Schema.Struct({ ref: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(256)), sha: Oid, repo: Schema.Struct({ full_name: Schema.Literal("NiceEval/NiceEval") }) }),
  head: Schema.Struct({ sha: Oid }),
});
export interface PullRequestComparison { readonly reviewId: string; readonly base: string; readonly head: string; readonly baseLabel: string; }

function gitEnvironment(): NodeJS.ProcessEnv {
  const environment = { ...process.env };
  for (const name of Object.keys(environment)) if (name.startsWith("GIT_")) delete environment[name];
  return { ...environment, GIT_NO_REPLACE_OBJECTS: "1", GIT_GRAFT_FILE: process.platform === "win32" ? "NUL" : "/dev/null", GIT_NO_LAZY_FETCH: "1", GIT_TERMINAL_PROMPT: "0", GIT_OPTIONAL_LOCKS: "0" };
}
const git = (root: string, args: readonly string[]) => requirePreviewSuccess("git", ["--no-optional-locks", ...args], root, gitEnvironment()).pipe(Effect.map(result => result.stdout.trim()));

/** Public GitHub response is projected to only the fields that authorize this build. */
export const readPullRequestComparison = Effect.fn("preview.readPullRequestComparison")(function*(platform: Extract<PreviewPlatform, { kind: "pull-request" }>) {
  const url = `https://api.github.com/repos/NiceEval/NiceEval/pulls/${platform.reviewId}`;
  const value = yield* Effect.tryPromise({
    try: async signal => {
      const response = await fetch(url, { redirect: "error", signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]), headers: {
        Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10", "User-Agent": "NiceEval-Preview",
      } });
      if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
      const reader = response.body?.getReader(); if (!reader) throw new Error("GitHub returned an empty body");
      const chunks: Uint8Array[] = []; let length = 0;
      try { for (;;) { const next = await reader.read(); if (next.done) break; length += next.value.byteLength; if (length > 1024 * 1024) throw new Error("GitHub PR response exceeds 1 MiB"); chunks.push(next.value); } }
      finally { await reader.cancel(); reader.releaseLock(); }
      return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))) as unknown;
    },
    catch: error => new PreviewHttpError({ url, message: error instanceof Error ? error.message : String(error) }),
  });
  const pr = yield* Schema.decodeUnknownEffect(PullRequestProjection, { onExcessProperty: "ignore" })(value).pipe(Effect.mapError(error => new PreviewInputError({ message: `Invalid GitHub PR identity: ${String(error)}` })));
  if (String(pr.number) !== platform.reviewId || pr.head.sha !== platform.commitRef) return yield* new PreviewVerificationError({ subject: "PR candidate", message: "PR head, COMMIT_REF and checkout HEAD must agree; merge checkouts are not accepted" });
  return { reviewId: platform.reviewId, base: pr.base.sha, head: pr.head.sha, baseLabel: pr.base.ref } satisfies PullRequestComparison;
});

export const preparePullRequestHistory = Effect.fn("preview.preparePullRequestHistory")(function*(root: string, comparison: PullRequestComparison) {
  const shallow = yield* git(root, ["rev-parse", "--is-shallow-repository"]);
  yield* git(root, ["fetch", "--no-tags", ...(shallow === "true" ? ["--unshallow"] : []), NICEEVAL_REPOSITORY_URL,
    `refs/heads/${comparison.baseLabel}`, `refs/pull/${comparison.reviewId}/head`]);
  for (const oid of [comparison.base, comparison.head]) yield* git(root, ["cat-file", "-e", `${oid}^{commit}`]);
});

export const exportConcordChanges = Effect.fn("preview.exportConcordChanges")(function*(options: { root: string; base: string; head: string; baseLabel?: string; out: string }) {
  options = { ...options, root: resolve(options.root), out: resolve(options.out) };
  const base = yield* git(options.root, ["rev-parse", "--verify", "--end-of-options", `${options.base}^{commit}`]);
  const head = yield* git(options.root, ["rev-parse", "--verify", "--end-of-options", `${options.head}^{commit}`]);
  const mergeBase = yield* git(options.root, ["merge-base", "--all", base, head]);
  yield* Schema.decodeUnknownEffect(Oid)(mergeBase).pipe(Effect.mapError(() => new PreviewVerificationError({ subject: "PR merge-base", message: "expected one unique best common ancestor" })));
  const comparison: ConcordComparison = { base, head, mergeBase, baseLabel: options.baseLabel ?? options.base };
  yield* requirePreviewSuccess("concord", ["--root", options.root, "--json", "view", "export", "--base", base, "--head", head, "--base-label", comparison.baseLabel, "--out", options.out], options.root, gitEnvironment());
  const file = join(options.out, "changes.json");
  const bytes = yield* Effect.tryPromise({
    try: async () => {
      if ((await stat(file)).size > PREVIEW_DATA_LIMIT) throw new Error("Concord data exceeds 8 MiB");
      return await readFile(file);
    }, catch: error => new PreviewIoError({ operation: "verify-concord-export", path: file, message: String(error) }),
  });
  const validated = yield* validateConcordChanges(options.root, bytes);
  yield* Effect.try({ try: () => assertConcordComparison(validated, comparison), catch: error => new PreviewVerificationError({ subject: "Concord comparison", message: String(error) }) });
  const current = yield* Effect.tryPromise({
    try: () => readFile(file),
    catch: error => new PreviewIoError({ operation: "recheck-concord-export", path: file, message: String(error) }),
  });
  if (!bytes.equals(current)) return yield* new PreviewVerificationError({ subject: "Concord changes", message: "Concord changes changed during engine validation" });
  return { operation: "preview-changes" as const, output: options.out, comparison };
});

export function assertConcordComparison(data: ConcordComparison, expected: ConcordComparison): void {
  for (const key of ["base", "head", "mergeBase", "baseLabel"] as const) {
    if (data[key] !== expected[key]) throw new Error(`Concord ${key} does not match the admitted PR comparison`);
  }
}
