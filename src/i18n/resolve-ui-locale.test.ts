import { describe, expect, it } from "vitest";
import { resolveUiLocale } from "./resolve-ui-locale";

describe("resolveUiLocale", () => {
  it("uses the language named in the URL, ignoring the saved preference", () => {
    expect(resolveUiLocale({ pathname: "/ja/faq", preference: "ru" })).toEqual(
      { locale: "ja" },
    );
    expect(resolveUiLocale({ pathname: "/es", preference: "ru" })).toEqual({
      locale: "es",
    });
  });

  it("keeps a deep unprefixed path in English even with a saved preference", () => {
    expect(resolveUiLocale({ pathname: "/faq", preference: "ru" })).toEqual({
      locale: "en",
    });
    expect(
      resolveUiLocale({ pathname: "/courts/los-angeles", preference: "ja" }),
    ).toEqual({ locale: "en" });
  });

  it("redirects the bare root to a saved non-English preference", () => {
    expect(resolveUiLocale({ pathname: "/", preference: "ru" })).toEqual({
      locale: "ru",
      redirectTo: "/ru",
    });
  });

  it("stays on the root in English when the preference is English, missing or unknown", () => {
    expect(resolveUiLocale({ pathname: "/", preference: "en" })).toEqual({
      locale: "en",
    });
    expect(resolveUiLocale({ pathname: "/", preference: null })).toEqual({
      locale: "en",
    });
    expect(resolveUiLocale({ pathname: "/", preference: "fr" })).toEqual({
      locale: "en",
    });
  });

  it("does not treat a path that merely starts with a language code as prefixed", () => {
    expect(
      resolveUiLocale({ pathname: "/russia-guide", preference: null }),
    ).toEqual({ locale: "en" });
  });
});
