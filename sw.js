/* LingoLab SW raíz — alcance total del sitio (offline instalable). */
const V = "lingolab-v8";
const CORE = [
  "index.html",
  "css/app.css",
  "css/themes.css",
  "css/overhaul.css",
  "js/app-legacy.js",
  "js/db.js",
  "js/srs.js",
  "js/theme.js",
  "js/magic.js",
  "js/games.js",
  "js/shortcuts.js",
  "js/pet.js",
  "js/enhance.js",
  "data/culture.json",
  "pwa/manifest.webmanifest",
  "pwa/icon-192.png",
  "pwa/icon-512.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(V).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
