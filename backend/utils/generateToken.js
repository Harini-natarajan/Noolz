import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'noolz_access_secret_default_key';

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET ||
  (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'noolz_refresh_secret_default_key');

/**
 * Generate a short-lived access token (15 minutes)
 * @param {object} admin - Admin document or object with _id, role, username
 * @returns {string} - Signed JWT access token
 */
export const generateAccessToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id || admin.id,
      role: admin.role || 'admin',
      username: admin.username,
      jti: crypto.randomUUID(),
    },
    getAccessSecret(),
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    }
  );
};

/**
 * Generate a long-lived refresh token (7 days)
 * @param {object} admin - Admin document or object with _id
 * @returns {string} - Signed JWT refresh token
 */
export const generateRefreshToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id || admin.id,
    },
    getRefreshSecret(),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    }
  );
};

/**
 * Verify access token
 * @param {string} token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

/**
 * Verify refresh token
 * @param {string} token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

// Backwards-compatibility alias
export const generateToken = (id, role = 'admin') => {
  return generateAccessToken({ _id: id, role });
};
