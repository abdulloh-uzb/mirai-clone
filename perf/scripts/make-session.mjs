// Signs in the demo Student and Admin, and writes their Supabase session
// cookies plus the URLs the plan needs to perf/data/session.tsv.
// Run before every JMeter run: local sessions expire after one hour.
//
//   node perf/scripts/make-session.mjs
//
// Needs the local stack, .env.local and `pnpm db:seed:demo`.

import { mkdirSync, writeFileSync } from "node:fs";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD || "Demo-pass-2026!";
if (!url || !anon || !service)
  throw new Error("Supabase env missing in .env.local");

async function cookieHeader(email) {
  const jar = new Map();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(`${email}: ${error.message}`);
  return {
    header: [...jar].map(([n, v]) => `${n}=${v}`).join("; "),
    userId: data.user.id,
  };
}

const admin = createClient(url, service, { auth: { persistSession: false } });

const student = await cookieHeader("learner@roadready.example");
const adminSession = await cookieHeader("admin@roadready.example");

const { data: enrollment, error: enrollmentError } = await admin
  .from("enrollments")
  .select("id")
  .eq("user_id", student.userId)
  .eq("status", "active")
  .limit(1)
  .single();
if (enrollmentError)
  throw new Error(`learner enrollment: ${enrollmentError.message}`);

const { data: post } = await admin
  .from("posts")
  .select("slug")
  .eq("published", true)
  .eq("locale", "en")
  .limit(1)
  .maybeSingle();

const { data: county } = await admin
  .from("counties")
  .select("slug")
  .eq("slug", "los-angeles-county")
  .maybeSingle();

const row = {
  studentCookie: student.header,
  adminCookie: adminSession.header,
  enrollmentId: enrollment.id,
  blogSlug: post?.slug ?? "",
  countySlug: county?.slug ?? "alameda-county",
};

mkdirSync("perf/data", { recursive: true });
// Tab-separated, no header row: the JMeter CSV Data Set names the columns.
writeFileSync("perf/data/session.tsv", Object.values(row).join("\t") + "\n");
console.log(
  `session.tsv written (enrollment ${row.enrollmentId}, blog "${row.blogSlug || "none"}", county ${row.countySlug})`,
);
