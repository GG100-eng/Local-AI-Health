import { Trash2 } from "lucide-react";
import type { JournalEntry, Severity } from "@/lib/types";

const SEVERITY_COLOR: Record<Severity, string> = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-emerald-100 text-emerald-700",
  3: "bg-amber-100 text-amber-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-rose-100 text-rose-700",
};

type Props = {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function JournalList({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No journal entries yet. Save the first one above.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2" data-testid="list-journal">
      {entries.map((e) => (
        <li
          key={e.id}
          className="flex flex-col gap-1.5 rounded-xl border border-card-border bg-card p-3 shadow-sm"
          data-testid={`item-journal-${e.id}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs text-muted-foreground">{formatDate(e.ts)}</div>
            <div className="flex items-center gap-1">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_COLOR[e.severity]}`}
              >
                Severity {e.severity}
              </span>
              <button
                type="button"
                onClick={() => onDelete(e.id)}
                className="hover-elevate active-elevate-2 -m-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground"
                aria-label="Delete entry"
                data-testid={`button-delete-${e.id}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="text-sm text-foreground">{e.symptoms}</div>
          {e.notes && (
            <div className="text-xs text-muted-foreground">{e.notes}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
