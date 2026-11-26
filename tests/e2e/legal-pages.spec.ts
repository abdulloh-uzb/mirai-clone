import { expect, test } from "@playwright/test";
import { siteConfig } from "../../src/config/site";
import { expectNoSeriousA11yIssues } from "../support/axe";

const pages = [
  {
    path: "/terms",
    h1: "Terms of use",
    other: "/ja/terms",
    otherH1: "利用規約",
    legal: true,
  },
  {
    path: "/privacy",
    h1: "Privacy policy",
    other: "/es/privacy",
    otherH1: "Política de privacidad",
    legal: true,
  },
  {
    path: "/refund-policy",
    h1: "Refund policy",
    other: "/ru/refund-policy",
    otherH1: "Политика возврата",
    legal: true,
  },
  {
    path: "/school-rules",
    h1: "School rules",
    other: "/es/school-rules",
    otherH1: "Reglas de la escuela",
    legal: true,
  },
  {
    path: "/about",
    h1: "Built for drivers who are new here.",
    other: "/ja/about",
    otherH1: "Built for drivers who are new here.",
    legal: false,
  },
  {
    path: "/accessibility",
    h1: "Accessibility",
    other: "/ru/accessibility",
    otherH1: "Доступность",
    legal: false,
  },
];

for (const page of pages) {
  test(`${page.path} renders in English and another language`, async ({
    page: browser,
  }) => {
    await browser.goto(page.path);
    await expect(browser.getByRole("heading", { level: 1 })).toHaveText(
      page.h1,
    );
    if (page.legal) {
      await expect(
        browser.getByText("Demo text, not legal advice."),
      ).toBeVisible();
    }
    await browser.goto(page.other);
    await expect(browser.getByRole("heading", { level: 1 })).toHaveText(
      page.otherH1,
    );
  });
}

test("the refund policy states the three tiers", async ({ page }) => {
  await page.goto("/refund-policy");
  const table = page.getByRole("table");
  await expect(table).toContainText("100%");
  await expect(table).toContainText("50%");
  await expect(table).toContainText("0%");
  await expectNoSeriousA11yIssues(page);
});

test("/ru/school-rules falls back to English with the notice", async ({
  page,
}) => {
  await page.goto("/ru/school-rules");
  await expect(page.getByRole("note")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "School rules",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/school-rules$/,
  );
  await expect(page.locator('link[rel="canonical"]')).not.toHaveAttribute(
    "href",
    /\/ru\//,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="ru"]'),
  ).toHaveCount(0);
});

test("/contact shows the contact details from the site config", async ({
  page,
}) => {
  await page.goto("/contact");
  await expect(
    page
      .getByRole("main")
      .getByRole("link", { name: siteConfig.contact.email })
      .first(),
  ).toBeVisible();
  await expect(page.getByText("not a licensed school").first()).toBeVisible();
  await expectNoSeriousA11yIssues(page);
});
