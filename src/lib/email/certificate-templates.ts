import { siteConfig } from "@/config/site";
import type { EmailMessage } from "./types";

type Message = Omit<EmailMessage, "to">;
type UiLocale = "en" | "ja" | "es" | "ru";

const READY: Record<
  UiLocale,
  (i: { name: string; certNo: string; url: string }) => {
    subject: string;
    lines: string[];
  }
> = {
  en: (i) => ({
    subject: `Your certificate ${i.certNo} is ready`,
    lines: [
      `Hi ${i.name},`,
      "",
      "Congratulations, you passed the final exam.",
      `Your certificate ${i.certNo} is ready to download: ${i.url}`,
    ],
  }),
  ja: (i) => ({
    subject: `修了証 ${i.certNo} の準備ができました`,
    lines: [
      `${i.name} 様`,
      "",
      "最終試験の合格おめでとうございます。",
      `修了証 ${i.certNo} はこちらからダウンロードできます: ${i.url}`,
    ],
  }),
  es: (i) => ({
    subject: `Tu certificado ${i.certNo} está listo`,
    lines: [
      `Hola ${i.name},`,
      "",
      "Felicidades, aprobaste el examen final.",
      `Tu certificado ${i.certNo} está listo para descargar: ${i.url}`,
    ],
  }),
  ru: (i) => ({
    subject: `Ваш сертификат ${i.certNo} готов`,
    lines: [
      `Здравствуйте, ${i.name}!`,
      "",
      "Поздравляем, вы сдали итоговый экзамен.",
      `Сертификат ${i.certNo} можно скачать здесь: ${i.url}`,
    ],
  }),
};

export function certificateReadyEmail(input: {
  locale: UiLocale;
  name: string;
  certNo: string;
  url: string;
}): Message {
  const { subject, lines } = READY[input.locale](input);
  return { subject, text: [...lines, "", siteConfig.name].join("\n") };
}
