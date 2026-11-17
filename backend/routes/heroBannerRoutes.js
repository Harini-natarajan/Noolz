import express from 'express';
import {
  getHeroBanners,
  getActiveHeroBanners,
  getHeroBannerById,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
} from '../controllers/heroBannerController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route: fetch active banners for homepage carousel
router.get('/active', getActiveHeroBanners);

// Admin-only route: fetch all banners (active and inactive)
router.get('/', protect, requireAdmin, getHeroBanners);

// Get single banner details
router.get('/:id', getHeroBannerById);

// Admin-only mutations
router.post('/', protect, requireAdmin, uploadSingleImage, createHeroBanner);
router.put('/:id', protect, requireAdmin, uploadSingleImage, updateHeroBanner);
router.delete('/:id', protect, requireAdmin, deleteHeroBanner);

export default router;
