const AppError = require('../utils/appError');
const logger = require('../config/logger');

/**
 * Handle Mongoose validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose cast errors
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again!', 401);

/**
 * Handle JWT expiration errors
 */
const handleJWTExpiredError = () => 
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Send error response in development environment
 */
const sendErrorDev = (err, req, res) => {
  logger.error('ERROR 💥', { 
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode 
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    data: err.data
  });
};

/**
 * Send error response in production environment
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      status: err.status,
      message: err.message
    };

    // Include any additional data if present
    if (err.data && Object.keys(err.data).length > 0) {
      response.data = err.data;
    }

    return res.status(err.statusCode).json(response);
  }
  
  // Programming or other unknown error: don't leak error details
  // 1) Log error
  logger.error('ERROR 💥', { 
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500
  });
  
  // 2) Send generic message
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

/**
 * Global error handling middleware
 */
exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    error.data = err.data;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
