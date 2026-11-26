// Builds the "download my data" payload. Pure, so the exclusions are testable:
// regulator references, answer hashes and unsubmitted attempts never leave.

type Row = Record<string, unknown>;

export type ExportInput = {
  profile: Row | null;
  enrollments: Row[];
  orders: Row[];
  examAttempts: Row[];
  quizAttempts: Row[];
  certificates: Row[];
  reports: Row[];
  tickets: Row[];
  aiConversations: Row[];
};

const omit = (row: Row, keys: string[]): Row =>
  Object.fromEntries(Object.entries(row).filter(([k]) => !keys.includes(k)));

const submitted = (rows: Row[]) => rows.filter((r) => r.submitted_at != null);

export function buildExport(input: ExportInput, now: Date = new Date()) {
  return {
    exportedAt: now.toISOString(),
    profile: input.profile
      ? omit(input.profile, ["answer_hash", "security_answer_hash"])
      : null,
    enrollments: input.enrollments,
    orders: input.orders.map((o) => omit(o, ["stripe_payment_intent"])),
    examAttempts: submitted(input.examAttempts).map((a) =>
      omit(a, ["answer_hash"]),
    ),
    quizAttempts: submitted(input.quizAttempts).map((a) =>
      omit(a, ["answer_hash"]),
    ),
    certificates: input.certificates,
    reports: input.reports.map((r) =>
      omit(r, ["regulator_ref", "error", "batch_id"]),
    ),
    tickets: input.tickets,
    aiConversations: input.aiConversations,
  };
}
