// The only place the school's brand and contact details live.
// Header, footer and later pages read from here so the school can be renamed in one place.
// Unofficial concept demo for Mirai Traffic School. Licence, address, phone and
// email are placeholders, not the school's real details.
export const siteConfig = {
  name: "MIRAI TRAFFIC SCHOOL",
  shortName: "MIRAI",
  logo: { src: "/brand/mirai-logo.webp", width: 200, height: 85 },
  licenseNumber: "DEMO-0000",
  contact: {
    addressLines: ["100 Example Avenue, Suite 200", "Sacramento, CA 95814"],
    phone: "(555) 010-0199",
    phoneHref: "tel:+15550100199",
    email: "support@mirai-demo.example",
  },
} as const;

export type SiteConfig = typeof siteConfig;
