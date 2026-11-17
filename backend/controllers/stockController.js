import Product from '../models/Product.js';
import StockHistory from '../models/StockHistory.js';

/**
 * @desc    Get stock overview dashboard metrics
 * @route   GET /api/stock/overview
 * @access  Private (Admin only)
 */
export const getStockOverview = async (req, res, next) => {
  try {
    const products = await Product.find({});

    let totalUnits = 0;
    let lowVariantsCount = 0;
    let outVariantsCount = 0;
    let inStockProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    products.forEach((p) => {
      let productTotal = 0;
      const threshold = p.lowStockThreshold || 5;

      p.colors.forEach((c) => {
        p.sizes.forEach((s) => {
          const key = `${c.name}|${s}`;
          const qty = p.stock.get(key) || 0;
          productTotal += qty;

          if (qty === 0) {
            outVariantsCount++;
          } else if (qty <= threshold) {
            lowVariantsCount++;
          }
        });
      });

      totalUnits += productTotal;

      if (productTotal === 0) {
        outOfStockProducts++;
      } else if (productTotal <= threshold) {
        lowStockProducts++;
      } else {
        inStockProducts++;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts: products.length,
        totalUnits,
        inStockProducts,
        lowStockProducts,
        outOfStockProducts,
        lowVariantsCount,
        outVariantsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update stock quantity for a specific variant
 * @route   PUT /api/stock/:productId
 * @access  Private (Admin only)
 */
export const updateVariantStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { color, size, quantity, note } = req.body;

    if (!color || !size || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Color, size, and quantity are required',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const key = `${color}|${size}`;
    const previous = product.stock.get(key) || 0;
    const updated = Math.max(0, Math.floor(Number(quantity) || 0));

    // Update stock map
    product.stock.set(key, updated);
    await product.save();

    // Create history entry
    const change = updated - previous;
    let historyEntry = null;

    if (change !== 0) {
      historyEntry = await StockHistory.create({
        productId: product._id,
        productName: product.name,
        color,
        size,
        previous,
        updated,
        change,
        note: note || (change > 0 ? 'Stock increased' : 'Stock decreased'),
        date: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: `Stock updated for ${product.name} (${color}/${size})`,
      stock: Object.fromEntries(product.stock),
      historyEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Increment or decrement stock (prevents negative values)
 * @route   POST /api/stock/:productId/adjust
 * @access  Private (Admin only)
 */
export const adjustVariantStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { color, size, change, note } = req.body;

    if (!color || !size || change === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Color, size, and change amount are required',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const key = `${color}|${size}`;
    const previous = product.stock.get(key) || 0;
    const delta = Math.floor(Number(change) || 0);
    const updated = Math.max(0, previous + delta);

    if (previous === updated) {
      return res.status(200).json({
        success: true,
        message: 'No stock change needed',
        stock: Object.fromEntries(product.stock),
      });
    }

    product.stock.set(key, updated);
    await product.save();

    const historyEntry = await StockHistory.create({
      productId: product._id,
      productName: product.name,
      color,
      size,
      previous,
      updated,
      change: updated - previous,
      note: note || (delta > 0 ? 'Stock increased' : 'Stock decreased'),
      date: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Stock adjusted for ${product.name} (${color}/${size})`,
      stock: Object.fromEntries(product.stock),
      historyEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get stock movement history with search and pagination
 * @route   GET /api/stock/history
 * @access  Private (Admin only)
 */
export const getStockHistory = async (req, res, next) => {
  try {
    const { q, type, productId, limit = 100, page = 1 } = req.query;

    const filter = {};

    if (productId) {
      filter.productId = productId;
    }

    if (q && q.trim()) {
      filter.productName = { $regex: q.trim(), $options: 'i' };
    }

    if (type === 'added') {
      filter.change = { $gt: 0 };
    } else if (type === 'removed') {
      filter.change = { $lt: 0 };
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [history, total] = await Promise.all([
      StockHistory.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockHistory.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get low stock and out of stock products
 * @route   GET /api/stock/alerts
 * @access  Private (Admin only)
 */
export const getStockAlerts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    const lowVariants = [];
    const outVariants = [];

    products.forEach((p) => {
      const threshold = p.lowStockThreshold || 5;

      p.colors.forEach((c) => {
        p.sizes.forEach((s) => {
          const key = `${c.name}|${s}`;
          const qty = p.stock.get(key) || 0;

          const item = {
            productId: p._id,
            productName: p.name,
            category: p.category,
            image: p.images[0] || null,
            color: c.name,
            hex: c.hex,
            size: s,
            qty,
            threshold,
          };

          if (qty === 0) {
            outVariants.push(item);
          } else if (qty <= threshold) {
            lowVariants.push(item);
          }
        });
      });
    });

    res.status(200).json({
      success: true,
      lowCount: lowVariants.length,
      outCount: outVariants.length,
      lowStock: lowVariants,
      outOfStock: outVariants,
    });
  } catch (error) {
    next(error);
  }
};
