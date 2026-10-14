import { useMemo, useState } from "react";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor";

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 40 ? u.pathname.slice(0, 37) + "…" : u.pathname;
    return `${u.host}${path}`;
  } catch {
    return url.slice(0, 60);
  }
}

function categorize(url: string): "model" | "cdn" | "other" {
  if (url.includes("huggingface.co") || url.includes(".onnx")) return "model";
  if (url.includes("cdn.") || url.includes("jsdelivr") || url.includes("unpkg"))
    return "cdn";
  return "other";
}

export function NetworkBadge({ ready }: { ready: boolean }) {
  const startTs = useMemo(() => Date.now(), []);
  const events = useNetworkMonitor(startTs);
  const [open, setOpen] = useState(false);

  const modelCount = events.filter((e) => categorize(e.url) === "model").length;
  const totalCount = events.length;
  const isClean = ready && totalCount === 0;

  return (
    <div
      className="fixed bottom-3 left-3 z-30 flex max-w-[calc(100vw-1.5rem)] flex-col gap-1.5"
      data-testid="widget-network"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`hover-elevate active-elevate-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
          isClean
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-border bg-card text-foreground"
        }`}
        data-testid="button-network-toggle"
        aria-expanded={open}
      >
        <Activity className="h-3.5 w-3.5" />
        <span className="tabular-nums">{totalCount}</span>
        <span>app requests</span>
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
      </button>
      {open && (
        <div className="max-h-72 w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-card-border bg-card p-2.5 text-xs shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-border pb-2">
            <div>
              <div className="font-semibold text-foreground">
                Live network activity
              </div>
              <div className="text-[10px] text-muted-foreground">
                Counted by Service Worker · dev-tooling requests filtered
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Model files
              </div>
              <div className="font-semibold text-foreground tabular-nums">
                {modelCount}
              </div>
            </div>
          </div>
          {events.length === 0 ? (
            <div className="rounded-md bg-emerald-50 p-3 text-emerald-700">
              No app-level outbound requests since this widget started.
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {events
                .slice()
                .reverse()
                .slice(0, 25)
                .map((e, i) => {
                  const cat = categorize(e.url);
                  return (
                    <li
                      key={`${e.timestamp}-${i}`}
                      className="flex items-start gap-2 rounded-md p-1.5 hover:bg-muted/60"
                    >
                      <span
                        className={`mt-0.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${
                          cat === "model"
                            ? "bg-primary"
                            : cat === "cdn"
                              ? "bg-amber-500"
                              : "bg-muted-foreground"
                        }`}
                        title={cat}
                      />
                      <div className="flex-1 break-all text-[11px] text-foreground">
                        <span className="font-mono">{shortenUrl(e.url)}</span>
                      </div>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                        {new Date(e.timestamp).toLocaleTimeString()}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
