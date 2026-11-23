import { Clipboard, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uiCopy } from "@/copy";
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
      <div id="reply-content" className="mt-3 flex flex-1 flex-col">
        {editing ? (
          <Textarea
            aria-labelledby="reply-heading"
            ref={textarea}
            value={reply}
            onChange={(event) => {
              setCopyFeedback(undefined);
              onChangeReply(event.target.value);
            }}
            className="min-h-40 flex-1 bg-draft font-serif text-[17px] leading-[1.55] [field-sizing:content]"
          />
        ) : (
          <div className="flex-1 rounded-lg border border-transparent bg-draft px-3.5 py-3">
            <p className="max-w-[55ch] font-serif text-[17px] leading-[1.55] wrap-break-word whitespace-pre-wrap">
              {reply.trim() ? reply : uiCopy.reply.empty}
            </p>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p role="status" className="text-xs leading-5 text-muted-foreground">
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
      className="flex min-w-0 flex-col border-t border-border p-4 sm:p-6 lg:border-t-0 lg:border-l"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reply-heading" tabIndex={-1} className="text-sm leading-5 font-semibold">
          {uiCopy.reply.heading}
        </h2>
        {outcome && <OutcomeLabel outcome={outcome} />}
      </div>
      {state.active && outcome?.status === "ready" ? (
        <ReadyReply key={state.active.id} reply={state.reply} onChangeReply={onChangeReply} />
      ) : (
        <div
          role="status"
          className="mt-3 flex min-h-24 flex-1 items-start gap-2 rounded-lg bg-draft px-3.5 py-3 text-sm leading-6 lg:min-h-40"
        >
          {pending ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="mt-1.5 size-3 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none"
              />
              <p className="text-muted-foreground">{uiCopy.reply.drafting}</p>
            </>
          ) : outcome?.status === "manual_review" ? (
            <>
              <TriangleAlert
                aria-hidden="true"
                className="mt-1.5 size-3 shrink-0 text-caution-foreground"
              />
              <div>
                <p className="font-semibold">{uiCopy.reply.manual}</p>
                <p className="text-muted-foreground">{uiCopy.reply.manualDetails}</p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">{uiCopy.reply.waiting}</p>
          )}
        </div>
      )}
    </section>
  );
}
