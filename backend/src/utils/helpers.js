/**
 * SprinkSync - Helper Utilities
 *
 * General utility functions used throughout the application.
 */

const { DAY_NAMES } = require('../config/constants');

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted string (e.g., "1h 30m" or "45m")
 */
const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

/**
 * Convert days array to readable string
 * @param {Array<number>} days - Array of day numbers (0-6)
 * @returns {string} - Formatted string (e.g., "Mon, Wed, Fri")
 */
const formatDays = (days) => {
  if (!Array.isArray(days) || days.length === 0) {
    return 'No days selected';
  }

  // If all 7 days, return "Every day"
  if (days.length === 7) {
    return 'Every day';
  }

  // If weekdays only (Mon-Fri)
  const weekdays = [1, 2, 3, 4, 5];
  if (days.length === 5 && weekdays.every(day => days.includes(day))) {
    return 'Weekdays';
  }

  // If weekend only (Sat-Sun)
  const weekend = [0, 6];
  if (days.length === 2 && weekend.every(day => days.includes(day))) {
    return 'Weekends';
  }

  // Otherwise, list individual days with abbreviated names
  return days
    .map(day => DAY_NAMES[day].substring(0, 3))
    .join(', ');
};

/**
 * Parse days from JSON string or array
 * @param {string|Array} days - Days as JSON string or array
 * @returns {Array<number>} - Parsed array of day numbers
 */
const parseDays = (days) => {
  if (typeof days === 'string') {
    try {
      return JSON.parse(days);
    } catch (error) {
      return [];
    }
  }

  if (Array.isArray(days)) {
    return days;
  }

  return [];
};

/**
 * Get current timestamp in ISO format
 * @returns {string} - ISO timestamp
 */
const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Calculate minutes between two dates
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {number} - Minutes elapsed
 */
const calculateMinutesBetween = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  return Math.round(diffMs / 60000); // Convert ms to minutes
};

/**
 * Get next occurrence of a scheduled time
 * @param {string} startTime - Time in HH:MM format
 * @param {Array<number>} days - Days of week (0-6)
 * @returns {Date|null} - Next occurrence or null if no days selected
 */
const getNextScheduledRun = (startTime, days) => {
  if (!Array.isArray(days) || days.length === 0) {
    return null;
  }

  const [hours, minutes] = startTime.split(':').map(Number);
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const scheduleTime = hours * 60 + minutes;

  // Find the next day in the schedule
  let daysUntilNext = null;

  // Check if schedule runs today and hasn't passed yet
  if (days.includes(currentDay) && scheduleTime > currentTime) {
    daysUntilNext = 0;
  } else {
    // Find next scheduled day
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (days.includes(checkDay)) {
        daysUntilNext = i;
        break;
      }
    }
  }

  if (daysUntilNext === null) {
    return null;
  }

  // Calculate next run date
  const nextRun = new Date(now);
  nextRun.setDate(now.getDate() + daysUntilNext);
  nextRun.setHours(hours, minutes, 0, 0);

  return nextRun;
};

/**
 * Sleep/delay for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Format timestamp to readable date/time string
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} - Formatted string
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return 'Never';
  }

  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Check if a schedule should run today
 * @param {Array<number>} days - Days of week (0-6)
 * @returns {boolean} - True if schedule runs today
 */
const shouldRunToday = (days) => {
  const today = new Date().getDay();
  return Array.isArray(days) && days.includes(today);
};

/**
 * Generate cron expression from time and days
 * @param {string} startTime - Time in HH:MM format
 * @param {Array<number>} days - Days of week (0-6)
 * @returns {string} - Cron expression
 */
const generateCronExpression = (startTime, days) => {
  const [hours, minutes] = startTime.split(':');
  const daysList = days.join(',');
  return `${minutes} ${hours} * * ${daysList}`;
};

module.exports = {
  formatDuration,
  formatDays,
  parseDays,
  getCurrentTimestamp,
  calculateMinutesBetween,
  getNextScheduledRun,
  sleep,
  formatTimestamp,
  shouldRunToday,
  generateCronExpression
};
