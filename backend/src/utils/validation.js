/**
 * SprinkSync - Validation Utilities
 *
 * Input validation helpers for API endpoints.
 * Ensures data integrity and provides clear error messages.
 */

const { SAFETY, DAYS_OF_WEEK } = require('../config/constants');

/**
 * Validate zone ID
 * @param {number} zoneId - Zone ID to validate
 * @returns {object} - { valid: boolean, error: string }
 */
const validateZoneId = (zoneId) => {
  const id = parseInt(zoneId);

  if (isNaN(id)) {
    return { valid: false, error: 'Zone ID must be a number' };
  }

  if (id < 1) {
    return { valid: false, error: 'Zone ID must be a positive integer' };
  }

  return { valid: true, value: id };
};

/**
 * Validate duration in minutes
 * @param {number} duration - Duration to validate
 * @returns {object} - { valid: boolean, error: string, value: number }
 */
const validateDuration = (duration) => {
  const dur = parseInt(duration);

  if (isNaN(dur)) {
    return { valid: false, error: 'Duration must be a number' };
  }

  if (dur < SAFETY.MIN_DURATION_MINUTES) {
    return { valid: false, error: `Duration must be at least ${SAFETY.MIN_DURATION_MINUTES} minute` };
  }

  if (dur > SAFETY.MAX_RUNTIME_MINUTES) {
    return { valid: false, error: `Duration cannot exceed ${SAFETY.MAX_RUNTIME_MINUTES} minutes` };
  }

  return { valid: true, value: dur };
};

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {object} - { valid: boolean, error: string, value: string }
 */
const validateTimeFormat = (time) => {
  if (!time || typeof time !== 'string') {
    return { valid: false, error: 'Time is required and must be a string' };
  }

  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

  if (!timeRegex.test(time)) {
    return { valid: false, error: 'Invalid time format. Use HH:MM (24-hour format)' };
  }

  return { valid: true, value: time };
};

/**
 * Validate days array for schedule
 * @param {Array|string} days - Days array or JSON string
 * @returns {object} - { valid: boolean, error: string, value: Array }
 */
const validateDays = (days) => {
  let daysArray;

  // Parse if string
  if (typeof days === 'string') {
    try {
      daysArray = JSON.parse(days);
    } catch (error) {
      return { valid: false, error: 'Days must be a valid JSON array' };
    }
  } else if (Array.isArray(days)) {
    daysArray = days;
  } else {
    return { valid: false, error: 'Days must be an array' };
  }

  // Check if array is not empty
  if (daysArray.length === 0) {
    return { valid: false, error: 'At least one day must be selected' };
  }

  // Validate each day value
  for (const day of daysArray) {
    const dayNum = parseInt(day);

    if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
      return { valid: false, error: 'Days must be numbers between 0 (Sunday) and 6 (Saturday)' };
    }
  }

  // Remove duplicates and sort
  const uniqueDays = [...new Set(daysArray)].sort((a, b) => a - b);

  return { valid: true, value: uniqueDays };
};

/**
 * Validate zone name
 * @param {string} name - Zone name to validate
 * @returns {object} - { valid: boolean, error: string, value: string }
 */
const validateZoneName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Zone name is required and must be a string' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: 'Zone name cannot be empty' };
  }

  if (trimmedName.length > 50) {
    return { valid: false, error: 'Zone name cannot exceed 50 characters' };
  }

  return { valid: true, value: trimmedName };
};

/**
 * Validate schedule ID
 * @param {number} scheduleId - Schedule ID to validate
 * @returns {object} - { valid: boolean, error: string, value: number }
 */
const validateScheduleId = (scheduleId) => {
  const id = parseInt(scheduleId);

  if (isNaN(id) || id < 1) {
    return { valid: false, error: 'Invalid schedule ID' };
  }

  return { valid: true, value: id };
};

/**
 * Validate boolean value
 * @param {any} value - Value to validate as boolean
 * @returns {object} - { valid: boolean, error: string, value: boolean }
 */
const validateBoolean = (value) => {
  if (typeof value === 'boolean') {
    return { valid: true, value };
  }

  if (value === 'true' || value === '1' || value === 1) {
    return { valid: true, value: true };
  }

  if (value === 'false' || value === '0' || value === 0) {
    return { valid: true, value: false };
  }

  return { valid: false, error: 'Value must be a boolean (true/false)' };
};

/**
 * Validate date string (ISO format)
 * @param {string} dateStr - Date string to validate
 * @returns {object} - { valid: boolean, error: string, value: Date }
 */
const validateDate = (dateStr) => {
  if (!dateStr) {
    return { valid: false, error: 'Date is required' };
  }

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format. Use ISO 8601 format' };
  }

  return { valid: true, value: date };
};

/**
 * Validate positive integer
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} - { valid: boolean, error: string, value: number }
 */
const validatePositiveInt = (value, fieldName = 'Value') => {
  const num = parseInt(value);

  if (isNaN(num) || num < 1) {
    return { valid: false, error: `${fieldName} must be a positive integer` };
  }

  return { valid: true, value: num };
};

module.exports = {
  validateZoneId,
  validateDuration,
  validateTimeFormat,
  validateDays,
  validateZoneName,
  validateScheduleId,
  validateBoolean,
  validateDate,
  validatePositiveInt
};
