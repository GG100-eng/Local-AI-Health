export type NetworkEvent = {
  url: string;
  method: string;
  timestamp: number;
};

let listeners = new Set<(e: NetworkEvent) => void>();
let registered = false;
let swSupported = false;

export function isServiceWorkerActive(): boolean {
  return swSupported;
}

export function subscribeNetwork(cb: (e: NetworkEvent) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emit(e: NetworkEvent) {
  listeners.forEach((l) => l(e));
}

function startPerformanceObserverFallback() {
  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType !== "resource") return;
        emit({
          url: (entry as PerformanceResourceTiming).name,
          method: "GET",
          timestamp: performance.timeOrigin + entry.startTime,
        });
      });
    });
    observer.observe({ entryTypes: ["resource"] });
  } catch (e) {
    console.warn("[net] PerformanceObserver fallback failed:", e);
  }
}

export async function registerNetworkMonitor(): Promise<void> {
  if (registered) return;
  registered = true;

  if ("serviceWorker" in navigator) {
    try {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      const reg = await navigator.serviceWorker.register(swUrl, {
        scope: import.meta.env.BASE_URL,
      });
      swSupported = true;
      console.log("[net] Service Worker registered:", reg.scope);

      navigator.serviceWorker.addEventListener("message", (e) => {
        if (e.data && e.data.type === "SW_FETCH") {
          emit({
            url: e.data.url,
            method: e.data.method,
            timestamp: e.data.timestamp,
          });
        }
      });
      return;
    } catch (e) {
      console.warn("[net] Service Worker registration failed, using PerformanceObserver fallback:", e);
    }
  }

  startPerformanceObserverFallback();
}
