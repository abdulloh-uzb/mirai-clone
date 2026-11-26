import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Only Admins may open the Admin area. The role is read on the server from the
 * signed-in user's own profile (RLS), and everyone else gets the ordinary 404
 * page, so the area's existence is not revealed.
 */
export default async function AdminLayout({
  children,
  breadcrumb,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const account = await getCurrentAccount();
  if (account?.role !== "admin") notFound();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return (
    <AdminShell locale={locale} account={account} breadcrumb={breadcrumb}>
      {children}
    </AdminShell>
  );
}
