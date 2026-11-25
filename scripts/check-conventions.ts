// Mechanical project rules that ESLint can't express. Runs as part of `pnpm lint`.
//   1. Brand and contact details live only in src/config/site.ts (CLAUDE.md, "Brand and content").
//   2. Database enums come from the generated types, never a hand-written string union
//      (CLAUDE.md, "Code quality"): use `Enums<"app_role">`, not `"student" | "admin"`.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { siteConfig } from "../src/config/site";

const root = join(import.meta.dirname, "..");
const SCANNED_DIRS = ["src", "messages", "supabase"];
const SCANNED_EXTENSIONS = /\.(ts|tsx|json|sql)$/;
const BRAND_HOME = "src/config/site.ts";
const GENERATED_TYPES = "src/lib/database.types.ts";

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return listFiles(path);
    return SCANNED_EXTENSIONS.test(entry) ? [path] : [];
  });
}

const brandValues = [
  siteConfig.name,
  siteConfig.shortName,
  siteConfig.licenseNumber,
  siteConfig.contact.phone,
  siteConfig.contact.email,
];

// Reads the `Constants.public.Enums` block of the generated types, e.g. `"app_role": ["student", "admin"]`.
function generatedEnums(): Map<string, string[]> {
  const source = readFileSync(join(root, GENERATED_TYPES), "utf8");
  const enums = new Map<string, string[]>();
  for (const match of source.matchAll(/"(\w+)": \[((?:"[^"]+",?\s*)+)\]/g)) {
    const values = [...match[2].matchAll(/"([^"]+)"/g)].map(
      (value) => value[1],
    );
    if (values.length > 1) enums.set(match[1], values);
  }
  return enums;
}

// A union of string literals that uses every value of the enum, in any order.
function unionPattern(values: string[]): RegExp {
  const literal = `"(?:${values.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})"`;
  return new RegExp(Array(values.length).fill(literal).join("\\s*\\|\\s*"));
}

const enumPatterns = [...generatedEnums()].map(([name, values]) => ({
  name,
  pattern: unionPattern(values),
}));

const problems: string[] = [];

for (const file of SCANNED_DIRS.flatMap((dir) => listFiles(join(root, dir)))) {
  const path = relative(root, file);
  if (path === BRAND_HOME || path === GENERATED_TYPES) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    const at = `${path}:${index + 1}`;
    for (const value of brandValues) {
      if (line.includes(value)) {
        problems.push(
          `${at}: "${value}" belongs only in ${BRAND_HOME}; read it from siteConfig`,
        );
      }
    }
    if (!path.endsWith(".ts") && !path.endsWith(".tsx")) return;
    for (const { name, pattern } of enumPatterns) {
      if (pattern.test(line)) {
        problems.push(
          `${at}: hand-written union of enum "${name}"; use Enums<"${name}">`,
        );
      }
    }
  });
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`\ncheck-conventions: ${problems.length} problem(s)`);
  process.exit(1);
}
