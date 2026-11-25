import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
}: LayoutProps<"/[locale]/admin">) {
  const account = await getCurrentAccount();
  if (account?.role !== "admin") notFound();
  return children;
}
