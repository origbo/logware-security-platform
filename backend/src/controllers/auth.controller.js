const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const otplib = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const logger = require('../config/logger');
const { createClient } = require('redis');

// Redis client for token blacklisting
const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err}`);
});

// Generate JWT token
const signToken = (id, type = 'access') => {
  const expiresIn = type === 'access' 
    ? process.env.JWT_ACCESS_EXPIRATION || '15m'
    : process.env.JWT_REFRESH_EXPIRATION || '7d';

  return jwt.sign(
    { 
      id,
      type
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );
};

// Create and send tokens
const createSendTokens = (user, statusCode, req, res) => {
  const accessToken = signToken(user._id, 'access');
  const refreshToken = signToken(user._id, 'refresh');

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRATION || 7 * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict'
  };

  // Send refresh token as a cookie
  res.cookie('jwt', refreshToken, cookieOptions);

  // Remove sensitive fields from response
  user.password = undefined;
  user.passwordChangedAt = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.twoFactorSecret = undefined;

  // Update last login timestamp
  User.findByIdAndUpdate(user._id, { lastLogin: Date.now() }).catch((err) => {
    logger.error(`Error updating last login: ${err.message}`);
  });

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: {
      user
    }
  });
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role // This will be ignored for security unless explicitly allowed
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Create new user (role will be set to default 'user' unless admin creates)
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      // Only set role if the current user is an admin and has permission
      ...(req.user && req.user.role === 'admin' ? { role } : {})
    });

    // Generate tokens and send response
    createSendTokens(newUser, 201, req, res);
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select(
      '+password +role +active +loginAttempts +lockUntil +twoFactorEnabled +twoFactorSecret'
    );

    // If no user or password is incorrect
    if (!user || !(await user.correctPassword(password, user.password))) {
      // Increment login attempts if user exists
      if (user) {
        await user.incrementLoginAttempts();
      }
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) Check if account is locked
    if (user.isLocked()) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return next(
        new AppError(
          `Account locked due to too many failed attempts. Try again in ${lockTime} minutes.`,
          401,
          { lockUntil: user.lockUntil }
        )
      );
    }

    // 4) Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await User.findByIdAndUpdate(user._id, { 
        loginAttempts: 0, 
        lockUntil: null 
      });
    }

    // 5) Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return special response indicating 2FA is required
      return res.status(200).json({
        status: 'success',
        message: 'Please enter your 2FA code',
        require2FA: true,
        userId: user._id
      });
    }

    // 6) If no 2FA, generate tokens and send response
    createSendTokens(user, 200, req, res);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// Verify 2FA token
exports.verify2FA = async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return next(new AppError('Please provide user ID and 2FA token', 400));
    }

    // Get user with 2FA secret
    const user = await User.findById(userId).select(
      '+twoFactorSecret +twoFactorEnabled'
    );

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return next(new AppError('Invalid user or 2FA not enabled', 400));
    }

    // Verify the token
    const isValid = otplib.authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return next(new AppError('Invalid 2FA token', 401));
    }

    // Set 2FA verification in session
    req.session.twoFactorVerified = true;

    // Generate tokens and send response
    createSendTokens(user, 200, req, res);
  } catch (error) {
    logger.error(`2FA verification error: ${error.message}`);
    next(error);
  }
};

// Setup 2FA for a user
exports.setup2FA = async (req, res, next) => {
  try {
    // Get user (must be authenticated)
    const user = await User.findById(req.user.id).select('+twoFactorSecret');

    // Generate new secret
    const secret = otplib.authenticator.generateSecret();
    
    // Save secret to user
    user.twoFactorSecret = secret;
    await user.save({ validateBeforeSave: false });

    // Generate QR code
    const otpauth = otplib.authenticator.keyuri(
      user.email,
      process.env.MFA_ISSUER || 'Logware Security Platform',
      secret
    );

    const qrCodeDataUrl = await promisify(qrcode.toDataURL)(otpauth);

    res.status(200).json({
      status: 'success',
      data: {
        secret,
        qrCode: qrCodeDataUrl
      }
    });
  } catch (error) {
    logger.error(`2FA setup error: ${error.message}`);
    next(error);
  }
};

// Enable 2FA after setup and verification
exports.enable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Get user with 2FA secret
    const user = await User.findById(req.user.id).select('+twoFactorSecret');

    if (!user || !user.twoFactorSecret) {
      return next(new AppError('Please set up 2FA first', 400));
    }

    // Verify the token
    const isValid = otplib.authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return next(new AppError('Invalid 2FA token', 401));
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Two-factor authentication enabled'
    });
  } catch (error) {
    logger.error(`2FA enabling error: ${error.message}`);
    next(error);
  }
};

// Disable 2FA
exports.disable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Get user with 2FA secret
    const user = await User.findById(req.user.id).select(
      '+twoFactorSecret +twoFactorEnabled'
    );

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return next(new AppError('2FA is not enabled', 400));
    }

    // Verify the token
    const isValid = otplib.authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return next(new AppError('Invalid 2FA token', 401));
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Two-factor authentication disabled'
    });
  } catch (error) {
    logger.error(`2FA disabling error: ${error.message}`);
    next(error);
  }
};

// Refresh access token using refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('No refresh token provided', 400));
    }

    // Verify the refresh token
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_SECRET
    );

    // Check token type
    if (decoded.type !== 'refresh') {
      return next(new AppError('Invalid token type', 401));
    }

    // Check if token is blacklisted
    const isBlacklisted = await promisify(redisClient.get).bind(redisClient)(
      `blacklist_${refreshToken}`
    );

    if (isBlacklisted) {
      return next(new AppError('Token has been revoked', 401));
    }

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Generate new tokens
    const newAccessToken = signToken(user._id, 'access');
    const newRefreshToken = signToken(user._id, 'refresh');

    // Blacklist the old refresh token
    await promisify(redisClient.set).bind(redisClient)(
      `blacklist_${refreshToken}`,
      'true',
      'EX',
      7 * 24 * 60 * 60 // 7 days
    );

    // Set cookie with new refresh token
    const cookieOptions = {
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRATION || 7 * 24 * 60 * 60 * 1000)
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'strict'
    };

    res.cookie('jwt', newRefreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    // For JWT errors, send clear error
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(error);
  }
};

// Logout and invalidate refresh token
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    // If refresh token exists, blacklist it
    if (refreshToken) {
      await promisify(redisClient.set).bind(redisClient)(
        `blacklist_${refreshToken}`,
        'true',
        'EX',
        7 * 24 * 60 * 60 // 7 days
      );
    }

    // Clear the refresh token cookie
    res.clearCookie('jwt');

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // 1) Get user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No user found with that email address', 404));
    }

    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send token to user's email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      // Send email logic here (would use nodemailer in a real implementation)
      logger.info(`Password reset token sent to: ${email}, URL: ${resetURL}`);

      res.status(200).json({
        status: 'success',
        message: 'Password reset token sent to email'
      });
    } catch (err) {
      // If sending email fails, clear reset token and expiry
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error(`Error sending password reset email: ${err.message}`);
      return next(
        new AppError('Error sending password reset email. Please try again later.', 500)
      );
    }
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    // 1) Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2) Find user by token and check if token is valid
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired token', 400));
    }

    // 3) Set new password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // 4) Update changedPasswordAt property (done by pre-save middleware)
    await user.save();

    // 5) Log in the user, send JWT
    createSendTokens(user, 200, req, res);
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};

// Update password (when user is logged in)
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError('Your current password is incorrect', 401));
    }

    // 3) Check if new password is different from current password
    if (await user.correctPassword(newPassword, user.password)) {
      return next(
        new AppError('New password must be different from current password', 400)
      );
    }

    // 4) Update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    // 5) Log user in, send new JWT
    createSendTokens(user, 200, req, res);
  } catch (error) {
    logger.error(`Update password error: ${error.message}`);
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    next(error);
  }
};
