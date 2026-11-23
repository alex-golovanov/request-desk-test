import type { HistoryEntry } from "@neowise/api";

export type RequestState = {
  text: string;
  reply: string;
  active: HistoryEntry | null;
  history: HistoryEntry[];
  pending: number | null;
  error: string | null;
};

type Action =
  | { type: "changeText"; text: string }
  | { type: "changeReply"; reply: string }
  | { type: "openHistory"; entry: HistoryEntry }
  | { type: "loadHistory"; history: HistoryEntry[] }
  | { type: "start"; submission: number }
  | { type: "validationError"; error: string }
  | { type: "complete"; submission: number; entry: HistoryEntry }
  | { type: "fail"; submission: number; error: string };

export const initialState: RequestState = {
  text: "",
  reply: "",
  active: null,
  history: [],
  pending: null,
  error: null,
};

function mergeHistory(current: HistoryEntry[], incoming: HistoryEntry[]) {
  const entries = new Map([...current, ...incoming].map((entry) => [entry.id, entry]));
  return [...entries.values()]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 5);
}

function openEntry(state: RequestState, entry: HistoryEntry): RequestState {
  return {
    ...state,
    text: entry.text,
    reply: entry.outcome.draft ?? "",
    active: entry,
    pending: null,
    error: null,
  };
}

export function requestReducer(state: RequestState, action: Action): RequestState {
  switch (action.type) {
    case "changeText":
      return {
        ...state,
        text: action.text,
        active: null,
        reply: "",
        pending: null,
        error: null,
      };
    case "changeReply":
      return { ...state, reply: action.reply };
    case "openHistory":
      return openEntry(state, action.entry);
    case "loadHistory":
      return { ...state, history: mergeHistory(state.history, action.history) };
    case "start":
      return { ...state, active: null, reply: "", pending: action.submission, error: null };
    case "validationError":
      return { ...state, active: null, reply: "", pending: null, error: action.error };
    case "complete": {
      const next = { ...state, history: mergeHistory(state.history, [action.entry]) };
      return state.pending === action.submission ? openEntry(next, action.entry) : next;
    }
    case "fail":
      return state.pending === action.submission
        ? { ...state, pending: null, error: action.error }
        : state;
  }
}
