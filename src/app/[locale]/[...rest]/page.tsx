import { notFound } from "next/navigation";

// Any path no page claims (including sections not built yet) shows the
// localized 404 from `[locale]/not-found.tsx`, inside the page frame.
export default function CatchAll() {
  notFound();
}
