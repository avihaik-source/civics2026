// ================================================================
// Service Worker – civics2026
// גרסה 2.0 | מרץ 2026
// ================================================================

const CACHE_NAME = 'civics2026-v2'

// נכסים שנטענים מיד בהתקנה (cache-first)
const STATIC_ASSETS = [
  '/',
  '/app.js',
  '/features.js',
  '/data.js',
  '/styles.css',
  '/exam-questions-official.json',
]

// ── Install: cache static assets ─────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ── Fetch: strategy per request type ─────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // API: Network-first (תמיד עדכני), fallback לcache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request))
    return
  }

  // Static assets: Cache-first (מהיר), רענון ברקע
  event.respondWith(cacheFirst(event.request))
})

// ── Strategy: Cache-first ─────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Offline fallback: return homepage from cache
    return caches.match('/') || new Response('Offline', { status: 503 })
  }
}

// ── Strategy: Network-first ───────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response(
      JSON.stringify({ error: 'Offline – no cached data', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
