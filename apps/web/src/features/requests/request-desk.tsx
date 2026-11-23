import type { HistoryEntry } from "@neowise/api";
import { ArrowRight } from "lucide-react";
import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { ThemeControl } from "@/components/theme-control";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uiCopy } from "@/copy";
import { createBrowserClient } from "./api";
import { DraftPanel } from "./draft-panel";
import { RecentRequests } from "./recent-requests";
import { initialState, requestReducer } from "./state";

const requests = createBrowserClient();

export function RequestDesk() {
  const [state, dispatch] = useReducer(requestReducer, initialState);
  const [historyStatus, setHistoryStatus] = useState<"loading" | "loaded" | "error">("loading");
  const submissionCount = useRef(0);
  const pending = state.pending !== null;
  const hasDraft = state.active?.outcome.status === "ready";

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const { data, error } = await requests.history();
        if (error || !data) throw new Error("History request failed");
        if (active) {
          dispatch({ type: "loadHistory", history: data });
          setHistoryStatus("loaded");
        }
      } catch {
        if (active) setHistoryStatus("error");
      }
    }

    void loadHistory();
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const text = state.text.trim();
    if (!text) {
      dispatch({ type: "validationError", error: uiCopy.request.required });
      return;
    }

    const submission = ++submissionCount.current;
    dispatch({ type: "start", submission });
    try {
      const { data, error } = await requests.draft(text);
      if (error || !data) throw new Error("Draft request failed");
      dispatch({ type: "complete", submission, entry: data });
    } catch {
      dispatch({ type: "fail", submission, error: uiCopy.request.unavailable });
    }
  }

  function openHistory(entry: HistoryEntry) {
    dispatch({ type: "openHistory", entry });
    document.getElementById("reply-heading")?.focus();
  }

  return (
    <>
      <a
        href="#workspace"
        className="sr-only z-10 rounded-lg bg-card px-4 py-3 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:outline-2 focus:outline-ring"
      >
        {uiCopy.skipLink}
      </a>
      <header className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border">
          <span className="text-sm font-semibold tracking-[-0.02em]">{uiCopy.product}</span>
          <ThemeControl />
        </div>
      </header>
      <main id="workspace" className="mx-auto max-w-6xl px-4 pt-7 pb-12 sm:px-8 sm:pt-10">
        <header className="mb-5 sm:mb-6">
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.045em] sm:text-4xl">
            {uiCopy.heading}
          </h1>
        </header>

        <div className="grid rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <form onSubmit={submit} className="flex min-w-0 flex-col p-4 sm:p-6">
            <label htmlFor="request-text" className="text-sm leading-5 font-semibold">
              {uiCopy.request.label}
            </label>
            <Textarea
              id="request-text"
              name="text"
              value={state.text}
              placeholder={uiCopy.request.placeholder}
              onChange={(event) => dispatch({ type: "changeText", text: event.target.value })}
              maxLength={8_000}
              aria-invalid={Boolean(state.error && !state.text.trim())}
              aria-describedby={state.error ? "request-error" : undefined}
              className="mt-3 min-h-24 max-h-80 [field-sizing:content] sm:text-[15px] lg:min-h-40 lg:flex-1"
            />
            {state.error && (
              <p id="request-error" role="alert" className="mt-2 text-sm text-caution-foreground">
                {state.error}
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
              <Button
                variant="ghost"
                aria-label={uiCopy.request.useSampleLabel}
                onClick={() => dispatch({ type: "changeText", text: uiCopy.request.sample })}
              >
                {uiCopy.request.useSample}
              </Button>
              <Button
                type="submit"
                variant={hasDraft ? "outline" : "primary"}
                className="ml-auto"
                disabled={pending}
              >
                {pending ? uiCopy.request.pending : uiCopy.request.submit}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </form>
          <DraftPanel
            state={state}
            onChangeReply={(reply) => dispatch({ type: "changeReply", reply })}
          />
        </div>

        <RecentRequests
          history={state.history}
          activeId={state.active?.id}
          loading={historyStatus === "loading"}
          error={historyStatus === "error"}
          onOpen={openHistory}
        />
      </main>
    </>
  );
}
