import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import {
  reindexKnowledgeBaseAction,
  toggleMessageFlag,
} from "@/lib/admin/content-actions";
import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminAiPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/ai">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const sp = await searchParams;
  const open = typeof sp.c === "string" ? sp.c : null;
  const svc = createServiceClient();
  const [convs, usage, messages] = await Promise.all([
    svc
      .from("ai_conversations")
      .select("id, locale, flagged, handed_off_at, created_at, page")
      .order("created_at", { ascending: false })
      .limit(50),
    svc.from("ai_usage_daily").select("*").order("day", { ascending: false }),
    open
      ? svc
          .from("ai_messages")
          .select("id, role, content, flagged, cost_usd")
          .eq("conversation_id", open)
          .order("created_at")
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">AI</h1>
      <form action={reindexKnowledgeBaseAction} className="mt-4">
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          Re-index knowledge base
        </button>
      </form>

      <h2 className="mt-8 text-xl font-semibold">Daily cost</h2>
      <table className="mt-4 text-left text-sm">
        <thead>
          <tr className="text-muted-foreground">
            <th className="pr-4">Day</th>
            <th className="pr-4">Answers</th>
            <th className="pr-4">Tokens in/out</th>
            <th className="pr-4">Cost (USD)</th>
          </tr>
        </thead>
        <tbody>
          {(usage.data ?? []).map((u) => (
            <tr key={String(u.day)}>
              <td className="pr-4">{String(u.day).slice(0, 10)}</td>
              <td className="pr-4">{u.answers}</td>
              <td className="pr-4">
                {u.tokens_in}/{u.tokens_out}
              </td>
              <td className="pr-4">{Number(u.cost_usd ?? 0).toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 text-xl font-semibold">Conversations</h2>
      <ul className="mt-4 flex flex-col gap-1 text-sm">
        {(convs.data ?? []).map((c) => (
          <li key={c.id}>
            <a href={`?c=${c.id}`} className="underline">
              {c.created_at.slice(0, 16).replace("T", " ")} · {c.locale}
              {c.page ? ` · ${c.page}` : ""}
            </a>
            {c.flagged ? " · flagged" : ""}
            {c.handed_off_at ? " · handed off" : ""}
          </li>
        ))}
      </ul>

      {open ? (
        <div className="mt-6 flex flex-col gap-2">
          <h3 className="font-semibold">Transcript</h3>
          {(messages.data ?? []).map((m) => (
            <div key={m.id} className="rounded-md border p-3 text-sm">
              <p className="text-muted-foreground">
                {m.role}
                {m.flagged ? " · flagged" : ""}
              </p>
              <p className="whitespace-pre-wrap">{m.content}</p>
              <form action={toggleMessageFlag} className="mt-2">
                <input type="hidden" name="id" value={m.id} />
                <input
                  type="hidden"
                  name="flagged"
                  value={m.flagged ? "false" : "true"}
                />
                <button type="submit" className="underline">
                  {m.flagged ? "Unflag" : "Flag"}
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
