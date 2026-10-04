const CACHE = 'after-8-8-v16-challenge-share-compat';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const indexResponse = await fetch('./index.html', { cache: 'reload' });
    const html = await indexResponse.clone().text();
    const builtAssets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^\"]+)"/g)].map((match) => match[1]);
    await cache.put('./index.html', indexResponse);
    await cache.addAll([
      './',
      './manifest.webmanifest',
      './icon.svg',
      './assets/hero-v2.png',
      './assets/characters/female.png',
      './assets/characters/male.png',
      './assets/characters/female-blink.png',
      './assets/characters/male-blink.png',
      './assets/characters/female-portal.png',
      './assets/characters/male-portal.png',
      './assets/characters/female-stop.png',
      './assets/characters/male-stop.png',
      './assets/film/female-shot-01.jpg',
      './assets/film/female-shot-02.jpg',
      './assets/film/female-shot-03.jpg',
      './assets/film/female-shot-04.jpg',
      './assets/film/female-shot-05.jpg',
      './assets/film/female-shot-06.jpg',
      './assets/film/female-shot-07.jpg',
      './assets/film/female-shot-08.jpg',
      './assets/film/male-shot-01.jpg',
      './assets/film/male-shot-02.jpg',
      './assets/film/male-shot-03.jpg',
      './assets/film/male-shot-04.jpg',
      './assets/film/male-shot-05.jpg',
      './assets/film/male-shot-06.jpg',
      './assets/film/male-shot-07.jpg',
      './assets/film/male-shot-08.jpg',
      './assets/video/female-shot-01.mp4',
      './assets/video/female-shot-02.mp4',
      './assets/video/female-shot-03.mp4',
      './assets/video/female-shot-04.mp4',
      './assets/video/female-shot-05.mp4',
      './assets/video/female-shot-06.mp4',
      './assets/video/female-shot-07.mp4',
      './assets/video/female-shot-08.mp4',
      './assets/video/male-shot-01.mp4',
      './assets/video/male-shot-02.mp4',
      './assets/video/male-shot-03.mp4',
      './assets/video/male-shot-04.mp4',
      './assets/video/male-shot-05.mp4',
      './assets/video/male-shot-06.mp4',
      './assets/video/male-shot-07.mp4',
      './assets/video/male-shot-08.mp4',
      './assets/audio/trust-bubbles-light.mp3',
      './assets/audio/trust-bubbles-dark.mp3',
      ...builtAssets,
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (event.request.mode === 'navigate') {
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }
    const response = await fetch(event.request);
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  })());
});
