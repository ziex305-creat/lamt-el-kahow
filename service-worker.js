const CACHE_NAME = "lamet-el-qahwa-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./lobby-app.js",
  "./pwa-controller.js",
  "./supabase-config.js",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./app-icon.svg",
  "./app-icon-192.png",
  "./app-icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("lamet-el-qahwa-") && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedPage = await caches.match("./index.html");
        if (cachedPage) return cachedPage;
        throw new Error("The app shell is not available offline.");
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => cachedResponse || fetch(request)),
  );
});
