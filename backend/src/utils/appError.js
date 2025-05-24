/**
 * Custom Application Error Class
 * Extends Error to include statusCode, status, isOperational and additional data
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {object} data - Additional error data (optional)
   */
  constructor(message, statusCode, data = {}) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marks error as operational vs programming error
    this.data = data; // Additional error data

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
