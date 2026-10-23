/** Runs inside the sandbox. Frames preserve bytes and make stdin EOF explicit. */
export const OPEN_SANDBOX_PROCESS_BRIDGE = String.raw`
const { spawn } = require("node:child_process");
const { readdir, readFile } = require("node:fs/promises");
const { createInterface } = require("node:readline");
const config = JSON.parse(Buffer.from(process.argv[1], "base64").toString("utf8"));
const send = (frame) => process.stdout.write(JSON.stringify(frame) + "\n");
if (Number(process.versions.node.split(".")[0]) < 24) throw new Error("OpenSandbox managed processes require Node.js 24 or newer");
if (config.uid !== undefined && config.gid !== undefined) process.initgroups(config.uid, config.gid);
const child = spawn(config.argv[0], config.argv.slice(1), {
  cwd: config.cwd,
  env: { ...process.env, ...config.env },
  uid: config.uid,
  gid: config.gid,
  detached: true,
  stdio: ["pipe", "pipe", "pipe"],
});
let finalizing;
let closed = false;
let stdinClosed = false;
let exitCode = null;
let exitSignal;
const childClosed = new Promise((resolve) => child.once("close", resolve));
const liveGroup = async (pgid) => {
  for (const name of await readdir("/proc")) {
    if (!/^\d+$/.test(name)) continue;
    let stat;
    try { stat = await readFile("/proc/" + name + "/stat", "utf8"); }
    catch (error) { if (error.code === "ENOENT" || error.code === "ESRCH") continue; throw error; }
    const fields = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
    if (Number(fields[2]) === pgid && fields[0] !== "Z" && fields[0] !== "X") return true;
  }
  return false;
};
const finish = () => finalizing ??= (async () => {
  if (child.pid !== undefined) {
    const until = Date.now() + 5000;
    do {
      try { process.kill(-child.pid, "SIGKILL"); }
      catch (error) { if (error.code !== "ESRCH") throw error; }
      if (!(await liveGroup(child.pid))) break;
      if (Date.now() >= until) throw new Error("managed process group did not terminate");
      await new Promise((resolve) => setTimeout(resolve, 25));
    } while (true);
  }
  await childClosed;
  closed = true;
  send({ type: "exit", exitCode, ...(exitSignal ? { signal: exitSignal } : {}) });
  process.stdout.write("", () => process.exit(0));
})().catch((error) => {
  send({ type: "error", message: error.message });
  process.stdout.write("", () => process.exit(1));
});
child.stdout.on("data", (bytes) => send({ type: "stdout", data: bytes.toString("base64") }));
child.stderr.on("data", (bytes) => send({ type: "stderr", data: bytes.toString("base64") }));
child.once("spawn", () => send({ type: "ready" }));
child.once("error", (error) => {
  send({ type: "error", message: error.message });
  void finish();
});
child.once("exit", (code, signal) => { exitCode = code; exitSignal = signal; void finish(); });
// A closed target stdin is reported to the corresponding caller, not an unhandled event.
child.stdin.on("error", () => {});
const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
let inputChain = Promise.resolve();
lines.on("line", (line) => {
  // Cancellation must not queue behind a write blocked by target backpressure.
  try {
    if (JSON.parse(line).type === "terminate") { void finish(); return; }
  } catch (error) { send({ type: "error", message: error.message }); void finish(); return; }
  inputChain = inputChain.then(async () => {
    const frame = JSON.parse(line);
    if (closed) throw new Error("managed process has exited");
    if (frame.type === "write") {
      if (stdinClosed) throw new Error("managed process stdin is closed");
      await new Promise((resolve, reject) => child.stdin.write(Buffer.from(frame.data, "base64"), (error) => error ? reject(error) : resolve()));
    } else if (frame.type === "eof") {
      stdinClosed = true;
      await new Promise((resolve) => child.stdin.end(resolve));
    } else throw new Error("invalid managed process input frame");
    send({ type: "ack", id: frame.id });
  }).catch((error) => { send({ type: "error", message: error.message }); void finish(); });
});
lines.once("close", () => { if (!closed) void finish(); });
`;
