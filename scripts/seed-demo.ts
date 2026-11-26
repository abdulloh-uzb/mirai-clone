// Demo seed: an Admin, a Student with a finished course and certificate, and a
// Student part-way through the course. Safe to run again.
//
//   pnpm db:seed:demo
//
// Needs the local stack and `.env.local`. The password comes from DEMO_PASSWORD.
import type { SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import type { Database } from "../src/lib/database.types";
import { createStatelessClient } from "../src/lib/supabase/stateless";

type Client = SupabaseClient<Database>;

export const DEMO_ADMIN = "admin@roadready.example";
export const DEMO_STUDENT = "student@roadready.example";
export const DEMO_LEARNER = "learner@roadready.example";
const DEFAULT_PASSWORD = "Demo-pass-2026!";

type Result<T> = { data: T; error: { message: string } | null };

/** The data of a query, failing on an error or no row. */
function must<T>(result: Result<T>): NonNullable<T> {
  if (result.error) throw new Error(result.error.message);
  if (result.data == null) throw new Error("expected a row");
  return result.data;
}

/** For calls that may return nothing: only checks for an error. */
function ok(result: Result<unknown>): void {
  if (result.error) throw new Error(result.error.message);
}

async function ensureAuthUser(
  service: Client,
  email: string,
  firstName: string,
  lastName: string,
  password: string,
): Promise<string> {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await service.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) {
      await service.auth.admin.updateUserById(found.id, {
        password,
        email_confirm: true,
      });
      return found.id;
    }
    if (data.users.length < 200) break;
  }
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (error) throw error;
  return data.user.id;
}

/** Demo accounts are verified: the auth flag and the profile flag the app reads. */
async function ensureUser(
  service: Client,
  email: string,
  firstName: string,
  lastName: string,
  password: string,
): Promise<string> {
  const id = await ensureAuthUser(
    service,
    email,
    firstName,
    lastName,
    password,
  );
  ok(
    await service
      .from("profiles")
      .update({ email_verified_at: new Date().toISOString() })
      .eq("user_id", id)
      .is("email_verified_at", null),
  );
  return id;
}

async function signIn(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<Client> {
  const client = createStatelessClient(url, anonKey);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

/** Order, payment event and enrollment for a user, through the same function the webhook uses. */
async function ensureEnrollment(
  service: Client,
  userId: string,
  eventId: string,
): Promise<string> {
  const found = await service
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  ok(found);
  if (found.data) return found.data.id;
  const order = must(
    await service
      .from("orders")
      .insert({
        user_id: userId,
        product: "online_course",
        amount_cents: 2499,
        course_locale: "en",
        status: "pending",
      })
      .select("id")
      .single(),
  );
  ok(
    await service.rpc("fulfill_checkout", {
      p_event_id: eventId,
      p_event_type: "checkout.session.completed",
      p_order_id: order.id,
      p_session_id: `cs_demo_${eventId}`,
      p_payment_intent: `pi_demo_${eventId}`,
    }),
  );
  const enrollment = must(
    await service
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .single(),
  );
  return enrollment.id;
}

async function saveDetails(
  user: Client,
  enrollmentId: string,
  countyId: string,
  legalName: string,
  licenseNo: string,
) {
  const due = new Date();
  due.setMonth(due.getMonth() + 3);
  ok(
    await user.rpc("save_driver_details", {
      p_enrollment_id: enrollmentId,
      p_legal_name: legalName,
      p_dob: "1990-05-17",
      p_license_no: licenseNo,
      p_license_state: "CA",
      p_phone: "+1 555 010 0199",
      p_county_id: countyId,
      p_citation_no: "DEMO-1234",
      p_court_due_date: due.toISOString().slice(0, 10),
      p_security_question: "first_car",
      p_security_answer: "Civic",
    }),
  );
}

type ExamPayload = { attemptId: string; questions: { id: string }[] };

export async function seedDemo(options: {
  url: string;
  anonKey: string;
  serviceKey: string;
  password: string;
  issueCertificate: (enrollmentId: string) => Promise<string>;
}): Promise<void> {
  const { url, anonKey, password } = options;
  const service = createStatelessClient(url, options.serviceKey);

  const course = must(
    await service.from("courses").select("id").limit(1).single(),
  );
  const county = must(
    await service.from("counties").select("id").limit(1).single(),
  );
  const sections = must(
    await service
      .from("sections")
      .select("id, position")
      .eq("course_id", course.id)
      .order("position"),
  );
  const lessonRows = must(
    await service
      .from("lessons")
      .select("id, sections!inner(id, course_id)")
      .eq("sections.course_id", course.id),
  );

  // Admin
  await ensureUser(service, DEMO_ADMIN, "Demo", "Admin", password);
  ok(await service.rpc("make_admin", { target_email: DEMO_ADMIN }));

  // Student with a finished course
  const studentId = await ensureUser(
    service,
    DEMO_STUDENT,
    "Sam",
    "Student",
    password,
  );
  const enrollmentId = await ensureEnrollment(service, studentId, "evt_demo_1");
  const student = await signIn(url, anonKey, DEMO_STUDENT, password);
  const done = must(
    await service
      .from("enrollments")
      .select("status")
      .eq("id", enrollmentId)
      .single(),
  );
  if (done.status !== "completed") {
    await saveDetails(
      student,
      enrollmentId,
      county.id,
      "Samuel Student",
      "D1234567",
    );
    const now = new Date().toISOString();
    ok(
      await service.from("lesson_progress").upsert(
        lessonRows.map((l) => ({
          enrollment_id: enrollmentId,
          lesson_id: l.id,
          seconds_spent: 5000,
          completed_at: now,
        })),
        { onConflict: "enrollment_id,lesson_id" },
      ),
    );
    ok(
      await service.from("quiz_attempts").insert(
        sections.map((s) => ({
          enrollment_id: enrollmentId,
          section_id: s.id,
          passed: true,
          score: 1,
          submitted_at: now,
        })),
      ),
    );
    const exam = must(
      await student.rpc("start_exam", { p_enrollment_id: enrollmentId }),
    ) as unknown as ExamPayload;
    const options_ = must(
      await service
        .from("answer_options")
        .select("id, question_id")
        .in(
          "question_id",
          exam.questions.map((q) => q.id),
        )
        .eq("is_correct", true),
    );
    const answers = Object.fromEntries(
      options_.map((o) => [o.question_id, o.id]),
    );
    ok(
      await student.rpc("submit_exam", {
        p_attempt_id: exam.attemptId,
        p_answers: answers,
      }),
    );
  }
  const certNo = await options.issueCertificate(enrollmentId);
  console.log(`${DEMO_STUDENT}: course complete, certificate ${certNo}`);

  // Student in the middle of the course (section 1 done)
  const learnerId = await ensureUser(
    service,
    DEMO_LEARNER,
    "Lee",
    "Learner",
    password,
  );
  const learnerEnrollment = await ensureEnrollment(
    service,
    learnerId,
    "evt_demo_2",
  );
  const learner = await signIn(url, anonKey, DEMO_LEARNER, password);
  await saveDetails(
    learner,
    learnerEnrollment,
    county.id,
    "Leland Learner",
    "D7654321",
  );
  const first = sections[0];
  if (first) {
    const firstLessons = must(
      await service.from("lessons").select("id").eq("section_id", first.id),
    );
    const now = new Date().toISOString();
    ok(
      await service.from("lesson_progress").upsert(
        firstLessons.map((l) => ({
          enrollment_id: learnerEnrollment,
          lesson_id: l.id,
          seconds_spent: 600,
          completed_at: now,
        })),
        { onConflict: "enrollment_id,lesson_id" },
      ),
    );
    const passed = must(
      await service
        .from("quiz_attempts")
        .select("id")
        .eq("enrollment_id", learnerEnrollment)
        .eq("section_id", first.id)
        .eq("passed", true)
        .limit(1),
    );
    if (!passed.length) {
      ok(
        await service.from("quiz_attempts").insert({
          enrollment_id: learnerEnrollment,
          section_id: first.id,
          passed: true,
          score: 1,
          submitted_at: now,
        }),
      );
    }
  }
  console.log(`${DEMO_LEARNER}: section 1 done`);
}

async function main() {
  config({ path: ".env.local", quiet: true });
  const { z } = await import("zod");
  const env = z
    .object({
      NEXT_PUBLIC_SUPABASE_URL: z.url(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
      DEMO_PASSWORD: z.string().min(8).default(DEFAULT_PASSWORD),
    })
    .parse(process.env);
  // `server-only` throws outside Next.js; stub it for this trusted script.
  const require = createRequire(import.meta.url);
  const serverOnly = require.resolve("server-only");
  require.cache[serverOnly] = {
    id: serverOnly,
    filename: serverOnly,
    loaded: true,
    exports: {},
  } as NodeJS.Module;
  // Loaded after dotenv: these modules read the environment when imported.
  const { issueCertificateFor } = await import("../src/lib/certificates/issue");
  await seedDemo({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    password: env.DEMO_PASSWORD,
    issueCertificate: issueCertificateFor,
  });
  // Report the demo completion: first batch sends it, the second sees it accepted.
  process.env.MOCK_REPORTING_ALWAYS_ACCEPT = "1";
  const { adapterFor } = await import("../src/lib/reporting/adapters");
  const { runBatch } = await import("../src/lib/reporting/run-batch-core");
  const service = createStatelessClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
  for (let i = 0; i < 2; i++) {
    const counts = await runBatch(
      { service, adapterFor },
      { trigger: "manual", now: new Date() },
    );
    console.log(`Report batch ${i + 1}: ${JSON.stringify(counts)}`);
  }
  console.log("Demo data ready.");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
