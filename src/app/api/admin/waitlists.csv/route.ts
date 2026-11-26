import { NextResponse } from "next/server";
import { buildCsv } from "@/lib/admin/csv";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/** Admin only: every notify-me and classroom waitlist signup. */
export async function GET() {
  const account = await getCurrentAccount();
  if (account?.role !== "admin") {
    return new NextResponse("Not found", { status: 404 });
  }
  const svc = createServiceClient();
  const [states, classroom] = await Promise.all([
    svc.from("state_waitlist").select("email, state_code, created_at"),
    svc
      .from("classroom_waitlist")
      .select("email, locale, created_at, county_id"),
  ]);
  const rows = [
    ...(states.data ?? []).map((r) => [
      "state",
      r.email,
      r.state_code,
      r.created_at,
    ]),
    ...(classroom.data ?? []).map((r) => [
      "classroom",
      r.email,
      r.county_id,
      r.created_at,
    ]),
  ];
  return new NextResponse(
    buildCsv(["list", "email", "state_or_county", "created_at"], rows),
    {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="waitlists.csv"',
        "cache-control": "no-store",
      },
    },
  );
}
