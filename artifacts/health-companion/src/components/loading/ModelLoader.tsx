import { useEffect, useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { OfflineReadyBadge } from "./OfflineReadyBadge";
import { Loader2 } from "lucide-react";
import { useModelLoader } from "@/hooks/useModelLoader";

type Props = {
  isReady: boolean;
  backend: "webgpu" | "wasm" | null;
};

function formatMB(bytes: number): string {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function shortenFilename(name: string): string {
  const parts = name.split("/");
  return parts[parts.length - 1] || name;
}

export function ModelLoader({ isReady, backend }: Props) {
  const state = useModelLoader();
  const [stayVisible, setStayVisible] = useState(true);

  // After ready, show the badge for ~1.5s then dismiss the overlay.
  useEffect(() => {
    if (isReady) {
      const t = setTimeout(() => setStayVisible(false), 1500);
      return () => clearTimeout(t);
    }
  }, [isReady]);

  if (isReady && !stayVisible) return null;

  const pct = isReady ? 100 : Math.round(state.overallPct);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 px-6 backdrop-blur-sm"
      data-testid="overlay-model-loader"
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-card-border bg-card p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isReady ? (
              <span className="text-xl">✓</span>
            ) : (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {isReady ? "All models loaded" : "Preparing your on-device assistant"}
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            This downloads once, then lives on your device forever.
          </p>
        </div>

        {!isReady && (
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span
                  className="truncate font-medium text-foreground"
                  data-testid="text-current-file"
                  title={state.currentFile ?? ""}
                >
                  {state.currentFile
                    ? shortenFilename(state.currentFile)
                    : "Initializing…"}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {state.currentTotal
                    ? `${formatMB(state.currentLoaded)} / ${formatMB(state.currentTotal)}`
                    : ""}
                </span>
              </div>
              <ProgressBar
                value={
                  state.currentTotal
                    ? (state.currentLoaded / state.currentTotal) * 100
                    : 0
                }
                trackClassName="h-1.5"
              />
              <span className="text-[11px] text-muted-foreground">
                {state.modelName ?? ""}
              </span>
            </div>

            <div className="flex w-full flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium text-foreground">Overall</span>
                <span
                  className="tabular-nums text-muted-foreground"
                  data-testid="text-overall-pct"
                >
                  {pct}%
                </span>
              </div>
              <ProgressBar value={pct} />
            </div>
          </div>
        )}

        {isReady && (
          <div className="flex flex-col items-center gap-3">
            <OfflineReadyBadge backend={backend} />
            <p className="text-center text-xs text-muted-foreground">
              You can disconnect from the network now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
