// Okuma Yıldızı - service worker (çevrimdışı önbellek)
// ÖNEMLİ: Uygulama güncellendiğinde CACHE sürümünü artırın (v2 -> v3).
// Aksi hâlde cihazlar eski sürümü önbellekten göstermeye devam eder.
const CACHE = "okuma-yildizi-v4";
const FILES = ["./", "./index.html", "./style.css", "./oykuler.js", "./app.js", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

// Eski önbellekleri sil; aksi hâlde caches.match eski dosyayı döndürebilir.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((adlar) => Promise.all(adlar.filter((a) => a !== CACHE).map((a) => caches.delete(a))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
