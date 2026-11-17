import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Admin from './models/Admin.js';
import HeroBanner from './models/HeroBanner.js';
import authRoutes from './routes/authRoutes.js';
import heroBannerRoutes from './routes/heroBannerRoutes.js';
import { generateAccessToken } from './utils/generateToken.js';
import { EXISTING_HERO_BANNERS } from './utils/seedHeroBanners.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const runHeroBannerTests = async () => {
  console.log('\n======================================================');
  console.log('NOOLZ Hero Banner Management Test Suite');
  console.log('======================================================\n');

  await connectDB();

  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/hero-banners', heroBannerRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/hero-banners`;

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✓ PASSED: ${title}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${title}`);
      failed++;
    }
  };

  try {
    const admin = await Admin.findOne({ username: 'admin' });
    const adminToken = generateAccessToken(admin);

    // ----------------------------------------------------
    // Scenario 1: Existing banners appear on homepage (GET /api/hero-banners/active)
    // ----------------------------------------------------
    console.log('--- Scenario 1: Active banners retrieval for homepage ---');
    const activeRes = await fetch(`${baseUrl}/active`);
    const activeData = await activeRes.json();

    assert(activeRes.status === 200, 'Public endpoint returns HTTP 200');
    assert(activeData.success === true, 'Returns success: true');
    assert(
      Array.isArray(activeData.banners) && activeData.banners.length >= 4,
      `Homepage receives at least 4 active banners (received: ${activeData.banners?.length})`
    );

    // ----------------------------------------------------
    // Scenario 2: Existing banners appear in Admin Hero Banners (GET /api/hero-banners)
    // ----------------------------------------------------
    console.log('\n--- Scenario 2: Admin banners retrieval ---');
    const adminListRes = await fetch(`${baseUrl}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminListData = await adminListRes.json();

    assert(adminListRes.status === 200, 'Admin endpoint returns HTTP 200 with JWT');
    assert(adminListData.success === true, 'Returns success: true');
    const titles = adminListData.banners.map((b) => b.title);
    assert(
      titles.includes('Express Your Style.') && titles.includes('Carry Your Style.'),
      'Contains original hero banners in Admin list'
    );

    // ----------------------------------------------------
    // Scenario 3: Admin can add a new banner (POST /api/hero-banners)
    // ----------------------------------------------------
    console.log('\n--- Scenario 3: Admin adds a new hero banner ---');
    const newBannerPayload = {
      title: 'Summer Linen Capsule',
      subtitle: 'Breezy silhouettes made for warm sunshine.',
      eyebrow: 'Limited Edition',
      buttonText: 'Shop the Capsule',
      buttonLink: '/shop/mens/normal-fit',
      displayOrder: 10,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1920&q=85',
    };

    const createRes = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newBannerPayload),
    });
    const createData = await createRes.json();

    assert(createRes.status === 201, 'Returns HTTP 201 Created');
    assert(createData.banner?.title === 'Summer Linen Capsule', 'New banner saved with correct title');
    const createdId = createData.banner?.id || createData.banner?._id;

    // ----------------------------------------------------
    // Scenario 4: Admin can edit an existing banner (PUT /api/hero-banners/:id)
    // ----------------------------------------------------
    console.log('\n--- Scenario 4: Admin edits an existing banner ---');
    const editRes = await fetch(`${baseUrl}/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Summer Linen Capsule (Updated)',
        buttonText: 'Discover Summer Fits',
      }),
    });
    const editData = await editRes.json();

    assert(editRes.status === 200, 'Returns HTTP 200 on edit');
    assert(
      editData.banner?.title === 'Summer Linen Capsule (Updated)',
      'Title updated without touching other banners'
    );
    assert(
      editData.banner?.buttonText === 'Discover Summer Fits',
      'Button text updated successfully'
    );

    // ----------------------------------------------------
    // Scenario 5: Admin can deactivate a banner and verify it disappears from active
    // ----------------------------------------------------
    console.log('\n--- Scenario 5 & 6: Deactivate banner and verify homepage exclusion ---');
    const deactivateRes = await fetch(`${baseUrl}/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isActive: false }),
    });
    const deactivateData = await deactivateRes.json();

    assert(deactivateData.banner?.isActive === false, 'Banner isActive set to false');

    const activeAfterDeactivateRes = await fetch(`${baseUrl}/active`);
    const activeAfterDeactivateData = await activeAfterDeactivateRes.json();
    const activeIds = activeAfterDeactivateData.banners.map((b) => b.id || b._id);

    assert(
      !activeIds.includes(createdId),
      'Inactive banner is excluded from public homepage carousel'
    );

    // ----------------------------------------------------
    // Scenario 7: Verify Display Order
    // ----------------------------------------------------
    console.log('\n--- Scenario 7: Display order verification ---');
    const orderedBanners = activeAfterDeactivateData.banners;
    let isSorted = true;
    for (let i = 0; i < orderedBanners.length - 1; i++) {
      if ((orderedBanners[i].displayOrder ?? 0) > (orderedBanners[i + 1].displayOrder ?? 0)) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, 'Banners are sorted in ascending displayOrder');

    // ----------------------------------------------------
    // Scenario 8: Admin can delete ONLY the selected banner
    // ----------------------------------------------------
    console.log('\n--- Scenario 8: Delete only the selected banner ---');
    const countBefore = await HeroBanner.countDocuments();
    const deleteRes = await fetch(`${baseUrl}/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const countAfter = await HeroBanner.countDocuments();

    assert(deleteRes.status === 200, 'Returns HTTP 200 on delete');
    assert(countAfter === countBefore - 1, 'Exactly one banner was deleted; others preserved');

    // Verify existing 4 banners are still intact
    const remainingTitles = (await HeroBanner.find()).map((b) => b.title);
    assert(
      remainingTitles.includes('Express Your Style.') &&
      remainingTitles.includes('Style That Speaks.') &&
      remainingTitles.includes('Little Styles, Big Smiles.') &&
      remainingTitles.includes('Carry Your Style.'),
      'All 4 original NOOLZ hero banners remain perfectly preserved in MongoDB'
    );

    console.log('\n======================================================');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('[Test Suite Error]', error);
    server.close();
    process.exit(1);
  }
};

runHeroBannerTests();
