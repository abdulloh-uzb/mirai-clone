import { z } from "zod";

const locales = z.enum(["en", "ja", "es", "ru"]);

/** A question with four options, exactly one of them correct. */
export const questionFormSchema = z
  .object({
    sectionId: z.uuid().nullable(),
    locale: locales,
    text: z.string().trim().min(1).max(1000),
    explanation: z.string().trim().max(2000),
    options: z.array(z.string().trim().min(1).max(500)).length(4),
    correct: z
      .string()
      .regex(/^[0-3]$/)
      .transform(Number),
  })
  .strict();

export type QuestionForm = z.infer<typeof questionFormSchema>;

/** Reads the admin question form: option0..3, a `correct` radio, optional section. */
export function parseQuestionForm(formData: FormData) {
  const section = formData.get("sectionId");
  return questionFormSchema.safeParse({
    sectionId: typeof section === "string" && section ? section : null,
    locale: formData.get("locale"),
    text: formData.get("text"),
    explanation: formData.get("explanation") ?? "",
    options: [0, 1, 2, 3].map((i) => formData.get(`option${i}`) ?? ""),
    correct: formData.get("correct"),
  });
}
