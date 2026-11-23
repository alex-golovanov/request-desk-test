import { Clipboard, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uiCopy } from "@/copy";
import { cn } from "@/lib/cn";
import { OutcomeLabel } from "./recent-requests";
import type { RequestState } from "./state";

type ReplyProps = {
  reply: string;
  onChangeReply: (reply: string) => void;
};

type DraftPanelProps = Pick<ReplyProps, "onChangeReply"> & {
  state: RequestState;
};

function ReadyReply({ reply, onChangeReply }: ReplyProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<"copied" | "select">();

  useEffect(() => {
    if (!editing || copyFeedback === "copied") return;
    textarea.current?.focus();
    if (copyFeedback === "select") textarea.current?.select();
  }, [editing, copyFeedback]);

  async function copyReply() {
    try {
      await navigator.clipboard.writeText(reply.trim());
      setCopyFeedback("copied");
    } catch {
      setEditing(true);
      setCopyFeedback("select");
    }
  }

  return (
    <>
      <div id="reply-content" className="mt-4 flex flex-1 flex-col">
        {editing ? (
          <Textarea
            aria-labelledby="reply-heading"
            ref={textarea}
            value={reply}
            onChange={(event) => {
              setCopyFeedback(undefined);
              onChangeReply(event.target.value);
            }}
            className="min-h-32 flex-1 bg-field font-serif text-base leading-[1.65] [field-sizing:content] sm:text-sm"
          />
        ) : (
          <div className="flex-1">
            <p className="max-w-[70ch] font-serif text-sm leading-[1.7] wrap-break-word whitespace-pre-wrap">
              {reply.trim() ? reply : uiCopy.reply.empty}
            </p>
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border pt-3">
        <p
          role="status"
          className={cn(
            "text-[13px] leading-5",
            copyFeedback === "copied" ? "text-success-foreground" : "text-muted-foreground",
          )}
        >
          {copyFeedback === "copied"
            ? uiCopy.reply.copied
            : copyFeedback === "select"
              ? uiCopy.reply.select
              : uiCopy.reply.review}
        </p>
        <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">
          <Button
            variant="ghost"
            aria-controls="reply-content"
            onClick={() => {
              setCopyFeedback(undefined);
              setEditing(!editing);
            }}
          >
            {editing ? uiCopy.reply.done : uiCopy.reply.edit}
          </Button>
          <Button onClick={copyReply} disabled={!reply.trim()}>
            <Clipboard aria-hidden="true" />
            {uiCopy.reply.copy}
          </Button>
        </div>
      </div>
    </>
  );
}

export function DraftPanel({ state, onChangeReply }: DraftPanelProps) {
  const outcome = state.active?.outcome;
  const pending = state.pending !== null;

  return (
    <section
      aria-labelledby="reply-heading"
      aria-busy={pending}
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border border-border bg-card px-4 py-4 sm:px-5 sm:py-5",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <h2 id="reply-heading" tabIndex={-1} className="text-[15px] leading-5 font-semibold">
          {uiCopy.reply.heading}
        </h2>
        {outcome?.status === "ready" && <OutcomeLabel outcome={outcome} />}
      </div>
      {state.active && outcome?.status === "ready" ? (
        <ReadyReply key={state.active.id} reply={state.reply} onChangeReply={onChangeReply} />
      ) : !pending && outcome?.status === "manual_review" ? (
        <div
          role="status"
          className="mt-4 rounded-xl bg-caution-surface px-3 py-2.5 text-sm leading-6"
        >
          <p className="font-semibold text-caution-foreground">{uiCopy.reply.manual}</p>
          <p className="text-muted-foreground">{uiCopy.reply.manualDetails}</p>
        </div>
      ) : (
        <div role="status" className="relative mt-3 text-sm leading-6">
          {pending ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="absolute top-1.5 right-0 size-3 animate-spin text-muted-foreground motion-reduce:animate-none"
              />
              <p className="text-muted-foreground">{uiCopy.reply.drafting}</p>
            </>
          ) : (
            <p>{uiCopy.reply.waiting}</p>
          )}
        </div>
      )}
    </section>
  );
}
