import type { DatabaseSync } from "node:sqlite";
import { Schema } from "effect";

export const OPEN_SANDBOX_CACHE_REPOSITORY = "opensandbox-cache" as const;
const Artifact = Schema.Struct({
  artifact_id: Schema.String, domain_id: Schema.String, setup_prefix_key: Schema.String,
  base_identity: Schema.String, manifest_json: Schema.String, replacement_scope: Schema.String,
  generation: Schema.Int, snapshot_name: Schema.String, snapshot_id: Schema.NullOr(Schema.String),
  state: Schema.Literals(["building", "ready", "deleting", "deleted"]),
  lease_token: Schema.NullOr(Schema.String), lease_until: Schema.NullOr(Schema.Int),
  created_at: Schema.Int, published_at: Schema.NullOr(Schema.Int),
});
export type OpenSandboxCacheArtifact = typeof Artifact.Type;
const common = { repository: Schema.Literal(OPEN_SANDBOX_CACHE_REPOSITORY), domainId: Schema.String };
const fence = { artifactId: Schema.String, leaseToken: Schema.String, now: Schema.Int };
const Request = Schema.Union([
  Schema.Struct({ ...common, operation: Schema.Literal("lookup"), key: Schema.String, manifest: Schema.String, rootId: Schema.String, now: Schema.Int }),
  Schema.Struct({ ...common, operation: Schema.Literal("reserve"), ...fence, key: Schema.String, base: Schema.String, manifest: Schema.String, replacementScope: Schema.String, snapshotName: Schema.String, leaseUntil: Schema.Int }),
  Schema.Struct({ ...common, operation: Schema.Literal("publish"), ...fence, snapshotId: Schema.String, rootId: Schema.String, sandboxId: Schema.String }),
  Schema.Struct({ ...common, operation: Schema.Literal("settle-root"), rootId: Schema.String, sandboxId: Schema.String }),
  Schema.Struct({ ...common, operation: Schema.Literal("release-root"), rootId: Schema.String }),
  Schema.Struct({ ...common, operation: Schema.Literal("invalidate"), artifactId: Schema.String, now: Schema.Int }),
  Schema.Struct({ ...common, operation: Schema.Literal("claim-cleanup"), leaseToken: Schema.String, now: Schema.Int, leaseUntil: Schema.Int }),
  Schema.Struct({ ...common, operation: Schema.Literal("settle-delete"), ...fence, snapshotId: Schema.NullOr(Schema.String) }),
]);
export type OpenSandboxCacheRequest = typeof Request.Type;
const Result = Schema.Struct({
  repository: Schema.Literal(OPEN_SANDBOX_CACHE_REPOSITORY), operation: Schema.String,
  accepted: Schema.Boolean, entry: Schema.NullOr(Artifact), entries: Schema.Array(Artifact),
  disposition: Schema.Literals(["reserved", "active-writer", "indexed-generation", "none"]),
});
export type OpenSandboxCacheResult = typeof Result.Type;
export const isOpenSandboxCacheRequest = Schema.is(Request);
export const isOpenSandboxCacheResult = Schema.is(Result);
const decodeArtifact = Schema.decodeUnknownSync(Artifact, { onExcessProperty: "error" });
const A = "opensandbox_cache_artifacts";
const R = "opensandbox_cache_roots";
const definitions = [
  ["table", A, A, `CREATE TABLE ${A} (
    artifact_id TEXT PRIMARY KEY, domain_id TEXT NOT NULL, setup_prefix_key TEXT NOT NULL,
    base_identity TEXT NOT NULL, manifest_json TEXT NOT NULL, replacement_scope TEXT NOT NULL,
    generation INTEGER UNIQUE NOT NULL CHECK (generation > 0), snapshot_name TEXT UNIQUE NOT NULL,
    snapshot_id TEXT, state TEXT NOT NULL CHECK (state IN ('building','ready','deleting','deleted')),
    lease_token TEXT, lease_until INTEGER, created_at INTEGER NOT NULL, published_at INTEGER,
    UNIQUE(domain_id, snapshot_id),
    CHECK ((state IN ('building','deleting') AND lease_token IS NOT NULL AND lease_until IS NOT NULL)
      OR (state IN ('ready','deleted') AND lease_token IS NULL AND lease_until IS NULL))
  ) STRICT`],
  ["table", R, R, `CREATE TABLE ${R} (root_id TEXT PRIMARY KEY, artifact_id TEXT NOT NULL REFERENCES ${A}(artifact_id), sandbox_id TEXT, created_at INTEGER NOT NULL) STRICT`],
  ["index", "opensandbox_cache_ready", A, `CREATE UNIQUE INDEX opensandbox_cache_ready ON ${A}(domain_id, setup_prefix_key) WHERE state = 'ready'`],
  ["index", "opensandbox_cache_key", A, `CREATE INDEX opensandbox_cache_key ON ${A}(domain_id, setup_prefix_key, state)`],
  ["index", "opensandbox_cache_scope", A, `CREATE INDEX opensandbox_cache_scope ON ${A}(domain_id, replacement_scope, state)`],
  ["index", "opensandbox_cache_cleanup", A, `CREATE INDEX opensandbox_cache_cleanup ON ${A}(domain_id, state, lease_until)`],
  ["index", "opensandbox_cache_roots_artifact", R, `CREATE INDEX opensandbox_cache_roots_artifact ON ${R}(artifact_id)`],
] as const;
export const OPEN_SANDBOX_CACHE_SCHEMA_SQL = definitions.map(([, , , sql]) => sql).join(";\n");
export const OPEN_SANDBOX_CACHE_SCHEMA_OBJECTS = [
  ...definitions.map(([type, name, table]) => [type, name, table]),
  ...[1, 2, 3, 4].map((n) => ["index", `sqlite_autoindex_${A}_${n}`, A]),
  ["index", `sqlite_autoindex_${R}_1`, R],
];
function installCurrentSchema(database: DatabaseSync): void { database.exec(OPEN_SANDBOX_CACHE_SCHEMA_SQL); }
function assertCurrentSchema(database: DatabaseSync): void {
  const normalize = (sql: string) => sql.trim().replace(/\s+/g, " ");
  for (const [type, name, table, sql] of definitions) {
    const row = database.prepare("SELECT sql FROM sqlite_schema WHERE type = ? AND name = ? AND tbl_name = ?").get(type, name, table);
    if (typeof row?.sql !== "string" || normalize(row.sql) !== normalize(sql)) throw new Error(`Invalid OpenSandbox cache schema: ${name}`);
  }
}
function dispatch(database: DatabaseSync, request: OpenSandboxCacheRequest): OpenSandboxCacheResult {
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = transact(database, request);
    database.exec("COMMIT");
    return result;
  } catch (cause) { database.exec("ROLLBACK"); throw cause; }
}
function transact(db: DatabaseSync, q: OpenSandboxCacheRequest): OpenSandboxCacheResult {
  const result = (overrides: Partial<OpenSandboxCacheResult> = {}): OpenSandboxCacheResult => ({
    repository: OPEN_SANDBOX_CACHE_REPOSITORY, operation: q.operation, accepted: false,
    entry: null, entries: [], disposition: "none", ...overrides,
  });
  const entry = (id: string) => {
    const row = db.prepare(`SELECT * FROM ${A} WHERE artifact_id = ? AND domain_id = ?`).get(id, q.domainId);
    return row === undefined ? null : decodeArtifact(row);
  };
  switch (q.operation) {
    case "lookup": {
      const row = db.prepare(`SELECT * FROM ${A} WHERE domain_id = ? AND setup_prefix_key = ? AND manifest_json = ? AND state = 'ready'`).get(q.domainId, q.key, q.manifest);
      if (!row) return result();
      const found = decodeArtifact(row);
      db.prepare(`INSERT INTO ${R}(root_id,artifact_id,created_at) VALUES (?,?,?)`).run(q.rootId, found.artifact_id, q.now);
      return result({ accepted: true, entry: found });
    }
    case "reserve": {
      const existing = db.prepare(`SELECT * FROM ${A} WHERE domain_id = ? AND setup_prefix_key = ? AND state IN ('ready','building') ORDER BY generation DESC LIMIT 1`).get(q.domainId, q.key);
      if (existing) {
        const found = decodeArtifact(existing);
        return result({ entry: found, disposition: found.state === "ready" ? "indexed-generation" : "active-writer" });
      }
      db.prepare(`INSERT INTO ${A}(artifact_id,domain_id,setup_prefix_key,base_identity,manifest_json,replacement_scope,generation,snapshot_name,state,lease_token,lease_until,created_at)
        VALUES (?,?,?,?,?,?,(SELECT COALESCE(MAX(generation),0)+1 FROM ${A}),?,'building',?,?,?)`)
        .run(q.artifactId, q.domainId, q.key, q.base, q.manifest, q.replacementScope, q.snapshotName, q.leaseToken, q.leaseUntil, q.now);
      return result({ accepted: true, entry: entry(q.artifactId), disposition: "reserved" });
    }
    case "publish": {
      const candidate = entry(q.artifactId);
      if (!candidate || candidate.state !== "building" || candidate.lease_token !== q.leaseToken || candidate.lease_until === null || candidate.lease_until <= q.now) return result();
      const winner = db.prepare(`SELECT artifact_id FROM ${A} WHERE domain_id = ? AND replacement_scope = ? AND generation > ? AND published_at IS NOT NULL LIMIT 1`).get(q.domainId, candidate.replacement_scope, candidate.generation);
      if (winner) return result();
      db.prepare(`UPDATE ${A} SET state = 'deleting', lease_token = ?, lease_until = ? WHERE domain_id = ? AND replacement_scope = ? AND generation < ? AND state = 'ready'`)
        .run(q.leaseToken, q.now, q.domainId, candidate.replacement_scope, candidate.generation);
      db.prepare(`UPDATE ${A} SET state = 'ready', snapshot_id = ?, published_at = ?, lease_token = NULL, lease_until = NULL WHERE artifact_id = ?`).run(q.snapshotId, q.now, q.artifactId);
      db.prepare(`INSERT INTO ${R}(root_id,artifact_id,sandbox_id,created_at) VALUES (?,?,?,?)`).run(q.rootId, q.artifactId, q.sandboxId, q.now);
      return result({ accepted: true, entry: entry(q.artifactId) });
    }
    case "settle-root":
      return result({ accepted: db.prepare(`UPDATE ${R} SET sandbox_id = ? WHERE root_id = ? AND artifact_id IN (SELECT artifact_id FROM ${A} WHERE domain_id = ?)`).run(q.sandboxId, q.rootId, q.domainId).changes === 1 });
    case "release-root":
      return result({ accepted: db.prepare(`DELETE FROM ${R} WHERE root_id = ? AND artifact_id IN (SELECT artifact_id FROM ${A} WHERE domain_id = ?)`).run(q.rootId, q.domainId).changes === 1 });
    case "invalidate":
      return result({ accepted: db.prepare(`UPDATE ${A} SET state = 'deleting', lease_token = artifact_id, lease_until = ? WHERE artifact_id = ? AND domain_id = ? AND state = 'ready'`).run(q.now, q.artifactId, q.domainId).changes === 1 });
    case "claim-cleanup": {
      const rows = db.prepare(`SELECT * FROM ${A} WHERE domain_id = ? AND state IN ('building','deleting') AND lease_until <= ? AND NOT EXISTS (SELECT 1 FROM ${R} WHERE ${R}.artifact_id = ${A}.artifact_id)`).all(q.domainId, q.now).map((row) => decodeArtifact(row));
      for (const row of rows) db.prepare(`UPDATE ${A} SET state = 'deleting', lease_token = ?, lease_until = ? WHERE artifact_id = ?`).run(q.leaseToken, q.leaseUntil, row.artifact_id);
      return result({ accepted: true, entries: rows.map((row) => ({ ...row, state: "deleting", lease_token: q.leaseToken, lease_until: q.leaseUntil })) });
    }
    case "settle-delete":
      return result({ accepted: db.prepare(`UPDATE ${A} SET state = 'deleted', snapshot_id = ?, lease_token = NULL, lease_until = NULL WHERE artifact_id = ? AND domain_id = ? AND state = 'deleting' AND lease_token = ? AND lease_until > ? AND NOT EXISTS (SELECT 1 FROM ${R} WHERE artifact_id = ?)`)
        .run(q.snapshotId, q.artifactId, q.domainId, q.leaseToken, q.now, q.artifactId).changes === 1 });
  }
}
export const openSandboxCacheRepositoryHandler = Object.freeze({ id: OPEN_SANDBOX_CACHE_REPOSITORY, installCurrentSchema, assertCurrentSchema, dispatch });
