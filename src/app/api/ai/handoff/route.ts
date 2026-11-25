import { z } from "zod";
import { hashIp } from "@/lib/ai/chat.server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const bodySchema = z.object({
  conversationId: z.uuid(),
  email: z.email().max(254).optional(),
  note: z.string().trim().max(1000).optional(),
});

/** "Talk to a person": a ticket with the transcript in its body. */
export async function POST(request: Request): Promise<Response> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const { conversationId, note } = parsed.data;

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub ?? null;
  const email = userId
    ? (claims?.claims.email as string | undefined)
    : parsed.data.email;
  if (!email) {
    return Response.json({ error: "email_required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: conversation } = await service
    .from("ai_conversations")
    .select("id, user_id, locale, page")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation || conversation.user_id !== userId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const { data: limited } = await service.rpc("hit_rate_limit", {
    key: `ai-handoff:${userId ?? hashIp(email)}`,
    max: 5,
    window_seconds: 3600,
  });
  if (limited !== true) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const { data: messages, error: messagesError } = await service
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);
  if (messagesError) throw messagesError;
  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const { error } = await service.from("tickets").insert({
    type: "ai_handoff",
    user_id: userId,
    email,
    body: `${note ? `Note: ${note}\n\n` : ""}Transcript:\n\n${transcript}`,
    page_url: conversation.page,
    details: { locale: conversation.locale, conversationId },
  });
  if (error) throw error;
  await service
    .from("ai_conversations")
    .update({ handed_off_at: new Date().toISOString() })
    .eq("id", conversationId);

  return Response.json({ status: "ok" });
}
