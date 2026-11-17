// Generates on-brand SVG product mockups (as data URIs) so the demo needs no
// external image hosting. Real photos uploaded from admin replace these.

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
    ${star(0, -20, 46, k.b)}${star(-70, 20, 20, k.a)}${star(70, 20, 20, k.a)}${star(-40, -70, 11, k.a)}${star(46, -76, 11, k.a)}
    ${text('DREAM BIG', 96, 26, k.a, 6)}`,
  retro: (k) => `
    ${[k.a, k.b, k.a].map((c, i) => `<rect x="-100" y="${-30 + i * 18}" width="200" height="10" rx="5" fill="${c}"/>`).join('')}
    ${text('SOFT CLUB', 62, 34, k.a, 5, 700)}
    ${text('STITCHED FOR YOU', 88, 11, k.c, 7, 500)}`,
  rocket: (k) => `
    <g transform="rotate(35)">
      <path d="M0 -80 C28 -50 28 0 18 28 H-18 C-28 0 -28 -50 0 -80 Z" fill="${k.a}"/>
      <circle cy="-30" r="11" fill="${k.b}"/>
      <path d="M-18 8 L-40 34 L-18 28 Z M18 8 L40 34 L18 28 Z" fill="${k.b}"/>
      <path d="M-10 32 Q0 70 10 32 Z" fill="${k.b}"/>
    </g>
    ${star(-78, -50, 9, k.b)}${star(60, 60, 8, k.a)}
    ${text('BLAST OFF!', 104, 24, k.a, 4)}`,
  rainbow: (k) => `
    ${['#8A0B45', '#D39E57', '#A9B79C', '#A9C7E0'].map((c, i) => `<path d="M${-85 + i * 14} 40 a${85 - i * 14} ${85 - i * 14} 0 0 1 ${(85 - i * 14) * 2} 0" fill="none" stroke="${c}" stroke-width="11"/>`).join('')}
    <ellipse cx="-86" cy="46" rx="20" ry="10" fill="${k.c}" opacity=".25"/><ellipse cx="86" cy="46" rx="20" ry="10" fill="${k.c}" opacity=".25"/>
    ${text('Happy Days', 98, 28, k.a, 2, 600)}`,
  smile: (k) => `
    <circle r="62" fill="${k.b}"/>
    <circle cx="-22" cy="-14" r="8" fill="#1B1517"/><circle cx="22" cy="-14" r="8" fill="#1B1517"/>
    <path d="M-30 14 Q0 48 30 14" fill="none" stroke="#1B1517" stroke-width="7" stroke-linecap="round"/>
    ${text('SMILE MORE', 104, 24, k.a, 5)}`,
};

DESIGNS.plain = (k) => `<rect x="-18" y="-150" width="36" height="5" rx="2.5" fill="${k.b}" opacity=".9"/>`;

export const DESIGN_KEYS = Object.keys(DESIGNS);

const TEE_BODY = {
  men: 'M200 110 L128 140 L52 262 L118 296 L160 238 L160 596 Q160 616 180 616 L420 616 Q440 616 440 596 L440 238 L482 296 L548 262 L472 140 L400 110 Q380 164 300 164 Q220 164 200 110 Z',
  women:
    'M206 112 L142 138 L84 252 L142 284 L176 232 L184 380 L168 598 Q168 616 188 616 L412 616 Q432 616 432 598 L416 380 L424 232 L458 284 L516 252 L458 138 L394 112 Q370 196 300 196 Q230 196 206 112 Z',
  kids: 'M196 130 L124 158 L66 262 L124 292 L162 244 L162 590 Q162 608 182 608 L418 608 Q438 608 438 590 L438 244 L476 292 L534 262 L476 158 L404 130 Q384 180 300 180 Q216 180 196 130 Z',
};

TEE_BODY.oversized = 'M190 112 L96 150 L26 290 L100 322 L150 262 L150 596 Q150 616 170 616 L430 616 Q450 616 450 596 L450 262 L500 322 L574 290 L504 150 L410 112 Q384 166 300 166 Q216 166 190 112 Z';
TEE_BODY.crop = 'M206 112 L142 138 L84 252 L142 284 L176 232 L184 330 L172 468 Q172 482 190 482 L410 482 Q428 482 428 468 L416 330 L424 232 L458 284 L516 252 L458 138 L394 112 Q370 196 300 196 Q230 196 206 112 Z';

const COLLAR = {
  men: 'M200 110 Q220 164 300 164 Q380 164 400 110',
  women: 'M206 112 Q230 196 300 196 Q370 196 394 112',
  kids: 'M196 130 Q216 180 300 180 Q384 180 404 130',
  oversized: 'M190 112 Q216 166 300 166 Q384 166 410 112',
  crop: 'M206 112 Q230 196 300 196 Q370 196 394 112',
};

const backdrops = [
  ['#F3E9D6', '#E7D7BA'],
  ['#EFE2DD', '#E3CDC8'],
  ['#E9E6D8', '#D7D4BF'],
  ['#F1E4CF', '#E6CFA6'],
];

const wrap = (inner, bgIdx) => {
  const [a, b] = backdrops[bgIdx % backdrops.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset=".35" stop-color="#fff" stop-opacity=".10"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient></defs><rect width="600" height="750" fill="${`url(#bg)`}"/><ellipse cx="300" cy="680" rx="190" ry="18" fill="#000" opacity=".08"/>${inner}</svg>`;
};

const toUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

function tee({ type, color, design, zoom, back, bg }) {
  const k = inks(color);
  const stroke = shade(color, lum(color) > 0.5 ? -0.12 : 0.1);
  const printY = type === 'women' ? 360 : 340;
  const scale = zoom ? 1.9 : type === 'kids' ? 0.95 : 1;
  let print = '';
  if (!back) {
    print = `<g transform="translate(300 ${zoom ? 360 : printY}) scale(${scale})">${DESIGNS[design](k)}</g>`;
  } else {
    print = `<g transform="translate(300 250) scale(.5)">${DESIGNS[design](k)}</g>`;
  }
  const collar = back
    ? `<path d="${COLLAR[type].replace(/(\d+) (\d+)/g, (m, x, y) => `${x} ${Math.round(Number(y) * 0.55 + 40)}`)}" fill="none" stroke="${stroke}" stroke-width="9" stroke-linecap="round"/>`
    : `<path d="${COLLAR[type]}" fill="none" stroke="${stroke}" stroke-width="11" stroke-linecap="round"/>`;
  const body = `
    <path d="${TEE_BODY[type]}" fill="${color}" stroke="${stroke}" stroke-width="2"/>
    <path d="${TEE_BODY[type]}" fill="url(#sh)"/>
    ${collar}
    <path d="M160 238 Q180 250 190 262 M440 238 Q420 250 410 262" stroke="${stroke}" stroke-width="2" fill="none"/>
    <path d="M200 600 Q300 608 400 600" stroke="${stroke}" stroke-width="2" fill="none" opacity=".7"/>`;
  return wrap(zoom ? `<g transform="translate(-0 0)">${body}</g>${print}` : body + print, bg);
}

function tote({ color, design, zoom, bg }) {
  const k = inks(color);
  const stroke = shade(color, lum(color) > 0.5 ? -0.14 : 0.1);
  const handle = `<path d="M215 230 C215 80 385 80 385 230" fill="none" stroke="${shade(color, lum(color) > 0.5 ? -0.08 : 0.08)}" stroke-width="22" stroke-linecap="round"/>
  <path d="M215 230 C215 80 385 80 385 230" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" transform="translate(0 -10)" opacity=".4"/>`;
  const body = `<path d="M120 222 H480 L506 636 Q507 656 487 656 H113 Q93 656 94 636 Z" fill="${color}" stroke="${stroke}" stroke-width="2"/>
  <path d="M120 222 H480 L506 636 Q507 656 487 656 H113 Q93 656 94 636 Z" fill="url(#sh)"/>
  <path d="M120 250 H480" stroke="${stroke}" stroke-width="2" stroke-dasharray="6 6"/>`;
  const sc = zoom ? 2 : 1.25;
  return wrap(
    `${handle}${body}<g transform="translate(300 ${zoom ? 440 : 430}) scale(${sc})">${DESIGNS[design](k)}</g>`,
    bg
  );
}

/**
 * @param {{kind:'men'|'women'|'kids'|'tote', color:string, design:string}} p
 * @returns {string[]} three data-URI images: front, close-up, back/alt
 */
export function makeImages({ kind, color, design }) {
  if (kind === 'tote') {
    return [
      toUri(tote({ color, design, bg: 0 })),
      toUri(tote({ color, design, zoom: true, bg: 1 })),
      toUri(tote({ color: shade(color, lum(color) > 0.5 ? -0.05 : 0.05), design, bg: 3 })),
    ];
  }
  return [
    toUri(tee({ type: kind, color, design, bg: 0 })),
    toUri(tee({ type: kind, color, design, zoom: true, bg: 1 })),
    toUri(tee({ type: kind, color, design, back: true, bg: 2 })),
  ];
}
