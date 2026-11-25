import type { Locale } from "@/i18n/routing";

export type Intent =
  | "report_status"
  | "enrollment"
  | "refund"
  | "deadline"
  | "exam_answers"
  | "legal_advice";

// Keyword lists are matched against lower-cased text. Order matters: the
// refusal intents come first so they win over account intents.
const KEYWORDS: Record<Intent, string[]> = {
  exam_answers: [
    "exam answer",
    "answers to the exam",
    "answers for the exam",
    "answer key",
    "test answers",
    "quiz answers",
    "correct answers",
    "cheat",
    "試験の答え",
    "テストの答え",
    "解答",
    "respuestas del examen",
    "respuestas correctas",
    "respuestas de la prueba",
    "ответы на экзамен",
    "ответы на тест",
    "правильные ответы",
  ],
  legal_advice: [
    "legal advice",
    "should i plead",
    "plead guilty",
    "plead not guilty",
    "fight my ticket",
    "need a lawyer",
    "法的助言",
    "弁護士",
    "consejo legal",
    "abogado",
    "юридическ",
    "адвокат",
    "юрист",
  ],
  report_status: [
    "dmv",
    "reported",
    "report status",
    "completion",
    "court got",
    "court receive",
    "完了",
    "報告",
    "recibió",
    "recibio",
    "reportado",
    "finalización",
    "finalizacion",
    "получил",
    "сообщили",
    "завершени",
  ],
  refund: [
    "refund",
    "money back",
    "返金",
    "払い戻し",
    "reembolso",
    "devolución",
    "devolucion",
    "возврат",
    "вернуть деньги",
  ],
  deadline: [
    "deadline",
    "due date",
    "court date",
    "締め切り",
    "期限",
    "期日",
    "fecha límite",
    "fecha limite",
    "plazo",
    "срок",
    "дедлайн",
  ],
  enrollment: [
    "enrolled",
    "enrollment",
    "my course",
    "my progress",
    "access expire",
    "登録",
    "受講",
    "inscrito",
    "inscripción",
    "inscripcion",
    "mi curso",
    "записан",
    "мой курс",
    "прогресс",
  ],
};

const ORDER: Intent[] = [
  "exam_answers",
  "legal_advice",
  "refund",
  "deadline",
  "report_status",
  "enrollment",
];

/** Guesses what the user wants from keywords in en, ja, es or ru. */
export function detectIntent(text: string): Intent | null {
  const lower = text.toLowerCase();
  for (const intent of ORDER) {
    if (KEYWORDS[intent].some((word) => lower.includes(word))) return intent;
  }
  return null;
}

const REFUSALS: Record<
  "exam_answers" | "legal_advice",
  Record<Locale, string>
> = {
  exam_answers: {
    en: "I can't help with exam or quiz answers, and I have no access to the question bank. I can explain the course material, so ask about a topic you want to review.",
    ja: "試験やクイズの答えはお手伝いできません。問題バンクにもアクセスできません。教材の内容なら説明できますので、復習したいテーマを聞いてください。",
    es: "No puedo ayudar con respuestas de exámenes o cuestionarios y no tengo acceso al banco de preguntas. Sí puedo explicar el material del curso: pregunta por el tema que quieras repasar.",
    ru: "Я не могу помогать с ответами на экзамен или тесты и не имею доступа к банку вопросов. Зато могу объяснить материал курса, спросите о теме, которую хотите повторить.",
  },
  legal_advice: {
    en: "I can only give educational information, not legal advice. For your case, talk to a lawyer or the court, and check dmv.ca.gov for official rules.",
    ja: "私が提供できるのは教育的な情報のみで、法的助言はできません。ご自身のケースは弁護士か裁判所にご相談ください。公式情報は dmv.ca.gov で確認できます。",
    es: "Solo puedo dar información educativa, no asesoría legal. Para tu caso, habla con un abogado o con el tribunal y consulta dmv.ca.gov para las reglas oficiales.",
    ru: "Я даю только учебную информацию, а не юридические советы. По вашему делу обратитесь к юристу или в суд, а официальные правила смотрите на dmv.ca.gov.",
  },
};

/** Fixed answer for intents the assistant must refuse; null for the others. */
export function refusalFor(
  intent: Intent | null,
  locale: Locale,
): string | null {
  if (intent === "exam_answers" || intent === "legal_advice") {
    return REFUSALS[intent][locale];
  }
  return null;
}

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  ja: "Japanese",
  es: "Spanish",
  ru: "Russian",
};

export function systemPrompt(input: {
  locale: Locale;
  signedIn: boolean;
  page: string;
  context?: string;
}): string {
  const lines = [
    "You are the help assistant of a California online traffic school (a demo project, not a licensed school).",
    `Answer in ${LANGUAGE_NAMES[input.locale]}, briefly and plainly.`,
    "Give educational information only. Never give legal advice. Point to the official source, dmv.ca.gov, for rules.",
    "Never reveal or guess exam or quiz answers. You have no access to the question bank; never claim you do.",
    "Use the knowledge base excerpts below for school policies. If they do not answer the question, say you are not sure and suggest talking to a person.",
    input.signedIn
      ? "The user is signed in. For questions about their enrollment, DMV report status, refund or deadline, call the matching tool and answer from its result only."
      : "The user is a visitor with no account tools. For account questions, ask them to sign in.",
    `The user is on the page: ${input.page}.`,
  ];
  if (input.context) lines.push("Knowledge base excerpts:", input.context);
  return lines.join("\n");
}

/** Shown instead of an answer while the user has an exam in progress. */
export const EXAM_DISABLED: Record<Locale, string> = {
  en: "The assistant is turned off while your final exam is in progress. Finish or submit the exam first.",
  ja: "最終試験の受験中はアシスタントを利用できません。先に試験を終えるか提出してください。",
  es: "El asistente está desactivado mientras tu examen final está en curso. Termina o envía el examen primero.",
  ru: "Помощник отключён, пока идёт итоговый экзамен. Сначала завершите или отправьте экзамен.",
};

/** Shown when a rate limit is hit. */
export const RATE_LIMITED: Record<Locale, string> = {
  en: "You are sending messages too quickly. Please wait a few minutes and try again.",
  ja: "メッセージの送信が多すぎます。数分待ってからもう一度お試しください。",
  es: "Estás enviando mensajes demasiado rápido. Espera unos minutos e inténtalo de nuevo.",
  ru: "Вы отправляете сообщения слишком часто. Подождите несколько минут и попробуйте снова.",
};
