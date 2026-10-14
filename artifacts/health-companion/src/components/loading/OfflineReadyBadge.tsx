import { CheckCircle2 } from "lucide-react";

type Props = {
  backend?: "webgpu" | "wasm" | null;
};

export function OfflineReadyBadge({ backend }: Props) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 shadow-sm"
      data-testid="badge-offline-ready"
    >
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-medium">
        Ready to work offline
        {backend ? (
          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {backend}
          </span>
        ) : null}
      </span>
    </div>
  );
}
