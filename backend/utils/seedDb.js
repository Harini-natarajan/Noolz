import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import StockHistory from '../models/StockHistory.js';
import { makeImages } from './mockupHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

const buildStock = (colors, sizes, seed, zeroKeys = [], lowKeys = []) => {
  const stock = new Map();
  let s = seed;
  colors.forEach((c) =>
    sizes.forEach((sz) => {
      s = (s * 9301 + 49297) % 233280;
      const key = `${c.name}|${sz}`;
      let q = 6 + Math.floor((s / 233280) * 22);
      if (zeroKeys.includes(key)) q = 0;
      if (lowKeys.includes(key)) q = 2 + (s % 3);
      stock.set(key, q);
    })
  );
  return stock;
};

const def = (name, category, price, colors, design, description, featured, seed, extra = {}, subcategory = null) => {
  const sizes = SIZES[category];
  return {
    name,
    category,
    subcategory,
    price,
    description,
    featured,
    lowStockThreshold: 5,
    colors,
    sizes,
    design,
    images: makeImages({ kind: category, color: colors[0].hex, design }),
    stock: buildStock(colors, sizes, seed, extra.zero || [], extra.low || []),
  };
};

const SEED_CATALOG = [
  def('Golden Hour Tee', 'men', 899, [C.black, C.white, C.navy], 'sunrise',
    'A relaxed-fit tee in 100% combed cotton, screen-printed with our signature sunrise motif. Soft hand-feel, reinforced collar and a print that stays vivid wash after wash.',
    true, 11, { low: ['Black|L'] }, 'normal-fit'),
  def('Wander More Tee', 'men', 949, [C.olive, C.offwhite, C.black], 'mountain',
    'For the weekend explorers. A heavyweight 220 GSM tee with a layered mountain print in water-based inks — breathable, structured and made to last.',
    true, 23, { zero: ['Olive|XXL'] }, 'oversized'),
  def('Tidal Lines Tee', 'men', 849, [C.navy, C.sand], 'wave',
    'Minimal wave lines meet a clean boxy silhouette. Pre-shrunk cotton jersey that drapes beautifully and feels cool all day.',
    false, 37, {}, 'normal-fit'),
  def('Essential Plain Heavyweight Tee', 'men', 749, [C.black, C.white, C.burgundy], 'plain',
    'Clean, timeless, unprinted 240 GSM combed cotton tee. Structured drape, ribbed collar and ultra-durable stitching.',
    false, 41, { low: ['Burgundy|M', 'Burgundy|S'] }, 'plain-tees'),

  def('In Bloom Fitted Tee', 'women', 849, [C.blush, C.white, C.sage], 'bloom',
    'A softly fitted tee with a hand-drawn floral bloom print. Cotton-modal blend with a flattering scoop neck and a touch of stretch.',
    true, 53, {}, 'normal-fit'),
  def('Dream Big Cropped Tee', 'women', 799, [C.black, C.offwhite], 'stars',
    'Cropped, cut and comfortable. Starry print with metallic-gold feel ink, designed to pair with high-waist denim or tailored trousers.',
    true, 61, { zero: ['Off White|XS', 'Off White|S'], low: ['Black|L'] }, 'crop-tops'),
  def('Golden Hour Relaxed Tee', 'women', 899, [C.mustard, C.white], 'sunrise',
    'Our sunrise print in an airy oversized women\'s cut. Drop-shoulder, mid-weight cotton with a buttery soft finish.',
    false, 71, {}, 'oversized'),
  def('Tidal Lines Scoop Tee', 'women', 829, [C.sky, C.sand, C.black], 'wave',
    'Light, airy and printed with calm wave lines. Perfect for warm days and easy layering.',
    false, 83, {}, 'normal-fit'),

  def('Blast Off Kids Tee', 'kids', 599, [C.navy, C.mustard], 'rocket',
    'For little astronauts. Ultra-soft, skin-friendly cotton with a playful rocket print and tag-free neckline.',
    true, 97),
  def('Happy Days Rainbow Tee', 'kids', 549, [C.white, C.blush, C.sky], 'rainbow',
    'A cheerful rainbow print on gentle organic-blend cotton. Safe, non-toxic inks and a fit that grows with them.',
    true, 101, { low: ['White|4-5Y'] }),
  def('Smile More Kids Tee', 'kids', 549, [C.mustard, C.sage], 'smile',
    'A big smile for small people. Durable, easy-care jersey that survives playground adventures.',
    false, 113, { zero: ['Sage|10-11Y'] }),

  def('Wander More Canvas Tote', 'tote', 499, [C.natural, C.black], 'mountain',
    'Sturdy 12 oz natural canvas tote with reinforced handles and a mountain print. Carries your day — and then some.',
    true, 127),
  def('In Bloom Market Tote', 'tote', 449, [C.natural, C.sage], 'bloom',
    'A roomy market tote with an inner pocket and a floral bloom print. Made for farmers\' markets and café runs.',
    true, 131, { low: ['Sage|One Size'] }),
  def('Golden Hour Everyday Tote', 'tote', 479, [C.burgundy, C.natural], 'sunrise',
    'Everyday carry in burgundy cotton canvas, printed with our sunrise motif. Wide base, long shoulder handles.',
    false, 139, { zero: ['Natural|One Size'] }),
];

const seedDatabase = async () => {
  try {
    const isForce = process.argv.includes('--force');
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await connectDB();

    // 1. Seed or Update Admin
    const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    const email = (process.env.ADMIN_EMAIL || 'admin@noolz.in').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'AdminPassword@123';

    let admin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (!admin) {
      admin = await Admin.create({ username, email, password, role: 'admin' });
      console.log('✓ Admin account created.');
    } else {
      console.log(`✓ Admin account exists (${admin.username}).`);
    }

    // 2. Check Products
    const count = await Product.countDocuments();
    if (count > 0 && !isForce) {
      console.log(`[Seed] Database already contains ${count} products. Skipping product seeding. (Use --force to overwrite)`);
      await mongoose.connection.close();
      process.exit(0);
    }

    if (isForce) {
      console.log('[Seed] --force flag detected. Clearing existing products and stock history...');
      await Product.deleteMany({});
      await StockHistory.deleteMany({});
    }

    console.log(`[Seed] Inserting ${SEED_CATALOG.length} NOOLZ products...`);
    const inserted = await Product.insertMany(SEED_CATALOG);
    console.log(`✓ Inserted ${inserted.length} products.`);

    // 3. Seed Initial Stock History
    console.log('[Seed] Generating initial stock movement history...');
    const historyEntries = [];

    inserted.forEach((prod, idx) => {
      prod.colors.forEach((c) => {
        prod.sizes.forEach((s) => {
          const key = `${c.name}|${s}`;
          const qty = prod.stock.get(key) || 0;
          if (qty > 0) {
            historyEntries.push({
              productId: prod._id,
              productName: prod.name,
              color: c.name,
              size: s,
              previous: 0,
              updated: qty,
              change: qty,
              note: idx % 3 === 0 ? 'Batch production' : 'Initial stock',
              date: new Date(Date.now() - (idx + 1) * 3600 * 1000 * 6),
            });
          }
        });
      });
    });

    if (historyEntries.length > 0) {
      await StockHistory.insertMany(historyEntries);
      console.log(`✓ Inserted ${historyEntries.length} stock history records.`);
    }

    console.log('\n=========================================');
    console.log('✓ NOOLZ Database Seeding Completed!');
    console.log('=========================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
