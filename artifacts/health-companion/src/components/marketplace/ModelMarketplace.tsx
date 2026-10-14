import { useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Check, Heart, Stethoscope } from "lucide-react";
import { send as workerSend } from "@/lib/workerBus";
import { VARIANT_LABELS, type SystemPromptVariant } from "@/lib/systemPrompt";

type Variant = Exclude<SystemPromptVariant, "p2p">;

const VARIANTS: Array<{
  key: Variant;
  title: string;
  blurb: string;
  icon: ReactNode;
}> = [
  {
    key: "default",
    title: VARIANT_LABELS.default,
    blurb:
      "Broad triage across common symptoms. Best starting point for most questions.",
    icon: <Stethoscope className="h-4 w-4" />,
  },
  {
    key: "cardio",
    title: VARIANT_LABELS.cardio,
    blurb:
      "Heightened attention to cardiovascular signals — chest discomfort, palpitations, breathing.",
    icon: <Heart className="h-4 w-4" />,
  },
];

type Props = {
  trigger: ReactNode;
  active: Variant;
  onChange: (v: Variant) => void;
};

export function ModelMarketplace({ trigger, active, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const swap = (v: Variant) => {
    onChange(v);
    workerSend({
      type: "SWAP_MODEL",
      payload: { systemPromptVariant: v },
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-4 sm:max-w-md"
        data-testid="drawer-marketplace"
      >
        <SheetHeader>
          <SheetTitle>Specialist Models</SheetTitle>
          <SheetDescription>
            Switches the system prompt. Underlying model stays loaded — instant
            swap, no extra download.
          </SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-2">
          {VARIANTS.map((v) => {
            const isActive = active === v.key;
            return (
              <li key={v.key}>
                <button
                  type="button"
                  onClick={() => swap(v.key)}
                  className={`hover-elevate active-elevate-2 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    isActive
                      ? "border-primary/40 bg-accent"
                      : "border-card-border bg-card"
                  }`}
                  data-testid={`button-variant-${v.key}`}
                  aria-pressed={isActive}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {v.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-foreground">
                        {v.title}
                      </div>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          <Check className="h-2.5 w-2.5" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {v.blurb}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Note:</span> All
          variants run the same on-device model. Swapping changes the assistant's
          focus and tone — not its diagnostic ability.
        </div>
      </SheetContent>
    </Sheet>
  );
}
