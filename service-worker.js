// IMMONOVA — Service Worker
// Due responsabilità: (1) rendere l'app installabile/utilizzabile offline in modo minimo,
// (2) ricevere le notifiche push e mostrarle, gestire il tap sulla notifica.

const CACHE_NAME = "immonova-shell-v3";
const SHELL_FILES = [
  "/index.html",
  "/manifest.json",
  "/icon-192-v2.png",
  "/icon-512-v2.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategia minima: prova la rete, se non disponibile ripiega sulla cache (solo per lo shell base).
// Non intercetta chiamate Supabase/API: lascia passare tutto il resto direttamente alla rete.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isShellFile = SHELL_FILES.some((f) => url.pathname === f);
  if (!isShellFile) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ---- Notifiche push ----
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: "IMMONOVA", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "IMMONOVA — Nuova opportunità";
  const options = {
    body: payload.body || "È stata pubblicata una nuova opportunità off-market.",
    icon: "/icon-192-v2.png",
    badge: "/icon-192-v2.png",
    data: { url: payload.url || "/opportunities.html" },
    tag: payload.tag || "immonova-new-opportunity"
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/opportunities.html";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
