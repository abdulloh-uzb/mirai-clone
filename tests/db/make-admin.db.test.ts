import { afterAll, describe, expect, it } from "vitest";
import { makeAdmin } from "../../scripts/make-admin";
import {
  createStudentAccount,
  deleteTestUsers,
  serviceClient,
  signInAsStudent,
  uniqueEmail,
  visitor,
} from "../support/users";

afterAll(deleteTestUsers);

async function roleOf(userId: string) {
  const { data, error } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data.role;
}

describe("the admin seed script", () => {
  it("makes an existing account an Admin by email", async () => {
    const account = await createStudentAccount();

    await makeAdmin(serviceClient, account.email);

    expect(await roleOf(account.id)).toBe("admin");
  });

  it("matches the email regardless of case and surrounding spaces", async () => {
    const account = await createStudentAccount();

    await makeAdmin(serviceClient, `  ${account.email.toUpperCase()} `);

    expect(await roleOf(account.id)).toBe("admin");
  });

  it("refuses an email with no account", async () => {
    await expect(
      makeAdmin(serviceClient, uniqueEmail("nobody")),
    ).rejects.toThrow(/no account/i);
  });

  it("cannot be used by a Student or a Visitor to promote anyone", async () => {
    const student = await signInAsStudent();

    await expect(makeAdmin(student.client, student.email)).rejects.toThrow();
    await expect(makeAdmin(visitor(), student.email)).rejects.toThrow();

    expect(await roleOf(student.id)).toBe("student");
  });
});
