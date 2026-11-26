import { NextResponse } from "next/server";
import { certificateNumberValid } from "@/lib/certificates/mask";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/** Signed-in owner only: redirects to a 60 second signed URL of the PDF. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ certNo: string }> },
) {
  const { certNo } = await params;
  if (!certificateNumberValid(certNo)) {
    return new NextResponse(null, { status: 404 });
  }
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims.sub) return new NextResponse(null, { status: 401 });
  // RLS: only the owner's certificates are visible.
  const { data: cert } = await supabase
    .from("certificates")
    .select("pdf_path, revoked_at")
    .eq("cert_no", certNo.toUpperCase())
    .maybeSingle();
  if (!cert?.pdf_path || cert.revoked_at) {
    return new NextResponse(null, { status: 404 });
  }
  const { data: signed } = await createServiceClient()
    .storage.from("certificates")
    .createSignedUrl(cert.pdf_path, 60);
  if (!signed) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(signed.signedUrl, 302);
}
