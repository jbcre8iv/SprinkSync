/**
 * SprinkSync - Logging Service
 *
 * Centralized logging using Winston.
 * Logs to both console and files with different levels.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || 'info';

// Create Winston logger
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    // Write all logs to app.log
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Write GPIO activity to gpio.log
    new winston.transports.File({
      filename: path.join(logsDir, 'gpio.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

/**
 * Log info message
 * @param {string} message - Log message
 */
const info = (message) => {
  logger.info(message);
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Error} error - Error object (optional)
 */
const error = (message, err = null) => {
  if (err) {
    logger.error(`${message}: ${err.message}`, { stack: err.stack });
  } else {
    logger.error(message);
  }
};

/**
 * Log warning message
 * @param {string} message - Warning message
 */
const warn = (message) => {
  logger.warn(message);
};

/**
 * Log debug message
 * @param {string} message - Debug message
 */
const debug = (message) => {
  logger.debug(message);
};

/**
 * Log GPIO activity
 * @param {string} message - GPIO activity message
 */
const gpio = (message) => {
  logger.info(`[GPIO] ${message}`);
};

/**
 * Log API request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {number} status - Response status code
 */
const apiRequest = (method, path, status) => {
  logger.info(`[API] ${method} ${path} → ${status}`);
};

/**
 * Log schedule execution
 * @param {number} scheduleId - Schedule ID
 * @param {number} zoneId - Zone ID
 * @param {string} zoneName - Zone name
 */
const scheduleExecution = (scheduleId, zoneId, zoneName) => {
  logger.info(`[SCHEDULER] Executing schedule ${scheduleId} for Zone ${zoneId} (${zoneName})`);
};

module.exports = {
  info,
  error,
  warn,
  debug,
  gpio,
  apiRequest,
  scheduleExecution,
  logger // Export raw logger if needed
};
