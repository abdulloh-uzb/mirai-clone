import { reportingEnv } from "@/lib/reporting/env";
import { NextResponse } from "next/server";
import { runReportBatch } from "@/lib/reporting/run-batch";
import { isReportingSlot } from "@/lib/reporting/schedule";

export const dynamic = "force-dynamic";

/** Cron: sends completions to the DMV at the reporting slots (spec section 9). */
export async function GET(request: Request) {
  const secret = reportingEnv().cronSecret;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const force = new URL(request.url).searchParams.get("force") === "1";
  const now = new Date();
  if (!force && !isReportingSlot(now)) {
    return NextResponse.json({ skipped: true });
  }
  const counts = await runReportBatch({ trigger: "cron", now });
  return NextResponse.json({ skipped: false, counts });
}
