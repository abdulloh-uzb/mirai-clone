const DAY_MS = 86_400_000;

/** Whole days until expiry, rounded up; 0 when expired or unknown. */
export function daysLeft(expiresAt: Date | string | null, now: Date): number {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / DAY_MS));
}

export type AccessBanner = 14 | 7 | 1;

export function accessBanner(days: number): AccessBanner | null {
  if (days <= 1) return 1;
  if (days <= 7) return 7;
  if (days <= 14) return 14;
  return null;
}

/** Calendar days from today to the court due date (YYYY-MM-DD); negative when overdue. */
export function daysUntilDue(courtDueDate: string, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(`${courtDueDate}T00:00:00`);
  return Math.round((due.getTime() - today.getTime()) / DAY_MS);
}

export function dueDateWarning(
  courtDueDate: string | null,
  now: Date,
): "overdue" | "soon" | null {
  if (!courtDueDate) return null;
  const days = daysUntilDue(courtDueDate, now);
  if (days < 0) return "overdue";
  if (days <= 7) return "soon";
  return null;
}
