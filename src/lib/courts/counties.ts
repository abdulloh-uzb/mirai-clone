import "server-only";
import { routing, type Locale } from "@/i18n/routing";
import { cachedContent, contentTags } from "@/lib/content/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type { CountyDetail, CountySummary } from "./types";

const STATE_CODE = "CA";

/** Keeps only the languages we know, with non-empty text. */
function parseInstructions(value: unknown): CountyDetail["instructions"] {
  const result: CountyDetail["instructions"] = {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return result;
  }
  const record = value as Record<string, unknown>;
  for (const locale of routing.locales satisfies readonly Locale[]) {
    const text = record[locale];
    if (typeof text === "string" && text.trim()) result[locale] = text;
  }
  return result;
}

/** Every California County by name, each with its Courthouses. */
export const listCounties = cachedContent(
  async (): Promise<CountySummary[]> => {
    const { data, error } = await createAnonClient()
      .from("counties")
      .select(
        "slug, name, seat_city, popular_rank, courts(name, city, court_code, slug)",
      )
      .eq("state_code", STATE_CODE)
      .order("name");
    if (error) throw error;
    return data.map((county) => ({
      slug: county.slug,
      name: county.name,
      seatCity: county.seat_city,
      popularRank: county.popular_rank,
      courthouses: [...county.courts]
        .sort((a, b) => (a.court_code ?? "").localeCompare(b.court_code ?? ""))
        .map((court) => ({
          name: court.name,
          city: court.city,
          courtCode: court.court_code,
        })),
    }));
  },
  "list-counties",
  contentTags.courts,
);

/** One County with its Courthouses, or null for an unknown slug. */
export const getCountyBySlug = cachedContent(
  async (slug: string): Promise<CountyDetail | null> => {
    const { data, error } = await createAnonClient()
      .from("counties")
      .select(
        "slug, name, seat_city, popular_rank, case_lookup_url, instructions, courts(name, city, court_code, address, slug)",
      )
      .eq("state_code", STATE_CODE)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      slug: data.slug,
      name: data.name,
      seatCity: data.seat_city,
      popularRank: data.popular_rank,
      caseLookupUrl: data.case_lookup_url,
      instructions: parseInstructions(data.instructions),
      courthouses: [...data.courts]
        .sort((a, b) => (a.court_code ?? "").localeCompare(b.court_code ?? ""))
        .map((court) => ({
          name: court.name,
          city: court.city,
          courtCode: court.court_code,
          address: court.address,
        })),
    };
  },
  "county-by-slug",
  contentTags.courts,
);
