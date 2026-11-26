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
    <figure className="overflow-hidden rounded-[22px] border border-line-blue bg-hero">
      <Image
        src={src}
        alt={alt}
        width={960}
        height={540}
        className="h-auto w-full"
        unoptimized={src.endsWith(".svg")}
      />
      {caption ? (
        <figcaption className="bg-card px-5 py-3 text-[15px] text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
