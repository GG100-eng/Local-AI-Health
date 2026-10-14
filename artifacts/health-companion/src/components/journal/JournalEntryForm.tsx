import { useState, type FormEvent } from "react";
import type { JournalEntry, Severity } from "@/lib/types";
import { Save } from "lucide-react";

type Props = {
  onSave: (entry: JournalEntry) => Promise<void> | void;
};

const SEVERITY_LABELS: Record<Severity, string> = {
  1: "Mild",
  2: "Light",
  3: "Moderate",
  4: "Severe",
  5: "Critical",
};

export function JournalEntryForm({ onSave }: Props) {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState<Severity>(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({
        id: crypto.randomUUID(),
        ts: Date.now(),
        symptoms: symptoms.trim(),
        severity,
        notes: notes.trim(),
      });
      setSymptoms("");
      setSeverity(3);
      setNotes("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3"
      data-testid="form-journal-entry"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">
          Symptoms
        </label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Headache, light sensitivity, since this morning…"
          rows={2}
          required
          className="w-full resize-none rounded-md border border-input bg-background px-2.5 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          data-testid="input-journal-symptoms"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">
          How severe is it? <span className="text-muted-foreground">({SEVERITY_LABELS[severity]})</span>
        </label>
        <div className="flex items-center gap-1.5">
          {([1, 2, 3, 4, 5] as Severity[]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSeverity(n)}
              className={`hover-elevate active-elevate-2 h-8 flex-1 rounded-md text-xs font-medium ${
                severity === n
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
              data-testid={`button-severity-${n}`}
              aria-pressed={severity === n}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">
          Notes <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else worth remembering…"
          rows={2}
          className="w-full resize-none rounded-md border border-input bg-background px-2.5 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          data-testid="input-journal-notes"
        />
      </div>
      <button
        type="submit"
        disabled={!symptoms.trim() || saving}
        className="hover-elevate active-elevate-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="button-save-journal"
      >
        <Save className="h-3.5 w-3.5" />
        Save entry
      </button>
    </form>
  );
}
