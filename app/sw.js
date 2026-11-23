/* Türkü Defteri çevrimdışı önbelleği. Önce ağdan güncel dosya istenir, internet yoksa önbellekteki kopya kullanılır.
   Böylece yeni eklenen türküler bağlantı olduğunda kendiliğinden gelir. İçerik güncellendiğinde SURUM değerini artır. */
var SURUM = "turku-defteri-v2";
var DOSYALAR = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "akort.js",
  "kurulum.js",
  "manifest.webmanifest",
  "data/turkuler.js",
  "data/duzenler.js",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(SURUM).then(function (c) { return c.addAll(DOSYALAR); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (anahtarlar) {
    return Promise.all(anahtarlar.filter(function (k) { return k.indexOf("turku-defteri-") === 0 && k !== SURUM; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(function (yanit) {
    if (yanit && yanit.ok) {
      var kopya = yanit.clone();
      caches.open(SURUM).then(function (c) { c.put(e.request, kopya); });
    }
    return yanit;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
  }));
});
