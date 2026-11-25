import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  deleteTestUsers,
  serviceClient,
  signInAsAdmin,
  signInAsStudent,
  type TestUser,
  visitor,
} from "../support/users";

// Who can read what, per the access column of spec section 13. Every table
// gets at least one row through the service role first, so "returns nothing"
// means RLS hid the row, not that the table was empty.

const tag = `test-${crypto.randomUUID()}`;

let student: TestUser;
let otherStudent: TestUser;
let admin: TestUser;

type Fixture = { orderId: string; enrollmentId: string; certificateId: string };
let mine: Fixture;
let theirs: Fixture;

async function single<T>(
  query: PromiseLike<{ data: T; error: unknown }>,
): Promise<NonNullable<T>> {
  const { data, error } = await query;
  if (error) throw error;
  if (!data) throw new Error("no row returned");
  return data;
}

async function caCourse() {
  return single(
    serviceClient
      .from("courses")
      .select("id, sections(id, position)")
      .eq("state_code", "CA")
      .single(),
  );
}

/** A paid, active enrollment with a certificate, as the webhook and later phases create it. */
async function enroll(userId: string): Promise<Fixture> {
  const course = await caCourse();
  const order = await single(
    serviceClient
      .from("orders")
      .insert({
        user_id: userId,
        product: "online_course",
        amount_cents: 2499,
        currency: "usd",
        status: "paid",
        stripe_session_id: `cs_${crypto.randomUUID()}`,
      })
      .select("id")
      .single(),
  );
  const enrollment = await single(
    serviceClient
      .from("enrollments")
      .insert({
        user_id: userId,
        course_id: course.id,
        order_id: order.id,
        course_locale: "en",
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 86_400_000).toISOString(),
      })
      .select("id")
      .single(),
  );
  const certificate = await single(
    serviceClient
      .from("certificates")
      .insert({
        enrollment_id: enrollment.id,
        cert_no: `${tag}-${crypto.randomUUID()}`,
      })
      .select("id")
      .single(),
  );
  return {
    orderId: order.id,
    enrollmentId: enrollment.id,
    certificateId: certificate.id,
  };
}

beforeAll(async () => {
  [student, otherStudent, admin] = await Promise.all([
    signInAsStudent(),
    signInAsStudent(),
    signInAsAdmin(),
  ]);
  [mine, theirs] = await Promise.all([
    enroll(student.id),
    enroll(otherStudent.id),
  ]);

  const course = await caCourse();
  const sectionId = course.sections[0]?.id ?? null;
  const question = await single(
    serviceClient
      .from("questions")
      .insert({
        section_id: sectionId,
        locale: "en",
        text: `${tag} question`,
        explanation: "Because.",
      })
      .select("id")
      .single(),
  );

  const writes = await Promise.all([
    serviceClient.from("answer_options").insert([
      { question_id: question.id, text: "Right", is_correct: true },
      { question_id: question.id, text: "Wrong", is_correct: false },
    ]),
    serviceClient.from("identity_checks").insert({
      enrollment_id: mine.enrollmentId,
      question_key: "dob",
      correct: true,
    }),
    serviceClient.from("security_questions").insert({
      user_id: student.id,
      question: "First pet?",
      answer_hash: "not-a-real-hash",
    }),
    serviceClient
      .from("stripe_events")
      .insert({ event_id: `evt_${tag}`, type: "checkout.session.completed" }),
    serviceClient.from("kb_chunks").insert({
      source: tag,
      locale: "en",
      content: "Knowledge base text.",
    }),
  ]);
  for (const { error } of writes) if (error) throw error;
});

afterAll(async () => {
  await serviceClient.from("questions").delete().like("text", `${tag}%`);
  await serviceClient
    .from("stripe_events")
    .delete()
    .eq("event_id", `evt_${tag}`);
  await serviceClient.from("kb_chunks").delete().eq("source", tag);
  await serviceClient.from("courts").delete().like("slug", `${tag}%`);
  await serviceClient.from("state_waitlist").delete().like("email", `%${tag}%`);
  await serviceClient.from("audit_log").delete().eq("entity", tag);
  await serviceClient.from("lessons").delete().eq("title->>en", tag);
  for (const table of [
    "faq_items",
    "pages",
    "posts",
    "changelog",
    "reviews",
  ] as const) {
    await serviceClient.from(table).delete().like("slug", `${tag}%`);
  }
  await deleteTestUsers();
});

const serverOnlyTables = [
  "questions",
  "answer_options",
  "identity_checks",
  "security_questions",
  "stripe_events",
  "kb_chunks",
] as const;

const roles = {
  Visitor: () => visitor(),
  Student: () => student.client,
  Admin: () => admin.client,
};

describe("server-only tables", () => {
  for (const [role, client] of Object.entries(roles)) {
    it.each(serverOnlyTables)(
      `deny a ${role} any read of %s`,
      async (table) => {
        const { data, error } = await client().from(table).select("*");

        // No table privileges for client roles: Postgres refuses the read
        // outright (42501 insufficient_privilege), not just an empty result.
        expect(error?.code).toBe("42501");
        expect(data).toBeNull();
      },
    );
  }

  it("hold the rows the tests read through the service role", async () => {
    const { count } = await serviceClient
      .from("answer_options")
      .select("*", { count: "exact", head: true });

    expect(count).toBeGreaterThanOrEqual(2);
  });
});

async function anyCountyId(): Promise<string> {
  const county = await single(
    serviceClient.from("counties").select("id").limit(1).single(),
  );
  return county.id;
}

describe("public tables", () => {
  it("let a Visitor read courts and lessons", async () => {
    const countyId = await anyCountyId();
    const course = await caCourse();
    const sectionId = course.sections[0]?.id ?? "";
    const writes = await Promise.all([
      serviceClient.from("courts").insert({
        state_code: "CA",
        county_id: countyId,
        slug: tag,
        name: "Demo Superior Court",
      }),
      serviceClient.from("lessons").insert({
        section_id: sectionId,
        position: 1000,
        min_seconds: 60,
        title: { en: tag },
      }),
    ]);
    for (const { error } of writes) if (error) throw error;

    const courts = await visitor()
      .from("courts")
      .select("slug")
      .eq("slug", tag);
    const lessons = await visitor()
      .from("lessons")
      .select("title")
      .eq("section_id", sectionId)
      .eq("position", 1000);

    expect(courts.data).toEqual([{ slug: tag }]);
    expect(lessons.data).toEqual([{ title: { en: tag } }]);
  });

  it("stamp updated_at when a row changes", async () => {
    const countyId = await anyCountyId();
    const before = await single(
      serviceClient
        .from("courts")
        .insert({
          state_code: "CA",
          county_id: countyId,
          slug: `${tag}-stamp`,
          name: "Old",
        })
        .select("updated_at")
        .single(),
    );

    const after = await single(
      serviceClient
        .from("courts")
        .update({ name: "New" })
        .eq("slug", `${tag}-stamp`)
        .select("updated_at")
        .single(),
    );

    expect(Date.parse(after.updated_at)).toBeGreaterThan(
      Date.parse(before.updated_at),
    );
  });

  const contentTables = [
    "faq_items",
    "pages",
    "posts",
    "changelog",
    "reviews",
  ] as const;

  /** A published and a draft row; tables with a required category get one. */
  function insertLiveAndDraft(table: (typeof contentTables)[number]) {
    const rows = [
      {
        locale: "en",
        slug: `${tag}-live`,
        title: "Live",
        body: "",
        published: true,
      },
      {
        locale: "en",
        slug: `${tag}-draft`,
        title: "Draft",
        body: "",
        published: false,
      },
    ];
    if (table === "faq_items") {
      return serviceClient
        .from(table)
        .insert(rows.map((row) => ({ ...row, category: "about" })));
    }
    return serviceClient.from(table).insert(rows);
  }

  it.each(contentTables)(
    "let a Visitor read published %s rows but not drafts",
    async (table) => {
      const { error } = await insertLiveAndDraft(table);
      if (error) throw error;

      const { data } = await visitor()
        .from(table)
        .select("slug")
        .like("slug", `${tag}%`);

      expect(data).toEqual([{ slug: `${tag}-live` }]);
    },
  );
});

describe("the state waitlist", () => {
  const email = `${tag}@example.test`;

  it("takes a Visitor's email but does not show it back", async () => {
    const { error } = await visitor()
      .from("state_waitlist")
      .insert({ state_code: "TX", email });

    expect(error).toBeNull();

    const visitorRead = await visitor()
      .from("state_waitlist")
      .select("email")
      .eq("email", email);
    const studentRead = await student.client
      .from("state_waitlist")
      .select("email")
      .eq("email", email);

    expect(visitorRead.data ?? []).toEqual([]);
    expect(studentRead.data ?? []).toEqual([]);
  });

  it("is readable by an Admin", async () => {
    await visitor()
      .from("state_waitlist")
      .insert({ state_code: "NV", email: `admin-${email}` });

    const { data } = await admin.client
      .from("state_waitlist")
      .select("state_code")
      .eq("email", `admin-${email}`);

    expect(data).toEqual([{ state_code: "NV" }]);
  });
});

describe("admin-only tables", () => {
  const adminTables = ["report_attempts", "tickets", "audit_log"] as const;

  beforeAll(async () => {
    const report = await single(
      serviceClient
        .from("completion_reports")
        .insert({ certificate_id: mine.certificateId, status: "queued" })
        .select("id")
        .single(),
    );
    const writes = await Promise.all([
      serviceClient.from("report_attempts").insert({
        report_id: report.id,
        request: { tag },
        response: {},
      }),
      serviceClient.from("tickets").insert({
        type: "contact",
        user_id: student.id,
        email: student.email,
        body: tag,
      }),
      serviceClient.from("audit_log").insert({
        actor_id: admin.id,
        action: "test",
        entity: tag,
      }),
    ]);
    for (const { error } of writes) if (error) throw error;
  });

  it.each(adminTables)(
    "hide %s from a Visitor and a Student",
    async (table) => {
      for (const client of [visitor(), student.client]) {
        const { data } = await client.from(table).select("id");

        expect(data ?? []).toEqual([]);
      }
    },
  );

  it.each(adminTables)("let an Admin read %s", async (table) => {
    const { data, error } = await admin.client.from(table).select("id");

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });
});

describe("lesson blocks", () => {
  it("are readable only by a Student enrolled in the course", async () => {
    const course = await caCourse();
    const sectionId = course.sections[1]?.id ?? "";
    const lesson = await single(
      serviceClient
        .from("lessons")
        .insert({ section_id: sectionId, position: 1002, title: { en: tag } })
        .select("id")
        .single(),
    );
    const { error } = await serviceClient.from("lesson_blocks").insert({
      lesson_id: lesson.id,
      position: 1,
      type: "rich_text",
      content: { en: tag },
    });
    if (error) throw error;
    const outsider = await signInAsStudent();

    const read = (client: ReturnType<typeof visitor>) =>
      client.from("lesson_blocks").select("content").eq("lesson_id", lesson.id);
    const enrolledRead = await read(student.client);
    const outsiderRead = await read(outsider.client);
    const visitorRead = await read(visitor());

    expect(enrolledRead.data).toEqual([{ content: { en: tag } }]);
    expect(outsiderRead.data ?? []).toEqual([]);
    expect(visitorRead.data ?? []).toEqual([]);
  });
});

describe("a Student's own records", () => {
  it("reads only their own orders", async () => {
    const { data, error } = await student.client.from("orders").select("id");

    expect(error).toBeNull();
    expect(data).toEqual([{ id: mine.orderId }]);
  });

  it("reads only their own enrollments", async () => {
    const { data, error } = await student.client
      .from("enrollments")
      .select("id");

    expect(error).toBeNull();
    expect(data).toEqual([{ id: mine.enrollmentId }]);
  });

  it("reads only their own certificates", async () => {
    const { data, error } = await student.client
      .from("certificates")
      .select("id");

    expect(error).toBeNull();
    expect(data).toEqual([{ id: mine.certificateId }]);
  });

  it("cannot create an enrollment for themselves", async () => {
    const course = await caCourse();

    const { error } = await student.client.from("enrollments").insert({
      user_id: student.id,
      course_id: course.id,
      course_locale: "en",
    });

    expect(error).not.toBeNull();
  });

  it("include submitted exam attempts but not one in progress", async () => {
    const { data: attempts, error } = await serviceClient
      .from("exam_attempts")
      .insert([
        {
          enrollment_id: mine.enrollmentId,
          submitted_at: new Date().toISOString(),
          score: 20,
          passed: true,
        },
        { enrollment_id: mine.enrollmentId },
        {
          enrollment_id: theirs.enrollmentId,
          submitted_at: new Date().toISOString(),
        },
      ])
      .select("id");
    if (error) throw error;

    const { data } = await student.client.from("exam_attempts").select("id");

    expect(data).toEqual([{ id: attempts[0]?.id }]);
  });

  it("include their refunds, lesson progress and AI conversations", async () => {
    const course = await caCourse();
    const sectionId = course.sections[0]?.id ?? "";
    const lesson = await single(
      serviceClient
        .from("lessons")
        .insert({ section_id: sectionId, position: 1001, title: { en: tag } })
        .select("id")
        .single(),
    );
    const conversations = await single(
      serviceClient
        .from("ai_conversations")
        .insert([{ user_id: student.id }, { user_id: otherStudent.id }])
        .select("id, user_id"),
    );
    const myConversation = conversations.find((c) => c.user_id === student.id);
    const writes = await Promise.all([
      serviceClient.from("refunds").insert([
        { order_id: mine.orderId, amount_cents: 2499, pct: 100 },
        { order_id: theirs.orderId, amount_cents: 0, pct: 0 },
      ]),
      serviceClient.from("lesson_progress").insert([
        {
          enrollment_id: mine.enrollmentId,
          lesson_id: lesson.id,
          seconds_spent: 30,
        },
        {
          enrollment_id: theirs.enrollmentId,
          lesson_id: lesson.id,
          seconds_spent: 40,
        },
      ]),
      serviceClient.from("ai_messages").insert(
        conversations.map((c) => ({
          conversation_id: c.id,
          role: "user",
          content: `hello from ${c.user_id}`,
        })),
      ),
    ]);
    for (const { error } of writes) if (error) throw error;

    const refunds = await student.client.from("refunds").select("pct");
    const progress = await student.client
      .from("lesson_progress")
      .select("seconds_spent");
    const chats = await student.client.from("ai_conversations").select("id");
    const messages = await student.client.from("ai_messages").select("content");

    expect(refunds.data).toEqual([{ pct: 100 }]);
    expect(progress.data).toEqual([{ seconds_spent: 30 }]);
    expect(chats.data).toEqual([{ id: myConversation?.id }]);
    expect(messages.data).toEqual([{ content: `hello from ${student.id}` }]);
  });

  it("include the status of their completion report but not its internals", async () => {
    const { error } = await serviceClient.from("completion_reports").insert([
      {
        certificate_id: mine.certificateId,
        status: "accepted",
        error: "secret",
      },
      {
        certificate_id: theirs.certificateId,
        status: "rejected",
        error: "secret",
      },
    ]);
    if (error) throw error;

    const status = await student.client
      .from("completion_reports")
      .select("certificate_id, status")
      .eq("status", "accepted");
    const others = await student.client
      .from("completion_reports")
      .select("id")
      .eq("certificate_id", theirs.certificateId);
    const internals = await student.client
      .from("completion_reports")
      .select("error");

    expect(status.data).toEqual([
      { certificate_id: mine.certificateId, status: "accepted" },
    ]);
    expect(others.data).toEqual([]);
    expect(internals.data ?? []).toEqual([]);
  });

  it("are hidden from a Visitor", async () => {
    for (const table of ["orders", "enrollments", "certificates"] as const) {
      const { data } = await visitor().from(table).select("id");

      expect(data ?? []).toEqual([]);
    }
  });
});
