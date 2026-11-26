export const MAX_ATTEMPTS = 5;
export const REPORTING_TIMES = ["09:00", "13:00", "17:00"] as const;
export const REPORTING_TZ = "America/Los_Angeles";

const BACKOFF_MINUTES = [5, 15, 60, 180, 720];

function parts(date: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(f.find((p) => p.type === t)?.value);
  return { hour: get("hour"), minute: get("minute") };
}

/** True when `now` falls in the hour of a reporting slot in the school's time zone. */
export function isReportingSlot(
  now: Date,
  times: readonly string[] = REPORTING_TIMES,
  tz: string = REPORTING_TZ,
): boolean {
  const { hour } = parts(now, tz);
  return times.some((t) => Number(t.split(":")[0]) === hour);
}

/** Minutes to wait after the given number of failed attempts. */
export function nextBackoff(attempts: number): number {
  const i = Math.min(Math.max(attempts, 1), BACKOFF_MINUTES.length) - 1;
  return BACKOFF_MINUTES[i];
}

/** The next slot strictly after `now`, found minute by minute (at most 2 days). */
export function nextReportingSlot(
  now: Date,
  times: readonly string[] = REPORTING_TIMES,
  tz: string = REPORTING_TZ,
): Date {
  const start = new Date(Math.floor(now.getTime() / 60000) * 60000 + 60000);
  for (let i = 0; i < 2 * 24 * 60; i++) {
    const d = new Date(start.getTime() + i * 60000);
    const { hour, minute } = parts(d, tz);
    if (minute === 0 && times.some((t) => Number(t.split(":")[0]) === hour)) {
      return d;
    }
  }
  return start;
}
