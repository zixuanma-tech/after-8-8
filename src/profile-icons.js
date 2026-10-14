const BADGE_BASE = '<rect x="6" y="6" width="108" height="108" rx="32" fill="#660874"/><ellipse cx="44" cy="26" rx="26" ry="10" fill="rgba(255,255,255,.13)"/><rect x="6" y="6" width="108" height="108" rx="32" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="3"/>';
const RARE_RING = '<rect x="6" y="6" width="108" height="108" rx="32" fill="none" stroke="#f3dd65" stroke-width="3" stroke-dasharray="12 9"/>';

export const PROFILE_ICONS = Object.freeze({
  'little-fool': { rare: false, image: 'little-fool.jpg', label: '熟人小呆瓜徽章', glyph: '<path d="M30 44c0-4 6-6 8-2 2-4 8-2 8 2 0 5-5 7-8 11-3-4-8-6-8-11z" fill="#f3dd65"/><circle cx="45" cy="53" r="10" fill="#ffffff"/><circle cx="48" cy="55" r="4" fill="#2a103d"/><circle cx="76" cy="49" r="10" fill="#ffffff"/><circle cx="73" cy="51" r="4" fill="#2a103d"/><ellipse cx="61" cy="77" rx="7" ry="8.5" fill="#2a103d"/>' },
  snack: { rare: false, image: 'snack.jpg', label: '8.8大馋丫头徽章', glyph: '<circle cx="45" cy="50" r="11" fill="#f3dd65"/><circle cx="75" cy="50" r="11" fill="#f3dd65"/><path d="M42 72q18 16 36 0" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M77 79q3.5 8 0 12.5q-3.5-4.5 0-12.5z" fill="#ddc9eb"/>' },
  'rush-king': { rare: false, image: 'rush-king.jpg', label: '急急大王徽章', glyph: '<circle cx="40" cy="35" r="9" fill="#ffffff"/><circle cx="80" cy="35" r="9" fill="#ffffff"/><circle cx="60" cy="63" r="27" fill="#ffffff"/><path d="M60 63V47" stroke="#2a103d" stroke-width="5" stroke-linecap="round"/><path d="M60 63l13 8" stroke="#2a103d" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="63" r="4" fill="#2a103d"/><path d="M95 56h9M93 44l7-5M25 56h-9M27 44l-7-5" stroke="#f3dd65" stroke-width="5" stroke-linecap="round"/>' },
  'kind-baby': { rare: false, image: 'kind-baby.jpg', label: '热心肠宝宝徽章', glyph: '<path d="M60 84c-26-18-28-40-14-44 6-2 12 2 14 8 2-6 8-10 14-8 14 4 12 26-14 44z" fill="#ffffff"/><path d="M30 46c0-3.4 5-5 6.6-1.7 1.6-3.3 6.6-1.7 6.6 1.7 0 4-4 6-6.6 9-2.6-3-6.6-5-6.6-9z" fill="#f3dd65"/><path d="M84 40c0-3.4 5-5 6.6-1.7 1.6-3.3 6.6-1.7 6.6 1.7 0 4-4 6-6.6 9-2.6-3-6.6-5-6.6-9z" fill="#f3dd65"/>' },
  'crowd-baby': { rare: false, image: 'crowd-baby.jpg', label: '气氛组宝宝徽章', glyph: '<rect x="24" y="38" width="52" height="34" rx="14" fill="#ffffff"/><path d="M38 70l-4 13 15-13z" fill="#ffffff"/><circle cx="42" cy="55" r="4" fill="#660874"/><circle cx="54" cy="55" r="4" fill="#660874"/><circle cx="66" cy="55" r="4" fill="#660874"/><rect x="66" y="66" width="34" height="24" rx="11" fill="#ddc9eb"/><path d="M84 90l-3 9 11-9z" fill="#ddc9eb"/><circle cx="80" cy="78" r="3" fill="#660874"/><circle cx="89" cy="78" r="3" fill="#660874"/><path d="M22 24h12M94 32h10M38 18h8" stroke="#f3dd65" stroke-width="4" stroke-linecap="round"/>' },
  stubborn: { rare: false, image: 'stubborn.jpg', label: '回本犟种徽章', glyph: '<circle cx="60" cy="63" r="18" fill="#f3dd65"/><path d="M52 55l8 8 8-8" stroke="#2a103d" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 61v12" stroke="#2a103d" stroke-width="3.5" stroke-linecap="round"/><path d="M54 66h12M54 72h12" stroke="#2a103d" stroke-width="3.5" stroke-linecap="round"/><path d="M92 46a34 34 0 1 0 2 26" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/><path d="M84 36l18 6-11 13z" fill="#ffffff"/>' },
  'service-baby': { rare: false, image: 'service-baby.jpg', label: '客服乖宝宝徽章', glyph: '<ellipse cx="60" cy="28" rx="19" ry="6" fill="none" stroke="#f3dd65" stroke-width="5"/><path d="M34 56a26 24 0 0 1 52 0" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/><rect x="24" y="52" width="13" height="24" rx="6.5" fill="#ffffff"/><rect x="83" y="52" width="13" height="24" rx="6.5" fill="#ffffff"/><path d="M89 76q0 14-16 14" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><path d="M50 64q10 9 20 0" stroke="#ddc9eb" stroke-width="4" fill="none" stroke-linecap="round"/>' },
  'serious-genius': { rare: false, image: 'serious-genius.jpg', label: '较真小天才徽章', glyph: '<circle cx="52" cy="50" r="22" fill="none" stroke="#ffffff" stroke-width="8"/><path d="M68 66L84 84" stroke="#ffffff" stroke-width="11" stroke-linecap="round"/><path d="M88 26l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#f3dd65"/><circle cx="50" cy="50" r="5" fill="#f3dd65"/>' },
  schrodinger: { rare: true, image: 'schrodinger.jpg', label: '薛定谔的钱包徽章', glyph: '<path d="M34 50l6-20 16 12z" fill="#ffffff"/><path d="M86 50l-6-20-16 12z" fill="#ffffff"/><rect x="28" y="48" width="64" height="42" rx="10" fill="#ffffff"/><path d="M54 63a7 7 0 1 1 11 6c-3 2-5 3-5 7" fill="none" stroke="#660874" stroke-width="5.5" stroke-linecap="round"/><circle cx="60" cy="83" r="3.2" fill="#660874"/>' },
  'anti-scam-debater': { rare: true, image: 'anti-scam-debater.jpg', label: '反诈小杠精徽章', glyph: '<path d="M60 24l30 10v22c0 22-13 34-30 42C43 90 30 78 30 56V34z" fill="#ffffff"/><rect x="42" y="50" width="36" height="8" rx="4" fill="#660874"/><rect x="48" y="63" width="24" height="8" rx="4" fill="#660874"/>' },
  'immersive-tester': { rare: true, image: 'immersive-tester.jpg', label: '诈骗剧情沉浸式内测员徽章', glyph: '<rect x="22" y="28" width="76" height="17" rx="7" fill="#f3dd65"/><path d="M38 28l-9 17M58 28l-9 17M78 28l-9 17" stroke="#660874" stroke-width="6"/><rect x="26" y="46" width="68" height="42" rx="9" fill="#ffffff"/><path d="M52 58l18 9-18 9z" fill="#660874"/>' },
});

export function profileIconSvg(id, size) {
  const icon = PROFILE_ICONS[id] || PROFILE_ICONS['little-fool'];
  const dims = size ? ` width="${size}" height="${size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"${dims} role="img" aria-label="${icon.label}">${BADGE_BASE}${icon.rare ? RARE_RING : ''}${icon.glyph}</svg>`;
}

export function profileImageSrc(id) {
  const icon = PROFILE_ICONS[id];
  return icon && icon.image ? `./assets/profiles/${icon.image}` : null;
}

const iconImageCache = new Map();

export function loadProfileIcon(id) {
  if (!iconImageCache.has(id)) {
    iconImageCache.set(id, new Promise((resolve) => {
      const loadSvgFallback = () => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(profileIconSvg(id, 240));
      };
      const src = profileImageSrc(id);
      if (!src) return loadSvgFallback();
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = loadSvgFallback;
      image.src = src;
    }));
  }
  return iconImageCache.get(id);
}
