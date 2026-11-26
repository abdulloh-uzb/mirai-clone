import { Markdown } from "@/components/content/markdown";

export function RichTextBlock({ markdown }: { markdown: string }) {
  return (
    <Markdown className="text-[18px] leading-[1.65] [&>*:first-child]:mt-0">
      {markdown}
    </Markdown>
  );
}
