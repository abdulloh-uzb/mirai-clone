import { expect, test } from "@playwright/test";
import { loadCourse } from "../support/course";
import { firstLink, waitForEmail } from "../support/mailpit";
import {
  deleteTestUsers,
  serviceClient,
  trackUserByEmail,
  uniqueEmail,
  visitor,
} from "../support/users";

test.afterAll(deleteTestUsers);

// The whole product in one run: sign up, verify, pay (mock), enter details,
// study (time and quizzes are set with the service role to keep the run
// short), pass the final exam in the browser and verify the certificate.
test("signup, pay, study, pass the exam and get a verifiable certificate", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const email = uniqueEmail("fullflow");
  const password = "Correct-horse-1";

  // Sign up and verify the email.
  await page.goto("/signup");
  const form = page.getByRole("main");
  await form.getByLabel("First name").fill("Frida");
  await form.getByLabel("Last name").fill("Flow");
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Password").fill(password);
  await form.getByLabel("Preferred language").selectOption("en");
  await form.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("button", { name: /Frida/ })).toBeVisible();
  const userId = await trackUserByEmail(email);
  await page.goto(firstLink(await waitForEmail(email)));
  await expect(
    page.getByRole("region", { name: "Verify your email" }),
  ).toBeHidden();

  // Pay in mock mode.
  await page.goto("/portal");
  await page
    .getByRole("button", { name: /Pay \$24\.99 and start in English/ })
    .click();
  await expect(page.getByRole("link", { name: "Continue" })).toBeVisible();
  const { data: enrollment } = await serviceClient
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .single();
  const enrollmentId = enrollment!.id;

  // Driver details (through the same RPC the form calls).
  const { countyId, lessons, sections } = await loadCourse();
  const user = visitor();
  expect(
    (await user.auth.signInWithPassword({ email, password })).error,
  ).toBeNull();
  const due = new Date();
  due.setMonth(due.getMonth() + 2);
  const saved = await user.rpc("save_driver_details", {
    p_enrollment_id: enrollmentId,
    p_legal_name: "Frida Flow",
    p_dob: "1991-02-03",
    p_license_no: "F7654321",
    p_license_state: "CA",
    p_phone: "+1 555 010 0100",
    p_county_id: countyId,
    p_citation_no: "FLOW-1",
    p_court_due_date: due.toISOString().slice(0, 10),
    p_security_question: "first_car",
    p_security_answer: "Civic",
  });
  expect(saved.error).toBeNull();

  // Study: lessons, minimum time and quizzes.
  const now = new Date().toISOString();
  await serviceClient.from("lesson_progress").insert(
    lessons.map((l) => ({
      enrollment_id: enrollmentId,
      lesson_id: l.id,
      seconds_spent: 5000,
      completed_at: now,
    })),
  );
  await serviceClient.from("quiz_attempts").insert(
    sections.map((s) => ({
      enrollment_id: enrollmentId,
      section_id: s.id,
      passed: true,
      score: 1,
      submitted_at: now,
    })),
  );

  // Final exam in the browser, answering every question correctly.
  await page.goto(`/portal/exam/${enrollmentId}`);
  await page.getByTestId("exam-confirm-check").check();
  await page.getByRole("button", { name: "Start the exam" }).click();
  await expect(page.locator("fieldset legend")).toBeVisible({
    timeout: 20_000,
  });
  for (let i = 0; i < 25; i++) {
    const legend = await page.locator("fieldset legend").innerText();
    const text = legend.replace(/^\d+\.\s*/, "");
    const { data: q } = await serviceClient
      .from("questions")
      .select("id, answer_options(text, is_correct)")
      .eq("text", text)
      .eq("locale", "en")
      .limit(1)
      .single();
    const correct = q!.answer_options.find((o) => o.is_correct)!;
    await page
      .locator("fieldset label")
      .filter({ hasText: correct.text })
      .first()
      .click();
    if (i < 24)
      await page
        .getByTestId("exam-runner")
        .getByRole("button", { name: "Next", exact: true })
        .click();
  }
  await page.getByRole("button", { name: "Submit exam" }).click();
  await page.getByRole("button", { name: "Submit now" }).click();
  await expect(page.getByText("You passed the final exam.")).toBeVisible();

  // Certificate and public verification.
  await page.goto("/portal/certificates");
  await expect(page.getByText(/RR-\d{4}-/).first()).toBeVisible();
  const certNo = (
    await page
      .getByText(/RR-\d{4}-[A-Z0-9]+/)
      .first()
      .innerText()
  ).match(/RR-\d{4}-[A-Z0-9]+/)![0];
  await page.goto(`/verify/${certNo}`);
  await expect(page.getByText(/Valid certificate/)).toBeVisible();
});
