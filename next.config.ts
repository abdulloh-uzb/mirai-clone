import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV !== "production";

// The Content-Security-Policy is set per request in src/proxy.ts (it needs a nonce).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Certificate PDF fonts are read from node_modules at runtime.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/@fontsource/noto-sans/files/noto-sans-{latin,cyrillic}-{400,700}-normal.woff",
      "./node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-{400,700}-normal.woff",
    ],
  },
  experimental: {
    // Bug report screenshots go through a server action (up to 5 MB).
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
