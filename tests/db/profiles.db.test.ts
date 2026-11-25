import { afterAll, describe, expect, it } from "vitest";
import {
  deleteTestUsers,
  serviceClient,
  signInAsAdmin,
  signInAsStudent,
  TEST_PASSWORD,
  trackUser,
  uniqueEmail,
  visitor,
} from "../support/users";

afterAll(deleteTestUsers);

async function signUp(metadata: Record<string, string>) {
  const { data, error } = await visitor().auth.signUp({
    email: uniqueEmail(),
    password: TEST_PASSWORD,
    options: { data: metadata },
  });
  if (error) throw error;
  if (!data.user) throw new Error("sign-up returned no user");
  trackUser(data.user.id);
  return data.user;
}

async function profileOf(userId: string) {
  const { data, error } = await serviceClient
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

describe("profiles on sign-up", () => {
  it("creates a Student profile from the sign-up details", async () => {
    const user = await signUp({
      first_name: "Aiko",
      last_name: "Tanaka",
      preferred_locale: "ja",
    });

    const profile = await profileOf(user.id);

    expect(profile).toMatchObject({
      first_name: "Aiko",
      last_name: "Tanaka",
      preferred_locale: "ja",
      role: "student",
      email_verified_at: null,
    });
  });

  it("ignores a role in the sign-up metadata", async () => {
    const user = await signUp({
      first_name: "Eve",
      last_name: "Sneaky",
      role: "admin",
    });

    const profile = await profileOf(user.id);

    expect(profile.role).toBe("student");
  });
});

describe("a Visitor's access to profiles", () => {
  it("cannot read any profile", async () => {
    await signInAsStudent();

    const { data } = await visitor().from("profiles").select("*");

    expect(data ?? []).toEqual([]);
  });
});

describe("a Student's access to profiles", () => {
  it("can read their own profile", async () => {
    const student = await signInAsStudent({ firstName: "Maria" });

    const { data, error } = await student.client.from("profiles").select("*");

    expect(error).toBeNull();
    expect(data).toEqual([
      expect.objectContaining({ user_id: student.id, first_name: "Maria" }),
    ]);
  });

  it("cannot read another Student's profile", async () => {
    const student = await signInAsStudent();
    const other = await signInAsStudent();

    const { data, error } = await student.client
      .from("profiles")
      .select("*")
      .eq("user_id", other.id);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("can update their own name and UI language", async () => {
    const student = await signInAsStudent();

    const { error } = await student.client
      .from("profiles")
      .update({ first_name: "Ana", preferred_locale: "es" })
      .eq("user_id", student.id);

    expect(error).toBeNull();
    expect(await profileOf(student.id)).toMatchObject({
      first_name: "Ana",
      preferred_locale: "es",
    });
  });

  it("cannot update another Student's profile", async () => {
    const student = await signInAsStudent();
    const other = await signInAsStudent({ firstName: "Original" });

    const { data } = await student.client
      .from("profiles")
      .update({ first_name: "Hacked" })
      .eq("user_id", other.id)
      .select();

    expect(data).toEqual([]);
    expect((await profileOf(other.id)).first_name).toBe("Original");
  });

  it("cannot change their own role", async () => {
    const student = await signInAsStudent();

    const { error } = await student.client
      .from("profiles")
      .update({ role: "admin" })
      .eq("user_id", student.id);

    expect(error).not.toBeNull();
    expect((await profileOf(student.id)).role).toBe("student");
  });

  it("cannot mark their own email as verified", async () => {
    const student = await signInAsStudent();

    const { error } = await student.client
      .from("profiles")
      .update({ email_verified_at: new Date().toISOString() })
      .eq("user_id", student.id);

    expect(error).not.toBeNull();
    expect((await profileOf(student.id)).email_verified_at).toBeNull();
  });
});

describe("an Admin's access to profiles", () => {
  it("can read every profile", async () => {
    const first = await signInAsStudent();
    const second = await signInAsStudent();
    const admin = await signInAsAdmin();

    const { data, error } = await admin.client
      .from("profiles")
      .select("user_id")
      .in("user_id", [first.id, second.id, admin.id]);

    expect(error).toBeNull();
    expect(data?.map((row) => row.user_id).sort()).toEqual(
      [first.id, second.id, admin.id].sort(),
    );
  });

  it("can change a Student's role", async () => {
    const student = await signInAsStudent();
    const admin = await signInAsAdmin();

    const { error } = await admin.client
      .from("profiles")
      .update({ role: "admin" })
      .eq("user_id", student.id);

    expect(error).toBeNull();
    expect((await profileOf(student.id)).role).toBe("admin");
  });
});
