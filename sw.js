/* LingoLab SW raíz — alcance total del sitio (instalable y sin conexión).
 *
 * IMPORTANTE — por qué este archivo decide si ves los cambios:
 * con la caché primero, publicabas el código nuevo y la app seguía enseñando
 * la versión antigua. Ahora:
 *   · red primero para el CÓDIGO (html, js, css) → siempre la última versión
 *     mientras tengas internet, y si no lo tienes cae a la caché (sigue
 *     funcionando sin conexión);
 *   · caché primero para el resto (fuentes, iconos, datos), que no cambian.
 * Al subir cambios, sube también la V de abajo: es lo que limpia la caché vieja.
 */
const V = "lingolab-v12";
const APP_V = "v12";
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
/* Lo que debe ir siempre fresco: si no, el usuario ve la app vieja. */
const CODIGO = /\.(?:html|js|css)$/i;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      // Le decimos a la página qué versión tiene en la caché, para que pueda
      // avisarte si estás viendo algo viejo.
      .then(() => self.clients.matchAll().then((cs) => cs.forEach((c) => c.postMessage({ tipo: "version", v: APP_V }))))
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // fuentes de Google: sin tocar

  if (CODIGO.test(url.pathname)) {
    /* RED PRIMERO: prueba la red, guarda lo nuevo y solo usa la caché si
       no hay internet. Así nunca te trapped en una versión vieja. */
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(V).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
    );
    return;
  }

  /* CACHÉ PRIMERO para el resto: rápido y sin conexión. */
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(V).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
