/** Public projections use current lifecycle names while Record keeps its stable encoding. */
type PublicLifecyclePhase<Phase extends string> =
  Phase extends `${infer Owner}.setup` ? `${Owner}.before`
    : Phase extends `${infer Owner}.teardown` ? `${Owner}.after`
      : Phase;

export function projectLifecyclePhase<Phase extends string>(phase: Phase): PublicLifecyclePhase<Phase> {
  return phase.replace(/\.setup$/, ".before").replace(/\.teardown$/, ".after") as PublicLifecyclePhase<Phase>;
}
