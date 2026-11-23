import { expect, test } from "bun:test";
import { createHistoryStore, demoHistory, type HistoryEntry } from "./history";
import { generateDemoDraft, triage } from "./triage";

test("returns a nonblank draft for a recognized topic", async () => {
  const result = await triage("Could you confirm our delivery window?", generateDemoDraft);
  expect(result).toEqual({ status: "ready", topic: "delivery", draft: expect.any(String) });
  expect(result.draft?.trim()).toBeTruthy();
});

test("returns manual review for every demo model failure", async () => {
  for (const marker of ["[error]", "[bad-json]", "[bad-topic]", "[empty-draft]", "[timeout]"]) {
    await expect(triage(marker, generateDemoDraft)).resolves.toEqual({
      status: "manual_review",
      topic: null,
      draft: null,
    });
  }
});

test("keeps five completed requests per session and preserves the matching outcome", () => {
  const [sample] = demoHistory();
  if (!sample) throw new Error("Missing sample request");
  const store = createHistoryStore([sample]);
  const entries = Array.from({ length: 7 }, (_, index): HistoryEntry => ({
    ...sample,
    id: `request-${index}`,
    text: `Message ${index}`,
  }));

  for (const entry of entries) store.add("first", entry);

  expect(store.list("first")).toEqual(entries.slice(-5).reverse());
  expect(store.list("second")).toEqual([sample]);
});
