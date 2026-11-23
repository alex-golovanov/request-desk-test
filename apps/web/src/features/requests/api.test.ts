import { expect, test } from "bun:test";
import { createApp } from "@neowise/api";
import { createRequestClient } from "./api";

test("the typed client preserves timestamp and request strings", async () => {
  const requests = createRequestClient(createApp(), crypto.randomUUID());
  const { data: history, error } = await requests.history();

  expect(error).toBeNull();
  expect(typeof history?.[0]?.createdAt).toBe("string");

  const text = "2026-11-23T16:00:00.000Z";
  const result = await requests.draft(text);
  expect(result.data?.text).toBe(text);
});
