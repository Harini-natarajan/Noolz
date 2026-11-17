import express from 'express';
import {
  loginAdmin,
  refreshAccessToken,
  logoutAdmin,
  getAdminProfile,
} from '../controllers/authController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/login', loginAdmin);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutAdmin);

// Protected admin profile route
router.get('/me', protect, requireAdmin, getAdminProfile);

export default router;
