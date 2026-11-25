import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { CountySummary } from "@/lib/courts/types";

/** A popular County: decorative art, name, county-seat city and a link to its page. */
export async function CountyCard({ county }: { county: CountySummary }) {
  const t = await getTranslations("Courts");
  return (
    <Link
      href={`/courts/${county.slug}`}
      className="group block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Image
        src="/placeholder/county-card.svg"
        alt=""
        width={320}
        height={160}
        unoptimized
        className="h-32 w-full object-cover"
      />
      <div className="p-4">
        <p className="text-lg font-semibold">{county.name}</p>
        <p className="text-sm text-muted-foreground">{county.seatCity}</p>
        <p className="mt-2 text-sm font-medium text-primary group-hover:underline">
          {t("popularCardCta")}
        </p>
      </div>
    </Link>
  );
}
