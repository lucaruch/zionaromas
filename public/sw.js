const CACHE_NAME = "zion-aromas-v3";
const STATIC_ASSETS = ["/brand/zion-aromas-logo.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Nunca interceptar 3DS / gateways / terceiros — quebra Cardinal e MPI.
  const bypass =
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/js/BP.Mpi") ||
    url.pathname.includes("cardinal") ||
    url.hostname.includes("cardinal") ||
    url.hostname.includes("braspag") ||
    url.hostname.includes("cielo");

  if (bypass) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/")));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && STATIC_ASSETS.some((asset) => event.request.url.endsWith(asset))) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
