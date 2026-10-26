import { createHash, randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { SandboxApiException, SandboxManager, type ConnectionConfigOptions, type SnapshotInfo } from "@alibaba-group/opensandbox";
import { Effect, Schema } from "effect";
import { userDatabaseHost } from "../../user-database/index.ts";
import type { JsonValue } from "../../shared/types.ts";
import { stableJson } from "../identity.ts";
import type { OpenSandboxOptions } from "../opensandbox.ts";
import {
  SandboxSetupPrefixCacheCaptureError, SandboxSetupPrefixCacheLookupError, SandboxSetupPrefixCacheRestoreError,
  type SandboxSetupPrefixCacheCapability, type SandboxSetupPrefixCacheOperation, type SandboxSetupPrefixCacheEligibility,
  type SandboxSetupPrefixCacheCaptureResult, type SandboxSetupPrefixCacheLookupResult, type SandboxSetupPrefixCacheError,
} from "../backend.ts";
import { OPEN_SANDBOX_CACHE_REPOSITORY, type OpenSandboxCacheRequest, type OpenSandboxCacheArtifact } from "./repository.ts";

const Format = "niceeval.opensandbox-rootfs/v1";
const Storage = "niceeval.opensandbox-cache/v1";
const ManifestPath = "/.niceeval-opensandbox-cache.json";
const LeaseMs = 15 * 60_000;
const Manifest = Schema.Struct({
  domainId: Schema.String, format: Schema.Literal(Format), baseImageId: Schema.String,
  setupPrefixKey: Schema.String, setupManifestDigest: Schema.String,
  requiredState: Schema.Literals(["all", "dockerData"]), storageSchemaRevision: Schema.Literal(Storage),
  artifactFormatRevision: Schema.Literal(Format), changeFrequency: Schema.Number, declarationMetadata: Schema.Json,
});
const decodeManifest = Schema.decodeUnknownSync(Manifest, { onExcessProperty: "error" });
const decodeJson = Schema.decodeUnknownSync(Schema.Json);
function canonical(value: unknown): string { return stableJson(decodeJson(value) as JsonValue); }

interface Target {
  readonly options: OpenSandboxOptions;
  readonly domainId: string;
  readonly connectionConfig: ConnectionConfigOptions;
  readonly sandboxId: () => string;
  readonly deadlineAt: () => number | undefined;
  readonly readManifest: (path: string) => Promise<string>;
  readonly writeManifest: (path: string, content: string) => Promise<void>;
  readonly mountsSafe: () => Promise<boolean>;
  readonly rebase: (snapshotId: string | undefined, signal: AbortSignal) => Promise<void>;
  readonly retire: () => Promise<void>;
  readonly cancel: () => Promise<void>;
  readonly adoptRoot: (release: () => Promise<void>) => void;
}
function database(request: OpenSandboxCacheRequest) {
  return Effect.runPromise(Effect.scoped(userDatabaseHost.open().pipe(Effect.flatMap((db) => db.dispatch(request)))));
}
function eligibility(target: Target): SandboxSetupPrefixCacheEligibility {
  if (!/@sha256:[a-f0-9]{64}$/.test(target.options.image)) return {
    _tag: "Unsupported", code: "base-image-unverified", reason: "OpenSandbox before cache requires a digest-pinned image",
  };
  return {
    _tag: "Eligible", persistence: "persistent", dependency: "parent-backed", coverage: "all", baseImageId: target.options.image,
    keyScope: { protocol: Format, storageSchemaRevision: Storage, artifactFormatRevision: Format,
      semanticIdentity: { domainId: target.domainId, image: target.options.image, targetPlatform: target.options.targetPlatform } },
  };
}
function manifest(target: Target, input: SandboxSetupPrefixCacheOperation): { text: string; replacementScope: string } {
  const value = decodeManifest({ domainId: target.domainId, format: Format, ...input.manifest });
  if (value.baseImageId !== target.options.image) throw new Error("OpenSandbox cache Base identity changed");
  const declaration = canonical(value.declarationMetadata);
  const digest = `sha256:${createHash("sha256").update(declaration).digest("hex")}`;
  if (value.setupPrefixKey !== `prefix:${digest.slice(7)}` || value.setupManifestDigest !== digest) throw new Error("OpenSandbox cache declaration digest mismatch");
  const metadata = Schema.decodeUnknownSync(Schema.Struct({ replacementScope: Schema.Json }))(value.declarationMetadata);
  return { text: canonical(value), replacementScope: canonical(metadata.replacementScope) };
}
function request(target: Target) { return { repository: OPEN_SANDBOX_CACHE_REPOSITORY, domainId: target.domainId } as const; }
async function release(target: Target, rootId: string): Promise<void> { await database({ ...request(target), operation: "release-root", rootId }); }
function check(target: Target, signal: AbortSignal): void {
  signal.throwIfAborted();
  if (Date.now() >= (target.deadlineAt() ?? Infinity)) throw new Error("OpenSandbox cache operation exceeded the Attempt deadline");
}
async function verify(target: Target, expected: string): Promise<void> {
  const actual = decodeManifest(JSON.parse(await target.readManifest(ManifestPath)));
  if (canonical(actual) !== expected) throw new Error("OpenSandbox snapshot manifest does not match the requested prefix");
}
async function byName(manager: SandboxManager, name: string): Promise<SnapshotInfo | undefined> {
  const result = await manager.listSnapshots({ name, pageSize: 100 });
  const matches = result.items.filter((snapshot) => snapshot.name === name);
  if (result.pagination?.hasNextPage || matches.length > 1) throw new Error("OpenSandbox snapshot name is ambiguous");
  return matches[0];
}
async function reconcile(target: Target, manager: SandboxManager, signal: AbortSignal): Promise<void> {
  const leaseToken = randomUUID();
  const claimed = await database({ ...request(target), operation: "claim-cleanup", leaseToken, now: Date.now(), leaseUntil: Date.now() + LeaseMs });
  for (const artifact of claimed.entries) {
    check(target, signal);
    // Only names recorded before our own create request are eligible. An absent
    // response can never authorize deleting another client's snapshot.
    let snapshot: SnapshotInfo | undefined;
    try {
      snapshot = artifact.snapshot_id === null ? await byName(manager, artifact.snapshot_name) : await manager.getSnapshot(artifact.snapshot_id);
    } catch (cause) {
      if (!(cause instanceof SandboxApiException && cause.statusCode === 404)) throw cause;
    }
    if (snapshot === undefined && artifact.snapshot_id === null) continue;
    if (snapshot !== undefined) {
      if (snapshot.name !== artifact.snapshot_name) throw new Error("OpenSandbox cleanup snapshot identity mismatch");
      if (snapshot.status.state === "Creating" || snapshot.status.state === "Deleting") continue;
      await manager.deleteSnapshot(snapshot.id);
    }
    await database({ ...request(target), operation: "settle-delete", artifactId: artifact.artifact_id, leaseToken, now: Date.now(), snapshotId: snapshot?.id ?? artifact.snapshot_id });
  }
}
async function restore(target: Target, input: SandboxSetupPrefixCacheOperation, signal: AbortSignal): Promise<SandboxSetupPrefixCacheLookupResult> {
  const expected = manifest(target, input);
  const manager = SandboxManager.create({ connectionConfig: target.connectionConfig });
  let artifact: OpenSandboxCacheArtifact | null = null;
  let rootId: string | undefined;
  try {
    check(target, signal);
    await reconcile(target, manager, signal);
    const id = randomUUID();
    const found = await database({ ...request(target), operation: "lookup", key: input.manifest.setupPrefixKey, manifest: expected.text, rootId: id, now: Date.now() });
    artifact = found.entry;
    if (!artifact) return { _tag: "Miss", setupPrefixKey: input.manifest.setupPrefixKey };
    rootId = id;
    if (artifact.snapshot_id === null) throw new Error("OpenSandbox ready artifact has no snapshot ID");
    const snapshot = await manager.getSnapshot(artifact.snapshot_id);
    if (snapshot.name !== artifact.snapshot_name || snapshot.status.state !== "Ready") throw new Error("OpenSandbox snapshot is not the registered Ready artifact");
    check(target, signal);
    await target.rebase(snapshot.id, signal);
    await verify(target, expected.text);
    check(target, signal);
    const settled = await database({ ...request(target), operation: "settle-root", rootId: id, sandboxId: target.sandboxId() });
    if (!settled.accepted) throw new Error("OpenSandbox restore root was lost");
    target.adoptRoot(() => release(target, id));
    rootId = undefined;
    return { _tag: "Restored", setupPrefixKey: artifact.setup_prefix_key, entryId: artifact.artifact_id,
      generation: artifact.generation, artifactId: snapshot.id, sandboxId: target.sandboxId() };
  } catch (cause) {
    // Never drop a root until its candidate instance is confirmed retired.
    await target.retire();
    if (rootId !== undefined) await release(target, rootId);
    if (artifact) await database({ ...request(target), operation: "invalidate", artifactId: artifact.artifact_id, now: Date.now() });
    throw cause;
  } finally { await manager.close(); }
}
async function capture(target: Target, input: SandboxSetupPrefixCacheOperation, signal: AbortSignal): Promise<SandboxSetupPrefixCacheCaptureResult> {
  const expected = manifest(target, input);
  check(target, signal);
  if (input.knownSensitiveValues?.some((value) => value.length > 0) || !(await target.mountsSafe())) {
    return { _tag: "ContinuedUncached", setupPrefixKey: input.manifest.setupPrefixKey, reason: "capture-failed", sandboxId: target.sandboxId() };
  }
  const manager = SandboxManager.create({ connectionConfig: target.connectionConfig });
  let captureRequested = false;
  let rootId: string | undefined;
  let published = false;
  try {
    await reconcile(target, manager, signal);
    const artifactId = randomUUID();
    const leaseToken = randomUUID();
    const snapshotName = `niceeval-${artifactId}`;
    const reserved = await database({ ...request(target), operation: "reserve", artifactId, leaseToken, snapshotName,
      key: input.manifest.setupPrefixKey, base: input.manifest.baseImageId, manifest: expected.text,
      replacementScope: expected.replacementScope, now: Date.now(), leaseUntil: Date.now() + LeaseMs });
    if (!reserved.accepted || !reserved.entry) return { _tag: "Contended", setupPrefixKey: input.manifest.setupPrefixKey,
      reason: reserved.disposition === "indexed-generation" ? "indexed-generation" : "active-writer" };
    await target.writeManifest(ManifestPath, expected.text);
    check(target, signal);
    captureRequested = true;
    let snapshot = await manager.createSnapshot(target.sandboxId(), { name: snapshotName });
    if (snapshot.name !== snapshotName || !snapshot.id) throw new Error("OpenSandbox snapshot creation identity mismatch");
    const expires = Math.min(Date.now() + 10 * 60_000, target.deadlineAt() ?? Infinity);
    while (snapshot.status.state === "Creating") {
      check(target, signal);
      if (Date.now() >= expires) throw new Error("OpenSandbox snapshot did not become Ready before its deadline");
      await delay(500, undefined, { signal });
      snapshot = await manager.getSnapshot(snapshot.id);
      if (snapshot.name !== snapshotName) throw new Error("OpenSandbox snapshot identity changed while polling");
    }
    if (snapshot.status.state !== "Ready") throw new Error(`OpenSandbox snapshot failed: ${snapshot.status.state}`);
    check(target, signal);
    await target.rebase(snapshot.id, signal);
    await verify(target, expected.text);
    check(target, signal);
    rootId = randomUUID();
    const publication = await database({ ...request(target), operation: "publish", artifactId, leaseToken,
      snapshotId: snapshot.id, rootId, sandboxId: target.sandboxId(), now: Date.now() });
    if (!publication.accepted) throw new Error("OpenSandbox snapshot publication lost its generation or lease fence");
    published = true;
    const adoptedRoot = rootId;
    target.adoptRoot(() => release(target, adoptedRoot));
    rootId = undefined;
    return { _tag: "Captured", setupPrefixKey: input.manifest.setupPrefixKey, entryId: artifactId,
      generation: reserved.entry.generation, artifactId: snapshot.id, sandboxId: target.sandboxId() };
  } catch (cause) {
    if (captureRequested) {
      await target.retire();
      if (published && rootId !== undefined) await release(target, rootId);
    }
    throw cause;
  } finally { await manager.close(); }
}
/** Cancellation waits for the SDK operation and retirement: no late clone or
 * publication may escape the owning Effect scope. SDK calls have bounded HTTP timeouts. */
function operation<T>(target: Target, run: (signal: AbortSignal) => Promise<T>, failure: (cause: unknown) => SandboxSetupPrefixCacheError): Effect.Effect<T, SandboxSetupPrefixCacheError> {
  return Effect.callback<T, SandboxSetupPrefixCacheError>((resume) => {
    const controller = new AbortController();
    let finished = false;
    const pending = run(controller.signal).then(
      (value) => { finished = true; resume(Effect.succeed(value)); },
      (cause: unknown) => { finished = true; resume(Effect.fail(failure(cause))); },
    );
    return Effect.promise(async () => {
      if (finished) return;
      controller.abort(new Error("OpenSandbox cache operation cancelled"));
      await pending;
      await target.cancel();
    });
  });
}
export function makeOpenSandboxCacheCapability(target: Target): SandboxSetupPrefixCacheCapability {
  const fields = (cause: unknown) => ({ operation: "OpenSandbox rootfs cache", reason: cause instanceof Error ? cause.message : String(cause), domainId: target.domainId, cause });
  return {
    eligibility: () => eligibility(target),
    lookupAndRebase: (input) => operation(target, (signal) => restore(target, input, signal), (cause) => new SandboxSetupPrefixCacheLookupError(fields(cause))),
    captureAndRebase: (input) => operation(target, (signal) => capture(target, input, signal), (cause) => new SandboxSetupPrefixCacheCaptureError(fields(cause))),
    recoverCleanBase: () => operation(target, async (signal) => {
      check(target, signal);
      await target.rebase(undefined, signal);
      return { _tag: "RecoveredCleanBase" as const, baseImageId: target.options.image, sandboxId: target.sandboxId() };
    }, (cause) => new SandboxSetupPrefixCacheRestoreError(fields(cause))),
  };
}
