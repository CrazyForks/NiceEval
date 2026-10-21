import type { SandboxTargetPlatform } from "niceeval/sandbox";

/** Planning target for fixtures that execute on this host, never a container. */
export function hostSandboxTargetPlatform(): SandboxTargetPlatform {
  const arch = process.arch;
  if (process.platform === "darwin") return { _tag: "Darwin", os: "darwin", arch };
  if (process.platform === "linux") {
    const report = process.report.getReport() as { header?: { glibcVersionRuntime?: string } };
    if (report.header === undefined) throw new Error("cannot determine host Linux libc from Node process report");
    return { _tag: "Linux", os: "linux", arch, libc: report.header.glibcVersionRuntime === undefined ? "musl" : "gnu" };
  }
  throw new Error(`host Sandbox fixtures require Linux or macOS, received ${process.platform}`);
}
