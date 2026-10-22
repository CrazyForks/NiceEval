// Client-owned wire shapes only. Governance algorithms remain in Concord.
import { Schema } from "effect";

export const decodeWire = <S extends Schema.ConstraintDecoder<unknown>>(schema: S, value: unknown): S["Type"] =>
  Schema.decodeUnknownSync(schema, { errors: "all", onExcessProperty: "error" })(value);
const strings = Schema.Array(Schema.String);
const Digest = Schema.TemplateLiteral(["sha256:", Schema.String]).check(Schema.isPattern(/^sha256:[a-f0-9]{64}$/u));
const nullableText = Schema.NullOr(Schema.String);
export const ProjectionSchema = Schema.Struct({ algorithm: Schema.Literal("concord.repository-source-projection/v3"), digest: Schema.String, files: Schema.Array(Schema.Struct({ path: Schema.String, bytes: Schema.Int, rawSha256: Schema.String, codeSha256: Schema.String })) });
export const SourceSchema = Schema.Struct({ format: Schema.Literal("concord.repository-source-identity/v4"), projection: ProjectionSchema, caseId: Schema.String, nativeTestFile: Schema.String, declarationFile: Schema.String, binding: Schema.Struct({ kind: Schema.Literal("direct-contract"), suiteId: Schema.String, contractRef: Schema.String, contractSha256: Schema.String, policy: Schema.Literal("concord.native-reliability/v1"), configurationDigest: Schema.String, adapterSourceDigest: nullableText }) });
export type RepositorySourceIdentityV4 = typeof SourceSchema.Type;
export type SourceProjectionV3 = typeof ProjectionSchema.Type;
export const ReceiptSchema = Schema.Struct({
  format: Schema.Literal("concord.native-case-receipt/v1"), mode: Schema.Literal("formal"), observation: Schema.Literals(["red", "green", "reliability"]), selector: Schema.String, caseId: Schema.String, inventoryDigest: Schema.String,
  problem: Schema.Struct({ path: Schema.String, epoch: Schema.Int }), candidate: Schema.Struct({ gitSha: Schema.String, sha256: Schema.String, sri: Schema.String }), source: SourceSchema,
  runner: Schema.Struct({ executor: Schema.String, version: Schema.String, implementationDigest: Schema.String, argv: strings }),
  result: Schema.Struct({ disposition: Schema.Literals(["regression", "pass"]), stage: Schema.String, exitCode: Schema.NullOr(Schema.Int), signal: nullableText, timedOut: Schema.Boolean, startupFailed: Schema.Boolean }),
  native: Schema.Struct({ copyId: Schema.String, copyPath: Schema.String, sequence: Schema.Int, mode: Schema.Literals(["single", "isolated", "same", "parallel"]), caseCount: Schema.Int, passed: Schema.Int, failed: Schema.Int, skipped: Schema.Int, retries: Schema.Int, parallelism: Schema.Int }),
  cleanup: Schema.Struct({ ok: Schema.Boolean, resources: Schema.Array(Schema.Record(Schema.String, Schema.Json)) }), invocationId: Schema.String, receiptSha256: Schema.String,
});
export type NativeCaseReceipt = typeof ReceiptSchema.Type;
export const CertificateSchema = Schema.Struct({ format: Schema.Literal("concord.native-reliability/v1"), selector: Schema.String, caseId: Schema.String, candidateSha256: Schema.String, sourceDigest: Schema.String, greenReceipt: Schema.String, observations: Schema.Struct({ isolatedCopies: Schema.Tuple([Schema.String, Schema.String, Schema.String]), sameCopy: Schema.Tuple([Schema.String, Schema.String]), defaultParallel: Schema.String, singleCase: Schema.String, cleanup: strings }), certificateSha256: Schema.String });
export type NativeReliabilityCertificate = typeof CertificateSchema.Type;
const executor = Schema.Literals(["vitest", "playwright"]);
const CaseSchema = Schema.Struct({ executor, repo: Schema.String, path: Schema.String, project: Schema.optionalKey(Schema.String), titlePath: strings, caseId: Schema.String });
const RawCaseSchema = Schema.Struct({ file: Schema.String, project: Schema.optionalKey(Schema.String), titlePath: strings });
export const InventorySchema = Schema.Struct({ executor: Schema.Struct({ name: executor, version: Schema.String }), repo: Schema.String, argv: strings, checkout: Schema.String, files: strings, cases: Schema.Array(CaseSchema), unassignedCases: Schema.Array(RawCaseSchema), bodyExecutions: Schema.Literal(0), forbiddenSetupExecutions: Schema.Literal(0), findings: strings, digest: Digest, exit: Schema.NullOr(Schema.Int), signal: nullableText });
export const WorkspaceInventorySchema = Schema.Struct({ checkout: Schema.String, repos: Schema.Array(Schema.Struct({ id: Schema.String, receipts: Schema.Array(InventorySchema) })), files: strings, cases: Schema.Array(CaseSchema), unassignedCases: Schema.Array(Schema.Struct({ executor, repo: Schema.String, path: Schema.String, project: Schema.optionalKey(Schema.String), titlePath: strings })), findings: strings, digest: Digest });
const IssueSchema = Schema.Struct({ repository: Schema.String, number: Schema.Int, url: Schema.String, nodeId: Schema.String, titleDigest: Schema.String, checkedAt: Schema.String, provenance: Schema.Literal("direct") });
export const DeclarationsSchema = Schema.Struct({ annotated: Schema.Array(Schema.Struct({ caseId: Schema.String, declarationPath: Schema.String, testFile: Schema.String, contract: Schema.String, contractKind: Schema.Literals(["feature", "use-case"]), regressions: strings, issues: Schema.Array(IssueSchema), title: Schema.String, declarationStart: Schema.Int, annotationStart: Schema.Int, annotationEnd: Schema.Int, annotationRanges: Schema.Array(Schema.Struct({ start: Schema.Int, end: Schema.Int })) })), supported: Schema.Array(Schema.Struct({ title: Schema.String, start: Schema.Int })) });
export const IdentitySchema = Schema.Struct({ implementationDigest: Schema.String, adapterDigest: nullableText });
export const SuiteSchema = Schema.Struct({ id: Schema.String, root: Schema.String });
export const EngineDescriptorSchema = Schema.Struct({ argv: Schema.NonEmptyArray(Schema.String), implementationDigest: Schema.String });
export type EngineDescriptor = typeof EngineDescriptorSchema.Type;
export const EngineEnvelopeSchema = Schema.Struct({ format: Schema.Literal("concord.repository-engine/v1"), requestId: Schema.String, op: Schema.String, implementationDigest: Schema.String, result: Schema.Json });
