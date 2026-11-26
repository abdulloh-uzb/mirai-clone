export type CourseLang = "en" | "ja" | "es" | "ru";

/**
 * Panel strings of the home page course chooser. They are course-language
 * content, not UI text: the panel previews the course in the chosen language,
 * whatever the site locale is. `{days}` is replaced with the access days.
 */
export type PanelCopy = {
  badge: string;
  title: string;
  features: readonly string[];
  line: string;
  go: string;
};

export const PANEL_COPY: Record<CourseLang, PanelCopy> = {
  en: {
    badge: "Available in 4 languages",
    title: "California Traffic Violator Course (TVC)",
    features: [
      "Defensive Driving",
      "Traffic Violations",
      "Driver Awareness",
      "Self-Paced",
      "{days} days of access",
      "Interactive Lessons",
      "All Devices",
      "Certificate of Completion",
      "Reported to the DMV 3 Times a Day",
      "Demo course, not a licensed school",
    ],
    line: "Lessons, quizzes and the final exam in English.",
    go: "Start in English",
  },
  ja: {
    badge: "4言語で受講できます",
    title: "カリフォルニア交通違反者コース(TVC)",
    features: [
      "防衛運転",
      "交通違反",
      "ドライバーの安全意識",
      "自分のペースで学習",
      "{days}日間アクセス可能",
      "インタラクティブなレッスン",
      "すべてのデバイスに対応",
      "修了証明書",
      "DMVへ1日3回報告",
      "デモコースです(認可校ではありません)",
    ],
    line: "レッスン、小テスト、最終試験はすべて日本語です。",
    go: "日本語で始める",
  },
  es: {
    badge: "Disponible en 4 idiomas",
    title: "Curso para infractores de tránsito de California (TVC)",
    features: [
      "Conducción defensiva",
      "Infracciones de tránsito",
      "Conciencia al volante",
      "A tu propio ritmo",
      "{days} días de acceso",
      "Lecciones interactivas",
      "Todos los dispositivos",
      "Certificado de finalización",
      "Reporte al DMV 3 veces al día",
      "Curso de demostración, no es una escuela autorizada",
    ],
    line: "Lecciones, cuestionarios y examen final en español.",
    go: "Empezar en español",
  },
  ru: {
    badge: "Доступно на 4 языках",
    title: "Курс для нарушителей ПДД Калифорнии (TVC)",
    features: [
      "Защитное вождение",
      "Нарушения ПДД",
      "Внимательность водителя",
      "В своём темпе",
      "Доступ на {days} дн.",
      "Интерактивные уроки",
      "Любые устройства",
      "Сертификат об окончании",
      "Отчёт в DMV 3 раза в день",
      "Демо-курс, не лицензированная школа",
    ],
    line: "Уроки, тесты и итоговый экзамен на русском.",
    go: "Начать на русском",
  },
};
