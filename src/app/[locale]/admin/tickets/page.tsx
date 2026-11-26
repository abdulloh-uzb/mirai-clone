import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { setTicketStatus } from "@/lib/admin/content-actions";
import { createServiceClient } from "@/lib/supabase/service";

const TYPES = ["contact", "bug", "ada", "ai_handoff"] as const;
const STATUSES = ["open", "in_progress", "closed"] as const;

export default async function AdminTicketsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/tickets">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const sp = await searchParams;
  const type = TYPES.find((t) => t === sp.type);
  const status = STATUSES.find((s) => s === sp.status);
  let q = createServiceClient()
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (type) q = q.eq("type", type);
  if (status) q = q.eq("status", status);
  const { data } = await q;

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/tickets" className="rounded-md border px-3 py-1">
          All
        </Link>
        {TYPES.map((t) => (
          <Link
            key={t}
            href={`/admin/tickets?type=${t}`}
            className="rounded-md border px-3 py-1"
          >
            {t}
          </Link>
        ))}
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/tickets?status=${s}`}
            className="rounded-md border px-3 py-1"
          >
            {s}
          </Link>
        ))}
      </nav>
      <div className="mt-4 flex flex-col gap-2">
        {(data ?? []).map((t) => (
          <details key={t.id} className="rounded-md border p-3">
            <summary className="cursor-pointer text-sm font-medium">
              [{t.type}] {t.email} · {t.status} · {t.created_at.slice(0, 10)}
            </summary>
            <p className="mt-2 text-sm whitespace-pre-wrap">{t.body}</p>
            <form action={setTicketStatus} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={t.id} />
              <select
                name="status"
                defaultValue={t.status}
                className="rounded-md border bg-background px-2 py-1 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
              >
                Update
              </button>
            </form>
          </details>
        ))}
        {(data ?? []).length === 0 ? (
          <p className="text-muted-foreground">No tickets.</p>
        ) : null}
      </div>
    </section>
  );
}
