// The only place the school's brand and contact details live.
// Header, footer and later pages read from here so the school can be renamed in one place.
// All values are placeholders: this is a demo, not a licensed school.
export const siteConfig = {
  name: "RoadReady Traffic School",
  shortName: "RoadReady",
  licenseNumber: "DEMO-0000",
  contact: {
    addressLines: ["100 Example Avenue, Suite 200", "Sacramento, CA 95814"],
    phone: "(555) 010-0199",
    phoneHref: "tel:+15550100199",
    email: "support@roadready.example",
  },
} as const;

export type SiteConfig = typeof siteConfig;
