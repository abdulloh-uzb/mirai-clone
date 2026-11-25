import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { Locale } from "@/i18n/routing";
import { createServiceClient } from "@/lib/supabase/service";
import { aiEnv } from "./env";
import { reindexKnowledgeBase } from "./kb";
import type { KbHit } from "./offline";

// Server helpers for the chat and handoff routes.

// TODO(spec): rough Haiku-class prices in USD per token; set real ones.
const USD_PER_INPUT_TOKEN = 1 / 1_000_000;
const USD_PER_OUTPUT_TOKEN = 5 / 1_000_000;

export function costUsd(tokensIn: number, tokensOut: number): number {
  return tokensIn * USD_PER_INPUT_TOKEN + tokensOut * USD_PER_OUTPUT_TOKEN;
}

/** Salted hash so conversations can be rate-limited and grouped without storing IPs. */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${aiEnv().ipSalt}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/** A UI message stream that carries one fixed text, so the client code is the same. */
export function textStreamResponse(text: string, status = 200): Response {
  const id = randomUUID();
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
    },
  });
  return createUIMessageStreamResponse({ stream, status });
}

/** Chunks for a question; fills an empty knowledge base on first use. */
export async function searchKb(
  query: string,
  locale: Locale,
  limit = 3,
): Promise<KbHit[]> {
  const service = createServiceClient();
  const { count } = await service
    .from("kb_chunks")
    .select("id", { count: "exact", head: true });
  if (count === 0) await reindexKnowledgeBase(service);
  const { data, error } = await service.rpc("search_kb", {
    p_query: query,
    p_locale: locale,
    p_limit: limit,
  });
  if (error) throw error;
  return data.map((row) => ({
    title: row.title,
    url: row.url,
    content: row.content,
  }));
}

/** Creates the conversation on first use. False when it belongs to someone else. */
export async function ensureConversation(input: {
  id: string;
  userId: string | null;
  locale: Locale;
  page: string;
  ipHash: string;
}): Promise<boolean> {
  const service = createServiceClient();
  const { data: existing } = await service
    .from("ai_conversations")
    .select("user_id")
    .eq("id", input.id)
    .maybeSingle();
  if (existing) return existing.user_id === input.userId;
  const { error } = await service.from("ai_conversations").insert({
    id: input.id,
    user_id: input.userId,
    locale: input.locale,
    page: input.page.slice(0, 200),
    ip_hash: input.ipHash,
  });
  if (error) throw error;
  return true;
}

export async function logExchange(input: {
  conversationId: string;
  userText: string;
  assistantText: string;
  flagged?: boolean;
  tokensIn?: number;
  tokensOut?: number;
}): Promise<void> {
  const service = createServiceClient();
  const { error } = await service.from("ai_messages").insert([
    {
      conversation_id: input.conversationId,
      role: "user",
      content: input.userText,
      flagged: input.flagged ?? false,
    },
    {
      conversation_id: input.conversationId,
      role: "assistant",
      content: input.assistantText,
      tokens_in: input.tokensIn ?? null,
      tokens_out: input.tokensOut ?? null,
      cost_usd:
        input.tokensIn !== undefined || input.tokensOut !== undefined
          ? costUsd(input.tokensIn ?? 0, input.tokensOut ?? 0)
          : null,
    },
  ]);
  if (error) throw error;
  if (input.flagged) {
    await service
      .from("ai_conversations")
      .update({ flagged: true })
      .eq("id", input.conversationId);
  }
}
