import Admin from '../models/Admin.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/generateToken.js';

/**
 * Common cookie options for refresh token
 */
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
});

export const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
});

/**
 * @desc    Admin login & issue access + refresh tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { identifier, username, email, password } = req.body;

    const userKey = (identifier || username || email || '').trim();

    if (!userKey || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password',
      });
    }

    // Match against either username or email
    const admin = await Admin.findOne({
      $or: [
        { username: userKey.toLowerCase() },
        { email: userKey.toLowerCase() },
      ],
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Access denied: Admin privileges required',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Filter out expired refresh tokens and record the new token
    const now = new Date();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    admin.refreshTokens = (admin.refreshTokens || []).filter(
      (t) => t.expiresAt && t.expiresAt > now
    );
    admin.refreshTokens.push({ token: refreshToken, expiresAt });
    await admin.save();

    // Set secure HTTP-only cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using valid refresh token (Token Rotation)
 * @route   POST /api/auth/refresh
 * @access  Public (Requires valid refresh token cookie or body)
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: 'NO_REFRESH_TOKEN',
        message: 'Refresh token is missing. Please log in.',
      });
    }

    // Verify refresh token signature & expiration
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      res.clearCookie('refreshToken', getClearCookieOptions());
      return res.status(401).json({
        success: false,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired. Please log in again.',
      });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      res.clearCookie('refreshToken', getClearCookieOptions());
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Admin account not found',
      });
    }

    if (admin.role !== 'admin') {
      res.clearCookie('refreshToken', getClearCookieOptions());
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Access denied: Admin privileges required',
      });
    }

    // Check if refresh token exists in DB (revocation & reuse detection)
    const tokenExists = (admin.refreshTokens || []).some(
      (t) => t.token === refreshToken
    );

    if (!tokenExists) {
      // Reuse of revoked/old token detected: Revoke all refresh tokens for security
      console.warn(
        `[Auth Alert] Revoked refresh token reuse attempt for admin ${admin.username}. Revoking all tokens.`
      );
      admin.refreshTokens = [];
      await admin.save();
      res.clearCookie('refreshToken', getClearCookieOptions());

      return res.status(403).json({
        success: false,
        code: 'REVOKED_TOKEN',
        message: 'Invalid or revoked session token. Please log in again.',
      });
    }

    // Token Rotation: Remove the old refresh token, generate a new pair
    const newAccessToken = generateAccessToken(admin);
    const newRefreshToken = generateRefreshToken(admin);

    const now = new Date();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    admin.refreshTokens = admin.refreshTokens.filter(
      (t) => t.token !== refreshToken && t.expiresAt && t.expiresAt > now
    );
    admin.refreshTokens.push({ token: newRefreshToken, expiresAt });
    await admin.save();

    // Set updated cookie
    res.cookie('refreshToken', newRefreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken: newAccessToken,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout admin & revoke refresh token
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutAdmin = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const admin = await Admin.findById(decoded.id);
        if (admin && admin.refreshTokens) {
          admin.refreshTokens = admin.refreshTokens.filter(
            (t) => t.token !== refreshToken
          );
          await admin.save();
        }
      } catch {
        // If token decode fails, proceed with clearing cookie
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', getClearCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated admin profile
 * @route   GET /api/auth/me
 * @access  Private (Admin only)
 */
export const getAdminProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role,
        createdAt: req.admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
