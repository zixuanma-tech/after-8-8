import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const dist = new URL('./dist/', root);
const distPath = fileURLToPath(dist);
const htmlPath = new URL('index.html', dist);
let html = await readFile(htmlPath, 'utf8');

const cssMatch = html.match(/<link rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/);
const jsMatch = html.match(/<script type="module"[^>]+src="([^"]+)"[^>]*><\/script>/);

if (!cssMatch || !jsMatch) throw new Error('找不到 Vite 构建后的 CSS 或 JavaScript 入口。');

const relativeToDist = (path) => path.replace(/^\.\//, '');
const css = await readFile(join(distPath, relativeToDist(cssMatch[1])), 'utf8');
let js = await readFile(join(distPath, relativeToDist(jsMatch[1])), 'utf8');

const pngAssets = [
  'assets/hero-v2.png',
  'assets/characters/female.png',
  'assets/characters/male.png',
  'assets/characters/female-blink.png',
  'assets/characters/male-blink.png',
  'assets/characters/female-portal.png',
  'assets/characters/male-portal.png',
  'assets/characters/female-stop.png',
  'assets/characters/male-stop.png',
];

const jpegAssets = ['female', 'male'].flatMap((gender) => Array.from(
  { length: 8 },
  (_, index) => `assets/film/${gender}-shot-${String(index + 1).padStart(2, '0')}.jpg`,
));

const videoAssets = ['female', 'male'].flatMap((gender) => Array.from(
  { length: 8 },
  (_, index) => `assets/video/${gender}-shot-${String(index + 1).padStart(2, '0')}.mp4`,
));

const audioAssets = [
  'assets/audio/trust-bubbles-light.mp3',
  'assets/audio/trust-bubbles-dark.mp3',
];

for (const asset of pngAssets) {
  const image = await readFile(new URL(asset, dist));
  const dataUrl = `data:image/png;base64,${image.toString('base64')}`;
  js = js.replaceAll(`./${asset}`, dataUrl);
}

for (const asset of jpegAssets) {
  const image = await readFile(new URL(asset, dist));
  const dataUrl = `data:image/jpeg;base64,${image.toString('base64')}`;
  js = js.replaceAll(`./${asset}`, dataUrl);
}

for (const asset of videoAssets) {
  const video = await readFile(new URL(asset, dist));
  const dataUrl = `data:video/mp4;base64,${video.toString('base64')}`;
  js = js.replaceAll(`./${asset}`, dataUrl);
}

for (const asset of audioAssets) {
  const audio = await readFile(new URL(asset, dist));
  const dataUrl = `data:audio/mpeg;base64,${audio.toString('base64')}`;
  js = js.replaceAll(`./${asset}`, dataUrl);
}

const icon = await readFile(new URL('icon.svg', dist));
const iconUrl = `data:image/svg+xml;base64,${icon.toString('base64')}`;

html = html
  .replace(cssMatch[0], () => `<style>${css}</style>`)
  .replace(jsMatch[0], () => `<script type="module">${js}</script>`)
  .replace(/<link rel="manifest"[^>]+>/, '')
  .replace(/href="\.\/icon\.svg"/, `href="${iconUrl}"`)
  .replace('<title>', '<meta name="offline-build" content="standalone" />\n    <title>');

const output = new URL('8.8元到账之后-离线单文件.html', dist);
await writeFile(output, html, 'utf8');
console.log(`Standalone H5: ${fileURLToPath(output)}`);
