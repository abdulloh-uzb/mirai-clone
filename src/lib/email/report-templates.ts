import { siteConfig } from "@/config/site";
import type { EmailMessage } from "./types";

type Message = Omit<EmailMessage, "to">;
type UiLocale = "en" | "ja" | "es" | "ru";
export type ReportEmailStatus = "sent" | "accepted" | "rejected";

type Copy = { subject: string; body: string };

const COPY: Record<UiLocale, Record<ReportEmailStatus, Copy>> = {
  en: {
    sent: {
      subject: "Your completion was sent to the DMV",
      body: "We sent your course completion to the DMV. We will let you know when it is confirmed.",
    },
    accepted: {
      subject: "The DMV confirmed your completion",
      body: "The DMV confirmed your completion and the court has been notified.",
    },
    rejected: {
      subject: "We are fixing your completion report",
      body: "The DMV could not match your completion. Our team is fixing this and will resend it. You do not need to do anything.",
    },
  },
  ja: {
    sent: {
      subject: "修了情報をDMVに送信しました",
      body: "コースの修了情報をDMVに送信しました。確認されましたらお知らせします。",
    },
    accepted: {
      subject: "DMVが修了を確認しました",
      body: "DMVが修了を確認し、裁判所にも通知しました。",
    },
    rejected: {
      subject: "修了報告を修正しています",
      body: "DMVで修了情報を照合できませんでした。当校で修正して再送します。お客様の操作は不要です。",
    },
  },
  es: {
    sent: {
      subject: "Enviamos tu finalización al DMV",
      body: "Enviamos al DMV la finalización de tu curso. Te avisaremos cuando se confirme.",
    },
    accepted: {
      subject: "El DMV confirmó tu finalización",
      body: "El DMV confirmó tu finalización y se notificó al tribunal.",
    },
    rejected: {
      subject: "Estamos corrigiendo tu reporte de finalización",
      body: "El DMV no pudo validar tu finalización. Nuestro equipo lo está corrigiendo y lo reenviará. No necesitas hacer nada.",
    },
  },
  ru: {
    sent: {
      subject: "Данные о завершении курса отправлены в DMV",
      body: "Мы отправили в DMV данные о завершении курса. Сообщим, когда они будут подтверждены.",
    },
    accepted: {
      subject: "DMV подтвердил завершение курса",
      body: "DMV подтвердил завершение курса, суд уведомлён.",
    },
    rejected: {
      subject: "Мы исправляем отчёт о завершении курса",
      body: "DMV не смог сопоставить данные о завершении. Наша команда исправит это и отправит повторно. От вас ничего не требуется.",
    },
  },
};

export function reportStatusEmail(input: {
  locale: UiLocale;
  status: ReportEmailStatus;
  name: string;
}): Message {
  const { subject, body } = COPY[input.locale][input.status];
  return {
    subject,
    text: [input.name, "", body, "", siteConfig.name].join("\n"),
  };
}
