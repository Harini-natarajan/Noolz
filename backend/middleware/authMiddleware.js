import Admin from '../models/Admin.js';
import { verifyAccessToken } from '../utils/generateToken.js';

/**
 * Protect middleware: Verifies JWT access token and attaches admin to req.admin
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'NO_TOKEN',
      message: 'Not authorized: No token provided in header',
    });
  }

  try {
    const decoded = verifyAccessToken(token);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Not authorized: Admin account not found',
      });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Not authorized: Access token has expired',
      });
    }

    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Not authorized: Invalid token signature or malformed token',
    });
  }
};

/**
 * Role-based authorization middleware: Verifies req.admin has 'admin' role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      message: 'Forbidden: Admin privileges required',
    });
  }
  next();
};
