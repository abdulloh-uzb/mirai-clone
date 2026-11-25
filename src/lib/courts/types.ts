import type { Locale } from "@/i18n/routing";

export type CourthouseSummary = {
  name: string;
  city: string | null;
  courtCode: string | null;
};

export type CountySummary = {
  slug: string;
  name: string;
  seatCity: string;
  popularRank: number | null;
  courthouses: CourthouseSummary[];
};

export type CountyDetail = Omit<CountySummary, "courthouses"> & {
  caseLookupUrl: string | null;
  /** Optional Markdown addendum per language; empty until an admin writes one. */
  instructions: Partial<Record<Locale, string>>;
  courthouses: (CourthouseSummary & { address: string | null })[];
};
