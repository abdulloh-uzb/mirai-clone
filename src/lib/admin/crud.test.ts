import { describe, expect, it } from "vitest";
import { CRUD, isCrudTable, parseCrudForm } from "./crud";

const get = (m: Record<string, string>) => (n: string) => m[n] ?? null;

describe("parseCrudForm", () => {
  it("parses a faq row", () => {
    const r = parseCrudForm(
      CRUD.faq_items.fields,
      get({
        locale: "en",
        slug: "a",
        title: "T",
        body: "",
        category: "about",
        position: "3",
        published: "on",
      }),
    );
    expect(r).toEqual({
      ok: true,
      values: {
        locale: "en",
        slug: "a",
        title: "T",
        body: "",
        category: "about",
        position: 3,
        featured: false,
        published: true,
      },
    });
  });
  it("rejects a missing required field and bad json", () => {
    expect(
      parseCrudForm(CRUD.pages.fields, get({ locale: "en", slug: "a" })).ok,
    ).toBe(false);
    expect(
      parseCrudForm(
        CRUD.counties.fields,
        get({ name: "X", slug: "x-county", seat_city: "X", instructions: "[" }),
      ).ok,
    ).toBe(false);
  });
  it("only knows configured tables", () => {
    expect(isCrudTable("audit_log")).toBe(false);
    expect(isCrudTable("courts")).toBe(true);
  });
});
