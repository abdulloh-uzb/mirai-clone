import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// The refund queue now lives in the Admin Orders module.
export default async function AdminRefundsPage({
  params,
}: PageProps<"/[locale]/admin/refunds">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  redirect({ href: "/admin/orders?tab=refunds", locale });
}
