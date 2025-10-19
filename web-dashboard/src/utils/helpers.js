/**
 * SprinkSync - Helper Utilities
 *
 * Frontend helper functions for formatting and display.
 */

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_ABBREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format duration in minutes to human-readable string
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0m';

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
 * Format days array to readable string
 */
export const formatDays = (days) => {
  if (!Array.isArray(days) || days.length === 0) {
    return 'No days';
  }

  // All 7 days
  if (days.length === 7) {
    return 'Every day';
  }

  // Weekdays (Mon-Fri)
  const weekdays = [1, 2, 3, 4, 5];
  if (days.length === 5 && weekdays.every(day => days.includes(day))) {
    return 'Weekdays';
  }

  // Weekends (Sat-Sun)
  if (days.length === 2 && days.includes(0) && days.includes(6)) {
    return 'Weekends';
  }

  // Individual days
  return days.map(day => DAY_ABBREV[day]).join(', ');
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never';

  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatTimestamp(timestamp);
};

/**
 * Format timestamp to readable date/time
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';

  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format time string (HH:MM) to 12-hour format
 */
export const formatTime12Hour = (time) => {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get zone status color class
 */
export const getZoneStatusColor = (isRunning) => {
  return isRunning ? 'text-success' : 'text-gray-400';
};

/**
 * Get zone status text
 */
export const getZoneStatusText = (zone) => {
  if (zone.is_running) {
    return `Running - ${zone.remaining_time} min left`;
  }
  return 'Idle';
};

/**
 * Calculate next run time from timestamp
 */
export const formatNextRun = (nextRunTimestamp) => {
  if (!nextRunTimestamp) return 'Not scheduled';

  const now = new Date();
  const nextRun = new Date(nextRunTimestamp);
  const diffMs = nextRun - now;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) return 'Overdue';
  if (diffHours < 1) return 'Soon';
  if (diffHours < 24) return `In ${diffHours}h`;
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;

  return formatTimestamp(nextRunTimestamp);
};

/**
 * Validate schedule time format
 */
export const validateTimeFormat = (time) => {
  const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(time);
};

export default {
  formatDuration,
  formatDays,
  formatRelativeTime,
  formatTimestamp,
  formatTime12Hour,
  getZoneStatusColor,
  getZoneStatusText,
  formatNextRun,
  validateTimeFormat,
  DAY_NAMES,
  DAY_ABBREV
};
