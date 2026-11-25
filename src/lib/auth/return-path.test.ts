import { describe, expect, it } from "vitest";
import { safeReturnPath, signInPathFor } from "./return-path";

describe("safeReturnPath", () => {
  it("keeps a same-site relative path with its query and hash", () => {
    expect(safeReturnPath("/portal")).toBe("/portal");
    expect(safeReturnPath("/ja/portal/certificates?paid=1#top")).toBe(
      "/ja/portal/certificates?paid=1#top",
    );
  });

  it("rejects a missing or empty value", () => {
    expect(safeReturnPath(null)).toBeNull();
    expect(safeReturnPath(undefined)).toBeNull();
    expect(safeReturnPath("")).toBeNull();
  });

  it("rejects absolute URLs to another site", () => {
    expect(safeReturnPath("https://evil.example/portal")).toBeNull();
    expect(safeReturnPath("javascript:alert(1)")).toBeNull();
  });

  it("rejects protocol-relative and backslash tricks that browsers treat as another host", () => {
    expect(safeReturnPath("//evil.example")).toBeNull();
    expect(safeReturnPath("/\\evil.example")).toBeNull();
    expect(safeReturnPath("\\\\evil.example")).toBeNull();
  });

  it("rejects paths with control characters, which browsers strip", () => {
    expect(safeReturnPath("/\t/evil.example")).toBeNull();
    expect(safeReturnPath("/portal\n")).toBeNull();
  });

  it("rejects relative paths that do not start at the root", () => {
    expect(safeReturnPath("portal")).toBeNull();
    expect(safeReturnPath("./portal")).toBeNull();
  });
});

describe("signInPathFor", () => {
  it("sends an English path to the unprefixed sign-in page", () => {
    expect(signInPathFor("/portal")).toBe("/login?next=%2Fportal");
  });

  it("keeps the UI language of the path being protected", () => {
    expect(signInPathFor("/ru/portal?paid=1")).toBe(
      "/ru/login?next=%2Fru%2Fportal%3Fpaid%3D1",
    );
  });
});
