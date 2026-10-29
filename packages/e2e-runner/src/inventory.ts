import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

import { Data, Effect, Predicate } from "effect";
import { bridgeBoundary, deriveTestReference, readDeclarations, engineCall } from "./concord-engine.ts";
import { InventorySchema } from "./bridge-wire.ts";

import { hasSuccessfulOwnedProcessResult, OwnedProcess } from "./owned-process.js";

export const CASE_ID_PATTERN = /^neref_[0-9a-f]{32}$/;

export type InventoryExecutor = "vitest" | "playwright";

export interface CollectedCase {
  readonly executor: InventoryExecutor;
  readonly repo: string;
  readonly path: string;
  readonly project?: string;
  readonly titlePath: readonly string[];
  readonly caseId: string;
}

export interface CaseInventoryReceipt {
  readonly executor: { readonly name: InventoryExecutor; readonly version: string };
  readonly repo: string;
  readonly argv: readonly string[];
  readonly checkout: string;
  readonly files: readonly string[];
  readonly cases: readonly CollectedCase[];
  readonly unassignedCases: readonly RawCollectedCase[];
  readonly bodyExecutions: 0;
  readonly forbiddenSetupExecutions: 0;
  readonly findings: readonly string[];
  readonly digest: `sha256:${string}`;
  readonly exit: number | null;
  readonly signal: string | null;
}

export class InventoryError extends Data.TaggedError("InventoryError")<{
  readonly detail: string;
  readonly receipt: CaseInventoryReceipt;
}> {}

export interface RawCollectedCase {
  readonly file: string;
  readonly project?: string;
  readonly titlePath: readonly string[];
}

const SOURCE_EXCLUDED_BASENAMES = new Set(["node_modules", ".git"]);
const signInventory = (value: unknown) => engineCall("inventory", { kind: "case", action: "sign", value }, InventorySchema);

const text = (value: unknown, key: string): string | undefined =>
  Predicate.isObject(value) && Predicate.isString(value[key]) ? value[key] : undefined;

const array = (value: unknown, key: string): readonly unknown[] =>
  Predicate.isObject(value) && Array.isArray(value[key]) ? value[key] : [];

const parseJson = (stdout: string): unknown => JSON.parse(stdout.trim());

const collectVitest = (document: unknown): readonly RawCollectedCase[] => {
  if (!Array.isArray(document)) throw new Error("Vitest list --json output must be an array");
  return document.map((entry, index) => {
    const file = text(entry, "file") ?? text(entry, "filepath") ?? text(entry, "moduleId");
    const name = text(entry, "name") ?? text(entry, "fullName");
    if (file === undefined || name === undefined) throw new Error(`Vitest list entry ${index} is missing file/name`);
    const project = text(entry, "projectName") ?? text(entry, "project");
    return { file, titlePath: [name], ...(project === undefined ? {} : { project }) };
  });
};

const collectPlaywright = (document: unknown): readonly RawCollectedCase[] => {
  if (!Predicate.isObject(document)) throw new Error("Playwright JSON report must be an object");
  const output: RawCollectedCase[] = [];
  const visitSuite = (suite: unknown, parents: readonly string[], inheritedFile?: string): void => {
    if (!Predicate.isObject(suite)) throw new Error("Playwright JSON report contains a non-object suite");
    const suiteTitle = text(suite, "title");
    const titlePath = suiteTitle === undefined || suiteTitle.length === 0 ? parents : [...parents, suiteTitle];
    const file = text(suite, "file") ?? inheritedFile;
    for (const spec of array(suite, "specs")) {
      if (!Predicate.isObject(spec)) throw new Error("Playwright JSON report contains a non-object spec");
      const title = text(spec, "title");
      const specFile = text(spec, "file") ?? file;
      if (title === undefined || specFile === undefined) throw new Error("Playwright JSON spec is missing title/file");
      const tests = array(spec, "tests");
      if (tests.length === 0) output.push({ file: specFile, titlePath: [...titlePath, title] });
      for (const test of tests) {
        const candidateProject = text(test, "projectName");
        const project = candidateProject === undefined || candidateProject.length === 0 ? undefined : candidateProject;
        output.push({ file: specFile, titlePath: [...titlePath, title], ...(project === undefined ? {} : { project }) });
      }
    }
    for (const child of array(suite, "suites")) visitSuite(child, titlePath, file);
  };
  for (const suite of array(document, "suites")) visitSuite(suite, []);
  const errors = array(document, "errors");
  if (errors.length > 0) throw new Error(`Playwright collection reported ${errors.length} error(s)`);
  return output;
};

const canonicalPath = (cwd: string, file: string): string => {
  const value = (isAbsolute(file) ? relative(cwd, file) : file).replaceAll("\\", "/");
  if (value.length === 0 || value === ".." || value.startsWith("../")) {
    throw new Error(`collected file is outside inventory cwd: ${file}`);
  }
  if (existsSync(resolve(cwd, value))) return value;

  // Playwright's JSON reporter may emit a path relative to testDir instead of
  // the process cwd. Resolve that runner-relative witness only when it names
  // one unique source file; ambiguity remains a collection error.
  const matches: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (SOURCE_EXCLUDED_BASENAMES.has(entry.name)) continue;
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) {
        const candidate = relative(cwd, absolute).replaceAll("\\", "/");
        if (candidate === value || candidate.endsWith(`/${value}`)) matches.push(candidate);
      }
    }
  };
  visit(cwd);
  if (matches.length !== 1) throw new Error(`collected file does not resolve to one source path: ${file} (${matches.length} matches)`);
  return matches[0]!;
};

interface SourceDeclaration {
  readonly title: string;
  readonly testFile: string;
  readonly declarationPath: string;
  readonly annotated: boolean;
}

const sourceFiles = (cwd: string): readonly string[] => {
  const output: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (SOURCE_EXCLUDED_BASENAMES.has(entry.name)) continue;
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && /\.(?:[cm]?[jt]sx?)$/u.test(entry.name)) output.push(relative(cwd, absolute).replaceAll("\\", "/"));
    }
  };
  visit(cwd);
  return output.sort();
};

const declarationsInCopy = Effect.fn("declarationsInCopy")(function* (cwd: string, repo: string) {
  const declarations: SourceDeclaration[] = [];
  for (const path of sourceFiles(cwd)) {
    const workspacePath = `e2e/${repo}/${path}`;
    const source = readFileSync(resolve(cwd, path), "utf8");
    const decoded = yield* readDeclarations(workspacePath, source);
    const annotatedByStart = new Map(decoded.annotated.map((entry) => [entry.declarationStart, entry]));
    for (const entry of decoded.supported) {
      const relation = annotatedByStart.get(entry.start);
      declarations.push({ title: entry.title, testFile: relation?.testFile ?? workspacePath, declarationPath: workspacePath, annotated: relation !== undefined });
    }
  }
  return declarations;
}, bridgeBoundary);

const validateCases = Effect.fn("validateCases")(function* (
  executor: InventoryExecutor,
  repo: string,
  suiteId: string,
  cwd: string,
  rawCases: readonly RawCollectedCase[],
) {
  const findings: string[] = [];
  const unassignedCases: RawCollectedCase[] = [];
  const seen = new Map<string, string>();
  const files = new Set<string>();
  const cases: CollectedCase[] = [];
  const declarations = yield* declarationsInCopy(cwd, repo);
  for (const raw of rawCases) {
    const path = canonicalPath(cwd, raw.file);
    files.add(path);
    const title = raw.titlePath.at(-1) ?? "";
    const workspacePath = `e2e/${repo}/${path}`;
    const candidates = declarations.filter((entry) => entry.testFile === workspacePath && entry.title === title);
    const declaration = candidates[0];
    if (candidates.length !== 1 || declaration === undefined) {
      if (candidates.length > 1) findings.push(`AmbiguousCaseBinding: ${path}: ${JSON.stringify(title)} has ${candidates.length} statically supported declarations`);
      unassignedCases.push({ ...raw, file: path });
      continue;
    }
    if (!declaration.annotated) {
      unassignedCases.push({ ...raw, file: path });
      continue;
    }
    const caseId = yield* deriveTestReference(workspacePath, declaration.declarationPath, title);
    if (!CASE_ID_PATTERN.test(caseId)) throw new Error("engine returned an invalid case ID");
    const prior = seen.get(caseId);
    if (prior !== undefined) {
      findings.push(`DuplicateCaseId: ${caseId} is collected by both ${prior} and ${path}`);
      continue;
    }
    seen.set(caseId, path);
    cases.push({ executor, repo: suiteId, path, ...(raw.project === undefined ? {} : { project: raw.project }), titlePath: raw.titlePath, caseId });
  }
  return {
    cases: cases.sort((left, right) => left.path.localeCompare(right.path) || (left.project ?? "").localeCompare(right.project ?? "") || left.titlePath.join("\0").localeCompare(right.titlePath.join("\0"))),
    unassignedCases,
    findings: findings.sort(),
    files: [...files].sort(),
  };
}, bridgeBoundary);

interface ResolvedExecutorCli {
  readonly cli: string;
}

const executorPackages = (executor: InventoryExecutor): readonly string[] =>
  executor === "vitest" ? ["vitest"] : ["@playwright/test", "playwright"];

const resolveExecutorCli = (executor: InventoryExecutor, cwd: string): ResolvedExecutorCli => {
  const requireFromCwd = createRequire(resolve(cwd, "__niceeval_inventory__.cjs"));
  const failures: string[] = [];
  for (const packageName of executorPackages(executor)) {
    try {
      const manifestPath = requireFromCwd.resolve(`${packageName}/package.json`);
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { readonly bin?: string | Readonly<Record<string, string>> };
      const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.[executor];
      if (bin === undefined) {
        failures.push(`${packageName} does not declare a ${executor} CLI bin`);
        continue;
      }
      return { cli: resolve(dirname(manifestPath), bin) };
    } catch (cause) {
      failures.push(cause instanceof Error ? cause.message : String(cause));
    }
  }
  throw new Error(`could not resolve the ${executor} CLI from ${cwd}: ${failures.join("; ")}`);
};

const executorCommand = (executor: InventoryExecutor, cli: string, nativeArgs: readonly string[]): readonly string[] =>
  executor === "vitest"
    ? [process.execPath, cli, "list", ...nativeArgs, "--json"]
    : [process.execPath, cli, "test", "--list", "--reporter=json", ...nativeArgs];

const versionCommand = (cli: string): readonly string[] => [process.execPath, cli, "--version"];

const versionFrom = (executor: InventoryExecutor, stdout: string): string => {
  const match = executor === "vitest" ? /vitest\/(\S+)/.exec(stdout) : /Version\s+(\S+)/.exec(stdout);
  if (match?.[1] === undefined) throw new Error(`could not parse ${executor} version output`);
  return match[1];
};

export interface InventoryOptions {
  readonly executor: InventoryExecutor;
  /** E2E manifest id: the scenario directory under `e2e/`, e.g. `adapter/codex-cli`. */
  readonly repo: string;
  /** Concord suite id written as the receipt `repo`; Concord matches it against the configured suite. */
  readonly suiteId: string;
  readonly cwd: string;
  readonly checkout: string;
  readonly nativeArgs: readonly string[];
}

export const collectCaseInventory = Effect.fn("collectCaseInventory")(function* (options: InventoryOptions) {
  const cwd = resolve(options.cwd);
  const ownedProcess = yield* OwnedProcess;
  let resolved: ResolvedExecutorCli;
  try {
    resolved = resolveExecutorCli(options.executor, cwd);
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    const unsigned = {
      executor: { name: options.executor, version: "unknown" }, repo: options.suiteId,
      argv: [process.execPath, `<unresolved-${options.executor}-cli>`], checkout: options.checkout,
      files: [], cases: [], unassignedCases: [], bodyExecutions: 0 as const, forbiddenSetupExecutions: 0 as const,
      findings: [detail], exit: null, signal: null,
    };
    const receipt: CaseInventoryReceipt = yield* signInventory(unsigned);
    return yield* new InventoryError({ detail, receipt });
  }
  const argv = executorCommand(options.executor, resolved.cli, options.nativeArgs);
  const [collection, versionResult] = yield* Effect.all([
    ownedProcess.run(argv, { cwd, output: "capture", stream: false }),
    ownedProcess.run(versionCommand(resolved.cli), { cwd, output: "capture", stream: false }),
  ], { concurrency: 2 });
  let version = "unknown";
  const findings: string[] = [];
  let rawCases: readonly RawCollectedCase[] = [];
  if (!hasSuccessfulOwnedProcessResult(versionResult)) findings.push(`${options.executor} version command failed`);
  else {
    try { version = versionFrom(options.executor, versionResult.stdout); }
    catch (cause) { findings.push(cause instanceof Error ? cause.message : String(cause)); }
  }
  if (!hasSuccessfulOwnedProcessResult(collection)) {
    let diagnostic = collection.stderr.trim();
    if (diagnostic.length === 0 && options.executor === "playwright" && collection.stdout.trim().length > 0) {
      try {
        diagnostic = array(parseJson(collection.stdout), "errors")
          .map((entry) => text(entry, "message"))
          .filter((message): message is string => message !== undefined)
          .join("; ");
      } catch {
        diagnostic = "";
      }
    }
    findings.push(`${options.executor} collection failed (exit=${String(collection.exitCode)}, signal=${String(collection.signal)})${diagnostic.length === 0 ? "" : `: ${diagnostic}`}`);
  } else {
    try {
      const document = parseJson(collection.stdout);
      rawCases = options.executor === "vitest" ? collectVitest(document) : collectPlaywright(document);
    } catch (cause) {
      findings.push(`collection receipt decode failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    }
  }
  const validated = yield* validateCases(options.executor, options.repo, options.suiteId, cwd, rawCases);
  findings.push(...validated.findings);
  const unsigned = {
    executor: { name: options.executor, version },
    repo: options.suiteId,
    argv,
    checkout: options.checkout,
    files: validated.files,
    cases: validated.cases,
    unassignedCases: validated.unassignedCases,
    bodyExecutions: 0 as const,
    forbiddenSetupExecutions: 0 as const,
    findings: findings.sort(),
    exit: collection.exitCode,
    signal: collection.signal,
  };
  const receipt: CaseInventoryReceipt = yield* signInventory(unsigned);
  if (receipt.findings.length > 0) return yield* new InventoryError({ detail: receipt.findings.join("; "), receipt });
  return receipt;
}, bridgeBoundary);
