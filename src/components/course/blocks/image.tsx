import Image from "next/image";

export function ImageBlock({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border">
      <Image
        src={src}
        alt={alt}
        width={960}
        height={540}
        className="h-auto w-full"
        unoptimized={src.endsWith(".svg")}
      />
      {caption ? (
        <figcaption className="px-4 py-2 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
