import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
          exclude: ["**/*.db.test.ts", "**/node_modules/**"],
        },
      },
      {
        extends: true,
        test: {
          // Runs against the shared local Supabase stack: one file at a time.
          name: "db",
          environment: "node",
          include: ["tests/db/**/*.db.test.ts"],
          testTimeout: 20_000,
          hookTimeout: 30_000,
          fileParallelism: false,
        },
      },
    ],
  },
});
