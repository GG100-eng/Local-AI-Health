import { AlertTriangle, Phone } from "lucide-react";

export function EmergencyChip() {
  return (
    <div
      className="mx-3 my-2 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm sm:mx-6"
      role="alert"
      data-testid="alert-emergency"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <div className="flex-1 text-foreground">
        <div className="font-semibold text-destructive">
          This sounds urgent.
        </div>
        <p className="mt-0.5 text-foreground/80">
          If you're experiencing a medical emergency, call your local emergency
          services right now. This tool does not replace emergency medical care.
        </p>
        <a
          href="tel:911"
          className="hover-elevate active-elevate-2 mt-2 inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground"
          data-testid="link-call-911"
        >
          <Phone className="h-3.5 w-3.5" />
          Call emergency services
        </a>
      </div>
    </div>
  );
}
