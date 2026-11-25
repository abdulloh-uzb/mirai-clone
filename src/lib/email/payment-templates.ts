import { siteConfig } from "@/config/site";
import type { EmailMessage } from "./types";

// Payment emails in the four UI languages (picked by profiles.preferred_locale).

type Message = Omit<EmailMessage, "to">;
type UiLocale = "en" | "ja" | "es" | "ru";
type Parts = { subject: string; lines: string[] };

const RECEIPT: Record<
  UiLocale,
  (i: { name: string; id: string; amount: string; date: string }) => Parts
> = {
  en: (i) => ({
    subject: `Your receipt ${i.id}`,
    lines: [
      `Hi ${i.name},`,
      "",
      "Thank you for your payment.",
      `Order: ${i.id}`,
      `Amount: ${i.amount}`,
      `Date: ${i.date}`,
    ],
  }),
  ja: (i) => ({
    subject: `領収書 ${i.id}`,
    lines: [
      `${i.name} 様`,
      "",
      "お支払いありがとうございます。",
      `注文番号: ${i.id}`,
      `金額: ${i.amount}`,
      `日付: ${i.date}`,
    ],
  }),
  es: (i) => ({
    subject: `Tu recibo ${i.id}`,
    lines: [
      `Hola ${i.name},`,
      "",
      "Gracias por tu pago.",
      `Pedido: ${i.id}`,
      `Importe: ${i.amount}`,
      `Fecha: ${i.date}`,
    ],
  }),
  ru: (i) => ({
    subject: `Ваш чек ${i.id}`,
    lines: [
      `Здравствуйте, ${i.name}!`,
      "",
      "Спасибо за оплату.",
      `Заказ: ${i.id}`,
      `Сумма: ${i.amount}`,
      `Дата: ${i.date}`,
    ],
  }),
};

const WELCOME: Record<
  UiLocale,
  (i: { name: string; language: string; url: string }) => Parts
> = {
  en: (i) => ({
    subject: `Welcome to ${siteConfig.name}`,
    lines: [
      `Hi ${i.name},`,
      "",
      `You are enrolled. Your course language is ${i.language}.`,
      `Start here: ${i.url}`,
    ],
  }),
  ja: (i) => ({
    subject: `${siteConfig.name}へようこそ`,
    lines: [
      `${i.name} 様`,
      "",
      `受講登録が完了しました。コースの言語は${i.language}です。`,
      `こちらから開始: ${i.url}`,
    ],
  }),
  es: (i) => ({
    subject: `Bienvenido a ${siteConfig.name}`,
    lines: [
      `Hola ${i.name},`,
      "",
      `Ya estás inscrito. El idioma de tu curso es ${i.language}.`,
      `Empieza aquí: ${i.url}`,
    ],
  }),
  ru: (i) => ({
    subject: `Добро пожаловать в ${siteConfig.name}`,
    lines: [
      `Здравствуйте, ${i.name}!`,
      "",
      `Вы записаны на курс. Язык курса: ${i.language}.`,
      `Начать: ${i.url}`,
    ],
  }),
};

const finish = ({ subject, lines }: Parts): Message => ({
  subject,
  text: [...lines, "", siteConfig.name].join("\n"),
});

export function receiptEmail(input: {
  locale: UiLocale;
  name: string;
  orderId: string;
  amount: string;
  date: string;
}): Message {
  return finish(
    RECEIPT[input.locale]({
      name: input.name,
      id: input.orderId.slice(0, 8).toUpperCase(),
      amount: input.amount,
      date: input.date,
    }),
  );
}

export function welcomeEmail(input: {
  locale: UiLocale;
  name: string;
  language: string;
  url: string;
}): Message {
  return finish(WELCOME[input.locale](input));
}

const REFUND_REQUESTED: Record<
  UiLocale,
  (i: { name: string; amount: string }) => Parts
> = {
  en: (i) => ({
    subject: "We received your refund request",
    lines: [
      `Hi ${i.name},`,
      "",
      `We received your refund request for ${i.amount}. An administrator will review it soon.`,
    ],
  }),
  ja: (i) => ({
    subject: "返金リクエストを受け付けました",
    lines: [
      `${i.name} 様`,
      "",
      `${i.amount} の返金リクエストを受け付けました。管理者が確認します。`,
    ],
  }),
  es: (i) => ({
    subject: "Recibimos tu solicitud de reembolso",
    lines: [
      `Hola ${i.name},`,
      "",
      `Recibimos tu solicitud de reembolso por ${i.amount}. Un administrador la revisará pronto.`,
    ],
  }),
  ru: (i) => ({
    subject: "Мы получили ваш запрос на возврат",
    lines: [
      `Здравствуйте, ${i.name}!`,
      "",
      `Мы получили ваш запрос на возврат ${i.amount}. Администратор скоро его рассмотрит.`,
    ],
  }),
};

const REFUND_PROCESSED: Record<
  UiLocale,
  (i: { name: string; amount: string }) => Parts
> = {
  en: (i) => ({
    subject: "Your refund was processed",
    lines: [
      `Hi ${i.name},`,
      "",
      `Your refund of ${i.amount} was processed. Course access has ended.`,
    ],
  }),
  ja: (i) => ({
    subject: "返金が完了しました",
    lines: [
      `${i.name} 様`,
      "",
      `${i.amount} の返金が完了しました。コースへのアクセスは終了しました。`,
    ],
  }),
  es: (i) => ({
    subject: "Tu reembolso fue procesado",
    lines: [
      `Hola ${i.name},`,
      "",
      `Tu reembolso de ${i.amount} fue procesado. El acceso al curso ha terminado.`,
    ],
  }),
  ru: (i) => ({
    subject: "Ваш возврат выполнен",
    lines: [
      `Здравствуйте, ${i.name}!`,
      "",
      `Возврат ${i.amount} выполнен. Доступ к курсу закрыт.`,
    ],
  }),
};

export function refundRequestedEmail(input: {
  locale: UiLocale;
  name: string;
  amount: string;
}): Message {
  return finish(REFUND_REQUESTED[input.locale](input));
}

export function refundProcessedEmail(input: {
  locale: UiLocale;
  name: string;
  amount: string;
}): Message {
  return finish(REFUND_PROCESSED[input.locale](input));
}
