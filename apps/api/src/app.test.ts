import { expect, test } from "bun:test";
import { createApp, type HistoryEntry } from "./app";

test("validates submitted text and keeps results in the submitting session", async () => {
  const app = createApp();
  const session = crypto.randomUUID();
  const otherSession = crypto.randomUUID();

  function submit(body: string) {
    return app.handle(
      new Request("http://localhost/api/triage", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json", "x-request-session": session },
      }),
    );
  }

  async function history(sessionId: string): Promise<HistoryEntry[]> {
    const response = await app.handle(
      new Request("http://localhost/api/history", {
        headers: { "x-request-session": sessionId },
      }),
    );
    expect(response.status).toBe(200);
    return response.json();
  }

  for (const body of ["{", "{}", '{"text":5}', '{"text":"  "}']) {
    const response = await submit(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ status: "invalid_input" });
  }

  const response = await submit(JSON.stringify({ text: "  Delivery question [bad-topic]  " }));
  expect(response.status).toBe(200);
  const entry = (await response.json()) as HistoryEntry;

  expect(entry.text).toBe("Delivery question [bad-topic]");
  expect(entry.outcome).toEqual({ status: "manual_review", topic: null, draft: null });
  expect((await history(session))[0]).toEqual(entry);
  expect((await history(otherSession)).some(({ id }) => id === entry.id)).toBe(false);
});
