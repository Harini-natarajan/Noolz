import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Color name is required'],
      trim: true,
    },
    hex: {
      type: String,
      required: [true, 'Color hex code is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Product description must be at least 10 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['men', 'women', 'kids', 'tote'],
        message: '{VALUE} is not a valid category',
      },
    },
    subcategory: {
      type: String,
      default: null,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price must be greater than or equal to 0'],
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one image',
      },
    },
    sizes: {
      type: [String],
      required: [true, 'At least one size is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one size',
      },
    },
    colors: {
      type: [colorSchema],
      required: [true, 'At least one color is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one color',
      },
    },
    // Stock mapping for each variant: e.g. { "Black|S": 10, "White|M": 15 }
    stock: {
      type: Map,
      of: Number,
      default: {},
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Low stock threshold cannot be negative'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    design: {
      type: String,
      default: 'sunrise',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        // Convert Map to plain object for clean JSON serialization
        if (ret.stock instanceof Map) {
          ret.stock = Object.fromEntries(ret.stock);
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        if (ret.stock instanceof Map) {
          ret.stock = Object.fromEntries(ret.stock);
        }
        return ret;
      },
    },
  }
);

// Auto-populate product.images if empty but colors have color-specific images
productSchema.pre('validate', function () {
  if ((!this.images || this.images.length === 0) && Array.isArray(this.colors)) {
    const collected = this.colors.flatMap((c) => (Array.isArray(c.images) ? c.images : []));
    if (collected.length > 0) {
      this.images = collected;
    }
  }
});

// Virtual for structured color variants matching requested format
productSchema.virtual('variants').get(function () {
  if (!this.colors) return [];
  const totalColors = this.colors.length;
  return this.colors.map((c, idx) => {
    let imgs = Array.isArray(c.images) && c.images.length > 0 ? c.images : [];
    if (!imgs.length && Array.isArray(this.images) && this.images.length > 0) {
      if (totalColors === 1) {
        imgs = this.images;
      } else if (idx < this.images.length) {
        imgs = [this.images[idx]];
      }
    }
    return {
      color: c.name,
      hex: c.hex,
      images: imgs,
    };
  });
});

// Virtual for calculating total units in stock across all valid variants
productSchema.virtual('totalUnits').get(function () {
  if (!this.stock) return 0;
  let total = 0;
  const stockMap = this.stock instanceof Map ? this.stock : new Map(Object.entries(this.stock));
  for (const qty of stockMap.values()) {
    total += Number(qty) || 0;
  }
  return total;
});

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ featured: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
