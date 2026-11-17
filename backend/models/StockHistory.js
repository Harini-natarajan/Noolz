import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true,
    },
    previous: {
      type: Number,
      required: [true, 'Previous quantity is required'],
      min: 0,
    },
    updated: {
      type: Number,
      required: [true, 'Updated quantity is required'],
      min: 0,
    },
    change: {
      type: Number,
      required: [true, 'Stock change amount is required'],
    },
    note: {
      type: String,
      default: 'Manual adjustment',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

stockHistorySchema.index({ productId: 1, date: -1 });
stockHistorySchema.index({ date: -1 });

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);

export default StockHistory;
