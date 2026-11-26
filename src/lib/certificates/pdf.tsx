import "server-only";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import { siteConfig } from "@/config/site";

export type CertificateData = {
  legalName: string;
  maskedLicense: string;
  court: string;
  citationNo: string;
  completedOn: string;
  certNo: string;
  courseLanguage: string;
  verifyUrl: string;
};

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 12 },
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
      <Text style={styles.label}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

// TODO(spec): built-in PDF fonts lack CJK and Cyrillic glyphs, so labels stay
// in English and the course language is named. Bundle a font for native labels.
function CertificateDocument({
  data,
  qr,
}: {
  data: CertificateData;
  qr: string;
}) {
  return (
    <Document title={`Certificate ${data.certNo}`} author={siteConfig.name}>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <Text style={styles.school}>
            {siteConfig.name} - License {siteConfig.licenseNumber}
          </Text>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.lead}>This certifies that</Text>
          <Text style={styles.name}>{data.legalName}</Text>
          <Text style={styles.lead}>
            has completed the online traffic school course.
          </Text>
          <View style={styles.details}>
            <Detail label="Driver license" value={data.maskedLicense} />
            <Detail label="Court" value={data.court} />
            <Detail label="Citation number" value={data.citationNo} />
            <Detail label="Completion date" value={data.completedOn} />
            <Detail label="Course language" value={data.courseLanguage} />
            <Detail label="Certificate number" value={data.certNo} />
          </View>
          <View style={styles.foot}>
            <Text style={{ fontSize: 10, width: 400 }}>
              Verify this certificate at {data.verifyUrl}
            </Text>
            {/* react-pdf Image has no alt prop */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qr} style={styles.qr} />
          </View>
          <Text style={styles.note}>
            Demo project - not a licensed school. Not valid for any court.
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
