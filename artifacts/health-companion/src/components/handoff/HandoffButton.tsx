import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { loadJournalEntries, loadMessages } from "@/lib/db";
import { generateHandoffPdf } from "@/lib/handoffPdf";

export function HandoffButton() {
  const [busy, setBusy] = useState(false);

  const exportPdf = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const [messages, entries] = await Promise.all([
        loadMessages(),
        loadJournalEntries(),
      ]);
      generateHandoffPdf({ messages, entries });
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={exportPdf}
      disabled={busy}
      className="hover-elevate active-elevate-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
      data-testid="button-export-handoff"
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      Export for clinician
    </button>
  );
}
