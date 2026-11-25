"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { PlayIcon, RotateCcwIcon, SendIcon, UserIcon } from "lucide-react";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { isExamPath } from "@/lib/ai/exam-path";
import { suggestionsFor } from "@/lib/ai/suggestions";

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  es: "Español",
  ru: "Русский",
};

type HandoffState = "closed" | "open" | "sending" | "done" | "error";

/**
 * The AI assistant: a right-side sheet opened by the `open-ai-assistant`
 * window event (help widget, portal nav). Never opens on the exam pages.
 */
export function AssistantPanel() {
  const t = useTranslations("Assistant");
  const uiLocale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [chatLocale, setChatLocale] = useState<Locale>(uiLocale);
  const [conversationId, setConversationId] = useState(() =>
    crypto.randomUUID(),
  );
  const [input, setInput] = useState("");
  const [showTour, setShowTour] = useState(false);
  const [handoff, setHandoff] = useState<HandoffState>("closed");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const onExam = isExamPath(pathname);

  const catalog = useMessages();
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/ai/chat" }),
    [],
  );
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport,
  });

  useEffect(() => {
    const onOpen = () => {
      if (!isExamPath(window.location.pathname)) setOpen(true);
    };
    window.addEventListener("open-ai-assistant", onOpen);
    return () => window.removeEventListener("open-ai-assistant", onOpen);
  }, []);

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages, status]);

  if (onExam) return null;

  const busy = status === "submitted" || status === "streaming";
  const suggestions = suggestionsFor(pathname);

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    void sendMessage(
      { text: trimmed },
      { body: { conversationId, locale: chatLocale, page: pathname } },
    );
  }

  function reset() {
    setMessages([]);
    setConversationId(crypto.randomUUID());
    setHandoff("closed");
    setShowTour(false);
  }

  async function sendHandoff() {
    setHandoff("sending");
    try {
      const response = await fetch("/api/ai/handoff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId,
          email: email.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });
      setHandoff(response.ok ? "done" : "error");
    } catch {
      setHandoff("error");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-md"
        aria-describedby="assistant-description"
      >
        <SheetHeader className="border-b pr-12">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>{t("title")}</SheetTitle>
            <div className="flex items-center gap-1">
              <select
                aria-label={t("language")}
                value={chatLocale}
                onChange={(event) =>
                  setChatLocale(event.target.value as Locale)
                }
                className="h-8 rounded-md border bg-background px-2 text-xs"
              >
                {routing.locales.map((l) => (
                  <option key={l} value={l}>
                    {LANGUAGE_LABELS[l]}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("reset")}
                title={t("reset")}
                onClick={reset}
              >
                <RotateCcwIcon aria-hidden className="size-4" />
              </Button>
            </div>
          </div>
          <SheetDescription id="assistant-description">
            {t("description")}
          </SheetDescription>
        </SheetHeader>

        <div
          role="log"
          aria-live="polite"
          aria-label={t("log")}
          className="flex-1 space-y-3 overflow-y-auto p-4"
        >
          {messages.length === 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowTour(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-soft-border bg-gradient-to-br from-surface-sky to-surface-mint p-3 text-left"
              >
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <PlayIcon className="size-4 fill-current" />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-brand-navy">
                    {t("tourTitle")}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {showTour ? t("tourSoon") : t("tourText")}
                  </span>
                </span>
              </button>
              <p className="text-xs font-bold text-muted-foreground">
                {t("suggestionsTitle")}
              </p>
              <ul className="flex flex-col gap-2">
                {suggestions.ids.map((id) => {
                  const text =
                    (
                      catalog.Assistant.suggestions as Record<
                        string,
                        Record<string, string>
                      >
                    )[suggestions.key]?.[id] ?? "";
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => ask(text)}
                        className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        {text}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-8 rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "mr-8 rounded-2xl bg-muted px-3 py-2 text-sm whitespace-pre-wrap"
              }
            >
              {message.parts.map((part, i) =>
                part.type === "text" ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          ))}
          {status === "submitted" && (
            <p className="text-xs text-muted-foreground">{t("thinking")}</p>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {t("error")}
            </p>
          )}
          <div ref={endRef} />
        </div>

        <div className="space-y-2 border-t p-3">
          {handoff === "closed" ? (
            <button
              type="button"
              onClick={() => setHandoff("open")}
              className="flex items-center gap-1 text-xs font-bold underline"
            >
              <UserIcon aria-hidden className="size-3" />
              {t("person")}
            </button>
          ) : handoff === "done" ? (
            <p role="status" className="text-sm">
              {t("handoffDone")}
            </p>
          ) : (
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                void sendHandoff();
              }}
            >
              <p className="text-xs text-muted-foreground">{t("personText")}</p>
              <input
                type="email"
                aria-label={t("email")}
                placeholder={t("email")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
              <input
                type="text"
                aria-label={t("note")}
                placeholder={t("note")}
                maxLength={1000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
              {handoff === "error" && (
                <p role="alert" className="text-xs text-destructive">
                  {t("handoffError")}
                </p>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={handoff === "sending" || messages.length === 0}
              >
                {t("submitHandoff")}
              </Button>
            </form>
          )}

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              ask(input);
            }}
          >
            <input
              type="text"
              aria-label={t("placeholder")}
              placeholder={t("placeholder")}
              maxLength={2000}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-full border-2 border-soft-border bg-background px-4 text-sm outline-none"
            />
            <Button
              type="submit"
              size="icon"
              aria-label={t("send")}
              disabled={busy || !input.trim()}
            >
              <SendIcon aria-hidden className="size-4" />
            </Button>
          </form>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {t("disclaimer")}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
