"use server";

import { runPublicForm, type PublicFormResult } from "@/lib/forms/public-form";
import { createServiceClient } from "@/lib/supabase/service";
import { HONEYPOT_FIELD } from "@/lib/validation/support";
import {
  classroomWaitlistSchema,
  stateWaitlistSchema,
} from "@/lib/validation/waitlists";
import { localeSchema } from "@/lib/validation/auth";
import type { Locale } from "@/i18n/routing";

// The State waitlist and the Classroom waitlist. Inserts use the service role
// after `runPublicForm` has checked the honeypot, the rate limit and the input.
// No emails are sent.

const honeypotOf = (input: unknown): unknown =>
  typeof input === "object" && input !== null
    ? (input as Record<string, unknown>)[HONEYPOT_FIELD]
    : undefined;

export async function joinStateWaitlist(
  input: unknown,
): Promise<PublicFormResult> {
  const service = createServiceClient();
  return runPublicForm({
    form: "state-waitlist",
    schema: stateWaitlistSchema,
    input,
    honeypot: honeypotOf(input),
    handle: async (data) => {
      const { data: state, error: lookupError } = await service
        .from("states")
        .select("active")
        .eq("code", data.stateCode)
        .maybeSingle();
      if (lookupError) throw lookupError;
      // An unknown or already-open state has nothing to wait for.
      if (!state || state.active) {
        return { status: "error", fieldErrors: { stateCode: "stateInvalid" } };
      }
      const { error } = await service
        .from("state_waitlist")
        .insert({ state_code: data.stateCode, email: data.email });
      if (error) throw error;
    },
  });
}

export async function joinClassroomWaitlist(
  input: unknown,
  localeInput: Locale,
): Promise<PublicFormResult> {
  const locale = localeSchema.parse(localeInput);
  const service = createServiceClient();
  return runPublicForm({
    form: "classroom-waitlist",
    schema: classroomWaitlistSchema,
    input,
    honeypot: honeypotOf(input),
    handle: async (data) => {
      const { data: county, error: lookupError } = await service
        .from("counties")
        .select("id")
        .eq("slug", data.countySlug)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!county) {
        return {
          status: "error",
          fieldErrors: { countySlug: "countyInvalid" },
        };
      }
      const { error } = await service.from("classroom_waitlist").insert({
        email: data.email,
        county_id: county.id,
        locale,
      });
      if (error) throw error;
    },
  });
}
