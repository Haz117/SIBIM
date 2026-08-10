// SIBIM Service Worker — cache-first para assets, network-first para navegación
const CACHE = "sibim-v1";

const PRECACHE = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/manifest.webmanifest",
];

// ── Install: pre-cachear recursos esenciales ──────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: eliminar caches obsoletos ──────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: estrategia según tipo de recurso ───────────────────────────────────
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // No interceptar llamadas a Supabase ni a rutas API
  if (url.hostname !== self.location.hostname) return;
  if (url.pathname.startsWith("/api/")) return;

  if (isStaticAsset(url.pathname)) {
    // Cache-first: los assets no cambian frecuentemente
    e.respondWith(cacheFirst(req));
  } else {
    // Network-first: páginas y datos siempre frescos; caída a /offline
    e.respondWith(networkFirst(req));
  }
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|svg|ico|woff2?|css)$/.test(pathname)
  );
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh.ok) {
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh.ok) {
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Fallback a offline page para navegación
    if (req.mode === "navigate") {
      return caches.match("/offline");
    }
    return new Response("Offline", { status: 503 });
  }
}
