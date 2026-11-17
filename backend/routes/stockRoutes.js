import express from 'express';
import {
  getStockOverview,
  updateVariantStock,
  adjustVariantStock,
  getStockHistory,
  getStockAlerts,
} from '../controllers/stockController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All stock routes are strictly protected for administrators
router.use(protect, requireAdmin);

router.get('/overview', getStockOverview);
router.get('/alerts', getStockAlerts);
router.get('/history', getStockHistory);
router.put('/:productId', updateVariantStock);
router.post('/:productId/adjust', adjustVariantStock);

export default router;
