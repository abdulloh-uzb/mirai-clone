import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const routes = [
  { key: "courses", href: "/courses" },
  { key: "findCourt", href: "/courts" },
  { key: "dmvServices", href: "/dmv-services" },
  { key: "faq", href: "/faq" },
] as const;

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        {t("code")}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
        {t("body")}
      </p>

      {/* Green guide-sign card: white inset border, white lettering. */}
      <div className="mt-10 w-full max-w-lg rounded-2xl bg-primary p-2 text-primary-foreground shadow-lg">
        <div className="rounded-xl border-4 border-primary-foreground/90 px-6 py-6">
          <h2 className="text-sm font-bold tracking-widest uppercase">
            {t("cardTitle")}
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {routes.map((route) => (
              <li key={route.key}>
                <Link
                  href={route.href}
                  className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-lg font-semibold hover:bg-primary-foreground/15"
                >
                  {t(route.key)}
                  <ArrowUpRightIcon aria-hidden className="size-5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button asChild variant="outline" size="lg" className="mt-10">
        <Link href="/">
          <ArrowLeftIcon aria-hidden />
          {t("backHome")}
        </Link>
      </Button>
    </section>
  );
}
