import type { Locale } from "@/i18n/routing";
import { detectIntent, refusalFor, type Intent } from "./guardrails";
import type { AccountTools, ReportStatusInfo } from "./tools";

// The offline responder: used when no AI_API_KEY is set. It answers account
// questions from the real tool results and everything else from the best
// knowledge-base chunk, in the user's language.

export type KbHit = {
  title: string | null;
  url: string | null;
  content: string;
};

export type OfflineDeps = {
  text: string;
  locale: Locale;
  /** null for a Visitor. */
  tools: AccountTools | null;
  search: (query: string, locale: Locale) => Promise<KbHit[]>;
};

export type OfflineResult = { text: string; intent: Intent | null };

type Strings = {
  signIn: string;
  notEnrolled: string;
  enrollment: (s: { status: string; expires: string | null }) => string;
  noCertificate: string;
  noReport: string;
  accepted: (date: string) => string;
  pending: string;
  failed: string;
  refund: (s: { pct: number; amount: string }) => string;
  noRefund: string;
  deadline: (date: string) => string;
  noDeadline: string;
  source: string;
  unsure: string;
};

const T: Record<Locale, Strings> = {
  en: {
    signIn: "Please sign in so I can look up your account.",
    notEnrolled:
      "You have not enrolled yet, so there is nothing on your account to look up. You can start from the Courses page.",
    enrollment: ({ status, expires }) =>
      `Your enrollment is ${status}.${expires ? ` Access runs until ${expires}.` : ""}`,
    noCertificate:
      "You are enrolled, but no certificate has been issued yet, so nothing has been reported to the DMV. Finish the course and pass the final exam first.",
    noReport:
      "Your certificate is issued. The completion has not been queued for the DMV yet; reports go out at 9:00, 13:00 and 17:00 Pacific time.",
    accepted: (date) => `Yes — the DMV confirmed your completion on ${date}.`,
    pending:
      "Your completion has been queued or sent to the DMV and is waiting for confirmation. Reports go out at 9:00, 13:00 and 17:00 Pacific time.",
    failed:
      "The DMV report did not go through yet. We retry it, and you can talk to a person if it stays stuck.",
    refund: ({ pct, amount }) =>
      `You are eligible for a ${pct}% refund (${amount}).`,
    noRefund:
      "Your order is not eligible for a refund under the refund policy.",
    deadline: (date) => `Your court due date is ${date}.`,
    noDeadline: "You have not added a court due date to your enrollment.",
    source: "Source",
    unsure:
      "I'm not sure about that. You can talk to a person and we will get back to you.",
  },
  ja: {
    signIn: "アカウントを確認するには、ログインしてください。",
    notEnrolled:
      "まだ受講登録がないため、確認できる情報がありません。コース一覧から始められます。",
    enrollment: ({ status, expires }) =>
      `受講状況は「${status}」です。${expires ? `利用期限は ${expires} までです。` : ""}`,
    noCertificate:
      "受講登録はありますが、修了証がまだ発行されていないため、DMV には何も報告されていません。コースと最終試験を完了してください。",
    noReport:
      "修了証は発行済みです。DMV への報告はまだキューに入っていません。報告は太平洋時間の 9:00、13:00、17:00 に送信されます。",
    accepted: (date) => `はい、DMV は ${date} に修了を確認しました。`,
    pending:
      "修了は DMV に送信待ち、または送信済みで、確認を待っています。報告は太平洋時間の 9:00、13:00、17:00 に送信されます。",
    failed:
      "DMV への報告はまだ完了していません。再送を行います。解決しない場合は担当者にご相談ください。",
    refund: ({ pct, amount }) => `${pct}% の返金対象です（${amount}）。`,
    noRefund: "ご注文は返金ポリシー上、返金の対象外です。",
    deadline: (date) => `裁判所の期日は ${date} です。`,
    noDeadline: "受講登録に裁判所の期日が入力されていません。",
    source: "出典",
    unsure:
      "申し訳ありません、はっきり分かりません。担当者に相談していただければ、後ほどご連絡します。",
  },
  es: {
    signIn: "Inicia sesión para que pueda consultar tu cuenta.",
    notEnrolled:
      "Todavía no te has inscrito, así que no hay nada que consultar en tu cuenta. Puedes empezar desde la página de cursos.",
    enrollment: ({ status, expires }) =>
      `Tu inscripción está ${status}.${expires ? ` El acceso dura hasta ${expires}.` : ""}`,
    noCertificate:
      "Estás inscrito, pero aún no se ha emitido un certificado, así que no se ha reportado nada al DMV. Primero termina el curso y aprueba el examen final.",
    noReport:
      "Tu certificado está emitido. La finalización aún no está en cola para el DMV; los reportes salen a las 9:00, 13:00 y 17:00 hora del Pacífico.",
    accepted: (date) =>
      `Sí: el DMV recibió y confirmó tu finalización el ${date}.`,
    pending:
      "Tu finalización está en cola o enviada al DMV y espera confirmación. Los reportes salen a las 9:00, 13:00 y 17:00 hora del Pacífico.",
    failed:
      "El reporte al DMV aún no se completó. Lo reintentamos y puedes hablar con una persona si sigue atascado.",
    refund: ({ pct, amount }) =>
      `Tienes derecho a un reembolso del ${pct}% (${amount}).`,
    noRefund:
      "Tu pedido no es elegible para reembolso según la política de reembolsos.",
    deadline: (date) => `La fecha límite del tribunal es el ${date}.`,
    noDeadline:
      "No has añadido una fecha límite del tribunal a tu inscripción.",
    source: "Fuente",
    unsure:
      "No estoy seguro. Puedes hablar con una persona y te responderemos.",
  },
  ru: {
    signIn: "Войдите в аккаунт, чтобы я мог посмотреть ваши данные.",
    notEnrolled:
      "Вы ещё не записались на курс, поэтому в аккаунте нечего проверять. Начать можно на странице курсов.",
    enrollment: ({ status, expires }) =>
      `Статус вашей записи: ${status}.${expires ? ` Доступ действует до ${expires}.` : ""}`,
    noCertificate:
      "Вы записаны, но сертификат ещё не выдан, поэтому в DMV ничего не отправлено. Сначала завершите курс и сдайте итоговый экзамен.",
    noReport:
      "Сертификат выдан. Завершение ещё не поставлено в очередь для DMV; отчёты уходят в 9:00, 13:00 и 17:00 по тихоокеанскому времени.",
    accepted: (date) => `Да, DMV получил и подтвердил ваше завершение ${date}.`,
    pending:
      "Ваше завершение поставлено в очередь или отправлено в DMV и ждёт подтверждения. Отчёты уходят в 9:00, 13:00 и 17:00 по тихоокеанскому времени.",
    failed:
      "Отчёт в DMV пока не прошёл. Мы повторяем отправку, а если ничего не меняется, свяжитесь с сотрудником.",
    refund: ({ pct, amount }) => `Вам полагается возврат ${pct}% (${amount}).`,
    noRefund: "По правилам возврата ваш заказ не подлежит возврату.",
    deadline: (date) => `Срок явки в суд: ${date}.`,
    noDeadline: "В вашей записи не указан срок явки в суд.",
    source: "Источник",
    unsure: "Не уверен в ответе. Свяжитесь с сотрудником, и мы вам ответим.",
  },
};

const STATUS_LABELS: Record<string, Record<Locale, string>> = {
  active: { en: "active", ja: "有効", es: "activa", ru: "активна" },
  paused: {
    en: "paused",
    ja: "一時停止",
    es: "en pausa",
    ru: "приостановлена",
  },
  locked: {
    en: "locked",
    ja: "ロック中",
    es: "bloqueada",
    ru: "заблокирована",
  },
  completed: {
    en: "completed",
    ja: "修了",
    es: "completada",
    ru: "завершена",
  },
  expired: { en: "expired", ja: "期限切れ", es: "vencida", ru: "истекла" },
  refunded: {
    en: "refunded",
    ja: "返金済み",
    es: "reembolsada",
    ru: "возвращена",
  },
};

const BCP47: Record<Locale, string> = {
  en: "en-US",
  ja: "ja-JP",
  es: "es-US",
  ru: "ru-RU",
};

function formatDate(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(BCP47[locale], {
    dateStyle: "long",
    timeZone: "America/Los_Angeles",
  }).format(date);
}

function reportAnswer(info: ReportStatusInfo, locale: Locale): string {
  const t = T[locale];
  if (!info.enrolled) return t.notEnrolled;
  if (!info.certificateIssued) return t.noCertificate;
  switch (info.reportStatus) {
    case "accepted":
      return t.accepted(formatDate(info.updatedAt ?? "", locale));
    case "queued":
    case "sent":
      return t.pending;
    case "rejected":
    case "error":
      return t.failed;
    default:
      return t.noReport;
  }
}

function excerpt(content: string): string {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length > 400 ? `${clean.slice(0, 397)}…` : clean;
}

export async function offlineAnswer(deps: OfflineDeps): Promise<OfflineResult> {
  const { text, locale, tools, search } = deps;
  const t = T[locale];
  const intent = detectIntent(text);

  const refusal = refusalFor(intent, locale);
  if (refusal) return { text: refusal, intent };

  if (
    intent === "report_status" ||
    intent === "enrollment" ||
    intent === "refund" ||
    intent === "deadline"
  ) {
    if (!tools) return { text: t.signIn, intent };
    if (intent === "report_status") {
      return {
        text: reportAnswer(await tools.getMyReportStatus(), locale),
        intent,
      };
    }
    if (intent === "enrollment") {
      const info = await tools.getMyEnrollment();
      if (!info.enrolled) return { text: t.notEnrolled, intent };
      return {
        text: t.enrollment({
          status: STATUS_LABELS[info.status]?.[locale] ?? info.status,
          expires: info.expiresAt ? formatDate(info.expiresAt, locale) : null,
        }),
        intent,
      };
    }
    if (intent === "refund") {
      const info = await tools.getMyRefundEligibility();
      if (!info.enrolled) return { text: t.notEnrolled, intent };
      if (!info.eligible) return { text: t.noRefund, intent };
      return {
        text: t.refund({
          pct: info.pct,
          amount: new Intl.NumberFormat(BCP47[locale], {
            style: "currency",
            currency: "USD",
          }).format(info.amountCents / 100),
        }),
        intent,
      };
    }
    const info = await tools.getMyCourtDeadline();
    if (!info.enrolled) return { text: t.notEnrolled, intent };
    return {
      text: info.courtDueDate
        ? t.deadline(formatDate(`${info.courtDueDate}T12:00:00Z`, locale))
        : t.noDeadline,
      intent,
    };
  }

  const hits = await search(text, locale);
  const top = hits[0];
  if (!top) return { text: t.unsure, intent };
  const source = top.url ? `\n\n${t.source}: ${top.url}` : "";
  return { text: `${excerpt(top.content)}${source}`, intent };
}
