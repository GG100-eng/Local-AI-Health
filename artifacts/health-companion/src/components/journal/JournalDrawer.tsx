import { useEffect, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { JournalEntryForm } from "./JournalEntryForm";
import { JournalList } from "./JournalList";
import { HandoffButton } from "@/components/handoff/HandoffButton";
import type { JournalEntry } from "@/lib/types";
import {
  loadJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
} from "@/lib/db";

type Props = {
  trigger: ReactNode;
};

export function JournalDrawer({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    loadJournalEntries().then(setEntries);
  }, [open]);

  const handleSave = async (entry: JournalEntry) => {
    await saveJournalEntry(entry);
    setEntries((curr) => [entry, ...curr]);
  };

  const handleDelete = async (id: string) => {
    await deleteJournalEntry(id);
    setEntries((curr) => curr.filter((e) => e.id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md"
        data-testid="drawer-journal"
      >
        <SheetHeader>
          <SheetTitle>Symptom Journal</SheetTitle>
          <SheetDescription>
            Stays on this device. Never uploaded.
          </SheetDescription>
        </SheetHeader>
        <JournalEntryForm onSave={handleSave} />
        <HandoffButton />
        <div className="flex-1">
          <JournalList entries={entries} onDelete={handleDelete} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
