import { PageHero, V2Root } from "@/components/layout/page-hero";
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
    <V2Root>
      <PageHero art="blog" title={t("title")} intro={t("intro")} />
      <div className="bg">
        <div className="bg-stages">
          <div className="bg-in">
            <nav aria-label={t("filterLabel")} className="bg-bar">
              <ul className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <li key={filter.key}>
                    <Link
                      href={filter.href}
                      aria-current={filter.active ? "true" : undefined}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold",
                        filter.active
                          ? "border-[var(--blue)] bg-[var(--blue)] text-[var(--on-blue)]"
                          : "hover:bg-[var(--blue-tint)]",
                      )}
                    >
                      {filter.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {posts.length === 0 ? (
              <p className="mt-10">{t("noPosts")}</p>
            ) : (
              <section className="bg-stage">
                <ul aria-label={t("listLabel")} className="bg-list">
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <PostCard post={post} headingLevel="h3" />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </V2Root>
  );
}
