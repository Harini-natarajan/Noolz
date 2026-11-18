import { makeImages } from '../utils/mockup';

const C = {
  black: { name: 'Black', hex: '#1B1517' },
  white: { name: 'White', hex: '#FFFFFF' },
  offwhite: { name: 'Off White', hex: '#F3ECDD' },
  navy: { name: 'Navy', hex: '#1F2A44' },
  olive: { name: 'Olive', hex: '#6B7048' },
  burgundy: { name: 'Burgundy', hex: '#8A0B45' },
  mustard: { name: 'Mustard', hex: '#D39E57' },
  sage: { name: 'Sage', hex: '#A9B79C' },
  sky: { name: 'Sky', hex: '#A9C7E0' },
  blush: { name: 'Blush', hex: '#EBC6C3' },
  sand: { name: 'Sand', hex: '#D8C3A0' },
  natural: { name: 'Natural', hex: '#EFE4CC' },
};

const SIZES = {
  men: ['S', 'M', 'L', 'XL', 'XXL'],
  women: ['XS', 'S', 'M', 'L', 'XL'],
  kids: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
  tote: ['One Size'],
};

// Deterministic pseudo-random stock so the demo has a nice mix of statuses.
const buildStock = (colors, sizes, seed, zeroKeys = [], lowKeys = []) => {
  const stock = {};
  let s = seed;
  colors.forEach((c) =>
    sizes.forEach((sz) => {
      s = (s * 9301 + 49297) % 233280;
      const key = `${c.name}|${sz}`;
      let q = 6 + Math.floor((s / 233280) * 22);
      if (zeroKeys.includes(key)) q = 0;
      if (lowKeys.includes(key)) q = 2 + (s % 3);
      stock[key] = q;
    })
  );
  return stock;
};

const daysAgo = (d, h = 10) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(h, (d * 7) % 60, 0, 0);
  return dt.toISOString();
};

const def = (
  id, name, category, price, colors, design, description, featured, seed, age, extra = {}, subcategory = null
) => {
  const sizes = SIZES[category];
  const enrichedColors = colors.map((c) => ({
    ...c,
    images: makeImages({ kind: category, color: c.hex, design }),
  }));
  const allImages = enrichedColors.flatMap((c) => c.images);
  return {
    id,
    name,
    category,
    subcategory,
    price,
    description,
    featured,
    lowStockThreshold: 5,
    colors: enrichedColors,
    sizes,
    design,
    images: allImages,
    stock: buildStock(colors, sizes, seed, extra.zero, extra.low),
    createdAt: daysAgo(age),
  };
};

export const SEED_PRODUCTS = [
  def('p-men-1', 'Golden Hour Tee', 'men', 899, [C.black, C.white, C.navy], 'sunrise',
    'A relaxed-fit tee in 100% combed cotton, screen-printed with our signature sunrise motif. Soft hand-feel, reinforced collar and a print that stays vivid wash after wash.',
    true, 11, 2, { low: ['Black|L'] }, 'normal-fit'),
  def('p-men-2', 'Wander More Tee', 'men', 949, [C.olive, C.offwhite, C.black], 'mountain',
    'For the weekend explorers. A heavyweight 220 GSM tee with a layered mountain print in water-based inks — breathable, structured and made to last.',
    true, 23, 5, { zero: ['Olive|XXL'] }, 'oversized'),
  def('p-men-3', 'Tidal Lines Tee', 'men', 849, [C.navy, C.sand], 'wave',
    'Minimal wave lines meet a clean boxy silhouette. Pre-shrunk cotton jersey that drapes beautifully and feels cool all day.',
    false, 37, 9, {}, 'normal-fit'),
  def('p-men-4', 'Essential Plain Heavyweight Tee', 'men', 749, [C.black, C.white, C.burgundy], 'plain',
    'Clean, timeless, unprinted 240 GSM combed cotton tee. Structured drape, ribbed collar and ultra-durable stitching.',
    false, 41, 14, { low: ['Burgundy|M', 'Burgundy|S'] }, 'plain-tees'),

  def('p-women-1', 'In Bloom Fitted Tee', 'women', 849, [C.blush, C.white, C.sage], 'bloom',
    'A softly fitted tee with a hand-drawn floral bloom print. Cotton-modal blend with a flattering scoop neck and a touch of stretch.',
    true, 53, 1, {}, 'normal-fit'),
  def('p-women-2', 'Dream Big Cropped Tee', 'women', 799, [C.black, C.offwhite], 'stars',
    'Cropped, cut and comfortable. Starry print with metallic-gold feel ink, designed to pair with high-waist denim or tailored trousers.',
    true, 61, 4, { zero: ['Off White|XS', 'Off White|S'], low: ['Black|L'] }, 'crop-tops'),
  def('p-women-3', 'Golden Hour Relaxed Tee', 'women', 899, [C.mustard, C.white], 'sunrise',
    'Our sunrise print in an airy oversized women\'s cut. Drop-shoulder, mid-weight cotton with a buttery soft finish.',
    false, 71, 8, {}, 'oversized'),
  def('p-women-4', 'Tidal Lines Scoop Tee', 'women', 829, [C.sky, C.sand, C.black], 'wave',
    'Light, airy and printed with calm wave lines. Perfect for warm days and easy layering.',
    false, 83, 12, {}, 'normal-fit'),

  def('p-kids-1', 'Blast Off Kids Tee', 'kids', 599, [C.navy, C.mustard], 'rocket',
    'For little astronauts. Ultra-soft, skin-friendly cotton with a playful rocket print and tag-free neckline.',
    true, 97, 3),
  def('p-kids-2', 'Happy Days Rainbow Tee', 'kids', 549, [C.white, C.blush, C.sky], 'rainbow',
    'A cheerful rainbow print on gentle organic-blend cotton. Safe, non-toxic inks and a fit that grows with them.',
    true, 101, 6, { low: ['White|4-5Y'] }),
  def('p-kids-3', 'Smile More Kids Tee', 'kids', 549, [C.mustard, C.sage], 'smile',
    'A big smile for small people. Durable, easy-care jersey that survives playground adventures.',
    false, 113, 10, { zero: ['Sage|10-11Y'] }),

  def('p-tote-1', 'Wander More Canvas Tote', 'tote', 499, [C.natural, C.black], 'mountain',
    'Sturdy 12 oz natural canvas tote with reinforced handles and a mountain print. Carries your day — and then some.',
    true, 127, 2),
  def('p-tote-2', 'In Bloom Market Tote', 'tote', 449, [C.natural, C.sage], 'bloom',
    'A roomy market tote with an inner pocket and a floral bloom print. Made for farmers\' markets and café runs.',
    true, 131, 7, { low: ['Sage|One Size'] }),
  def('p-tote-3', 'Golden Hour Everyday Tote', 'tote', 479, [C.burgundy, C.natural], 'sunrise',
    'Everyday carry in burgundy cotton canvas, printed with our sunrise motif. Wide base, long shoulder handles.',
    false, 139, 11, { zero: ['Natural|One Size'] }),
];

const mkHist = (i, p, color, size, prev, next, daysBack, note) => ({
  id: `h-${i}`,
  productId: p.id,
  productName: p.name,
  color,
  size,
  previous: prev,
  updated: next,
  change: next - prev,
  note,
  date: daysAgo(daysBack, 9 + (i % 8)),
});

export const buildSeedHistory = () => {
  const P = SEED_PRODUCTS;
  const rows = [
    [0, 'Black', 'L', 8, 3, 1, 'Sold via WhatsApp'],
    [1, 'Olive', 'XXL', 4, 0, 1, 'Sold out'],
    [4, 'Off White', 'XS', 5, 0, 2, 'Sold via WhatsApp'],
    [5, 'White', 'M', 10, 20, 2, 'Restock'],
    [8, 'Navy', '4-5Y', 12, 16, 3, 'New batch received'],
    [10, 'White', 'One Size', 30, 14, 3, 'Bulk order dispatched'],
    [3, 'Burgundy', 'M', 9, 4, 4, 'Sold via WhatsApp'],
    [11, 'Natural', 'One Size', 4, 0, 4, 'Sold out'],
    [6, 'Mustard', 'S', 6, 14, 5, 'Restock'],
    [9, 'White', '4-5Y', 8, 3, 5, 'Sold via WhatsApp'],
    [2, 'Sand', 'XL', 11, 9, 6, 'Manual correction'],
    [7, 'Black', 'M', 9, 18, 7, 'Restock'],
    [12, 'Sage', 'One Size', 11, 3, 8, 'Sold via WhatsApp'],
    [0, 'White', 'M', 14, 24, 9, 'Restock'],
    [13, 'Burgundy', 'One Size', 7, 15, 10, 'Restock'],
  ];
  return rows
    .map((r, i) => mkHist(i + 1, P[r[0]], r[1], r[2], r[3], r[4], r[5], r[6]))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const REVIEWS = [
  { name: 'Ananya R.', location: 'Bengaluru', rating: 5, text: 'The print quality is unreal — vivid after multiple washes, and the fabric feels so soft. Ordering over WhatsApp was effortless.', item: 'Golden Hour Tee' },
  { name: 'Karthik S.', location: 'Chennai', rating: 5, text: 'Ordered matching tees for our team. Fit, colour and packaging were all spot on. Delivered earlier than promised!', item: 'Wander More Tee' },
  { name: 'Meera P.', location: 'Hyderabad', rating: 5, text: 'My daughter refuses to take her Rainbow tee off. Gentle on her skin and the colours are adorable.', item: 'Happy Days Rainbow Tee' },
  { name: 'Rohan D.', location: 'Mumbai', rating: 4, text: 'The tote has become my everyday bag. Sturdy canvas and a design that gets compliments everywhere I go.', item: 'Wander More Canvas Tote' },
];
