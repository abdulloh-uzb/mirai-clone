import { notFound } from "next/navigation";

/** Fallback for `children` when only the breadcrumb catch-all matched. */
export default function AdminDefault() {
  notFound();
}
