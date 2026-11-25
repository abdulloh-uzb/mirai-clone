import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { Markdown } from "@/components/content/markdown";
import { NotTranslatedNotice } from "@/components/content/not-translated-notice";
import { JsonLd } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { coverImage } from "@/lib/blog/categories";
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
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
      <nav aria-label={t("breadcrumbLabel")} className="text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <li>
            <Link href="/" className="underline-offset-4 hover:underline">
              {t("breadcrumbHome")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/blog" className="underline-offset-4 hover:underline">
              {t("breadcrumbBlog")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page">{post.title}</li>
        </ol>
      </nav>

      <article className="mt-6">
        {isFallback ? <NotTranslatedNotice /> : null}
        <p className="mt-6 text-sm text-muted-foreground">
          <Link
            href={{ pathname: "/blog", query: { category: post.category } }}
            className="underline-offset-4 hover:underline"
          >
            {t(`categories.${post.category}`)}
          </Link>
          <span aria-hidden> · </span>
          <time dateTime={post.published_at}>
            {format.dateTime(new Date(post.published_at), {
              dateStyle: "long",
              timeZone: "UTC",
            })}
          </time>
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance">
          {post.title}
        </h1>
        <Markdown>{post.body}</Markdown>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2
            id="related-heading"
            className="text-2xl font-bold tracking-tight"
          >
            {t("relatedHeading")}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.map((other) => (
              <li key={other.slug} className="flex">
                <div className="flex w-full flex-col">
                  <PostCard post={other} headingLevel="h3" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
