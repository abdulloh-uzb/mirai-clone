import { describe, expect, it } from "vitest";
import { detectIntent, refusalFor } from "./guardrails";
import { offlineAnswer } from "./offline";
import { suggestionKeyFor } from "./suggestions";
import { isExamPath } from "@/lib/exam/exam";
import type { AccountTools, ReportStatusInfo } from "./tools";

describe("detectIntent", () => {
  it.each([
    "Did the DMV get my completion?",
    "¿El DMV recibió mi finalización?",
    "DMV получил мой сертификат?",
    "DMV に完了が報告されましたか？",
  ])("report status: %s", (text) => {
    expect(detectIntent(text)).toBe("report_status");
  });

  it("detects the other intents", () => {
    expect(detectIntent("Can I get a refund?")).toBe("refund");
    expect(detectIntent("Quiero un reembolso")).toBe("refund");
    expect(detectIntent("Какой у меня срок?")).toBe("deadline");
    expect(detectIntent("Give me the exam answers")).toBe("exam_answers");
    expect(detectIntent("ответы на экзамен пожалуйста")).toBe("exam_answers");
    expect(detectIntent("Should I plead guilty?")).toBe("legal_advice");
    expect(detectIntent("Am I enrolled?")).toBe("enrollment");
    expect(detectIntent("How long is the course?")).toBeNull();
  });
});

function tools(report: ReportStatusInfo): AccountTools {
  return {
    getMyEnrollment: async () => ({ enrolled: false }),
    getMyReportStatus: async () => report,
    getMyRefundEligibility: async () => ({ enrolled: false }),
    getMyCourtDeadline: async () => ({ enrolled: false }),
  };
}

const noSearch = async () => [];

describe("offlineAnswer", () => {
  it("answers an accepted report from the tool result", async () => {
    const result = await offlineAnswer({
      text: "Did the DMV get my completion?",
      locale: "en",
      tools: tools({
        enrolled: true,
        certificateIssued: true,
        reportStatus: "accepted",
        updatedAt: "2026-11-20T18:00:00Z",
      }),
      search: noSearch,
    });
    expect(result.text).toContain("confirmed your completion");
    expect(result.text).toContain("November 20, 2026");
  });

  it("tells a non-enrolled user they have not enrolled", async () => {
    const result = await offlineAnswer({
      text: "Did the DMV get my completion?",
      locale: "en",
      tools: tools({ enrolled: false }),
      search: noSearch,
    });
    expect(result.text).toContain("not enrolled");
  });

  it("asks a visitor to sign in", async () => {
    const result = await offlineAnswer({
      text: "Did the DMV get my completion?",
      locale: "es",
      tools: null,
      search: noSearch,
    });
    expect(result.text).toContain("Inicia sesión");
  });

  it("refuses exam answers", async () => {
    const result = await offlineAnswer({
      text: "what are the exam answers",
      locale: "en",
      tools: null,
      search: noSearch,
    });
    expect(result.text).toBe(refusalFor("exam_answers", "en"));
  });

  it("falls back to the best chunk with its link, then to unsure", async () => {
    const hit = await offlineAnswer({
      text: "how long is access",
      locale: "en",
      tools: null,
      search: async () => [
        {
          title: "Access",
          url: "/faq#access",
          content: "Access lasts 90 days.",
        },
      ],
    });
    expect(hit.text).toContain("Access lasts 90 days.");
    expect(hit.text).toContain("/faq#access");
    const miss = await offlineAnswer({
      text: "blah",
      locale: "en",
      tools: null,
      search: noSearch,
    });
    expect(miss.text).toContain("talk to a person");
  });
});

describe("suggestions and exam path", () => {
  it("picks suggestions by path", () => {
    expect(suggestionKeyFor("/")).toBe("home");
    expect(suggestionKeyFor("/ru")).toBe("home");
    expect(suggestionKeyFor("/courses")).toBe("courses");
    expect(suggestionKeyFor("/es/courts/los-angeles-county")).toBe("court");
    expect(suggestionKeyFor("/faq")).toBe("faq");
    expect(suggestionKeyFor("/portal")).toBe("portal");
    expect(suggestionKeyFor("/portal/status")).toBe("status");
    expect(suggestionKeyFor("/portal/orders")).toBe("orders");
    expect(suggestionKeyFor("/about")).toBe("default");
  });

  it("detects the exam path", () => {
    expect(isExamPath("/portal/exam")).toBe(true);
    expect(isExamPath("/ru/portal/exam/abc")).toBe(true);
    expect(isExamPath("/portal/examples")).toBe(false);
    expect(isExamPath("/portal")).toBe(false);
  });
});
