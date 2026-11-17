// Generates on-brand SVG product mockups (as data URIs) for seed products

const lum = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const shade = (hex, amt) => {
  const h = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16);
    return Math.max(0, Math.min(255, Math.round(v + amt * 255)))
      .toString(16)
      .padStart(2, '0');
  });
  return `#${c.join('')}`;
};

const inks = (bg) =>
  lum(bg) > 0.55
    ? { a: '#8A0B45', b: '#D39E57', c: '#1B1517' }
    : { a: '#F6EEDD', b: '#D39E57', c: '#F6EEDD' };

const text = (t, y, size, fill, spacing = 4, weight = 600) =>
  `<text x="0" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" fill="${fill}">${t}</text>`;

const star = (cx, cy, r, fill) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rad = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  });
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
};

const DESIGNS = {
  sunrise: (k) => `
    <path d="M-80 20 A80 80 0 0 1 80 20 Z" fill="${k.b}"/>
    ${Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI + (Math.PI / 8) * i;
      return `<line x1="${(Math.cos(a) * 92).toFixed(1)}" y1="${(20 + Math.sin(a) * 92).toFixed(1)}" x2="${(Math.cos(a) * 112).toFixed(1)}" y2="${(20 + Math.sin(a) * 112).toFixed(1)}" stroke="${k.a}" stroke-width="5" stroke-linecap="round"/>`;
    }).join('')}
    <rect x="-100" y="34" width="200" height="4" rx="2" fill="${k.a}"/>
    ${text('GOLDEN HOUR', 76, 24, k.a, 5)}
    ${text('EST. NOOLZ', 98, 12, k.c, 6, 500)}`,
  wave: (k) => `
    ${[0, 1, 2, 3].map((i) => `<path d="M-100 ${-10 + i * 24} q25 -22 50 0 t50 0 t50 0 t50 0" fill="none" stroke="${i % 2 ? k.b : k.a}" stroke-width="7" stroke-linecap="round"/>`).join('')}
    ${text('RIDE THE TIDE', 112, 22, k.a, 4)}`,
  mountain: (k) => `
    <circle cx="48" cy="-48" r="22" fill="${k.b}"/>
    <path d="M-100 60 L-40 -30 L0 30 L30 -10 L100 60 Z" fill="${k.a}"/>
    <path d="M-40 -30 L-26 -8 L-40 -14 L-54 -8 Z" fill="${k.c}" opacity=".35"/>
    ${text('WANDER MORE', 100, 22, k.a, 5)}`,
  bloom: (k) => `
    ${Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="-42" rx="15" ry="34" fill="${i % 2 ? k.b : k.a}" opacity=".92" transform="rotate(${i * 45})"/>`).join('')}
    <circle r="16" fill="${k.c}"/>
    ${text('in bloom', 100, 30, k.a, 3, 500)}`,
  stars: (k) => `
    ${star(0, -32, 42, k.b)}
    ${star(-64, 20, 20, k.a)}
    ${star(64, 20, 20, k.a)}
    ${star(-30, -85, 14, k.c)}
    ${star(38, -78, 16, k.c)}
    ${text('DREAM BIG', 94, 22, k.a, 5)}`,
  rocket: (k) => `
    <path d="M0 -78 C30 -42 34 26 24 54 L-24 54 C-34 26 -30 -42 0 -78 Z" fill="${k.a}"/>
    <circle cx="0" cy="-14" r="14" fill="${k.b}"/>
    <polygon points="-24,30 -54,64 -24,54" fill="${k.b}"/>
    <polygon points="24,30 54,64 24,54" fill="${k.b}"/>
    <polygon points="0,54 -12,80 0,72 12,80" fill="#DC2626"/>
    ${text('BLAST OFF', 118, 22, k.a, 4)}`,
  rainbow: (k) => `
    <path d="M-72 36 A72 72 0 0 1 72 36" fill="none" stroke="#DC2626" stroke-width="12" stroke-linecap="round"/>
    <path d="M-56 36 A56 56 0 0 1 56 36" fill="none" stroke="${k.b}" stroke-width="12" stroke-linecap="round"/>
    <path d="M-40 36 A40 40 0 0 1 40 36" fill="none" stroke="#2563EB" stroke-width="12" stroke-linecap="round"/>
    ${text('HAPPY DAYS', 92, 22, k.a, 4)}`,
  smile: (k) => `
    <circle r="60" fill="${k.b}"/>
    <circle cx="-20" cy="-10" r="7" fill="${k.c}"/>
    <circle cx="20" cy="-10" r="7" fill="${k.c}"/>
    <path d="M-28 16 Q0 46 28 16" fill="none" stroke="${k.c}" stroke-width="6" stroke-linecap="round"/>
    ${text('SMILE MORE', 104, 22, k.a, 4)}`,
  plain: () => '',
};

const SHAPES = {
  tee: (color) => `
    <g filter="url(#drop)">
      <path d="M260 215 C282 232 318 232 340 215 L436 270 L394 360 L346 340 L346 688 C346 702 334 712 320 712 L180 712 C166 712 154 702 154 688 L154 340 L106 360 L64 270 Z" fill="${color}"/>
      <path d="M260 215 C282 232 318 232 340 215" fill="none" stroke="${shade(color, -0.22)}" stroke-width="8" stroke-linecap="round"/>
    </g>`,
  crop: (color) => `
    <g filter="url(#drop)">
      <path d="M260 220 C282 234 318 234 340 220 L430 274 L392 350 L348 334 L348 530 C348 544 336 554 322 554 L178 554 C164 554 152 544 152 530 L152 334 L108 350 L70 274 Z" fill="${color}"/>
      <path d="M260 220 C282 234 318 234 340 220" fill="none" stroke="${shade(color, -0.22)}" stroke-width="8" stroke-linecap="round"/>
    </g>`,
  tote: (color) => `
    <g filter="url(#drop)">
      <path d="M210 320 L210 170 C210 134 230 110 250 110 C270 110 290 134 290 170 L290 320" fill="none" stroke="${shade(color, -0.22)}" stroke-width="16" stroke-linecap="round"/>
      <path d="M310 320 L310 170 C310 134 330 110 350 110 C370 110 390 134 390 170 L390 320" fill="none" stroke="${shade(color, -0.22)}" stroke-width="16" stroke-linecap="round"/>
      <path d="M140 320 L460 320 L434 680 C432 696 418 708 402 708 L198 708 C182 708 168 696 166 680 Z" fill="${color}"/>
    </g>`,
};

const svgToDataUrl = (svg) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;

export const buildMockupSvg = ({ kind = 'men', color = '#1B1517', design = 'sunrise', view = 'front' }) => {
  const isTote = kind === 'tote';
  const isCrop = kind === 'women' && design === 'stars';
  const shapeKey = isTote ? 'tote' : isCrop ? 'crop' : 'tee';
  const shape = SHAPES[shapeKey](color);

  const cx = 300;
  const cy = isTote ? 510 : isCrop ? 390 : 430;
  const k = inks(color);
  const designFn = DESIGNS[design] || DESIGNS.sunrise;
  const designArt = view === 'front' ? designFn(k) : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
      <defs>
        <filter id="drop" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#1B1517" flood-opacity="0.12"/>
        </filter>
        <radialGradient id="bg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#FBF7EE"/>
          <stop offset="100%" stop-color="#EFE6D2"/>
        </radialGradient>
      </defs>
      <rect width="600" height="750" fill="url(#bg)"/>
      ${shape}
      <g transform="translate(${cx}, ${cy})">${designArt}</g>
    </svg>`;
};

export const makeImages = ({ kind, color, design }) => [
  svgToDataUrl(buildMockupSvg({ kind, color, design, view: 'front' })),
  svgToDataUrl(buildMockupSvg({ kind, color, design: 'plain', view: 'back' })),
];
