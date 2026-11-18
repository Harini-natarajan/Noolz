import Product from '../models/Product.js';
import StockHistory from '../models/StockHistory.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Get all products with filtering, search, and sorting
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, subcategory, featured, q, sort } = req.query;

    const filter = {};

    // Filter by category
    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }

    // Filter by subcategory
    if (subcategory && subcategory !== 'all') {
      filter.subcategory = subcategory.toLowerCase();
    }

    // Filter by featured status
    if (featured === 'true' || featured === '1') {
      filter.featured = true;
    }

    // Search by product name or description
    if (q && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    // Determine sorting order
    let sortOption = { createdAt: -1 }; // Default newest first
    if (sort === 'low') {
      sortOption = { price: 1 };
    } else if (sort === 'high') {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    // Check if error is cast error (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Admin only)
 */
export const createProduct = async (req, res, next) => {
  try {
    let {
      name,
      category,
      subcategory,
      description,
      price,
      discountPrice,
      images,
      sizes,
      colors,
      stock,
      lowStockThreshold,
      featured,
      design,
    } = req.body;

    // Parse JSON strings if payload sent as multipart/form-data
    if (typeof colors === 'string') colors = JSON.parse(colors);
    if (typeof sizes === 'string') sizes = JSON.parse(sizes);
    if (typeof stock === 'string') stock = JSON.parse(stock);
    if (typeof images === 'string') images = JSON.parse(images);

    // Handle any uploaded files via Multer
    const uploadedUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'noolz/products');
        uploadedUrls.push(result.url);
      }
    }

    // Gather color-specific images if available
    const colorImages = Array.isArray(colors)
      ? colors.flatMap((c) => (Array.isArray(c.images) ? c.images : []))
      : [];

    const finalImages = Array.from(new Set([...(images || []), ...colorImages, ...uploadedUrls].filter(Boolean)));

    if (!finalImages.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one product image',
      });
    }

    // Convert stock object to Map structure for Mongoose
    const stockMap = new Map();
    if (stock && typeof stock === 'object') {
      Object.entries(stock).forEach(([key, val]) => {
        stockMap.set(key, Math.max(0, Math.floor(Number(val) || 0)));
      });
    }

    const product = new Product({
      name,
      category,
      subcategory: subcategory || null,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      images: finalImages,
      sizes: sizes || [],
      colors: colors || [],
      stock: stockMap,
      lowStockThreshold: Number(lowStockThreshold) >= 0 ? Number(lowStockThreshold) : 5,
      featured: Boolean(featured),
      design: design || 'sunrise',
    });

    const savedProduct = await product.save();

    // Log initial stock entries in StockHistory for variants with initial stock
    const historyEntries = [];
    if (colors && sizes) {
      colors.forEach((c) => {
        sizes.forEach((s) => {
          const key = `${c.name}|${s}`;
          const qty = stockMap.get(key) || 0;
          if (qty > 0) {
            historyEntries.push({
              productId: savedProduct._id,
              productName: savedProduct.name,
              color: c.name,
              size: s,
              previous: 0,
              updated: qty,
              change: qty,
              note: 'Initial stock',
            });
          }
        });
      });
    }

    if (historyEntries.length > 0) {
      await StockHistory.insertMany(historyEntries);
    }

    res.status(201).json({
      success: true,
      message: `Product "${savedProduct.name}" created successfully`,
      product: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 * @access  Private (Admin only)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let {
      name,
      category,
      subcategory,
      description,
      price,
      discountPrice,
      images,
      sizes,
      colors,
      stock,
      lowStockThreshold,
      featured,
      design,
    } = req.body;

    if (typeof colors === 'string') colors = JSON.parse(colors);
    if (typeof sizes === 'string') sizes = JSON.parse(sizes);
    if (typeof stock === 'string') stock = JSON.parse(stock);
    if (typeof images === 'string') images = JSON.parse(images);

    // Upload any newly attached files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'noolz/products');
        images = [...(images || []), result.url];
      }
    }

    // Detect stock changes and create StockHistory entries
    const historyEntries = [];
    const newStockMap = new Map();

    if (stock && typeof stock === 'object') {
      const activeColors = colors || product.colors;
      const activeSizes = sizes || product.sizes;

      activeColors.forEach((c) => {
        activeSizes.forEach((s) => {
          const key = `${c.name}|${s}`;
          const prevQty = product.stock.get(key) || 0;
          const newQty = Math.max(0, Math.floor(Number(stock[key]) || 0));

          newStockMap.set(key, newQty);

          if (prevQty !== newQty) {
            historyEntries.push({
              productId: product._id,
              productName: name || product.name,
              color: c.name,
              size: s,
              previous: prevQty,
              updated: newQty,
              change: newQty - prevQty,
              note: 'Edited in product form',
            });
          }
        });
      });
    }

    // Apply updates
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (colors !== undefined) {
      product.colors = colors;
      const colorImages = Array.isArray(colors)
        ? colors.flatMap((c) => (Array.isArray(c.images) ? c.images : []))
        : [];
      if (colorImages.length > 0 && (!images || images.length === 0)) {
        images = colorImages;
      }
    }
    if (images !== undefined) product.images = images;
    if (sizes !== undefined) product.sizes = sizes;
    if (stock !== undefined) product.stock = newStockMap;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (featured !== undefined) product.featured = Boolean(featured);
    if (design !== undefined) product.design = design;

    const updatedProduct = await product.save();

    if (historyEntries.length > 0) {
      await StockHistory.insertMany(historyEntries);
    }

    res.status(200).json({
      success: true,
      message: `Product "${updatedProduct.name}" updated successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product and its images from Cloudinary
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Remove images from Cloudinary
    if (Array.isArray(product.images)) {
      for (const imgUrl of product.images) {
        if (imgUrl.includes('cloudinary.com')) {
          await deleteFromCloudinary(imgUrl);
        }
      }
    }

    // Delete associated stock history
    await StockHistory.deleteMany({ productId: product._id });

    // Delete product document
    await Product.findByIdAndDelete(product._id);

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload multiple product images directly to Cloudinary
 * @route   POST /api/products/upload-images
 * @access  Private (Admin only)
 */
export const uploadImagesEndpoint = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded',
      });
    }

    const uploaded = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'noolz/products');
      uploaded.push({
        url: result.url,
        public_id: result.public_id,
      });
    }

    res.status(200).json({
      success: true,
      message: `${uploaded.length} image(s) uploaded successfully`,
      images: uploaded.map((u) => u.url),
      details: uploaded,
    });
  } catch (error) {
    next(error);
  }
};
