import { createAnthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { headers } from "next/headers";
import { z } from "zod";
import { routing } from "@/i18n/routing";
import {
  ensureConversation,
  hashIp,
  logExchange,
  searchKb,
  textStreamResponse,
} from "@/lib/ai/chat.server";
import { aiEnv } from "@/lib/ai/env";
import {
  detectIntent,
  EXAM_DISABLED,
  RATE_LIMITED,
  refusalFor,
  systemPrompt,
} from "@/lib/ai/guardrails";
import { isExamPath } from "@/lib/exam/exam";
import { offlineAnswer } from "@/lib/ai/offline";
import { createAccountTools } from "@/lib/ai/tools";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const textPart = z.object({
  type: z.literal("text"),
  text: z.string().max(2000),
});

// Only text parts are accepted from the browser: tool results and other part
// types are never trusted from the client.
const bodySchema = z.object({
  conversationId: z.uuid(),
  locale: z.enum(routing.locales),
  page: z.string().max(200).default("/"),
  messages: z
    .array(
      z.object({
        id: z.string().max(100).optional(),
        role: z.enum(["user", "assistant"]),
        parts: z.array(z.looseObject({ type: z.string() })).max(20),
      }),
    )
    .min(1)
    .max(40),
});

const IP_LIMIT = { max: 20, windowSeconds: 600 };
const USER_LIMIT = { max: 60, windowSeconds: 600 };

function textOf(parts: { type: string }[]): string {
  return parts
    .flatMap((p) => {
      const parsed = textPart.safeParse(p);
      return parsed.success ? [parsed.data.text] : [];
    })
    .join("\n");
}

export async function POST(request: Request): Promise<Response> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const { conversationId, locale, page } = parsed.data;
  const messages = parsed.data.messages.slice(-20);
  const last = messages.at(-1);
  if (last?.role !== "user") {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const userText = textOf(last.parts).trim();
  if (!userText) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub ?? null;

  // Disabled during an exam, checked on the server and not only hidden in the UI.
  if (isExamPath(page)) {
    return textStreamResponse(EXAM_DISABLED[locale], 423);
  }
  if (userId) {
    const { data: active } = await supabase.rpc("has_active_exam");
    if (active) return textStreamResponse(EXAM_DISABLED[locale], 423);
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown";
  const ipHash = hashIp(ip);
  const service = createServiceClient();
  const checks = [
    service.rpc("hit_rate_limit", {
      key: `ai:ip:${ipHash}`,
      max: IP_LIMIT.max,
      window_seconds: IP_LIMIT.windowSeconds,
    }),
    ...(userId
      ? [
          service.rpc("hit_rate_limit", {
            key: `ai:user:${userId}`,
            max: USER_LIMIT.max,
            window_seconds: USER_LIMIT.windowSeconds,
          }),
        ]
      : []),
  ];
  const results = await Promise.all(checks);
  if (results.some((r) => r.error || r.data !== true)) {
    return textStreamResponse(RATE_LIMITED[locale], 429);
  }

  if (
    !(await ensureConversation({
      id: conversationId,
      userId,
      locale,
      page,
      ipHash,
    }))
  ) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  // Refusal intents short-circuit; the model never sees them.
  const intent = detectIntent(userText);
  const refusal = refusalFor(intent, locale);
  if (refusal) {
    await logExchange({
      conversationId,
      userText,
      assistantText: refusal,
      flagged: true,
    });
    return textStreamResponse(refusal);
  }

  const accountTools = userId ? createAccountTools(supabase) : null;

  const { apiKey, model } = aiEnv();
  if (!apiKey) {
    const result = await offlineAnswer({
      text: userText,
      locale,
      tools: accountTools,
      search: (query, l) => searchKb(query, l),
    });
    await logExchange({
      conversationId,
      userText,
      assistantText: result.text,
    });
    return textStreamResponse(result.text);
  }

  const hits = await searchKb(userText, locale);
  const context = hits
    .map((h) => `- ${h.title ?? ""} (${h.url ?? ""}): ${h.content}`)
    .join("\n");

  const modelInput: Omit<UIMessage, "id">[] = messages.map((m) => ({
    role: m.role,
    parts: m.parts.flatMap((p) => {
      const t = textPart.safeParse(p);
      return t.success ? [t.data] : [];
    }),
  }));

  const result = streamText({
    model: createAnthropic({ apiKey })(model),
    system: systemPrompt({
      locale,
      signedIn: userId !== null,
      page,
      context,
    }),
    messages: await convertToModelMessages(modelInput),
    tools: accountTools
      ? {
          getMyEnrollment: tool({
            description: "The signed-in user's enrollment status and dates.",
            inputSchema: z.object({}),
            execute: () => accountTools.getMyEnrollment(),
          }),
          getMyReportStatus: tool({
            description:
              "Whether the user's course completion was reported to the DMV, and its status.",
            inputSchema: z.object({}),
            execute: () => accountTools.getMyReportStatus(),
          }),
          getMyRefundEligibility: tool({
            description:
              "Whether the user's order can be refunded, and how much.",
            inputSchema: z.object({}),
            execute: () => accountTools.getMyRefundEligibility(),
          }),
          getMyCourtDeadline: tool({
            description: "The court due date saved on the user's enrollment.",
            inputSchema: z.object({}),
            execute: () => accountTools.getMyCourtDeadline(),
          }),
        }
      : undefined,
    stopWhen: isStepCount(4),
    onFinish: async ({ text, totalUsage }) => {
      await logExchange({
        conversationId,
        userText,
        assistantText: text,
        tokensIn: totalUsage.inputTokens ?? 0,
        tokensOut: totalUsage.outputTokens ?? 0,
      });
    },
  });
  return result.toUIMessageStreamResponse();
}
