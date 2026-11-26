import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The school's logo image. Its wordmark is dark, so in dark mode it sits on a
 * light chip to stay readable.
 */
export function BrandLogo({
  height = 36,
  className,
  priority,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const { src, width: w, height: h } = siteConfig.logo;
  return (
    <span
      className={cn(
        "inline-flex items-center dark:rounded-md dark:bg-white dark:px-1.5 dark:py-0.5",
        className,
      )}
    >
      <Image
        src={src}
        alt={siteConfig.name}
        width={Math.round((w / h) * height)}
        height={height}
        priority={priority}
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
