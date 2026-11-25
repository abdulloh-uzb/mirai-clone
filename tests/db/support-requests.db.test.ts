import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { serviceClient, visitorClient } from "../support/supabase";
import { deleteTestUsers, signInAsStudent } from "../support/users";

afterAll(deleteTestUsers);

const service = serviceClient();
const BUCKET = "support-attachments";
const folder = `db-test-${randomUUID()}`;
const path = `${folder}/shot.png`;
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
let ticketId = "";

beforeAll(async () => {
  const upload = await service.storage
    .from(BUCKET)
    .upload(path, PNG, { contentType: "image/png" });
  if (upload.error) throw upload.error;
  const { data, error } = await service
    .from("tickets")
    .insert({
      type: "contact",
      email: `db-test-${randomUUID()}@example.test`,
      body: "A message for the support team.",
    })
    .select("id")
    .single();
  if (error) throw error;
  ticketId = data.id;
});

afterAll(async () => {
  await service.storage.from(BUCKET).remove([path]);
  await service.from("tickets").delete().eq("id", ticketId);
});

describe.each([
  ["a Visitor", async () => visitorClient()],
  ["a Student", async () => (await signInAsStudent()).client],
])("tickets and attachments as %s", (_name, getClient) => {
  it("cannot read or insert tickets", async () => {
    const client = await getClient();
    const read = await client.from("tickets").select("id").eq("id", ticketId);
    expect(read.data ?? []).toEqual([]);
    const insert = await client
      .from("tickets")
      .insert({ type: "contact", email: "x@example.test", body: "hello" });
    expect(insert.error).not.toBeNull();
  });

  it("cannot list, download or upload attachments", async () => {
    const client = await getClient();
    const bucket = client.storage.from(BUCKET);
    const list = await bucket.list(folder);
    expect(list.data ?? []).toEqual([]);
    expect((await bucket.download(path)).error).not.toBeNull();
    const upload = await bucket.upload(`${randomUUID()}/x.png`, PNG, {
      contentType: "image/png",
    });
    expect(upload.error).not.toBeNull();
  });
});
