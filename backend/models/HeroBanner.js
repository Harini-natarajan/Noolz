import mongoose from 'mongoose';

const heroBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    eyebrow: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
      trim: true,
    },
    fallbackImage: {
      type: String,
      default: null,
      trim: true,
    },
    buttonText: {
      type: String,
      default: 'Explore Collection',
      trim: true,
    },
    buttonLink: {
      type: String,
      default: '/shop',
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

heroBannerSchema.index({ displayOrder: 1, isActive: 1 });

const HeroBanner = mongoose.model('HeroBanner', heroBannerSchema);

export default HeroBanner;
