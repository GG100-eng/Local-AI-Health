import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

const KEY = "disclaimer_dismissed";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(KEY) === "1");
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(KEY, "1");
    setDismissed(true);
  };

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={() => {
          sessionStorage.removeItem(KEY);
          setDismissed(false);
        }}
        className="hover-elevate active-elevate-2 fixed left-3 top-3 z-50 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm sm:left-auto sm:right-4"
        aria-label="Show medical disclaimer"
        data-testid="button-show-disclaimer"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div
      className="sticky top-0 z-50 flex items-start gap-2 border-b border-amber-200 bg-amber-50/95 px-3 py-2 text-[11px] leading-snug text-amber-900 backdrop-blur sm:items-center sm:px-6 sm:text-xs"
      role="region"
      aria-label="Medical disclaimer"
      data-testid="banner-disclaimer"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" />
      <p className="flex-1">
        <span className="font-semibold">Informational only — not medical advice.</span>{" "}
        This tool does not diagnose, treat, or replace a qualified clinician.
        For emergencies, call your local emergency services.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="hover-elevate active-elevate-2 -m-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-amber-900"
        aria-label="Dismiss disclaimer"
        data-testid="button-dismiss-disclaimer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
