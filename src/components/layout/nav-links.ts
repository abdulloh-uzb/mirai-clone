// Final paths of the main sections. Pages not built yet fall through to the 404 page.
export const mainNav = [
  { key: "courses", href: "/courses" },
  { key: "dmvServices", href: "/dmv-services" },
  { key: "courts", href: "/courts" },
  { key: "about", href: "/about" },
  { key: "faq", href: "/faq" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

export const footerNav = [
  {
    key: "schoolGroup",
    links: [
      { key: "courts", href: "/courts" },
      { key: "schoolRules", href: "/school-rules" },
      { key: "about", href: "/about" },
    ],
  },
  {
    key: "helpGroup",
    links: [
      { key: "faq", href: "/faq" },
      { key: "blog", href: "/blog" },
      { key: "contact", href: "/contact" },
    ],
  },
  {
    key: "legalGroup",
    links: [
      { key: "privacy", href: "/privacy" },
      { key: "terms", href: "/terms" },
      { key: "refunds", href: "/refund-policy" },
      { key: "accessibility", href: "/accessibility" },
    ],
  },
] as const;
