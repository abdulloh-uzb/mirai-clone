import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Read env through the Zod-validated publicEnv in src/lib/env.ts (server secrets: src/lib/supabase/service.ts).",
        },
      ],
    },
  },
  {
    // The places allowed to read process.env directly.
    files: [
      "src/lib/env.ts",
      "src/lib/supabase/service.ts",
      "scripts/**",
      "tests/**",
      "*.config.{ts,mts,mjs}",
    ],
    rules: { "no-restricted-properties": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "src/lib/database.types.ts",
    ".scratch/**",
    ".agents/**",
    ".aider-desk/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
