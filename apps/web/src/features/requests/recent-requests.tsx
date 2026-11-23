import type { HistoryEntry } from "@neowise/api";
import { locale, uiCopy } from "@/copy";
import { cn } from "@/lib/cn";

const timeLabel = new Intl.DateTimeFormat(locale, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function OutcomeLabel({ outcome }: { outcome: HistoryEntry["outcome"] }) {
  const ready = outcome.status === "ready";
  return (
    <span
      className={cn(
        "text-xs leading-5 font-medium whitespace-nowrap",
        ready ? "text-info" : "text-caution-foreground",
      )}
    >
      {ready ? uiCopy.topics[outcome.topic] : uiCopy.history.manual}
    </span>
  );
}

type RecentRequestsProps = {
  history: HistoryEntry[];
  activeId?: string;
  loading: boolean;
  error: boolean;
  onOpen: (entry: HistoryEntry) => void;
};

export function RecentRequests({ history, activeId, loading, error, onOpen }: RecentRequestsProps) {
  return (
    <section aria-labelledby="recent-heading" className="mt-7 sm:mt-8">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3.5 sm:px-4">
        <h2 id="recent-heading" className="text-[15px] leading-5 font-semibold">
          {uiCopy.history.heading}
        </h2>
        <p className="text-[13px] text-muted-foreground">{uiCopy.history.caption}</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {history.length ? (
          <ul className="divide-y divide-border">
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  aria-current={activeId === entry.id ? "true" : undefined}
                  onClick={() => onOpen(entry)}
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:grid-cols-[minmax(0,1fr)_8rem_3.5rem] sm:gap-4 sm:px-3.5",
                    activeId === entry.id && "bg-accent font-medium",
                  )}
                >
                  <span className="col-span-2 line-clamp-2 min-w-0 text-sm leading-5 wrap-anywhere sm:col-span-1">
                    {entry.text}
                  </span>
                  <span className="flex sm:justify-center">
                    <OutcomeLabel outcome={entry.outcome} />
                  </span>
                  <time
                    className="text-right text-xs text-muted-foreground tabular-nums"
                    dateTime={entry.createdAt}
                  >
                    {timeLabel.format(new Date(entry.createdAt))}
                  </time>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="px-4 py-5 text-sm text-muted-foreground sm:px-5">
            {loading ? uiCopy.history.loading : error ? uiCopy.history.error : uiCopy.history.empty}
          </p>
        )}
      </div>
    </section>
  );
}
