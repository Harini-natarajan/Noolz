import HeroBanner from '../models/HeroBanner.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Get all hero banners (Admin view: active and inactive)
 * @route   GET /api/hero-banners
 * @access  Private (Admin only)
 */
export const getHeroBanners = async (req, res, next) => {
  try {
    const banners = await HeroBanner.find().sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active hero banners for public homepage
 * @route   GET /api/hero-banners/active
 * @access  Public
 */
export const getActiveHeroBanners = async (req, res, next) => {
  try {
    const banners = await HeroBanner.find({ isActive: true }).sort({
      displayOrder: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single hero banner by ID
 * @route   GET /api/hero-banners/:id
 * @access  Public
 */
export const getHeroBannerById = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Hero banner not found',
      });
    }

    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Hero banner not found',
      });
    }
    next(error);
  }
};

/**
 * @desc    Create a new hero banner
 * @route   POST /api/hero-banners
 * @access  Private (Admin only)
 */
export const createHeroBanner = async (req, res, next) => {
  try {
    let {
      title,
      subtitle,
      eyebrow,
      buttonText,
      buttonLink,
      displayOrder,
      isActive,
      imageUrl,
      fallbackImage,
    } = req.body;

    let cloudinaryPublicId = null;

    // Handle uploaded file if present
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'noolz/hero-banners');
      imageUrl = uploadResult.url;
      cloudinaryPublicId = uploadResult.public_id;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a banner image or upload an image file.',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Banner title is required.',
      });
    }

    const banner = new HeroBanner({
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      eyebrow: (eyebrow || '').trim(),
      buttonText: (buttonText || 'Explore Collection').trim(),
      buttonLink: (buttonLink || '/shop').trim(),
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      imageUrl,
      cloudinaryPublicId,
      fallbackImage: fallbackImage || null,
    });

    const savedBanner = await banner.save();

    res.status(201).json({
      success: true,
      message: `Hero banner "${savedBanner.title}" created successfully.`,
      banner: savedBanner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing hero banner
 * @route   PUT /api/hero-banners/:id
 * @access  Private (Admin only)
 */
export const updateHeroBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Hero banner not found',
      });
    }

    let {
      title,
      subtitle,
      eyebrow,
      buttonText,
      buttonLink,
      displayOrder,
      isActive,
      imageUrl,
      fallbackImage,
    } = req.body;

    // Handle new uploaded file
    if (req.file) {
      // Remove previous Cloudinary image if it exists
      if (banner.cloudinaryPublicId || banner.imageUrl?.includes('cloudinary.com')) {
        await deleteFromCloudinary(banner.cloudinaryPublicId || banner.imageUrl);
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, 'noolz/hero-banners');
      banner.imageUrl = uploadResult.url;
      banner.cloudinaryPublicId = uploadResult.public_id;
    } else if (imageUrl && imageUrl !== banner.imageUrl) {
      // If a different URL was provided, clean up old Cloudinary image
      if (banner.cloudinaryPublicId || banner.imageUrl?.includes('cloudinary.com')) {
        await deleteFromCloudinary(banner.cloudinaryPublicId || banner.imageUrl);
      }
      banner.imageUrl = imageUrl;
      banner.cloudinaryPublicId = null;
    }

    if (title !== undefined) banner.title = title.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle.trim();
    if (eyebrow !== undefined) banner.eyebrow = eyebrow.trim();
    if (buttonText !== undefined) banner.buttonText = buttonText.trim();
    if (buttonLink !== undefined) banner.buttonLink = buttonLink.trim();
    if (displayOrder !== undefined) banner.displayOrder = Number(displayOrder);
    if (isActive !== undefined) banner.isActive = Boolean(isActive);
    if (fallbackImage !== undefined) banner.fallbackImage = fallbackImage;

    const updatedBanner = await banner.save();

    res.status(200).json({
      success: true,
      message: `Hero banner "${updatedBanner.title}" updated successfully.`,
      banner: updatedBanner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a hero banner
 * @route   DELETE /api/hero-banners/:id
 * @access  Private (Admin only)
 */
export const deleteHeroBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Hero banner not found',
      });
    }

    // Clean up Cloudinary image if hosted there
    if (banner.cloudinaryPublicId || banner.imageUrl?.includes('cloudinary.com')) {
      await deleteFromCloudinary(banner.cloudinaryPublicId || banner.imageUrl);
    }

    await HeroBanner.findByIdAndDelete(banner._id);

    res.status(200).json({
      success: true,
      message: `Hero banner "${banner.title}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
