import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a memory buffer to Cloudinary using an upload stream
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadToCloudinary = (buffer, folder = 'noolz/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }, // Automatic compression and WebP conversion
        ],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Extract public_id from a Cloudinary URL
 * Example URL: https://res.cloudinary.com/demo/image/upload/v1234567/noolz/products/xyz.jpg -> noolz/products/xyz
 */
export const extractPublicId = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    // Remove version prefix (e.g. v1700000000/) if present
    const cleanPath = afterUpload.replace(/^v\d+\//, '');
    // Remove extension
    const dotIndex = cleanPath.lastIndexOf('.');
    return dotIndex !== -1 ? cleanPath.substring(0, dotIndex) : cleanPath;
  } catch {
    return null;
  }
};

/**
 * Delete an image from Cloudinary using URL or public_id
 * @param {string} urlOrPublicId
 */
export const deleteFromCloudinary = async (urlOrPublicId) => {
  if (!urlOrPublicId) return;

  try {
    const publicId = urlOrPublicId.startsWith('http')
      ? extractPublicId(urlOrPublicId)
      : urlOrPublicId;

    if (!publicId) return;

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`[Cloudinary Destroy Error for ${urlOrPublicId}]:`, error.message);
  }
};

export default cloudinary;
