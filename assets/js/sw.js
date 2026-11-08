// Offline-capable public shell cache for standalone schedule app.
const CACHE_NAME = 'unilink-shi-9-23-v1';
const SHELL_PATHS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/css/app.css',
  '/assets/css/background.css',
  '/assets/css/typography.css',
  '/assets/css/motion.css',
  '/assets/css/controls.css',
  '/assets/css/schedule-share.css',
  '/assets/js/appearance.js',
  '/assets/js/loading.js',
  '/assets/js/motion.js',
  '/assets/js/app.js',
  '/assets/js/schedule-share.js',
  '/assets/js/actions.js',
  '/assets/js/viewport-recovery.js',
  '/assets/js/navigation.js',
  '/assets/js/background.js',
  '/assets/fonts/manrope/cyrillic-ext.woff2',
  '/assets/fonts/manrope/cyrillic.woff2',
  '/assets/fonts/manrope/latin.woff2',
  '/assets/icons/unilink-dark-192.png',
  '/assets/icons/unilink-dark-512.png',
  '/assets/icons/unilink-dark-maskable-512.png',
  '/assets/icons/unilink-dark-favicon-32.png',
  '/assets/icons/unilink-dark-apple-touch.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(SHELL_PATHS.map(path => cache.add(path)));
    } catch { /* ignore storage restrictions */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.startsWith('unilink-shi-9-23-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    } catch { /* ignore */ }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request).catch(() => null);
    if (cached) {
      fetch(request).then(async fresh => {
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, fresh.clone());
        }
      }).catch(() => {});
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME).catch(() => null);
        await cache?.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const fallback = await caches.match('/index.html').catch(() => null);
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
