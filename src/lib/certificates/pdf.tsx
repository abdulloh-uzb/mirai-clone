import "server-only";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import path from "node:path";
import QRCode from "qrcode";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";

export type CertificateData = {
  legalName: string;
  maskedLicense: string;
  court: string;
  citationNo: string;
  completedOn: string;
  certNo: string;
  /** The course language: picks the label language. */
  locale: Locale;
  /** The course language's native name. */
  courseLanguage: string;
  verifyUrl: string;
};

// react-pdf cannot mix scripts inside one font file, so each script has its
// own family and `Mixed` splits every string into runs. Files are WOFF (not
// WOFF2). next.config.ts traces these files for deployment.
const fontFile = (pkg: string, file: string) =>
  path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file);
const FAMILIES = {
  latin: ["noto-sans", "noto-sans-latin"],
  cyrillic: ["noto-sans", "noto-sans-cyrillic"],
  japanese: ["noto-sans-jp", "noto-sans-jp-japanese"],
} as const;
for (const [script, [pkg, base]] of Object.entries(FAMILIES)) {
  Font.register({
    family: `Cert-${script}`,
    fonts: [
      { src: fontFile(pkg, `${base}-400-normal.woff`), fontWeight: 400 },
      { src: fontFile(pkg, `${base}-700-normal.woff`), fontWeight: 700 },
    ],
  });
}

const CYR = "\\u0400-\\u052F";
const JPN = "\\u3000-\\u30FF\\u3400-\\u9FFF\\uFF00-\\uFFEF";
const RUN = new RegExp(`([${CYR}]+)|([${JPN}]+)|([^${CYR}${JPN}]+)`, "g");

/** Text whose Latin, Cyrillic and Japanese runs each use their own font. */
function Mixed({ children }: { children: string }) {
  const runs = [...children.matchAll(RUN)].map((m) => ({
    text: m[0],
    family: m[1] ? "Cert-cyrillic" : m[2] ? "Cert-japanese" : "Cert-latin",
  }));
  return (
    <>
      {runs.map((r, i) => (
        <Text key={i} style={{ fontFamily: r.family }}>
          {r.text}
        </Text>
      ))}
    </>
  );
}

type Labels = {
  title: string;
  certifies: string;
  completed: string;
  license: string;
  court: string;
  citation: string;
  date: string;
  language: string;
  number: string;
  verify: string;
  demo: string;
};

const LABELS: Record<Locale, Labels> = {
  en: {
    title: "Certificate of Completion",
    certifies: "This certifies that",
    completed: "has completed the online traffic school course.",
    license: "Driver license",
    court: "Court",
    citation: "Citation number",
    date: "Completion date",
    language: "Course language",
    number: "Certificate number",
    verify: "Verify this certificate at",
    demo: "Demo project - not a licensed school. Not valid for any court.",
  },
  es: {
    title: "Certificado de finalización",
    certifies: "Se certifica que",
    completed: "ha completado el curso de escuela de tráfico en línea.",
    license: "Licencia de conducir",
    court: "Tribunal",
    citation: "Número de citación",
    date: "Fecha de finalización",
    language: "Idioma del curso",
    number: "Número de certificado",
    verify: "Verifique este certificado en",
    demo: "Proyecto de demostración: no es una escuela autorizada. No válido para ningún tribunal.",
  },
  ru: {
    title: "Сертификат о прохождении",
    certifies: "Настоящим подтверждается, что",
    completed: "прошёл(-ла) онлайн-курс школы вождения.",
    license: "Водительское удостоверение",
    court: "Суд",
    citation: "Номер штрафа",
    date: "Дата завершения",
    language: "Язык курса",
    number: "Номер сертификата",
    verify: "Проверить сертификат:",
    demo: "Демо-проект, не лицензированная школа. Не действителен ни для одного суда.",
  },
  ja: {
    title: "修了証明書",
    certifies: "次の者は、",
    completed: "オンライン交通安全講習を修了したことを証明します。",
    license: "運転免許証",
    court: "裁判所",
    citation: "違反切符番号",
    date: "修了日",
    language: "講習言語",
    number: "証明書番号",
    verify: "この証明書の確認：",
    demo: "デモ用プロジェクトです。認可校ではありません。裁判所には無効です。",
  },
};

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Cert-latin", fontSize: 12 },
  frame: { border: "3pt solid #1e3a8a", padding: 32, flexGrow: 1 },
  school: { fontSize: 14, textAlign: "center", color: "#1e3a8a" },
  title: { fontSize: 28, textAlign: "center", marginTop: 12 },
  lead: { textAlign: "center", marginTop: 24 },
  name: { fontSize: 24, textAlign: "center", marginTop: 8 },
  row: { flexDirection: "row", marginTop: 8 },
  label: { width: 150, color: "#555555" },
  details: { marginTop: 28 },
  foot: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  qr: { width: 90, height: 90 },
  note: { marginTop: 20, fontSize: 9, color: "#777777", textAlign: "center" },
});

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        <Mixed>{label}</Mixed>
      </Text>
      <Text>
        <Mixed>{value}</Mixed>
      </Text>
    </View>
  );
}

function CertificateDocument({
  data,
  qr,
}: {
  data: CertificateData;
  qr: string;
}) {
  const t = LABELS[data.locale];
  return (
    <Document title={`Certificate ${data.certNo}`} author={siteConfig.name}>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <Text style={styles.school}>
            {siteConfig.name} - License {siteConfig.licenseNumber}
          </Text>
          <Text style={styles.title}>
            <Mixed>{t.title}</Mixed>
          </Text>
          <Text style={styles.lead}>
            <Mixed>{t.certifies}</Mixed>
          </Text>
          <Text style={styles.name}>
            <Mixed>{data.legalName}</Mixed>
          </Text>
          <Text style={styles.lead}>
            <Mixed>{t.completed}</Mixed>
          </Text>
          <View style={styles.details}>
            <Detail label={t.license} value={data.maskedLicense} />
            <Detail label={t.court} value={data.court} />
            <Detail label={t.citation} value={data.citationNo} />
            <Detail label={t.date} value={data.completedOn} />
            <Detail label={t.language} value={data.courseLanguage} />
            <Detail label={t.number} value={data.certNo} />
          </View>
          <View style={styles.foot}>
            <Text style={{ fontSize: 10, width: 400 }}>
              <Mixed>{`${t.verify} ${data.verifyUrl}`}</Mixed>
            </Text>
            {/* react-pdf Image has no alt prop */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qr} style={styles.qr} />
          </View>
          <Text style={styles.note}>
            <Mixed>{t.demo}</Mixed>
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderCertificatePdf(
  data: CertificateData,
): Promise<Buffer> {
  const qr = await QRCode.toDataURL(data.verifyUrl, { margin: 1, width: 240 });
  return renderToBuffer(<CertificateDocument data={data} qr={qr} />);
}
