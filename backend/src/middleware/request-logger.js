/**
 * SprinkSync - Request Logger Middleware
 *
 * Logs all HTTP requests to the API.
 */

const logger = require('../services/logger');

/**
 * Request logger middleware
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
const requestLogger = (req, res, next) => {
  // Store start time
  const startTime = Date.now();

  // Listen for response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.apiRequest(req.method, req.path, res.statusCode);
    logger.debug(`${req.method} ${req.path} completed in ${duration}ms`);
  });

  next();
};

module.exports = requestLogger;
