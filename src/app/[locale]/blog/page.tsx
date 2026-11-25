import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { isPostCategory, POST_CATEGORIES } from "@/lib/blog/categories";
import { listPosts } from "@/lib/blog/posts";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Blog" });
  return pageMetadata({
    locale,
    path: "/blog",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function BlogPage({
  params,
  searchParams,
}: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { category: rawCategory } = await searchParams;
  // An unknown category shows every post instead of an error.
  const category = isPostCategory(rawCategory) ? rawCategory : undefined;

  const t = await getTranslations({ locale, namespace: "Blog" });
  const posts = await listPosts(locale, category);

  const filters = [
    { key: "all", label: t("all"), href: "/blog", active: !category },
    ...POST_CATEGORIES.map((value) => ({
      key: value,
      label: t(`categories.${value}`),
      href: { pathname: "/blog", query: { category: value } },
      active: category === value,
    })),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-balance">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t("intro")}</p>

      <nav aria-label={t("filterLabel")} className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <li key={filter.key}>
              <Link
                href={filter.href}
                aria-current={filter.active ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  filter.active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {filter.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t("noPosts")}</p>
      ) : (
        <ul
          aria-label={t("listLabel")}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((post) => (
            <li key={post.slug} className="flex">
              <div className="flex w-full flex-col">
                <PostCard post={post} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
