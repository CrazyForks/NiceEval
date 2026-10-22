import { bridgeBoundary, managedImplementationDigest } from "./concord-engine.ts";
import { ReadGuards } from "./bridge-guards.ts";
import { parseBridgeJson } from "./bridge-json.ts";
import { decodeWire } from "./bridge-wire.ts";
import { createHash, randomBytes } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { Effect, Schema } from "effect";

import {
  validateFormalCaseReceipt,
  validateTakeoverCertificate,
  type FormalCaseReceipt,
  type FormalCaseReceiptV2,
  type TakeoverCertificate,
  type TakeoverCertificateV2,
} from "./case-evidence.ts";

const EVIDENCE_ROOT = ".repo-tools/test-evidence";
const RED_ID = /^nered_[0-9A-HJKMNP-TV-Z]{16}$/;
const TAKEOVER_ID = /^netake_[0-9A-HJKMNP-TV-Z]{16}$/;
const crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

interface ArtifactEntry { readonly key: string; readonly file: string; readonly sha256: string }
interface ManagedEvidenceManifest {
  readonly id: string;
  readonly kind: "red" | "takeover";
  readonly implementationDigest: string;
  readonly selector: string;
  readonly inventoryDigest: string;
  readonly candidateSha256: string;
  readonly candidateFile: string;
  readonly receiptArtifacts: readonly ArtifactEntry[];
  readonly certificateArtifact?: ArtifactEntry;
}

export interface ManagedRedEvidence {
  readonly id: string;
  readonly receipt: FormalCaseReceipt;
  readonly candidatePath: string;
}

export interface ManagedTakeoverEvidence {
  readonly id: string;
  readonly certificate: TakeoverCertificate;
  readonly receipts: ReadonlyMap<string, FormalCaseReceipt>;
  readonly candidatePath: string;
}

const sha256 = (bytes: string | Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const implementationDigest = managedImplementationDigest;
const evidenceRoot = (root: string): string => resolve(root, EVIDENCE_ROOT);
const evidencePath = (root: string, id: string): string => resolve(evidenceRoot(root), id);

function newId(prefix: "nered" | "netake"): string {
  const bytes = randomBytes(10);
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  let token = "";
  for (let index = 0; index < 16; index += 1) { token = crockford[Number(value & 31n)]! + token; value >>= 5n; }
  return `${prefix}_${token}`;
}

function jsonBytes(value: unknown): string { return `${JSON.stringify(value, null, 2)}\n`; }

function publishBundle(root: string, manifest: ManagedEvidenceManifest, files: ReadonlyMap<string, string | Uint8Array>, candidatePath: string): void {
  const parent = evidenceRoot(root);
  mkdirSync(parent, { recursive: true, mode: 0o700 });
  const stage = join(parent, `.stage-${manifest.id}-${randomBytes(6).toString("hex")}`);
  const target = evidencePath(root, manifest.id);
  mkdirSync(stage, { mode: 0o700 });
  try {
    for (const [path, bytes] of files) {
      const destination = join(stage, path);
      mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
      writeFileSync(destination, bytes, { mode: 0o600, flag: "wx" });
    }
    copyFileSync(candidatePath, join(stage, manifest.candidateFile));
    writeFileSync(join(stage, "manifest.json"), jsonBytes(manifest), { mode: 0o600, flag: "wx" });
    renameSync(stage, target);
  } catch (cause) {
    rmSync(stage, { recursive: true, force: true });
    throw cause;
  }
}

function artifact(key: string, file: string, value: unknown): { readonly entry: ArtifactEntry; readonly bytes: string } {
  const bytes = jsonBytes(value);
  return { entry: { key, file, sha256: sha256(bytes) }, bytes };
}

export const saveManagedRedEvidence = Effect.fn("saveManagedRedEvidence")(function* (root: string, receipt: FormalCaseReceiptV2, candidatePath: string) {
  yield* validateFormalCaseReceipt(receipt);
  if (receipt.observation !== "red" || receipt.result.disposition !== "regression") throw new Error("managed red evidence requires a formal regression receipt");
  const candidateBytes = readFileSync(candidatePath);
  if (sha256(candidateBytes) !== receipt.candidate.sha256) throw new Error("red evidence candidate bytes do not match the formal receipt");
  const id = newId("nered");
  const stored = artifact("red", "red.json", receipt);
  const manifest: ManagedEvidenceManifest = {
    id, kind: "red", implementationDigest: yield* implementationDigest(root), selector: receipt.selector,
    inventoryDigest: receipt.inventoryDigest, candidateSha256: receipt.candidate.sha256,
    candidateFile: "candidate.tgz", receiptArtifacts: [stored.entry],
  };
  publishBundle(root, manifest, new Map([[stored.entry.file, stored.bytes]]), candidatePath);
  return id;
}, bridgeBoundary);

export const saveManagedTakeoverEvidence = Effect.fn("saveManagedTakeoverEvidence")(function* (root: string, certificate: TakeoverCertificateV2, receipts: ReadonlyMap<string, FormalCaseReceiptV2>, candidatePath: string) {
  yield* validateTakeoverCertificate(certificate, receipts);
  const candidateBytes = readFileSync(candidatePath);
  if (sha256(candidateBytes) !== certificate.candidateSha256) throw new Error("takeover candidate bytes do not match the certificate");
  const id = newId("netake");
  const files = new Map<string, string>();
  const entries = [...receipts].map(([key, receipt], index) => {
    const stored = artifact(key, `receipts/${String(index + 1).padStart(2, "0")}.json`, receipt);
    files.set(stored.entry.file, stored.bytes);
    return stored.entry;
  });
  const storedCertificate = artifact("certificate", "certificate.json", certificate);
  files.set(storedCertificate.entry.file, storedCertificate.bytes);
  const firstReceipt = receipts.values().next().value as FormalCaseReceiptV2 | undefined;
  if (firstReceipt === undefined) throw new Error("takeover evidence has no formal receipts");
  const manifest: ManagedEvidenceManifest = {
    id, kind: "takeover", implementationDigest: yield* implementationDigest(root), selector: certificate.selector,
    inventoryDigest: firstReceipt.inventoryDigest, candidateSha256: certificate.candidateSha256,
    candidateFile: "candidate.tgz", receiptArtifacts: entries, certificateArtifact: storedCertificate.entry,
  };
  publishBundle(root, manifest, files, candidatePath);
  return id;
}, bridgeBoundary);

const ArtifactSchema = Schema.Struct({ key: Schema.String, file: Schema.String, sha256: Schema.String });
const ManifestSchema = Schema.Struct({ id: Schema.String, kind: Schema.Literals(["red", "takeover"]), implementationDigest: Schema.String, selector: Schema.String, inventoryDigest: Schema.String, candidateSha256: Schema.String, candidateFile: Schema.String, receiptArtifacts: Schema.Array(ArtifactSchema), certificateArtifact: Schema.optionalKey(ArtifactSchema) });
const readManifest = Effect.fn("readManagedManifest")(function* (root: string, id: string, kind: "red" | "takeover", guards: ReadGuards) {
  if (!(kind === "red" ? RED_ID : TAKEOVER_ID).test(id)) throw new Error(`${id} is not a managed ${kind} evidence ID`);
  const directory = evidencePath(root, id);
  const path = join(directory, "manifest.json");
  if (!existsSync(path)) throw new Error(`${id} is unavailable; generate fresh formal evidence`);
  const manifest = decodeWire(ManifestSchema, parseBridgeJson(guards.read(path)));
  if (manifest.id !== id || manifest.kind !== kind || manifest.implementationDigest !== (yield* implementationDigest(root))) throw new Error(`${id} is stale or invalid; generate fresh formal evidence`);
  if (new Set(manifest.receiptArtifacts.map(entry => entry.key)).size !== manifest.receiptArtifacts.length || new Set(manifest.receiptArtifacts.map(entry => entry.file)).size !== manifest.receiptArtifacts.length) throw new Error("managed evidence contains duplicate artifact keys or files");
  return { directory, manifest };
}, bridgeBoundary);

function readArtifact(directory: string, entry: ArtifactEntry, guards: ReadGuards): unknown {
  const path = resolve(directory, entry.file);
  if (!path.startsWith(`${directory}/`)) throw new Error("managed evidence artifact escapes its bundle");
  const bytes = guards.read(path);
  if (sha256(bytes) !== entry.sha256) throw new Error(`managed evidence artifact failed integrity: ${entry.file}`);
  return parseBridgeJson(bytes);
}

function candidatePath(directory: string, manifest: ManagedEvidenceManifest, guards: ReadGuards): string {
  const path = resolve(directory, manifest.candidateFile);
  if (!path.startsWith(`${directory}/`) || sha256(guards.read(path)) !== manifest.candidateSha256) throw new Error("managed evidence candidate failed integrity");
  return path;
}

export const readManagedRedEvidence = Effect.fn("readManagedRedEvidence")(function* (root: string, id: string, guards = new ReadGuards(root)) {
  const { directory, manifest } = yield* readManifest(root, id, "red", guards);
  if (manifest.receiptArtifacts.length !== 1) throw new Error("managed red evidence must contain one receipt");
  const receipt = yield* validateFormalCaseReceipt(readArtifact(directory, manifest.receiptArtifacts[0]!, guards));
  if (receipt.selector !== manifest.selector || receipt.inventoryDigest !== manifest.inventoryDigest || receipt.candidate.sha256 !== manifest.candidateSha256 || receipt.observation !== "red" || receipt.result.disposition !== "regression") throw new Error("managed red evidence manifest does not bind its receipt");
  const candidate = candidatePath(directory, manifest, guards);
  guards.finish();
  return { id, receipt, candidatePath: candidate };
}, bridgeBoundary);

export const readManagedTakeoverEvidence = Effect.fn("readManagedTakeoverEvidence")(function* (root: string, id: string, guards = new ReadGuards(root)) {
  const { directory, manifest } = yield* readManifest(root, id, "takeover", guards);
  if (manifest.certificateArtifact === undefined) throw new Error("managed takeover evidence has no certificate");
  const receipts = new Map(yield* Effect.forEach(manifest.receiptArtifacts, entry => validateFormalCaseReceipt(readArtifact(directory, entry, guards)).pipe(Effect.map(receipt => [entry.key, receipt] as const))));
  const certificate = yield* validateTakeoverCertificate(readArtifact(directory, manifest.certificateArtifact, guards), receipts);
  if (certificate.selector !== manifest.selector || certificate.candidateSha256 !== manifest.candidateSha256 || [...receipts.values()].some((receipt) => receipt.inventoryDigest !== manifest.inventoryDigest)) throw new Error("managed takeover evidence manifest does not bind its receipts");
  const candidate = candidatePath(directory, manifest, guards);
  guards.finish();
  return { id, certificate, receipts, candidatePath: candidate };
}, bridgeBoundary);
