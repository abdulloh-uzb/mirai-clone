export type Messages = { [key: string]: string | Messages };

/**
 * Builds the message tree for a UI language: every key English has, using the
 * translation when present and the English string when it is missing.
 * Keys English does not have (such as a file's review note) are dropped.
 */
export function withEnglishFallback(
  english: Messages,
  translated: Messages,
): Messages {
  const result: Messages = {};
  for (const [key, englishValue] of Object.entries(english)) {
    const value = translated[key];
    if (typeof englishValue === "string") {
      result[key] = typeof value === "string" ? value : englishValue;
    } else {
      result[key] = withEnglishFallback(
        englishValue,
        typeof value === "object" ? value : {},
      );
    }
  }
  return result;
}
