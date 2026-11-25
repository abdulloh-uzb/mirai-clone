/** "A1234567" becomes "****4567". Short numbers are fully masked. */
export function maskLicense(license: string): string {
  const clean = license.trim();
  if (clean.length <= 4) return "*".repeat(clean.length);
  return "****" + clean.slice(-4);
}

/** Shape of a certificate number, e.g. RR-2026-1A2B3C4D. */
export function certificateNumberValid(value: string): boolean {
  return /^RR-\d{4}-[0-9A-F]{8}$/i.test(value.trim());
}
