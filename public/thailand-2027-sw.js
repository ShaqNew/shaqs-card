const SHELL_CACHE = "thailand-2027-v2-shell-v1";
const STATIC_CACHE = "thailand-2027-v2-static-v1";
const IMAGE_CACHE = "thailand-2027-v2-images-v1";

const PRECACHE_URLS = [
  "/naanas-space/thailand-2027-v2",
  "/thailand-2027-v2.webmanifest",
  "/icons/thailand-2027-192.png",
  "/icons/thailand-2027-512.png",
  "/icons/thailand-2027-180.png",
];

const MAX_STATIC_ENTRIES = 140;
const MAX_IMAGE_ENTRIES = 80;

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const excess = keys.length - maxEntries;
  await Promise.all(keys.slice(0, excess).map((req) => cache.delete(req)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          fetch(url, { cache: "no-store" }).then((response) => {
            if (response && response.ok) {
              return cache.put(url, response.clone());
            }
            return undefined;
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const allowed = new Set([SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !allowed.has(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok && response.status === 200) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok && response.status === 200) {
      await cache.put(request, response.clone());
      void trimCache(cacheName, maxEntries);
    }
    return response;
  } catch {
    return new Response("Offline", { status: 504 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache live trip state API or service worker script or dev HMR
  if (
    url.pathname === "/api/naanas-space/thailand-2027" ||
    url.pathname === "/thailand-2027-sw.js" ||
    url.pathname.includes("webpack-hmr")
  ) {
    return;
  }

  // Immutable uploaded wardrobe photos: CacheFirst with quota bound
  if (url.pathname.startsWith("/api/naanas-space/thailand-2027/wardrobe-image/")) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
    return;
  }

  // HTML navigations & manifest: NetworkFirst so updates arrive immediately while online
  if (
    request.mode === "navigate" ||
    url.pathname === "/thailand-2027-v2.webmanifest"
  ) {
    event.respondWith(
      networkFirst(
        request,
        SHELL_CACHE,
        request.mode === "navigate" ? "/naanas-space/thailand-2027-v2" : undefined
      )
    );
    return;
  }

  // Versioned Next static bundles, fonts, and PWA icons: CacheFirst
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, MAX_STATIC_ENTRIES));
  }
});
