"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";

const POLL_MS = 2000;
const GIVE_UP_MS = 60_000;

/**
 * Shown on `/portal?paid=1` until the webhook has created the enrollment. It
 * only reads: it polls and refreshes, and never creates anything.
 */
export function PaymentPending() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const started = Date.now();
    let stopped = false;
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/portal/enrollment", {
          cache: "no-store",
        });
        if (res.ok && ((await res.json()) as { enrolled: boolean }).enrolled) {
          if (!stopped) router.replace("/portal");
          return;
        }
      } catch {
        // Try again on the next tick.
      }
      if (Date.now() - started >= GIVE_UP_MS && !stopped) {
        stopped = true;
        clearInterval(timer);
        setSlow(true);
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [router]);

  return (
    <div role="status" className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-bold">{t("confirming")}</h2>
      <p className="mt-2 text-muted-foreground">
        {slow ? t("slow") : t("confirmingText")}
      </p>
    </div>
  );
}
