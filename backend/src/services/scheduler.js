/**
 * SprinkSync - Scheduler Service
 *
 * Manages automated schedule execution using node-cron.
 * Loads schedules from database and creates cron jobs to execute them.
 */

const cron = require('node-cron');
const { getAll, getOne } = require('../config/database');
const { startZoneManaged, isZoneRunning } = require('./zone-manager');
const { TRIGGER_TYPES } = require('../config/constants');
const { generateCronExpression, parseDays } = require('../utils/helpers');
const logger = require('./logger');

// Store active cron jobs
// Format: { scheduleId: cronJob }
const activeCronJobs = new Map();

/**
 * Execute a schedule (start the associated zone or group)
 * @param {object} schedule - Schedule object from database
 */
const executeSchedule = async (schedule) => {
  try {
    // Handle zone schedule
    if (schedule.zone_id) {
      logger.scheduleExecution(schedule.id, schedule.zone_id, schedule.zone_name);

      // Check if zone is already running
      if (isZoneRunning(schedule.zone_id)) {
        logger.warn(`Schedule ${schedule.id}: Zone ${schedule.zone_id} already running, skipping`);
        return;
      }

      // Start the zone
      await startZoneManaged(
        schedule.zone_id,
        schedule.duration,
        TRIGGER_TYPES.SCHEDULED,
        schedule.id
      );

      logger.info(`Schedule ${schedule.id} executed successfully`);
    }
    // Handle group schedule
    else if (schedule.group_id) {
      logger.info(`Schedule ${schedule.id}: Starting group ${schedule.group_name}`);

      // Get zones in the group
      const members = await getAll(
        `SELECT z.id, z.name
         FROM zone_group_members zgm
         JOIN zones z ON zgm.zone_id = z.id
         WHERE zgm.group_id = ?
         ORDER BY zgm.sequence_order`,
        [schedule.group_id]
      );

      if (members.length === 0) {
        logger.warn(`Schedule ${schedule.id}: Group ${schedule.group_id} has no zones, skipping`);
        return;
      }

      // Check if any zones in the group are already running
      const runningZones = members.filter(z => isZoneRunning(z.id));
      if (runningZones.length > 0) {
        logger.warn(`Schedule ${schedule.id}: Zone ${runningZones[0].name} in group is already running, skipping`);
        return;
      }

      logger.info(`Schedule ${schedule.id}: Starting ${members.length} zones from group ${schedule.group_name}`);

      // Start first zone immediately
      await startZoneManaged(
        members[0].id,
        schedule.duration,
        TRIGGER_TYPES.SCHEDULED,
        schedule.id
      );
      logger.info(`Schedule ${schedule.id}: Started zone ${members[0].name} (1/${members.length})`);

      // Queue remaining zones with delays
      for (let i = 1; i < members.length; i++) {
        const zone = members[i];
        const delayMs = (schedule.duration * 60 * 1000) * i + (5000 * i); // duration + 5sec buffer per zone

        setTimeout(async () => {
          try {
            await startZoneManaged(zone.id, schedule.duration, TRIGGER_TYPES.SCHEDULED, schedule.id);
            logger.info(`Schedule ${schedule.id}: Started zone ${zone.name} (${i + 1}/${members.length})`);
          } catch (error) {
            logger.error(`Schedule ${schedule.id}: Failed to start zone ${zone.name}`, error);
          }
        }, delayMs);
      }

      logger.info(`Schedule ${schedule.id} executed successfully - ${members.length} zones queued`);
    }

  } catch (error) {
    logger.error(`Failed to execute schedule ${schedule.id}`, error);
  }
};

/**
 * Add a schedule to the cron system
 * @param {object} schedule - Schedule object
 */
const addScheduleToCron = (schedule) => {
  try {
    // Parse days from JSON string
    const days = parseDays(schedule.days);

    if (days.length === 0) {
      logger.warn(`Schedule ${schedule.id} has no days selected, skipping`);
      return;
    }

    // Generate cron expression
    const cronExpression = generateCronExpression(schedule.start_time, days);

    // Create cron job
    const job = cron.schedule(cronExpression, () => {
      executeSchedule(schedule);
    }, {
      scheduled: true,
      timezone: 'America/New_York' // Adjust to your timezone
    });

    // Store job reference
    activeCronJobs.set(schedule.id, job);

    const target = schedule.zone_id
      ? `Zone ${schedule.zone_id} (${schedule.zone_name})`
      : `Group ${schedule.group_id} (${schedule.group_name})`;
    logger.info(`Schedule ${schedule.id} added: ${target} at ${schedule.start_time} on ${days.join(',')}`);

  } catch (error) {
    logger.error(`Failed to add schedule ${schedule.id} to cron`, error);
  }
};

/**
 * Remove a schedule from the cron system
 * @param {number} scheduleId - Schedule ID
 */
const removeScheduleFromCron = (scheduleId) => {
  if (activeCronJobs.has(scheduleId)) {
    const job = activeCronJobs.get(scheduleId);
    job.stop();
    activeCronJobs.delete(scheduleId);
    logger.info(`Schedule ${scheduleId} removed from cron`);
  }
};

/**
 * Update a schedule in the cron system
 * @param {number} scheduleId - Schedule ID
 */
const updateScheduleInCron = async (scheduleId) => {
  try {
    // Remove existing job
    removeScheduleFromCron(scheduleId);

    // Get updated schedule
    const schedule = await getOne(
      `SELECT s.*,
        z.name as zone_name,
        g.name as group_name
       FROM schedules s
       LEFT JOIN zones z ON s.zone_id = z.id
       LEFT JOIN zone_groups g ON s.group_id = g.id
       WHERE s.id = ? AND s.enabled = 1`,
      [scheduleId]
    );

    // If schedule exists and is enabled, add it back
    if (schedule) {
      addScheduleToCron(schedule);
    }

  } catch (error) {
    logger.error(`Failed to update schedule ${scheduleId} in cron`, error);
  }
};

/**
 * Load all enabled schedules from database and create cron jobs
 */
const loadSchedules = async () => {
  try {
    logger.info('Loading schedules from database...');

    // Get all enabled schedules
    const schedules = await getAll(
      `SELECT s.*,
        z.name as zone_name,
        g.name as group_name
       FROM schedules s
       LEFT JOIN zones z ON s.zone_id = z.id
       LEFT JOIN zone_groups g ON s.group_id = g.id
       WHERE s.enabled = 1`
    );

    // Clear existing jobs
    activeCronJobs.forEach(job => job.stop());
    activeCronJobs.clear();

    // Add each schedule to cron
    for (const schedule of schedules) {
      addScheduleToCron(schedule);
    }

    logger.info(`✅ Loaded ${schedules.length} enabled schedule(s)`);

  } catch (error) {
    logger.error('Failed to load schedules', error);
  }
};

/**
 * Initialize scheduler
 * Loads all schedules and starts cron system
 */
const initializeScheduler = async () => {
  logger.info('Initializing scheduler...');
  await loadSchedules();
  logger.info('✅ Scheduler initialized');
};

/**
 * Stop all cron jobs
 */
const stopScheduler = () => {
  logger.info('Stopping scheduler...');

  activeCronJobs.forEach(job => job.stop());
  activeCronJobs.clear();

  logger.info('✅ Scheduler stopped');
};

/**
 * Get count of active schedules
 * @returns {number} - Number of active schedules
 */
const getActiveScheduleCount = () => {
  return activeCronJobs.size;
};

/**
 * Check if a schedule is active
 * @param {number} scheduleId - Schedule ID
 * @returns {boolean} - True if schedule is active
 */
const isScheduleActive = (scheduleId) => {
  return activeCronJobs.has(scheduleId);
};

module.exports = {
  initializeScheduler,
  stopScheduler,
  loadSchedules,
  addScheduleToCron,
  removeScheduleFromCron,
  updateScheduleInCron,
  getActiveScheduleCount,
  isScheduleActive
};
