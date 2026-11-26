import { PageHero, V2Root } from "@/components/layout/page-hero";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogSearch, BlogSearchForm } from "@/components/blog/blog-search";
import { PostCard } from "@/components/blog/post-card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  coverImage,
  isPostCategory,
  POST_CATEGORIES,
} from "@/lib/blog/categories";
import { listPosts } from "@/lib/blog/posts";
import { pageMetadata } from "@/lib/seo/page-metadata";

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

  const tr = await getTranslations({ locale, namespace: "Ref.blog" });
  const format = await getFormatter();
  const lead = posts[0];
  const currentLabel = category ? t(`categories.${category}`) : t("all");

  return (
    <V2Root>
      <BlogSearch noResults={tr("noResults")}>
        <PageHero
          art="blog"
          className="bg-top"
          title={t("title")}
          intro={t("intro")}
        >
          <BlogSearchForm label={tr("searchLabel")} goLabel={tr("searchGo")} />
        </PageHero>
        <div className="bg">
          {lead ? (
            <section className="bg-feat" aria-label={tr("featured")}>
              <div className="bg-in">
                <Link className="bg-lead" href={`/blog/${lead.slug}`}>
                  <span className="bg-lead-img">
                    <Image
                      src={coverImage(lead.category)}
                      alt=""
                      width={1400}
                      height={875}
                      unoptimized
                      priority
                    />
                  </span>
                  <span className="bg-lead-body">
                    <span className="bg-ser">
                      {t(`categories.${lead.category}`)}
                    </span>
                    <h2>{lead.title}</h2>
                    <p>{lead.excerpt}</p>
                    <span className="bg-meta">
                      {format.dateTime(new Date(lead.publishedAt), {
                        dateStyle: "long",
                        timeZone: "UTC",
                      })}
                    </span>
                    <span className="bg-more">{tr("readGuide")}</span>
                  </span>
                </Link>
              </div>
            </section>
          ) : null}
          <nav aria-label={t("filterLabel")} className="bg-bar">
            <ol>
              {filters.map((filter, index) => (
                <li key={filter.key}>
                  <Link
                    href={filter.href}
                    aria-current={filter.active ? "true" : undefined}
                  >
                    <span className="bg-n" aria-hidden="true">
                      {index + 1}
                    </span>
                    {filter.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="bg-stages" id="blog-posts">
            <div className="bg-in">
              {posts.length === 0 ? (
                <p>{t("noPosts")}</p>
              ) : (
                <section className="bg-stage" aria-labelledby="stage-h">
                  <div className="bg-sh">
                    <h2 id="stage-h">{currentLabel}</h2>
                    <span className="bg-cnt">
                      {tr("count", { count: posts.length })}
                    </span>
                  </div>
                  <ul aria-label={t("listLabel")} className="bg-list">
                    {posts.map((post) => (
                      <li
                        key={post.slug}
                        data-post
                        className="[&[hidden]]:hidden"
                      >
                        <PostCard post={post} headingLevel="h3" />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </BlogSearch>
    </V2Root>
  );
}
