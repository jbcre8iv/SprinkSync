/**
 * SprinkSync - Application Constants
 *
 * This file contains all application-wide constants including
 * GPIO pin mappings, safety limits, and configuration values.
 */

// GPIO Pin Mapping for 8 zones
// Maps zone ID to Raspberry Pi GPIO pin number
const GPIO_PINS = {
  1: 17,  // Zone 1 → GPIO 17 (Physical Pin 11)
  2: 27,  // Zone 2 → GPIO 27 (Physical Pin 13)
  3: 22,  // Zone 3 → GPIO 22 (Physical Pin 15)
  4: 23,  // Zone 4 → GPIO 23 (Physical Pin 16)
  5: 24,  // Zone 5 → GPIO 24 (Physical Pin 18)
  6: 25,  // Zone 6 → GPIO 25 (Physical Pin 22)
  7: 5,   // Zone 7 → GPIO 5  (Physical Pin 29)
  8: 6    // Zone 8 → GPIO 6  (Physical Pin 31)
};

// Safety Limits
const SAFETY = {
  MAX_RUNTIME_MINUTES: 60,      // Maximum runtime per zone activation
  MAX_CONCURRENT_ZONES: 2,      // Maximum zones that can run simultaneously
  MIN_DURATION_MINUTES: 1,      // Minimum zone duration
  GPIO_STABILIZATION_MS: 100    // Wait time after GPIO initialization
};

// Default Values
const DEFAULTS = {
  ZONE_DURATION: 15,            // Default zone run time in minutes
  ZONE_NAME_PREFIX: 'Zone',     // Default zone name prefix
  POLLING_INTERVAL_MS: 5000     // Frontend polling interval recommendation
};

// Relay Control
// Using active-LOW relay modules (common configuration)
const RELAY = {
  ON: 0,   // GPIO LOW = Relay ON = Valve OPEN
  OFF: 1   // GPIO HIGH = Relay OFF = Valve CLOSED
};

// Schedule Trigger Types
const TRIGGER_TYPES = {
  MANUAL: 'manual',
  SCHEDULED: 'scheduled'
};

// Days of Week (for schedules)
// JavaScript Date.getDay() format: 0 = Sunday, 6 = Saturday
const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Error Codes
const ERROR_CODES = {
  ZONE_NOT_FOUND: 'ZONE_NOT_FOUND',
  ZONE_ALREADY_RUNNING: 'ZONE_ALREADY_RUNNING',
  ZONE_NOT_RUNNING: 'ZONE_NOT_RUNNING',
  MAX_ZONES_RUNNING: 'MAX_ZONES_RUNNING',
  INVALID_DURATION: 'INVALID_DURATION',
  INVALID_ZONE_ID: 'INVALID_ZONE_ID',
  SCHEDULE_NOT_FOUND: 'SCHEDULE_NOT_FOUND',
  INVALID_TIME_FORMAT: 'INVALID_TIME_FORMAT',
  INVALID_DAYS: 'INVALID_DAYS',
  DATABASE_ERROR: 'DATABASE_ERROR',
  GPIO_ERROR: 'GPIO_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

module.exports = {
  GPIO_PINS,
  SAFETY,
  DEFAULTS,
  RELAY,
  TRIGGER_TYPES,
  DAYS_OF_WEEK,
  DAY_NAMES,
  HTTP_STATUS,
  ERROR_CODES
};
