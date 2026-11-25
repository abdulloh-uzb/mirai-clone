import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmailSender } from "./index";

vi.mock("server-only", () => ({}));

const message = { to: "a@example.test", subject: "Hi", text: "Body" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function stubFetch() {
  const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("getEmailSender", () => {
  it("uses Resend when RESEND_API_KEY is set", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    const fetchMock = stubFetch();
    await getEmailSender().send(message);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.resend.com/emails");
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer re_test",
    );
  });

  it("uses Mailpit when there is no key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("MAILPIT_URL", "http://mail.test:1");
    const fetchMock = stubFetch();
    await getEmailSender().send(message);
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    expect(url).toBe("http://mail.test:1/api/v1/send");
  });

  it("throws when the provider rejects the message", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("no", { status: 500 })),
    );
    await expect(getEmailSender().send(message)).rejects.toThrow();
  });
});
