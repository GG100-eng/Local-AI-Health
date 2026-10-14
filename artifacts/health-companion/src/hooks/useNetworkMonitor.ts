import { useEffect, useState } from "react";
import { subscribeNetwork, type NetworkEvent } from "@/lib/registerSw";

const MAX_EVENTS = 50;

export function useNetworkMonitor(startTs: number) {
  const [events, setEvents] = useState<NetworkEvent[]>([]);

  useEffect(() => {
    return subscribeNetwork((e) => {
      // Ignore events from before mounting (SW may replay) and HMR/dev noise.
      if (e.timestamp < startTs) return;
      // Filter out dev-only assets, source maps, and HMR pings.
      const url = e.url;
      if (
        url.includes("/__replco/") ||
        url.includes("/@vite/") ||
        url.includes("/@react-refresh") ||
        url.includes(".map") ||
        url.includes("/src/") ||
        url.includes("/node_modules/.vite/") ||
        url.endsWith("/sw.js")
      ) {
        return;
      }
      setEvents((curr) => {
        const next = [...curr, e];
        return next.length > MAX_EVENTS
          ? next.slice(next.length - MAX_EVENTS)
          : next;
      });
    });
  }, [startTs]);

  return events;
}
