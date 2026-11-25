import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { localePrefix } from "@/i18n/locale-path";
import { Link } from "@/i18n/navigation";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { parseCourseLanguage } from "@/lib/courses/course-language";
import { authPageMetadata } from "../metadata";

export function generateMetadata({ params }: PageProps<"/[locale]/signup">) {
  return authPageMetadata(params, "signUp");
}

export default async function SignUpPage({
  params,
  searchParams,
}: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Auth.signUp" });
  // "Start in {language}" sends Visitors here with ?course=; keep it so the
  // Portal opens with the chosen Course language after sign-up.
  const course = parseCourseLanguage((await searchParams).course);
  const next = course
    ? `${localePrefix(locale)}/portal?course=${course}`
    : undefined;

  return (
    <AuthCard
      title={t("title")}
      intro={t("intro")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link
            href={{ pathname: "/login", query: next ? { next } : {} }}
            className="font-medium text-primary underline"
          >
            {t("signInLink")}
          </Link>
        </>
      }
    >
      <SignUpForm next={next} />
    </AuthCard>
  );
}
