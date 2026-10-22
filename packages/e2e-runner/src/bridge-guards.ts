import { createHash } from "node:crypto";
import { closeSync, constants, fstatSync, lstatSync, openSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

export interface ReadGuard { readonly path: string; readonly digest: string }

/** Records exactly the bytes consumed, and rechecks all reads before responding. */
export class ReadGuards {
  private readonly entries = new Map<string, ReadGuard>();
  readonly root: string;
  constructor(root: string) { this.root = realpathSync(root); }

  private path(path: string): string {
    const absolute = resolve(this.root, path);
    const local = relative(this.root, absolute);
    if (/[\\\0\r\n#]/u.test(local) || local === "" || isAbsolute(local) || local === ".." || local.startsWith(`..${sep}`)) throw new Error("guard path escapes consumer root or is not a protocol path");
    let current = this.root;
    const parts = local.split(sep);
    for (const [index, part] of parts.entries()) {
      current = resolve(current, part);
      const stat = lstatSync(current);
      if (stat.isSymbolicLink() || (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory())) throw new Error("guard path must contain only ordinary directories and files");
    }
    if (realpathSync(absolute) !== absolute) throw new Error("guard path is not canonical");
    return absolute;
  }

  private bytes(path: string): Buffer {
    const absolute = this.path(path);
    const fd = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const before = fstatSync(fd);
      if (!before.isFile()) throw new Error("guard must be an ordinary file");
      const bytes = readFileSync(fd);
      const after = fstatSync(fd);
      const named = lstatSync(this.path(absolute));
      if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs || named.dev !== after.dev || named.ino !== after.ino) throw new Error("managed evidence changed during read");
      return bytes;
    } finally { closeSync(fd); }
  }

  read(path: string): Buffer {
    const absolute = this.path(path);
    const bytes = this.bytes(absolute);
    if (!bytes.equals(this.bytes(absolute))) throw new Error("managed evidence changed during read");
    const digest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    const prior = this.entries.get(absolute);
    if (prior !== undefined && prior.digest !== digest) throw new Error("managed evidence changed while reading");
    this.entries.set(absolute, { path: this.wirePath(absolute), digest });
    return bytes;
  }

  wirePath(path: string): string { return relative(this.root, this.path(path)).split(sep).join("/"); }

  finish(): readonly ReadGuard[] {
    for (const guard of this.entries.values()) this.read(guard.path);
    return [...this.entries.values()].sort((left, right) => left.path.localeCompare(right.path));
  }
}
