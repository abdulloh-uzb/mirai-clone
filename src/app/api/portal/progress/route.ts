import { NextResponse } from "next/server";
import { recordTime } from "@/lib/portal/progress";
import { progressInputSchema } from "@/lib/validation/progress";

// Target for navigator.sendBeacon on tab close. Same checks as the server
// action: the cookie client applies RLS and the RPC caps the credited time.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = progressInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const result = await recordTime(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 403 });
}
