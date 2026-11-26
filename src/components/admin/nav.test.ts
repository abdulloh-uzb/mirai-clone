import { describe, expect, it } from "vitest";
import { activeNavHref, ADMIN_NAV_ITEMS, buildCrumbs } from "./nav";

const ID = "0b9f6c5e-1d2a-4b7c-8e3f-5a6b7c8d9e0f";

const labels = {
  sections: {
    "/admin": "Dashboard",
    "/admin/students": "Students",
    "/admin/content": "Course content",
    "/admin/content/questions": "Question bank",
  },
  details: "Details",
  view: "View as student",
};

describe("activeNavHref", () => {
  it.each([
    ["/admin", "/admin"],
    ["/admin/", "/admin"],
    [`/admin/students/${ID}`, "/admin/students"],
    ["/admin/content/questions", "/admin/content/questions"],
    [`/admin/content/lessons/${ID}`, "/admin/content"],
    ["/admin/refunds", "/admin/orders"],
    ["/admin/contentx", null],
  ])("%s highlights %s", (path, expected) => {
    expect(activeNavHref(path, ADMIN_NAV_ITEMS)).toBe(expected);
  });
});

describe("buildCrumbs", () => {
  it("shows Dashboard alone for /admin", () => {
    expect(buildCrumbs("/admin", labels)).toEqual([{ label: "Dashboard" }]);
  });

  it("starts deeper pages at their section", () => {
    expect(buildCrumbs("/admin/students", labels)).toEqual([
      { label: "Students" },
    ]);
    expect(buildCrumbs("/admin/content/questions", labels)).toEqual([
      { label: "Course content", href: "/admin/content" },
      { label: "Question bank" },
    ]);
  });

  it("skips unknown segments and labels ids as Details", () => {
    expect(buildCrumbs(`/admin/content/lessons/${ID}`, labels)).toEqual([
      { label: "Course content", href: "/admin/content" },
      { label: "Details" },
    ]);
    expect(buildCrumbs(`/admin/students/${ID}/view`, labels)).toEqual([
      { label: "Students", href: "/admin/students" },
      { label: "Details", href: `/admin/students/${ID}` },
      { label: "View as student" },
    ]);
  });

  it("is empty outside the Admin area", () => {
    expect(buildCrumbs("/portal", labels)).toEqual([]);
  });
});
