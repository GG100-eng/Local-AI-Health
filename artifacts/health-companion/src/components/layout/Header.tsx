import { Activity, BookHeart, Layers } from "lucide-react";
import { SovereigntyPill } from "@/components/shared/SovereigntyPill";
import { JournalDrawer } from "@/components/journal/JournalDrawer";
import { ModelMarketplace } from "@/components/marketplace/ModelMarketplace";
import { VARIANT_LABELS } from "@/lib/systemPrompt";

type Variant = "default" | "cardio";

type Props = {
  activeVariant: Variant;
  onVariantChange: (v: Variant) => void;
  backend: "webgpu" | "wasm" | null;
};

export function Header({ activeVariant, onVariantChange, backend }: Props) {
  return (
    <header
      className="sticky top-[36px] z-30 flex h-12 items-center justify-between gap-2 border-b border-border bg-background/90 px-3 backdrop-blur sm:top-[40px] sm:h-14 sm:px-6"
      data-testid="header-app"
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground sm:text-base">
            Health Companion
          </div>
          <div className="hidden text-[10px] text-muted-foreground sm:block">
            Privacy-first triage · runs in your browser
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <ModelMarketplace
          active={activeVariant}
          onChange={onVariantChange}
          trigger={
            <button
              type="button"
              className="hover-elevate active-elevate-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground sm:h-9 sm:px-3 sm:text-sm"
              data-testid="button-open-marketplace"
              aria-label="Switch specialist model"
            >
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Models</span>
            </button>
          }
        />
        <JournalDrawer
          trigger={
            <button
              type="button"
              className="hover-elevate active-elevate-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground sm:h-9 sm:px-3 sm:text-sm"
              data-testid="button-open-journal"
              aria-label="Open symptom journal"
            >
              <BookHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Journal</span>
            </button>
          }
        />
        <SovereigntyPill
          variantLabel={VARIANT_LABELS[activeVariant]}
          backend={backend}
        />
      </div>
    </header>
  );
}
