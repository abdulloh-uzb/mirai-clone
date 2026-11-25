import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/markdown";
import { NotTranslatedNotice } from "@/components/content/not-translated-notice";
import { routing } from "@/i18n/routing";
import { listChangelog } from "@/lib/content/changelog";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/whats-new">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "WhatsNew" });
  return pageMetadata({
    locale,
    path: "/whats-new",
    title: t("metaTitle"),
    description: t("intro"),
  });
}

export default async function WhatsNewPage({
  params,
}: PageProps<"/[locale]/whats-new">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, format, entries] = await Promise.all([
    getTranslations({ locale, namespace: "WhatsNew" }),
    getFormatter({ locale }),
    listChangelog(locale),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-balance">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{t("intro")}</p>
      <ol className="mt-10 grid gap-10">
        {entries.map(({ slug, item, isFallback }) => (
          <li key={slug}>
            <article
              id={slug}
              className="scroll-mt-24 border-l-4 border-primary/60 pl-5"
            >
              <time
                dateTime={item.published_at}
                className="text-sm text-muted-foreground"
              >
                {format.dateTime(new Date(item.published_at), {
                  dateStyle: "long",
                  timeZone: "America/Los_Angeles",
                })}
              </time>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                <a href={`#${slug}`} className="hover:underline">
                  {item.title}
                </a>
              </h2>
              {isFallback ? (
                <div className="mt-3">
                  <NotTranslatedNotice />
                </div>
              ) : null}
              <Markdown>{item.body}</Markdown>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
