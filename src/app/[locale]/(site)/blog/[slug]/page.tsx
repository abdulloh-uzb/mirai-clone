import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero, V2Root } from "@/components/layout/page-hero";
import { PostCard } from "@/components/blog/post-card";
import { Markdown } from "@/components/content/markdown";
import { NotTranslatedNotice } from "@/components/content/not-translated-notice";
import { JsonLd } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { coverImage, POST_CATEGORIES } from "@/lib/blog/categories";
import { formatUsd, getOnlineCourse } from "@/lib/courses/courses";
import { getPost, relatedPosts } from "@/lib/blog/posts";
import { publicEnv } from "@/lib/env";
import { article, breadcrumbList } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const result = await getPost(slug, locale);
  if (!result) return {};
  const { item, isFallback, availableLocales } = result;
  return pageMetadata({
    locale,
    path: `/blog/${item.slug}`,
    title: item.title,
    description: item.excerpt,
    image: coverImage(item.category),
    availableLocales,
    isFallback,
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
}: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const result = await getPost(slug, locale);
  if (!result) notFound();

  const { item: post, isFallback } = result;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const format = await getFormatter();
  const related = await relatedPosts(post, locale);
  const path = `/blog/${post.slug}`;
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

  const tr = await getTranslations({ locale, namespace: "Ref.blog" });
  const online = await getOnlineCourse();
  const dateText = format.dateTime(new Date(post.published_at), {
    dateStyle: "long",
    timeZone: "UTC",
  });

  return (
    <V2Root className="bp-page">
      <JsonLd
        data={article({
          siteUrl,
          locale,
          path,
          title: post.title,
          description: post.excerpt,
          image: coverImage(post.category),
          datePublished: post.published_at,
          dateModified: post.updated_at,
        })}
      />
      <JsonLd
        data={breadcrumbList(siteUrl, locale, [
          { name: t("breadcrumbHome"), path: "/" },
          { name: t("breadcrumbBlog"), path: "/blog" },
          { name: post.title, path },
        ])}
      />
      <PageHero
        art="blog"
        className="rd-top rd-top-long"
        title={post.title}
        intro={dateText}
      >
        <div className="rd-act">
          <Link className="btn btn-ghost btn-lg" href="/blog">
            {tr("backToAll")}
          </Link>
        </div>
      </PageHero>
      <section className="rd">
        <div className="rd-in">
          <article className="rd-article prose min-w-0">
            <nav aria-label={t("breadcrumbLabel")} className="text-sm">
              <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <li>
                  <Link href="/" className="underline-offset-4 hover:underline">
                    {t("breadcrumbHome")}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href="/blog"
                    className="underline-offset-4 hover:underline"
                  >
                    {t("breadcrumbBlog")}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page">{post.title}</li>
              </ol>
            </nav>
            {isFallback ? <NotTranslatedNotice /> : null}
            <p className="bp-series">
              <Link
                href={{ pathname: "/blog", query: { category: post.category } }}
              >
                {t(`categories.${post.category}`)}
              </Link>
              <span aria-hidden> · </span>
              <time dateTime={post.published_at}>{dateText}</time>
            </p>
            <figure className="rd-cover">
              <Image
                src={coverImage(post.category)}
                alt=""
                width={1200}
                height={630}
                unoptimized
              />
            </figure>
            <div className="blog-content">
              <Markdown>{post.body}</Markdown>
            </div>
          </article>
          <aside className="rd-side bp-side" aria-label={tr("aboutLabel")}>
            <section className="bw-block">
              <h2 className="bw-t">{tr("browse")}</h2>
              <nav aria-label={t("filterLabel")}>
                <ul className="bw-list">
                  {POST_CATEGORIES.map((value) => (
                    <li key={value}>
                      <Link
                        href={{ pathname: "/blog", query: { category: value } }}
                        aria-current={
                          value === post.category ? "true" : undefined
                        }
                      >
                        {t(`categories.${value}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <Link className="bw-all" href="/blog">
                {tr("viewAll")}
              </Link>
            </section>
            <section className="bw-promo">
              <div className="bw-promo-h">
                <div>
                  <h2>{tr("promoTitle")}</h2>
                </div>
              </div>
              <p>{tr("promoBody")}</p>
              <ul className="bw-ticks">
                <li>{tr("promoTick1")}</li>
                <li>{tr("promoTick2")}</li>
                <li>
                  {tr("promoTick3", {
                    price: formatUsd(online.priceCents, locale),
                  })}
                </li>
              </ul>
              <Link className="btn btn-primary" href="/courses">
                {tr("promoCta")}
              </Link>
            </section>
          </aside>
        </div>
      </section>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="bg">
          <div className="bg-in">
            <h2 id="related-heading" className="bg-sh">
              {t("relatedHeading")}
            </h2>
            <ul className="bg-list">
              {related.map((other) => (
                <li key={other.slug}>
                  <PostCard post={other} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </V2Root>
  );
}
