// Service Worker for the Local AI Health Companion.
// Sole purpose: count outbound network requests and stream them to the page,
// so the live "0 requests" demo is provably accurate. Never modifies responses.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Notify all open clients about this fetch. Don't block the response.
  const url = event.request.url;
  const method = event.request.method;
  const ts = Date.now();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      clients.forEach((c) => {
        c.postMessage({
          type: "SW_FETCH",
          url,
          method,
          timestamp: ts,
        });
      });
    }),
  );
  // Pass through — do not call respondWith. Browser handles the request normally.
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PING") {
    event.source && event.source.postMessage({ type: "PONG" });
  }
});
