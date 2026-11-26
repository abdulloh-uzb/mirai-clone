import { SearchIcon } from "lucide-react";
import Form from "next/form";
import { cn } from "@/lib/utils";
import { AdminInput } from "./ui/input";

/** A GET search box; the param name `q` is what the Students page reads. */
export function AdminSearch({
  action,
  label,
  placeholder,
  className,
}: {
  action: string;
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <Form action={action} role="search" className={cn("relative", className)}>
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <AdminInput
        type="search"
        name="q"
        aria-label={label}
        placeholder={placeholder}
        maxLength={100}
        className="h-8 pl-8"
      />
    </Form>
  );
}
