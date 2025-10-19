/**
 * SprinkSync - Error Handler Middleware
 *
 * Global error handling middleware for Express.
 * Catches all errors and returns consistent JSON responses.
 */

const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');
const logger = require('../services/logger');

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error in ${req.method} ${req.path}`, err);

  // Determine status code
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode = err.code || ERROR_CODES.VALIDATION_ERROR;

  // Handle specific error types
  if (err.message.includes('not found')) {
    statusCode = HTTP_STATUS.NOT_FOUND;
  } else if (err.message.includes('already running') || err.message.includes('not running')) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
  } else if (err.message.includes('Maximum')) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
  } else if (err.message.includes('Invalid') || err.message.includes('must be')) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
  }

  // Return error response
  res.status(statusCode).json({
    error: err.message,
    code: errorCode,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
