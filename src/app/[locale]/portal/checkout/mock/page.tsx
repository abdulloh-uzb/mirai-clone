import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { z } from "zod";
import { MockCheckoutRedirect } from "@/components/portal/mock-checkout-redirect";
import { routing } from "@/i18n/routing";
import { mockCheckoutAllowed } from "@/lib/stripe/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Mock payments mode only: hands off to the mock checkout route. */
export default async function MockCheckoutPage({
  params,
  searchParams,
}: PageProps<"/[locale]/portal/checkout/mock">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !mockCheckoutAllowed()) notFound();
  const order = z.uuid().safeParse((await searchParams).order);
  if (!order.success) notFound();
  // Route handlers are not locale-prefixed.
  const href = `/api/stripe/mock-checkout?order=${order.data}`;
  return <MockCheckoutRedirect href={href} label="Continue to payment" />;
}
