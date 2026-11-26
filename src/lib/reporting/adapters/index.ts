import type { StateReportingAdapter } from "../types";
import { MockCaliforniaAdapter } from "./mock-california";

/** The adapter named by `states.adapter`. */
export function adapterFor(name: string | null): StateReportingAdapter {
  if (name === "mock-california") return new MockCaliforniaAdapter();
  throw new Error(`No reporting adapter for "${name ?? "none"}"`);
}
