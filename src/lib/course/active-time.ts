export const ACTIVE_WINDOW_MS = 120_000;

/** Time counts only while the tab is visible and the Student was active in the last 2 minutes. */
export function isActive(
  now: number,
  lastInputAt: number,
  visible: boolean,
): boolean {
  return visible && now - lastInputAt <= ACTIVE_WINDOW_MS;
}
