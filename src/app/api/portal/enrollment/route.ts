import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { currentEnrollmentId } from "@/lib/payments/enrollment-status";

export const dynamic = "force-dynamic";

/** Polled by the "Confirming payment" page. Reads only; never creates anything. */
export async function GET() {
  const account = await getCurrentAccount();
  if (!account) return new NextResponse(null, { status: 401 });
  const id = await currentEnrollmentId(account.userId);
  return NextResponse.json(
    { enrolled: id !== null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
