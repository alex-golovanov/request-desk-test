import { treaty } from "@elysia/eden";
import type { App } from "@neowise/api";

function browserSession() {
  const key = "request-desk-session";
  const fresh = crypto.randomUUID();
  try {
    const existing = sessionStorage.getItem(key);
    if (existing && /^[0-9a-f-]{36}$/.test(existing)) return existing;
    sessionStorage.setItem(key, fresh);
  } catch {
    // The current page can still keep its session when storage is unavailable.
  }
  return fresh;
}

export function createRequestClient(origin: string | App, sessionId: string) {
  // Preserve the JSON strings declared by the API, including date-shaped messages.
  const api = treaty<App>(origin, { parseDate: false }).api;
  const session = { headers: { "x-request-session": sessionId } };

  return {
    history: () => api.history.get(session),
    draft: (text: string) => api.requests.post({ text }, session),
  };
}

export function createBrowserClient() {
  return createRequestClient(window.location.origin, browserSession());
}
