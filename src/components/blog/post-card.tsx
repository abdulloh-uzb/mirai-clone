import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { coverImage } from "@/lib/blog/categories";
import type { PostSummary } from "@/lib/blog/posts";

/** A blog post card: decorative cover, category, date, title link and excerpt. */
export async function PostCard({
  post,
  headingLevel: Heading = "h2",
}: {
  post: PostSummary;
  headingLevel?: "h2" | "h3";
}) {
  const t = await getTranslations("Blog");
  const format = await getFormatter();
  return (
    <article>
      <Link href={`/blog/${post.slug}`} className="bg-row">
        <span className="bg-row-img">
          <Image
            src={coverImage(post.category)}
            alt=""
            width={1200}
            height={630}
            unoptimized
          />
        </span>
        <span className="bg-row-body">
          <span className="bg-ser">{t(`categories.${post.category}`)}</span>
          <Heading>{post.title}</Heading>
          <p>{post.excerpt}</p>
          <span className="bg-meta">
            <time dateTime={post.publishedAt}>
              {format.dateTime(new Date(post.publishedAt), {
                dateStyle: "medium",
                timeZone: "UTC",
              })}
            </time>
          </span>
        </span>
      </Link>
    </article>
  );
}
