import { expect, test } from "@playwright/test";

const roots = [
  {
    path: "/",
    lang: "en",
    heading: "California traffic school in your language",
  },
  {
    path: "/ja",
    lang: "ja",
    heading: "日本語で受けられるカリフォルニア州トラフィックスクール",
  },
  {
    path: "/es",
    lang: "es",
    heading: "Escuela de tránsito de California en español",
  },
  {
    path: "/ru",
    lang: "ru",
    heading: "Дорожная школа Калифорнии на русском языке",
  },
] as const;

for (const root of roots) {
  test(`${root.path} renders in ${root.lang} inside the page frame`, async ({
    page,
  }) => {
    await page.goto(root.path);

    await expect(page.locator("html")).toHaveAttribute("lang", root.lang);
    await expect(
      page.getByRole("heading", { level: 1, name: root.heading }),
    ).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("DEMO-0000");
  });
}

test("the footer shows school details on separate lines and the demo notice", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  await expect(footer).toContainText("Demo project — not a licensed school");
  await expect(footer).toContainText(`© ${new Date().getFullYear()}`);

  const lines = [
    footer.getByText("License: DEMO-0000"),
    footer.getByText("Sacramento, CA 95814"),
    footer.getByRole("link", { name: "(555) 010-0199" }),
    footer.getByRole("link", { name: "support@mirai-demo.example" }),
  ];
  const tops: number[] = [];
  for (const line of lines) {
    await expect(line).toBeVisible();
    const box = await line.boundingBox();
    tops.push(box?.y ?? -1);
  }
  expect(new Set(tops).size).toBe(lines.length);

  for (const name of [
    "Courts by county",
    "School rules",
    "FAQ",
    "Blog",
    "About",
    "Contact",
    "Privacy",
    "Terms",
    "Refunds",
    "Accessibility",
  ]) {
    await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
  }
});
