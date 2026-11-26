export type CompletionPayload = {
  reportId: string;
  certNo: string;
  legalName: string;
  dob: string | null;
  licenseNo: string | null;
  licenseState: string | null;
  courtCode: string | null;
  countyName: string | null;
  citationNo: string | null;
  completedAt: string | null;
};

export type SubmitResult = {
  reportId: string;
  status: "sent" | "accepted" | "rejected" | "error";
  regulatorRef?: string;
  reason?: string;
};

export type StatusResult = {
  reportId: string;
  status: "sent" | "accepted" | "rejected";
  regulatorRef?: string;
  reason?: string;
};

/** The seam to a state's reporting system (spec section 9). */
export interface StateReportingAdapter {
  submitCompletions(items: CompletionPayload[]): Promise<SubmitResult[]>;
  checkStatus(reportIds: string[]): Promise<StatusResult[]>;
}
