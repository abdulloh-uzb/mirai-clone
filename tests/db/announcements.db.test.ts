import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { serviceClient, visitorClient } from "../support/supabase";

const service = serviceClient();
const visitor = visitorClient();
const tag = `test-${crypto.randomUUID()}`;
let draftId = "";
let publishedId = "";

beforeAll(async () => {
  const { data, error } = await service
    .from("announcements")
    .insert([
      { locale: "en", message: `${tag} draft`, published: false },
      { locale: "en", message: `${tag} live`, published: true },
    ])
    .select("id, published");
  if (error) throw error;
  draftId = data.find((row) => !row.published)?.id ?? "";
  publishedId = data.find((row) => row.published)?.id ?? "";
});

afterAll(async () => {
  await service.from("announcements").delete().like("message", `${tag}%`);
});

describe("announcements as a Visitor", () => {
  it("reads published announcements but not drafts", async () => {
    const { data, error } = await visitor
      .from("announcements")
      .select("id, message")
      .like("message", `${tag}%`);

    expect(error).toBeNull();
    expect(data).toEqual([{ id: publishedId, message: `${tag} live` }]);
  });

  it("sees the seeded published announcement for every UI language", async () => {
    const { data } = await visitor
      .from("announcements")
      .select("locale")
      .not("message", "like", "test-%");

    expect(new Set(data?.map((row) => row.locale))).toEqual(
      new Set(["en", "ja", "es", "ru"]),
    );
  });

  it("cannot insert an announcement", async () => {
    const { error } = await visitor
      .from("announcements")
      .insert({ locale: "en", message: `${tag} sneaky`, published: true });

    expect(error?.code).toBe("42501");
  });

  it("cannot update or delete announcements", async () => {
    const updated = await visitor
      .from("announcements")
      .update({ message: `${tag} changed` })
      .eq("id", publishedId)
      .select();
    const deleted = await visitor
      .from("announcements")
      .delete()
      .in("id", [publishedId, draftId])
      .select();

    expect(updated.data ?? []).toEqual([]);
    expect(deleted.data ?? []).toEqual([]);
    const { data } = await service
      .from("announcements")
      .select("message")
      .in("id", [publishedId, draftId])
      .order("message");
    expect(data).toEqual([
      { message: `${tag} draft` },
      { message: `${tag} live` },
    ]);
  });
});
