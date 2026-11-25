import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { testEnv } from "./env";

// Test user factory. Every user gets a unique email so tests never collide on
// the shared local stack. Clients send the user's JWT, so RLS applies exactly
// as it does for the real app.

type Client = SupabaseClient<Database>;

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

export const TEST_PASSWORD = "Passw0rd!test";

/** Service-role client. Bypasses RLS: use only for setup, cleanup and checks. */
export const serviceClient: Client = createClient<Database>(
  testEnv.NEXT_PUBLIC_SUPABASE_URL,
  testEnv.SUPABASE_SERVICE_ROLE_KEY,
  noSession,
);

/** A Visitor: the anon key and no session. */
export function visitor(): Client {
  return createClient<Database>(
    testEnv.NEXT_PUBLIC_SUPABASE_URL,
    testEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    noSession,
  );
}

export function uniqueEmail(prefix = "student"): string {
  return `${prefix}+${randomUUID()}@example.test`;
}

export type TestAccount = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type TestUser = TestAccount & { client: Client };

type UserOptions = {
  firstName?: string;
  lastName?: string;
  preferredLocale?: string;
  email?: string;
};

const createdUserIds: string[] = [];

/** Creates a Student account (email already confirmed) without signing in. */
export async function createStudentAccount(
  options: UserOptions = {},
): Promise<TestAccount> {
  const email = options.email ?? uniqueEmail();
  const firstName = options.firstName ?? "Test";
  const lastName = options.lastName ?? "Student";
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      preferred_locale: options.preferredLocale ?? "en",
    },
  });
  if (error) throw error;
  createdUserIds.push(data.user.id);
  return {
    id: data.user.id,
    email,
    password: TEST_PASSWORD,
    firstName,
    lastName,
  };
}

/** Creates an Admin account. The role is granted with the service role, as the seed script does. */
export async function createAdminAccount(
  options: UserOptions = {},
): Promise<TestAccount> {
  const account = await createStudentAccount({
    firstName: "Test",
    lastName: "Admin",
    ...options,
  });
  const { error } = await serviceClient
    .from("profiles")
    .update({ role: "admin" })
    .eq("user_id", account.id);
  if (error) throw error;
  return account;
}

async function signIn(account: TestAccount): Promise<TestUser> {
  const client = visitor();
  const { error } = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (error) throw error;
  return { ...account, client };
}

/** A signed-in Student. Call it twice for a second Student. */
export async function signInAsStudent(
  options: UserOptions = {},
): Promise<TestUser> {
  return signIn(await createStudentAccount(options));
}

/** A signed-in Admin. */
export async function signInAsAdmin(
  options: UserOptions = {},
): Promise<TestUser> {
  return signIn(await createAdminAccount(options));
}

/** Remembers a user created outside the factory (for example by sign-up) for cleanup. */
export function trackUser(id: string): void {
  createdUserIds.push(id);
}

/** Finds a user created through the app (for example by the sign-up form) and tracks it for cleanup. */
export async function trackUserByEmail(email: string): Promise<string> {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await serviceClient.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const user = data.users.find((u) => u.email === email);
    if (user) {
      trackUser(user.id);
      return user.id;
    }
    if (data.users.length < 200) break;
  }
  throw new Error(`no user with email ${email}`);
}

/** Deletes every user this process created. Call it from `afterAll`. */
export async function deleteTestUsers(): Promise<void> {
  const ids = createdUserIds.splice(0);
  await Promise.all(ids.map((id) => serviceClient.auth.admin.deleteUser(id)));
}
