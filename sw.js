const VERSION = "v0.1.2";
const CACHE_NAME = `pit-survey-${VERSION}`

const APP_STATIC_RESOURCES = [
    "/",
    "/index.html",
    "/styles.css",
    "/app.js",
    "/first_round_list.json",
    "/icon-512x512.png",
];

//install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      //retrieve, add responses to cache
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(APP_STATIC_RESOURCES);
    })(),
  );
});

//activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          //check if active, if not, delete
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        }),
      );
      //set sw itself to be new controller
      await clients.claim();
    })(),
  );
});

//fetch event
//do not make requests if already online
self.addEventListener("fetch", (event) => {
  // when seeking an HTML page
  if (event.request.mode === "navigate") {
    // Return to the index.html page
    event.respondWith(caches.match("/"));
    return;
  }

  // For every other request type
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request.url);
      if (cachedResponse) {
        // Return the cached response if it's available.
        return cachedResponse;
      }
      // Respond with a HTTP 404 response status.
      return new Response(null, { status: 404 });
    })(),
  );
});
