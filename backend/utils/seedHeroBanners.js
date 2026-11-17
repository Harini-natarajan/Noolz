import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import HeroBanner from '../models/HeroBanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const EXISTING_HERO_BANNERS = [
  {
    eyebrow: "Men's Collection",
    title: 'Express Your Style.',
    subtitle: 'Everyday comfort. Extraordinary prints.',
    buttonText: "Explore Men's Collection",
    buttonLink: '/shop/mens',
    imageUrl:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1920&q=85',
    fallbackImage: '/hero/slide-men.svg',
    displayOrder: 1,
    isActive: true,
  },
  {
    eyebrow: "Women's Collection",
    title: 'Style That Speaks.',
    subtitle: 'Discover prints that match your personality.',
    buttonText: "Explore Women's Collection",
    buttonLink: '/shop/womens',
    imageUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85',
    fallbackImage: '/hero/slide-women.svg',
    displayOrder: 2,
    isActive: true,
  },
  {
    eyebrow: "Kids' Collection",
    title: 'Little Styles, Big Smiles.',
    subtitle: 'Comfortable prints for little personalities.',
    buttonText: "Explore Kids' Collection",
    buttonLink: '/shop/kids',
    imageUrl:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1920&q=85',
    fallbackImage: '/hero/slide-kids.svg',
    displayOrder: 3,
    isActive: true,
  },
  {
    eyebrow: 'Tote Bags',
    title: 'Carry Your Style.',
    subtitle: 'Everyday essentials with a creative touch.',
    buttonText: 'Explore Tote Bags',
    buttonLink: '/shop/tote-bags',
    imageUrl:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1920&q=85',
    fallbackImage: '/hero/slide-tote.svg',
    displayOrder: 4,
    isActive: true,
  },
];

export const seedHeroBanners = async () => {
  try {
    const isForce = process.argv.includes('--force');
    const count = await HeroBanner.countDocuments();

    if (count > 0 && !isForce) {
      console.log(`[Hero Banners] Database already contains ${count} banners. Preserving existing data.`);
      return;
    }

    if (isForce) {
      console.log('[Hero Banners] --force flag detected. Clearing previous banners...');
      await HeroBanner.deleteMany({});
    }

    console.log(`[Hero Banners] Seeding ${EXISTING_HERO_BANNERS.length} original hero banners...`);
    const inserted = await HeroBanner.insertMany(EXISTING_HERO_BANNERS);
    console.log(`✓ Inserted ${inserted.length} existing hero banners into MongoDB Atlas.`);
  } catch (error) {
    console.error('[Hero Banners Seed Error]', error.message);
  }
};

// If run directly from terminal:
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  connectDB().then(async () => {
    await seedHeroBanners();
    await mongoose.connection.close();
    process.exit(0);
  });
}
