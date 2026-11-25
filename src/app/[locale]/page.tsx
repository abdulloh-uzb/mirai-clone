import { useTranslations } from "next-intl";

// Placeholder home page. The real home page is built in phase 2.
export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-6 text-lg text-pretty text-muted-foreground">
        {t("intro")}
      </p>
    </section>
  );
}
