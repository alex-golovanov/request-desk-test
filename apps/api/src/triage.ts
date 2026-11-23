import { setTimeout as delay } from "node:timers/promises";
import { exampleDrafts } from "./demo-copy";

export const topics = ["delivery", "pricing", "other"] as const;
export type Topic = (typeof topics)[number];

export type Outcome =
  | { status: "ready"; topic: Topic; draft: string }
  | { status: "manual_review"; topic: null; draft: null };

export type DraftProvider = (text: string, signal: AbortSignal) => Promise<string>;

const manualReview: Outcome = { status: "manual_review", topic: null, draft: null };
const deadlineMs = 300;

function isTopic(value: unknown): value is Topic {
  return topics.some((topic) => topic === value);
}

function readOutcome(output: string): Outcome {
  const value: unknown = JSON.parse(output);
  if (
    !value ||
    typeof value !== "object" ||
    !("topic" in value) ||
    !isTopic(value.topic) ||
    !("draft" in value) ||
    typeof value.draft !== "string" ||
    !value.draft.trim()
  ) {
    return manualReview;
  }

  return { status: "ready", topic: value.topic, draft: value.draft.trim() };
}

export async function triage(text: string, generate: DraftProvider): Promise<Outcome> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error("Draft generation timed out"));
        controller.abort();
      }, deadlineMs);
    });
    const output = await Promise.race([generate(text, controller.signal), deadline]);
    return readOutcome(output);
  } catch {
    return manualReview;
  } finally {
    clearTimeout(timer);
  }
}

export const generateDemoDraft: DraftProvider = async (text, signal) => {
  const input = text.toLowerCase();
  if (input.includes("[timeout]")) await delay(1_000, undefined, { signal });
  if (input.includes("[error]")) throw new Error("Demo provider error");
  if (input.includes("[bad-json]")) return "invalid JSON";

  let topic: Topic = "other";
  if (/\b(delivery|shipment|tracking|arrive|shipping)\b|достав/.test(input)) topic = "delivery";
  if (/\b(price|pricing|quote|cost|discount)\b|цен|стоим/.test(input)) topic = "pricing";

  return JSON.stringify({
    topic: input.includes("[bad-topic]") ? "unknown" : topic,
    draft: input.includes("[empty-draft]") ? "   " : exampleDrafts[topic],
  });
};
