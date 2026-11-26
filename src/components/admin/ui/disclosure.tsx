import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminDisclosureList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("divide-y", className)} {...props} />;
}

/** An expandable row, built on details so it needs no client JS. */
export function AdminDisclosure({
  summary,
  children,
  className,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details className={cn("group", className)}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        <ChevronRightIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
        />
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {summary}
        </span>
      </summary>
      <div className="border-t bg-muted/30 px-4 py-4">{children}</div>
    </details>
  );
}
