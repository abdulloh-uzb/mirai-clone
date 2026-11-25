import { Markdown } from "@/components/content/markdown";

export function RichTextBlock({ markdown }: { markdown: string }) {
  return <Markdown>{markdown}</Markdown>;
}
