import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImagesEndpoint,
} from '../controllers/productController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import { uploadImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes (anyone can browse and view products)
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Admin protected routes (require valid JWT + admin role)
router.post('/upload-images', protect, requireAdmin, uploadImages, uploadImagesEndpoint);
router.post('/', protect, requireAdmin, uploadImages, createProduct);
router.put('/:id', protect, requireAdmin, uploadImages, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

export default router;
