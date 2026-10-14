const CACHE = 'after-8-8-v25-unified-slogan';

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
      './assets/hero-v2.jpg',
      './assets/characters/female.webp',
      './assets/characters/male.webp',
      './assets/characters/female-blink.webp',
      './assets/characters/male-blink.webp',
      './assets/characters/female-portal.webp',
      './assets/characters/male-portal.webp',
      './assets/characters/female-stop.webp',
      './assets/characters/male-stop.webp',
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
      // 短剧视频不进首访预缓存（16 段共约 8.6MB 会拖垮首开），
      // 由 fetch 阶段按需运行时缓存：看过哪段，哪段离线可用。
      './assets/audio/trust-bubbles-light.mp3',
      './assets/audio/trust-bubbles-dark.mp3',
      ...builtAssets,
    ]);
    // 人格插图为可选资源：文件尚不存在时跳过，避免 addAll 整体失败。
    await Promise.all([
      './assets/profiles/little-fool.jpg',
      './assets/profiles/snack.jpg',
      './assets/profiles/rush-king.jpg',
      './assets/profiles/kind-baby.jpg',
      './assets/profiles/crowd-baby.jpg',
      './assets/profiles/stubborn.jpg',
      './assets/profiles/service-baby.jpg',
      './assets/profiles/serious-genius.jpg',
      './assets/profiles/schrodinger.jpg',
      './assets/profiles/anti-scam-debater.jpg',
      './assets/profiles/immersive-tester.jpg',
    ].map(async (file) => {
      try {
        const response = await fetch(file, { cache: 'reload' });
        if (response.ok) await cache.put(file, response);
      } catch {
        // 该插画尚未提供，跳过。
      }
    }));
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
