self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("zion-aromas-v1").then((cache) =>
      cache.addAll(["/", "/produtos", "/categorias", "/brand/zion-aromas-logo.png"])
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
