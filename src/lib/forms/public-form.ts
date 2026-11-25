import "server-only";
import { headers } from "next/headers";
import type { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import {
  isFormMessageKey,
  type FieldErrorKey,
  type FormErrorKey,
} from "@/lib/validation/support";

/** Public forms that go through `runPublicForm`. Add a name per new form. */
export type PublicFormName = "contact" | "ada" | "bug";

export type PublicFormResult =
  | { status: "ok" }
  | {
      status: "error";
      formError?: FormErrorKey;
      fieldErrors?: Record<string, FieldErrorKey>;
    };

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600;

/** The caller's IP from the proxy headers, or "unknown". */
export async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwarded || requestHeaders.get("x-real-ip")?.trim() || "unknown";
}

/**
 * The shared pipeline of every public form: honeypot, rate limit, validation,
 * then the handler. A bot that fills the honeypot gets a fake success and
 * nothing happens. The rate limit runs before anything is written or sent.
 */
export async function runPublicForm<T>(options: {
  form: PublicFormName;
  schema: z.ZodType<T>;
  input: unknown;
  honeypot: unknown;
  handle: (data: T) => Promise<void>;
}): Promise<PublicFormResult> {
  const { form, schema, input, honeypot, handle } = options;

  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "ok" };
  }

  try {
    const ip = await clientIp();
    const { data: allowed, error } = await createServiceClient().rpc(
      "hit_rate_limit",
      {
        key: `form:${form}:ip:${ip}`,
        max: RATE_LIMIT_MAX,
        window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      },
    );
    if (error) throw error;
    if (!allowed) return { status: "error", formError: "rateLimited" };

    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, FieldErrorKey> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "form");
        if (isFormMessageKey(issue.message)) {
          fieldErrors[field] ??= issue.message as FieldErrorKey;
        }
      }
      return { status: "error", fieldErrors };
    }

    await handle(parsed.data);
    return { status: "ok" };
  } catch (error) {
    console.error(`Public form "${form}" failed`, error);
    return { status: "error", formError: "generic" };
  }
}
