import type { HistoryEntry } from "@neowise/api";
import { ArrowRight, CircleAlert, CornerDownLeft, MessagesSquare } from "lucide-react";
import { useEffect, useReducer, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
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
  const invalidInput = Boolean(state.error && !state.text.trim());
  const hasCurrentManualReview =
    state.active?.outcome.status === "manual_review" && state.active.text === state.text.trim();

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

  function submitFromKeyboard(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.altKey || event.nativeEvent.isComposing) {
      return;
    }
    if (!event.ctrlKey && !event.metaKey && matchMedia("(pointer: coarse)").matches) return;

    event.preventDefault();
    if (!event.repeat && !pending) event.currentTarget.form?.requestSubmit();
  }

  return (
    <>
      <a
        href="#workspace"
        className="sr-only z-10 rounded-lg bg-card px-4 py-3 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:outline-2 focus:outline-ring"
      >
        {uiCopy.skipLink}
      </a>
      <header className="mx-auto max-w-4xl px-4 sm:px-8">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border">
          <h1 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.025em] sm:pl-1">
            <MessagesSquare aria-hidden="true" className="size-5 shrink-0" />
            {uiCopy.product}
          </h1>
          <ThemeControl />
        </div>
      </header>
      <main id="workspace" className="mx-auto max-w-4xl px-4 pt-6 pb-12 sm:px-8 sm:pt-8">
        <div className="space-y-6">
          <form onSubmit={submit} className="min-w-0">
            <label
              htmlFor="request-text"
              className="mb-3 block px-5 text-[15px] leading-5 font-semibold"
            >
              {uiCopy.request.label}
            </label>
            <div className="rounded-2xl border border-border bg-card p-1.5 focus-within:border-input">
              <Textarea
                id="request-text"
                name="text"
                value={state.text}
                placeholder={uiCopy.request.placeholder}
                onChange={(event) => dispatch({ type: "changeText", text: event.target.value })}
                onKeyDown={submitFromKeyboard}
                maxLength={8_000}
                aria-invalid={invalidInput}
                aria-describedby={
                  state.error ? "request-keyboard-hint request-error" : "request-keyboard-hint"
                }
                className="min-h-28 max-h-80 resize-y border-transparent bg-transparent px-3 py-2.5 [field-sizing:content] focus-visible:outline-0 sm:text-[15px]"
              />
              <span id="request-keyboard-hint" className="sr-only">
                {uiCopy.request.keyboardHint}
              </span>
              {state.error && (
                <p
                  id="request-error"
                  role="alert"
                  className="relative mx-3 mt-1 text-sm leading-5 font-medium text-destructive-foreground"
                >
                  <CircleAlert aria-hidden="true" className="absolute top-1 -left-4 size-3" />
                  {state.error}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 border-t border-border px-1.5 pt-1.5">
                <Button
                  variant="ghost"
                  aria-label={uiCopy.request.useSampleLabel}
                  onClick={() => dispatch({ type: "changeText", text: uiCopy.request.sample })}
                >
                  {uiCopy.request.useSample}
                </Button>
                <Button
                  type="submit"
                  variant={
                    hasDraft || invalidInput || hasCurrentManualReview ? "outline" : "primary"
                  }
                  className="ml-auto"
                  disabled={pending}
                >
                  {pending ? uiCopy.request.pending : uiCopy.request.submit}
                  <kbd
                    aria-hidden="true"
                    title={uiCopy.request.keyboardHint}
                    className="hidden size-[18px] shrink-0 place-items-center rounded border border-current/25 sm:inline-grid [@media(pointer:coarse)]:hidden"
                  >
                    <CornerDownLeft />
                  </kbd>
                  <ArrowRight
                    aria-hidden="true"
                    className="sm:hidden [@media(pointer:coarse)]:block"
                  />
                </Button>
              </div>
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
