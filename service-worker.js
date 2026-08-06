const cacheName = 'aroin-2026-08-clean-urls'
const shell = [
  '/',
  '/index.html',
  '/team/',
  '/journey/',
  '/assets/css/site-base.css',
  '/assets/css/site-sections.css',
  '/assets/css/site-responsive.css',
  '/assets/js/site.js',
  '/assets/js/canvas.js',
  '/data/team.json',
  '/data/timeline.json'
]

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(shell)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== cacheName).map(key => caches.delete(key))
  )))
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone()
    caches.open(cacheName).then(cache => cache.put(event.request, copy))
    return response
  }).catch(() => caches.match(event.request)))
})
