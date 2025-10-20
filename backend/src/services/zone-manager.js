/**
 * SprinkSync - Zone Manager Service
 *
 * Manages zone state, enforces safety rules, and coordinates
 * between GPIO hardware and database.
 *
 * This is the core service that tracks which zones are running,
 * manages auto-stop timeouts, and ensures safety limits are respected.
 */

const { startZone, stopZone } = require('../hardware/gpio');
const { runQuery, getOne } = require('../config/database');
const { SAFETY, TRIGGER_TYPES } = require('../config/constants');
const { getCurrentTimestamp, calculateMinutesBetween } = require('../utils/helpers');
const logger = require('./logger');

// In-memory state for running zones
// Format: { zoneId: { startTime, duration, timeout, historyId, trigger, scheduleId } }
const runningZones = new Map();

// In-memory state for queued zones (part of a running group)
// Format: { zoneId: { groupId, groupName, position, totalInGroup, scheduledStartMs } }
const queuedZones = new Map();

/**
 * Check if zone is currently running
 * @param {number} zoneId - Zone ID
 * @returns {boolean} - True if zone is running
 */
const isZoneRunning = (zoneId) => {
  return runningZones.has(zoneId);
};

/**
 * Get number of currently running zones
 * @returns {number} - Count of running zones
 */
const getRunningZoneCount = () => {
  return runningZones.size;
};

/**
 * Get running zones data
 * @returns {Array} - Array of running zone objects
 */
const getRunningZones = () => {
  const zones = [];

  for (const [zoneId, data] of runningZones.entries()) {
    const elapsed = calculateMinutesBetween(data.startTime, getCurrentTimestamp());
    const remaining = Math.max(0, data.duration - elapsed);

    zones.push({
      zone_id: parseInt(zoneId),
      start_time: data.startTime,
      duration: data.duration,
      elapsed_minutes: elapsed,
      remaining_minutes: remaining,
      trigger: data.trigger
    });
  }

  return zones;
};

/**
 * Get zone state (running/stopped with details)
 * @param {number} zoneId - Zone ID
 * @returns {object} - Zone state object
 */
const getZoneState = (zoneId) => {
  if (!runningZones.has(zoneId)) {
    return {
      is_running: false,
      remaining_time: 0
    };
  }

  const data = runningZones.get(zoneId);
  const elapsed = calculateMinutesBetween(data.startTime, getCurrentTimestamp());
  const remaining = Math.max(0, data.duration - elapsed);

  return {
    is_running: true,
    remaining_time: remaining,
    start_time: data.startTime,
    duration: data.duration
  };
};

/**
 * Queue a zone as part of a group
 * @param {number} zoneId - Zone ID
 * @param {object} queueData - Queue data
 */
const queueZone = (zoneId, queueData) => {
  queuedZones.set(zoneId, queueData);
};

/**
 * Dequeue a zone
 * @param {number} zoneId - Zone ID
 */
const dequeueZone = (zoneId) => {
  queuedZones.delete(zoneId);
};

/**
 * Check if zone is queued
 * @param {number} zoneId - Zone ID
 * @returns {boolean} - True if zone is queued
 */
const isZoneQueued = (zoneId) => {
  return queuedZones.has(zoneId);
};

/**
 * Get queued zone data
 * @param {number} zoneId - Zone ID
 * @returns {object|null} - Queue data or null
 */
const getQueuedZone = (zoneId) => {
  return queuedZones.get(zoneId) || null;
};

/**
 * Get all queued zones
 * @returns {Array} - Array of queued zones
 */
const getAllQueuedZones = () => {
  const zones = [];
  for (const [zoneId, data] of queuedZones.entries()) {
    zones.push({
      zone_id: parseInt(zoneId),
      ...data
    });
  }
  return zones;
};

/**
 * Start a zone
 * @param {number} zoneId - Zone ID
 * @param {number} duration - Run duration in minutes
 * @param {string} trigger - 'manual' or 'scheduled'
 * @param {number} scheduleId - Schedule ID (null for manual)
 * @returns {Promise<object>} - Result object
 */
const startZoneManaged = async (zoneId, duration, trigger = TRIGGER_TYPES.MANUAL, scheduleId = null) => {
  try {
    // Validation checks
    if (isZoneRunning(zoneId)) {
      throw new Error('Zone is already running');
    }

    // Get max concurrent zones from settings (fallback to constant)
    const settings = await getOne('SELECT max_concurrent_zones FROM system_settings WHERE id = 1');
    const maxConcurrentZones = settings ? settings.max_concurrent_zones : SAFETY.MAX_CONCURRENT_ZONES;

    if (getRunningZoneCount() >= maxConcurrentZones) {
      throw new Error(`Maximum ${maxConcurrentZones} zones can run concurrently`);
    }

    if (duration < SAFETY.MIN_DURATION_MINUTES || duration > SAFETY.MAX_RUNTIME_MINUTES) {
      throw new Error(`Duration must be between ${SAFETY.MIN_DURATION_MINUTES} and ${SAFETY.MAX_RUNTIME_MINUTES} minutes`);
    }

    // Get zone info
    const zone = await getOne('SELECT * FROM zones WHERE id = ?', [zoneId]);
    if (!zone) {
      throw new Error('Zone not found');
    }

    const startTime = getCurrentTimestamp();

    // Create history record
    const historyResult = await runQuery(
      `INSERT INTO history (zone_id, start_time, trigger, schedule_id)
       VALUES (?, ?, ?, ?)`,
      [zoneId, startTime, trigger, scheduleId]
    );

    const historyId = historyResult.lastID;

    // Start GPIO
    await startZone(zoneId);

    // Set auto-stop timeout
    const timeout = setTimeout(async () => {
      logger.warn(`Zone ${zoneId} auto-stop triggered (max runtime reached)`);
      await stopZoneManaged(zoneId);
    }, duration * 60 * 1000); // Convert minutes to milliseconds

    // Store in running zones map
    runningZones.set(zoneId, {
      startTime,
      duration,
      timeout,
      historyId,
      trigger,
      scheduleId
    });

    logger.info(`Zone ${zoneId} (${zone.name}) started - Duration: ${duration}min, Trigger: ${trigger}`);

    return {
      success: true,
      zone_id: zoneId,
      zone_name: zone.name,
      duration,
      start_time: startTime,
      will_stop_at: new Date(Date.now() + duration * 60 * 1000).toISOString()
    };

  } catch (error) {
    logger.error(`Failed to start zone ${zoneId}`, error);
    throw error;
  }
};

/**
 * Stop a zone
 * @param {number} zoneId - Zone ID
 * @returns {Promise<object>} - Result object
 */
const stopZoneManaged = async (zoneId) => {
  try {
    if (!isZoneRunning(zoneId)) {
      throw new Error('Zone is not running');
    }

    const data = runningZones.get(zoneId);
    const endTime = getCurrentTimestamp();
    const actualDuration = calculateMinutesBetween(data.startTime, endTime);

    // Stop GPIO
    await stopZone(zoneId);

    // Clear timeout
    if (data.timeout) {
      clearTimeout(data.timeout);
    }

    // Update history record
    await runQuery(
      `UPDATE history
       SET end_time = ?, duration = ?
       WHERE id = ?`,
      [endTime, actualDuration, data.historyId]
    );

    // Update zone total runtime and last_run
    await runQuery(
      `UPDATE zones
       SET total_runtime = total_runtime + ?,
           last_run = ?,
           updated_at = ?
       WHERE id = ?`,
      [actualDuration, endTime, endTime, zoneId]
    );

    // Remove from running zones map
    runningZones.delete(zoneId);

    // Remove from queued zones map (if it was queued)
    queuedZones.delete(zoneId);

    // Get zone name for logging
    const zone = await getOne('SELECT name FROM zones WHERE id = ?', [zoneId]);

    logger.info(`Zone ${zoneId} (${zone.name}) stopped - Runtime: ${actualDuration}min`);

    return {
      success: true,
      zone_id: zoneId,
      zone_name: zone.name,
      runtime: actualDuration
    };

  } catch (error) {
    logger.error(`Failed to stop zone ${zoneId}`, error);
    throw error;
  }
};

/**
 * Stop all running zones (emergency stop)
 * @returns {Promise<object>} - Result object
 */
const stopAllZonesManaged = async () => {
  try {
    const stoppedZones = [];

    // Get list of running zones before stopping
    const zonesSnapshot = Array.from(runningZones.keys());

    // Stop each zone
    for (const zoneId of zonesSnapshot) {
      try {
        await stopZoneManaged(parseInt(zoneId));
        stoppedZones.push(parseInt(zoneId));
      } catch (error) {
        logger.error(`Error stopping zone ${zoneId} during stopAll`, error);
      }
    }

    logger.warn(`Emergency stop: All zones stopped (${stoppedZones.length} zones)`);

    return {
      success: true,
      stopped_zones: stoppedZones,
      count: stoppedZones.length
    };

  } catch (error) {
    logger.error('Failed to stop all zones', error);
    throw error;
  }
};

/**
 * Initialize zone manager
 * Ensures all zones are stopped on startup
 */
const initializeZoneManager = () => {
  runningZones.clear();
  logger.info('Zone manager initialized (all zones cleared)');
};

module.exports = {
  isZoneRunning,
  getRunningZoneCount,
  getRunningZones,
  getZoneState,
  queueZone,
  dequeueZone,
  isZoneQueued,
  getQueuedZone,
  getAllQueuedZones,
  startZoneManaged,
  stopZoneManaged,
  stopAllZonesManaged,
  initializeZoneManager
};
