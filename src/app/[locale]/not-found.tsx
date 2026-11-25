import {
  ArrowDownLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const routes = [
  { key: "courses", href: "/courses", icon: ArrowUpIcon },
  { key: "findCourt", href: "/courts", icon: ArrowUpRightIcon },
  { key: "dmvServices", href: "/dmv-services", icon: ArrowRightIcon },
  { key: "faq", href: "/faq", icon: ArrowDownLeftIcon },
] as const;

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <section className="bg-gradient-to-b from-surface-sky to-surface-mint">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
        <p className="text-[13px] font-semibold text-muted-foreground">
          {t("code")}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-xl text-base text-pretty text-muted-foreground">
          {t("body")}
        </p>

        {/* Green highway guide sign: white inset border, four direction rows. */}
        <div className="mt-10 w-full max-w-[620px] rounded-3xl bg-[#14602d] p-1 shadow-lg">
          <div className="rounded-[20px] border-4 border-white bg-[#1b7f3c] text-left text-white">
            <h2 className="sr-only">{t("cardTitle")}</h2>
            <ul className="divide-y divide-white/70">
              {routes.map(({ key, href, icon: Icon }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/15 focus-visible:outline-white"
                  >
                    <Icon aria-hidden className="size-7 shrink-0" />
                    <span className="text-xl font-bold sm:text-[22px]">
                      {t(key)}
                    </span>
                    <span className="ml-auto hidden max-w-[45%] text-right text-[13px] text-white/90 sm:block">
                      {t(`${key}Sub`)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Two roadside posts under the sign. */}
        <div aria-hidden className="flex w-[260px] justify-between">
          <span className="h-10 w-4 rounded-b-md bg-slate-400 dark:bg-slate-600" />
          <span className="h-10 w-4 rounded-b-md bg-slate-400 dark:bg-slate-600" />
        </div>

        <p className="mt-10 text-sm font-semibold">
          <Link
            href="/"
            className="rounded-sm text-[#0a52b8] underline underline-offset-4 dark:text-primary"
          >
            {t("backHome")}
          </Link>
        </p>
      </div>
    </section>
  );
}
