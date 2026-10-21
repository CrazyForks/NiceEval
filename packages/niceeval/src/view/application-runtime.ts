import { Context, type Effect } from "effect";

/** HTTP callbacks submit effects to the application-owned runtime and Scope. */
export interface ViewApplicationRuntimeService {
  readonly run: <A, E>(operation: Effect.Effect<A, E>) => Promise<A>;
}

export class ViewApplicationRuntime extends Context.Service<ViewApplicationRuntime, ViewApplicationRuntimeService>()(
  "niceeval/view/ViewApplicationRuntime",
) {}
