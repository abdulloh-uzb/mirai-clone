import { reportingEnv } from "../env";
import type {
  CompletionPayload,
  StateReportingAdapter,
  StatusResult,
  SubmitResult,
} from "../types";

type Options = {
  random?: () => number;
  delay?: () => Promise<void>;
  alwaysAccept?: boolean;
};

const defaultDelay = () =>
  new Promise<void>((resolve) => setTimeout(resolve, Math.random() * 200));

/** A fake California DMV. Set MOCK_REPORTING_ALWAYS_ACCEPT=1 to make it deterministic. */
export class MockCaliforniaAdapter implements StateReportingAdapter {
  private random: () => number;
  private delay: () => Promise<void>;
  private alwaysAccept: boolean;

  constructor(options: Options = {}) {
    this.random = options.random ?? Math.random;
    this.delay = options.delay ?? defaultDelay;
    this.alwaysAccept = options.alwaysAccept ?? reportingEnv().alwaysAccept;
  }

  async submitCompletions(items: CompletionPayload[]): Promise<SubmitResult[]> {
    const results: SubmitResult[] = [];
    for (const item of items) {
      await this.delay();
      const roll = this.alwaysAccept ? 1 : this.random();
      if (roll < 0.05) {
        results.push({
          reportId: item.reportId,
          status: "rejected",
          reason: "Citation not found",
        });
      } else if (roll < 0.1) {
        results.push({
          reportId: item.reportId,
          status: "error",
          reason: "DMV service unavailable",
        });
      } else {
        const ref = Math.floor(this.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0")
          .toUpperCase();
        results.push({
          reportId: item.reportId,
          status: "sent",
          regulatorRef: `CA-MOCK-${ref}`,
        });
      }
    }
    return results;
  }

  async checkStatus(ids: string[]): Promise<StatusResult[]> {
    const results: StatusResult[] = [];
    for (const reportId of ids) {
      await this.delay();
      if (this.alwaysAccept || this.random() < 0.9) {
        results.push({ reportId, status: "accepted" });
      } else {
        results.push({
          reportId,
          status: "rejected",
          reason: "Record mismatch",
        });
      }
    }
    return results;
  }
}
