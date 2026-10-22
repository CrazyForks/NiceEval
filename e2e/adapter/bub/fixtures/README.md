# Bub protocol sample

`bub-0.5.1.tape.jsonl` retains the tape captured for the fixed Bub 0.5.1 protocol with a deterministic provider response.
The `system` entry's content is redacted because it contained local system instructions and installed skill descriptions; the entry kind and payload shape are preserved.
The sample contains a text reply and usage, but no tool calls. It does not establish tool-call compatibility or live-provider acceptance.

`replay.mjs` feeds these captured bytes into the installed public Adapter factory through a Sandbox boundary substitute. `test/protocol.test.ts` owns the CLI/readback assertions. Synthetic unknown event lines are explicit fault injection, not captured upstream samples. Tool-call samples remain unavailable.
