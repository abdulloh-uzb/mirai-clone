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
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
      <Image
        src={coverImage(post.category)}
        alt=""
        width={1200}
        height={630}
        unoptimized
        className="aspect-[1200/630] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-muted-foreground">
          <span>{t(`categories.${post.category}`)}</span>
          <span aria-hidden> · </span>
          <time dateTime={post.publishedAt}>
            {format.dateTime(new Date(post.publishedAt), {
              dateStyle: "medium",
              timeZone: "UTC",
            })}
          </time>
        </p>
        <Heading className="mt-2 text-xl font-semibold text-balance">
          <Link
            href={`/blog/${post.slug}`}
            className="underline-offset-4 hover:underline focus-visible:underline"
          >
            {post.title}
          </Link>
        </Heading>
        <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
      </div>
    </article>
  );
}
