import { historyCopy } from "./demo-copy";
import type { Outcome } from "./triage";

export type HistoryEntry = {
  id: string;
  text: string;
  createdAt: string;
  outcome: Outcome;
};

const historyLimit = 5;
const sessionLimit = 1_000;

export function createHistoryStore(seed: readonly HistoryEntry[] = []) {
  const histories = new Map<string, readonly HistoryEntry[]>();
  const sample = seed.slice(0, historyLimit);

  function list(session: string) {
    return histories.get(session) ?? sample;
  }

  function add(session: string, entry: HistoryEntry) {
    const next = [entry, ...list(session)].slice(0, historyLimit);
    histories.delete(session);
    histories.set(session, next);
    const oldest = histories.keys().next().value;
    if (histories.size > sessionLimit && oldest !== undefined) histories.delete(oldest);
    return next;
  }

  return { add, list };
}

export function demoHistory(now = Date.now()): HistoryEntry[] {
  return [
    {
      id: "sample-delivery",
      text: historyCopy.delivery.text,
      createdAt: new Date(now - 12 * 60_000).toISOString(),
      outcome: {
        status: "ready",
        topic: "delivery",
        draft: historyCopy.delivery.draft,
      },
    },
    {
      id: "sample-pricing",
      text: historyCopy.pricing.text,
      createdAt: new Date(now - 35 * 60_000).toISOString(),
      outcome: {
        status: "ready",
        topic: "pricing",
        draft: historyCopy.pricing.draft,
      },
    },
    {
      id: "sample-manual",
      text: historyCopy.manual.text,
      createdAt: new Date(now - 63 * 60_000).toISOString(),
      outcome: { status: "manual_review", topic: null, draft: null },
    },
  ];
}
