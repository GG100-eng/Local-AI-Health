import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";

const STORAGE_KEY = "iframe_webgpu_dismissed";

export function IframeWebGPUBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const dismissed = sessionStorage.getItem(STORAGE_KEY) === "1";
      if (dismissed) return;
      const inIframe = (() => {
        try {
          return window.self !== window.top;
        } catch {
          return true;
        }
      })();
      if (!inIframe) return;
      let hasGpu = false;
      try {
        // @ts-expect-error gpu may be undefined
        const adapter = await navigator.gpu?.requestAdapter();
        hasGpu = !!adapter;
      } catch {
        hasGpu = false;
      }
      if (mounted && !hasGpu) setShow(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const openInNewTab = () => {
    window.open(window.location.href, "_blank", "noopener");
  };

  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:px-6 sm:text-sm"
      data-testid="banner-webgpu"
    >
      <div className="flex-1 truncate">
        Running in WASM mode (single-threaded). Open in a new tab for faster
        WebGPU inference.
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={openInNewTab}
          className="hover-elevate active-elevate-2 inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-amber-900"
          data-testid="button-open-new-tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>New tab</span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="hover-elevate active-elevate-2 inline-flex items-center justify-center rounded-md p-1 text-amber-900"
          aria-label="Dismiss"
          data-testid="button-dismiss-webgpu-banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
