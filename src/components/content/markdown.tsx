import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

function isExternal(href: string | undefined): boolean {
  return !!href && /^(https?:)?\/\//.test(href);
}

/** react-markdown passes its syntax-tree `node`; it must not reach the DOM. */
function withoutNode<P extends { node?: unknown }>(props: P): Omit<P, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest;
}

const components: Components = {
  h1: (props) => (
    <h2
      className="mt-10 text-2xl font-bold tracking-tight"
      {...withoutNode(props)}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-10 text-2xl font-bold tracking-tight"
      {...withoutNode(props)}
    />
  ),
  h3: (props) => (
    <h3 className="mt-8 text-xl font-semibold" {...withoutNode(props)} />
  ),
  h4: (props) => (
    <h4 className="mt-6 text-lg font-semibold" {...withoutNode(props)} />
  ),
  p: (props) => <p className="mt-4 leading-7" {...withoutNode(props)} />,
  ul: (props) => (
    <ul className="mt-4 list-disc space-y-2 pl-6" {...withoutNode(props)} />
  ),
  ol: (props) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6" {...withoutNode(props)} />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-4 border-l-4 border-primary/60 pl-4 text-muted-foreground"
      {...withoutNode(props)}
    />
  ),
  a: ({ href, ...props }) => (
    <a
      href={href}
      className="font-medium text-link underline underline-offset-4 hover:no-underline"
      {...(isExternal(href)
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...withoutNode(props)}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-muted px-1 py-0.5 text-sm"
      {...withoutNode(props)}
    />
  ),
  table: (props) => (
    <div className="mt-4 overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-sm"
        {...withoutNode(props)}
      />
    </div>
  ),
  th: (props) => (
    <th
      className="border-b-2 border-border px-3 py-2 font-semibold"
      {...withoutNode(props)}
    />
  ),
  td: (props) => (
    <td className="border-b border-border px-3 py-2" {...withoutNode(props)} />
  ),
  hr: () => <hr className="my-8 border-border" />,
  // Images in admin text must carry alt text; an empty alt marks them decorative.
  img: ({ alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} className="mt-4 rounded-lg" {...withoutNode(props)} />
  ),
};

/**
 * Renders admin-written Markdown. Raw HTML in the source is dropped
 * (`skipHtml`), so content can never inject markup or scripts.
 */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("text-base text-foreground", className)}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
