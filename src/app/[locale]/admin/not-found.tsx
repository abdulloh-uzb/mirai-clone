import { useTranslations } from "next-intl";
import { adminButtonVariants } from "@/components/admin/ui/button";
import { Link } from "@/i18n/navigation";

/** Shown inside the Admin shell, for Admins only. */
export default function AdminNotFound() {
  const t = useTranslations("Admin");
  return (
    <div className="flex flex-col items-start gap-3 py-16">
      <p className="text-xs font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("shell.notFoundTitle")}
      </h1>
      <p className="text-muted-foreground">{t("shell.notFoundBody")}</p>
      <Link
        href="/admin"
        className={adminButtonVariants({ variant: "outline", size: "sm" })}
      >
        {t("shell.backToDashboard")}
      </Link>
    </div>
  );
}
