import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  variantLabel: string;
  backend: "webgpu" | "wasm" | null;
};

function Explainer({ variantLabel, backend }: Props) {
  return (
    <div className="flex flex-col gap-3 p-1 text-sm">
      <div>
        <div className="font-semibold text-foreground">On your device</div>
        <p className="mt-1 text-muted-foreground">
          All inference runs locally in your browser. No symptoms, prompts, or
          responses are ever sent to a server.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs">
        <div>
          <div className="text-muted-foreground">Active model</div>
          <div className="font-medium text-foreground">{variantLabel}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Backend</div>
          <div className="font-medium uppercase tracking-wide text-foreground">
            {backend ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SovereigntyPill({ variantLabel, backend }: Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const trigger = (
    <button
      type="button"
      className="hover-elevate active-elevate-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors sm:px-3 sm:text-sm"
      data-testid="button-sovereignty-pill"
      aria-label="Privacy details"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="hidden sm:inline">On your device</span>
      <span className="sm:hidden">Local</span>
      <span className="hidden text-emerald-600/80 sm:inline">·</span>
      <span className="hidden text-emerald-600/80 sm:inline">{variantLabel}</span>
    </button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <Explainer variantLabel={variantLabel} backend={backend} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Explainer variantLabel={variantLabel} backend={backend} />
      </PopoverContent>
    </Popover>
  );
}
