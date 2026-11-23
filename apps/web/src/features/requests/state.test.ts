import { expect, test } from "bun:test";
import type { HistoryEntry } from "@neowise/api";
import { initialState, requestReducer } from "./state";

const usable: HistoryEntry = {
  id: "usable",
  text: "Could you confirm my delivery date?",
  createdAt: "2026-11-23T16:00:00.000Z",
  outcome: { status: "ready", topic: "delivery", draft: "Please share your order number." },
};

const manual: HistoryEntry = {
  id: "manual",
  text: "Something went wrong",
  createdAt: "2026-11-23T16:01:00.000Z",
  outcome: { status: "manual_review", topic: null, draft: null },
};

test("opening a manual-review request clears the previous reply", () => {
  const withDraft = requestReducer(initialState, { type: "openHistory", entry: usable });
  const next = requestReducer(withDraft, { type: "openHistory", entry: manual });

  expect(next.text).toBe(manual.text);
  expect(next.active).toBe(manual);
  expect(next.reply).toBe("");
});

test("a late completion is available in history while the opened request stays active", () => {
  const pending = requestReducer(initialState, { type: "start", submission: 1 });
  const opened = requestReducer(pending, { type: "openHistory", entry: usable });
  const next = requestReducer(opened, { type: "complete", submission: 1, entry: manual });

  expect(next.active).toBe(usable);
  expect(next.history).toEqual([manual]);
});
