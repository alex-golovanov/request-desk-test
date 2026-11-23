import { Elysia, t } from "elysia";
import { createHistoryStore, demoHistory } from "./history";
import { generateDemoDraft, topics, triage, type DraftProvider } from "./triage";

export type { HistoryEntry } from "./history";
export type { Topic } from "./triage";

const sessionHeaders = t.Object({
  "x-request-session": t.String({
    pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
  }),
});
const outcomeSchema = t.Union([
  t.Object({
    status: t.Literal("ready"),
    topic: t.UnionEnum(topics),
    draft: t.String(),
  }),
  t.Object({
    status: t.Literal("manual_review"),
    topic: t.Null(),
    draft: t.Null(),
  }),
]);
const entrySchema = t.Object({
  id: t.String(),
  text: t.String(),
  createdAt: t.String(),
  outcome: outcomeSchema,
});

export function createApp(generate: DraftProvider = generateDemoDraft) {
  const store = createHistoryStore(demoHistory());

  return new Elysia({ prefix: "/api" })
    .onError(({ code, status }) => {
      if (code === "PARSE" || code === "VALIDATION") {
        return status(400, { status: "invalid_input" });
      }
    })
    .get("/history", ({ headers }) => [...store.list(headers["x-request-session"])], {
      headers: sessionHeaders,
      response: { 200: t.Array(entrySchema) },
    })
    .post(
      "/triage",
      async ({ body, headers }) => {
        const text = body.text.trim();
        const entry = {
          id: crypto.randomUUID(),
          text,
          createdAt: new Date().toISOString(),
          outcome: await triage(text, generate),
        };
        store.add(headers["x-request-session"], entry);
        return entry;
      },
      {
        headers: sessionHeaders,
        body: t.Object({ text: t.String({ minLength: 1, maxLength: 8_000, pattern: "\\S" }) }),
        response: { 200: entrySchema },
      },
    );
}

export type App = ReturnType<typeof createApp>;
