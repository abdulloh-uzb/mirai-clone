import { describe, expect, it } from "vitest";
import { suggestLanguage } from "./suggest-language";

describe("suggestLanguage", () => {
  it("suggests the browser's first supported language", () => {
    expect(suggestLanguage(["ru-RU", "en-US"], "en")).toBe("ru");
  });

  it("skips unsupported languages", () => {
    expect(suggestLanguage(["de-DE", "fr", "ja"], "en")).toBe("ja");
  });

  it("suggests nothing when the best match is the current language", () => {
    expect(suggestLanguage(["es-MX", "ru"], "es")).toBeNull();
  });

  it("suggests nothing when no language is supported", () => {
    expect(suggestLanguage(["de", "fr"], "en")).toBeNull();
    expect(suggestLanguage([], "en")).toBeNull();
  });

  it("can suggest English from another language", () => {
    expect(suggestLanguage(["en-GB"], "ja")).toBe("en");
  });
});
