import type { DiagnosticInput } from "../shared/types.ts";

/** One collector per Attempt; cumulative tapes replace their previous snapshot. */
export class UnrecognizedAgentEvents {
  private readonly sources = new Map<string, Readonly<Record<string, number>>>();
  private sequence = 0;

  observe(counts: Readonly<Record<string, number>> | undefined, source?: string): void {
    this.sources.set(source ?? `send:${++this.sequence}`, counts ?? {});
  }

  report(diagnostic: (input: DiagnosticInput) => void): void {
    const totals: Record<string, number> = Object.create(null);
    for (const counts of this.sources.values()) {
      for (const [type, count] of Object.entries(counts)) totals[type] = (totals[type] ?? 0) + count;
    }
    this.sources.clear();
    const types = Object.keys(totals).sort();
    if (!types.length) return;
    diagnostic({
      code: "agent-event-unrecognized",
      level: "warning",
      message: `Unrecognized agent events were excluded: ${types.map((type) => `${type} (${totals[type]})`).join(", ")}.`,
      data: { events: types.map((type) => ({ type, count: totals[type]! })) },
    });
  }
}
