/**
 * SprinkSync - Schedules Controller
 *
 * Business logic for schedule management endpoints.
 */

const { getAll, getOne, runQuery } = require('../config/database');
const { addScheduleToCron, removeScheduleFromCron, updateScheduleInCron } = require('../services/scheduler');
const { validateZoneId, validateTimeFormat, validateDuration, validateDays, validateScheduleId, validateBoolean } = require('../utils/validation');
const { getNextScheduledRun } = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Get all schedules
 */
const getAllSchedules = async (req, res, next) => {
  try {
    let query = `
      SELECT s.*, z.name as zone_name
      FROM schedules s
      JOIN zones z ON s.zone_id = z.id
    `;
    const conditions = [];
    const values = [];

    // Filter by zone_id
    if (req.query.zone_id) {
      const validation = validateZoneId(req.query.zone_id);
      if (validation.valid) {
        conditions.push('s.zone_id = ?');
        values.push(validation.value);
      }
    }

    // Filter by enabled status
    if (req.query.enabled !== undefined) {
      const validation = validateBoolean(req.query.enabled);
      if (validation.valid) {
        conditions.push('s.enabled = ?');
        values.push(validation.value ? 1 : 0);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.zone_id, s.start_time';

    const schedules = await getAll(query, values);

    // Add next_run to each schedule
    const schedulesWithNextRun = schedules.map(schedule => {
      const days = JSON.parse(schedule.days);
      const nextRun = schedule.enabled ? getNextScheduledRun(schedule.start_time, days) : null;

      return {
        ...schedule,
        days: days, // Convert from JSON string to array
        next_run: nextRun ? nextRun.toISOString() : null
      };
    });

    res.json(schedulesWithNextRun);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single schedule by ID
 */
const getScheduleById = async (req, res, next) => {
  try {
    const validation = validateScheduleId(req.params.id);
    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error });
    }

    const schedule = await getOne(
      `SELECT s.*, z.name as zone_name
       FROM schedules s
       JOIN zones z ON s.zone_id = z.id
       WHERE s.id = ?`,
      [validation.value]
    );

    if (!schedule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule not found' });
    }

    // Parse days and calculate next run
    const days = JSON.parse(schedule.days);
    const nextRun = schedule.enabled ? getNextScheduledRun(schedule.start_time, days) : null;

    res.json({
      ...schedule,
      days: days,
      next_run: nextRun ? nextRun.toISOString() : null
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Create new schedule
 */
const createSchedule = async (req, res, next) => {
  try {
    const { zone_id, start_time, duration, days, enabled } = req.body;

    // Validate zone_id
    const zoneValidation = validateZoneId(zone_id);
    if (!zoneValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: zoneValidation.error });
    }

    // Check zone exists
    const zone = await getOne('SELECT * FROM zones WHERE id = ?', [zoneValidation.value]);
    if (!zone) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Zone not found' });
    }

    // Validate start_time
    const timeValidation = validateTimeFormat(start_time);
    if (!timeValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: timeValidation.error });
    }

    // Validate duration
    const durationValidation = validateDuration(duration);
    if (!durationValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: durationValidation.error });
    }

    // Validate days
    const daysValidation = validateDays(days);
    if (!daysValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: daysValidation.error });
    }

    // Validate enabled (default true)
    const enabledValue = enabled !== undefined ? (enabled ? 1 : 0) : 1;

    // Insert schedule
    const result = await runQuery(
      `INSERT INTO schedules (zone_id, start_time, duration, days, enabled)
       VALUES (?, ?, ?, ?, ?)`,
      [zoneValidation.value, timeValidation.value, durationValidation.value, JSON.stringify(daysValidation.value), enabledValue]
    );

    // Get created schedule
    const newSchedule = await getOne(
      `SELECT s.*, z.name as zone_name
       FROM schedules s
       JOIN zones z ON s.zone_id = z.id
       WHERE s.id = ?`,
      [result.lastID]
    );

    // Add to cron if enabled
    if (enabledValue) {
      addScheduleToCron({
        ...newSchedule,
        days: JSON.parse(newSchedule.days)
      });
    }

    // Calculate next run
    const nextRun = enabledValue ? getNextScheduledRun(newSchedule.start_time, daysValidation.value) : null;

    res.status(HTTP_STATUS.CREATED).json({
      ...newSchedule,
      days: daysValidation.value,
      next_run: nextRun ? nextRun.toISOString() : null
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update schedule
 */
const updateSchedule = async (req, res, next) => {
  try {
    const scheduleIdValidation = validateScheduleId(req.params.id);
    if (!scheduleIdValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: scheduleIdValidation.error });
    }

    const scheduleId = scheduleIdValidation.value;

    // Check schedule exists
    const schedule = await getOne('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
    if (!schedule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule not found' });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (req.body.start_time !== undefined) {
      const validation = validateTimeFormat(req.body.start_time);
      if (!validation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error });
      }
      updates.push('start_time = ?');
      values.push(validation.value);
    }

    if (req.body.duration !== undefined) {
      const validation = validateDuration(req.body.duration);
      if (!validation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error });
      }
      updates.push('duration = ?');
      values.push(validation.value);
    }

    if (req.body.days !== undefined) {
      const validation = validateDays(req.body.days);
      if (!validation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error });
      }
      updates.push('days = ?');
      values.push(JSON.stringify(validation.value));
    }

    if (req.body.enabled !== undefined) {
      const validation = validateBoolean(req.body.enabled);
      if (!validation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error });
      }
      updates.push('enabled = ?');
      values.push(validation.value ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'No valid fields to update' });
    }

    // Add updated_at
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    // Add schedule ID for WHERE clause
    values.push(scheduleId);

    // Execute update
    await runQuery(
      `UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Update cron
    await updateScheduleInCron(scheduleId);

    // Get updated schedule
    const updatedSchedule = await getOne(
      `SELECT s.*, z.name as zone_name
       FROM schedules s
       JOIN zones z ON s.zone_id = z.id
       WHERE s.id = ?`,
      [scheduleId]
    );

    const days = JSON.parse(updatedSchedule.days);
    const nextRun = updatedSchedule.enabled ? getNextScheduledRun(updatedSchedule.start_time, days) : null;

    res.json({
      ...updatedSchedule,
      days: days,
      next_run: nextRun ? nextRun.toISOString() : null
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete schedule
 */
const deleteSchedule = async (req, res, next) => {
  try {
    const validation = validateScheduleId(req.params.id);
    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error });
    }

    const scheduleId = validation.value;

    // Check schedule exists
    const schedule = await getOne('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
    if (!schedule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule not found' });
    }

    // Remove from cron
    removeScheduleFromCron(scheduleId);

    // Delete from database
    await runQuery('DELETE FROM schedules WHERE id = ?', [scheduleId]);

    res.json({
      message: 'Schedule deleted',
      id: scheduleId
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Toggle schedule enabled/disabled
 */
const toggleSchedule = async (req, res, next) => {
  try {
    const validation = validateScheduleId(req.params.id);
    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error });
    }

    const scheduleId = validation.value;

    // Get current schedule
    const schedule = await getOne('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
    if (!schedule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule not found' });
    }

    // Toggle enabled
    const newEnabled = schedule.enabled ? 0 : 1;

    await runQuery(
      'UPDATE schedules SET enabled = ?, updated_at = ? WHERE id = ?',
      [newEnabled, new Date().toISOString(), scheduleId]
    );

    // Update cron
    await updateScheduleInCron(scheduleId);

    res.json({
      id: scheduleId,
      enabled: Boolean(newEnabled),
      message: newEnabled ? 'Schedule enabled' : 'Schedule disabled'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule
};
