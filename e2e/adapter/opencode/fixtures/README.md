# OpenCode protocol samples

`opencode-1.18.5.jsonl` and `opencode-1.18.5.export.json` retain the CLI output and session export captured for OpenCode 1.18.5 with a deterministic provider response.
The samples contain a text reply and usage, but no tool calls. They do not establish tool-call compatibility or live-provider acceptance.

`replay.mjs` feeds these captured bytes into the installed public Adapter factory through a Sandbox boundary substitute. `test/protocol.test.ts` owns the CLI/readback assertions. Synthetic unknown event lines are explicit fault injection, not captured upstream samples. Tool-call samples remain unavailable.

The fixed-version [CLI emitter](https://github.com/anomalyco/opencode/blob/v1.18.5/packages/opencode/src/cli/cmd/run.ts) defines `tool_use`, `text`, `reasoning`, `step_start`, `step_finish` and `error` JSONL envelopes. Source inspection supports the retained fields; it is not a substitute for missing tool/error captures.
