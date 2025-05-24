const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const logger = require('../config/logger');
const { promisify } = require('util');

/**
 * Authentication middleware
 * Verifies the user's JWT token and adds the user object to the request
 */
exports.authenticate = async (req, res, next) => {
  try {
    // 1) Check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to get access', 401)
      );
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id).select('+role +active');
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user is active
    if (!user.active) {
      return next(
        new AppError('This user account has been deactivated.', 401)
      );
    }

    // 5) Check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password. Please log in again.', 401)
      );
    }

    // 6) Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return next(
      new AppError('Authentication failed. Please log in again.', 401)
    );
  }
};

/**
 * Role-based access control middleware
 * Restricts access to certain routes based on user roles
 * @param  {...String} roles - Allowed roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

/**
 * Verify refresh token for token refresh operation
 */
exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify the refresh token
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_SECRET
    );

    // Check if user exists
    const user = await User.findById(decoded.id).select('+role +active');
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // Check if token type is refresh
    if (decoded.type !== 'refresh') {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Refresh token verification error: ${error.message}`);
    return next(new AppError('Invalid refresh token. Please login again.', 401));
  }
};

/**
 * Middleware to check if 2FA is enabled and verified
 */
exports.require2FA = async (req, res, next) => {
  try {
    const user = req.user;

    // Skip 2FA check if not enabled for user
    if (!user.twoFactorEnabled) {
      return next();
    }

    // Check if 2FA has been verified in this session
    if (!req.session.twoFactorVerified) {
      return next(
        new AppError('Two-factor authentication required', 401, {
          require2FA: true
        })
      );
    }

    next();
  } catch (error) {
    logger.error(`2FA verification error: ${error.message}`);
    return next(new AppError('Two-factor authentication failed', 401));
  }
};
