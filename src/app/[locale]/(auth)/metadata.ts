import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

type AuthPage =
  | "signUp"
  | "signIn"
  | "magicLink"
  | "resetRequest"
  | "resetUpdate";

/** Page title for an auth page, in the UI language of the URL. */
export async function authPageMetadata(
  params: Promise<{ locale: string }>,
  page: AuthPage,
): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: `Auth.${page}` });
  return { title: t("title") };
}
