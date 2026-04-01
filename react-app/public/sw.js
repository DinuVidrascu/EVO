// Service Worker de bază pentru compatibilitate PWA
self.addEventListener('install', () => {
  // Nimic special momentan, doar necesar pentru browser
});

self.addEventListener('fetch', (event) => {
  // Strategie passthrough simplă
  event.respondWith(fetch(event.request));
});
