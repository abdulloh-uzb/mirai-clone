import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import ja from "../../messages/ja.json";
import ru from "../../messages/ru.json";
import { DMV_SERVICE_GROUPS } from "./dmv-services";

const allTiles = DMV_SERVICE_GROUPS.flatMap((g) => g.tiles);

describe("DMV_SERVICE_GROUPS", () => {
  it("has 6 groups and about 20 tiles", () => {
    expect(DMV_SERVICE_GROUPS).toHaveLength(6);
    expect(allTiles.length).toBeGreaterThanOrEqual(18);
    expect(allTiles.length).toBeLessThanOrEqual(24);
  });
  it("uses unique tile ids", () => {
    expect(new Set(allTiles.map((t) => t.id)).size).toBe(allTiles.length);
  });
  it("links only to the official site over https", () => {
    for (const tile of allTiles) {
      expect(tile.url.startsWith("https://www.dmv.ca.gov/")).toBe(true);
    }
  });
  const catalogs = { en, ja, es, ru } as const;
  for (const [locale, messages] of Object.entries(catalogs)) {
    it(`has a title, text and keywords for every tile and group in ${locale}`, () => {
      const ns = messages.DmvServices;
      for (const tile of allTiles) {
        const copy = (
          ns.tiles as Record<
            string,
            { title?: string; text?: string; keywords?: string }
          >
        )[tile.id];
        expect(copy?.title, tile.id).toBeTruthy();
        expect(copy?.text, tile.id).toBeTruthy();
        expect(copy?.keywords, tile.id).toBeTruthy();
      }
      for (const group of DMV_SERVICE_GROUPS) {
        expect(
          (ns.groups as Record<string, string>)[group.id],
          group.id,
        ).toBeTruthy();
      }
    });
  }
});
