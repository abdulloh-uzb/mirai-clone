"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// The form (react-hook-form and zod) loads only when the dialog opens.
const BugReportForm = dynamic(
  () => import("./bug-report-form").then((m) => m.BugReportForm),
  { ssr: false },
);

/**
 * The "Got a problem?" dialog. `trigger` is the button or link that opens it.
 * `accountEmail` comes from the server for a signed-in Student; the server
 * action ignores any email the browser sends in that case.
 */
export function BugReportDialog({
  trigger,
  accountEmail,
}: {
  trigger: ReactNode;
  accountEmail?: string;
}) {
  const t = useTranslations("BugReport");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={t("close")}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the page URL is read when it opens. */}
        <BugReportForm accountEmail={accountEmail} />
      </DialogContent>
    </Dialog>
  );
}
