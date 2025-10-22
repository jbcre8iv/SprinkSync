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
      SELECT s.*,
        z.name as zone_name,
        g.name as group_name,
        CASE
          WHEN s.zone_id IS NOT NULL THEN 'zone'
          WHEN s.group_id IS NOT NULL THEN 'group'
        END as schedule_type
      FROM schedules s
      LEFT JOIN zones z ON s.zone_id = z.id
      LEFT JOIN zone_groups g ON s.group_id = g.id
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

    // Filter by group_id
    if (req.query.group_id) {
      const validation = validateZoneId(req.query.group_id); // Reuse validation
      if (validation.valid) {
        conditions.push('s.group_id = ?');
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

    query += ' ORDER BY s.start_time';

    const schedules = await getAll(query, values);

    // Add next_run and target_name to each schedule
    const schedulesWithNextRun = schedules.map(schedule => {
      let days;
      try {
        days = JSON.parse(schedule.days);
      } catch (error) {
        console.error(`Invalid JSON in schedule ${schedule.id} days field: ${schedule.days}`);
        days = []; // Default to empty array if JSON is corrupt
      }
      const nextRun = schedule.enabled ? getNextScheduledRun(schedule.start_time, days) : null;

      return {
        ...schedule,
        days: days, // Convert from JSON string to array
        next_run: nextRun ? nextRun.toISOString() : null,
        target_name: schedule.zone_name || schedule.group_name
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
      `SELECT s.*,
        z.name as zone_name,
        g.name as group_name,
        CASE
          WHEN s.zone_id IS NOT NULL THEN 'zone'
          WHEN s.group_id IS NOT NULL THEN 'group'
        END as schedule_type
       FROM schedules s
       LEFT JOIN zones z ON s.zone_id = z.id
       LEFT JOIN zone_groups g ON s.group_id = g.id
       WHERE s.id = ?`,
      [validation.value]
    );

    if (!schedule) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule not found' });
    }

    // Parse days and calculate next run
    let days;
    try {
      days = JSON.parse(schedule.days);
    } catch (error) {
      console.error(`Invalid JSON in schedule ${schedule.id} days field: ${schedule.days}`);
      days = []; // Default to empty array if JSON is corrupt
    }
    const nextRun = schedule.enabled ? getNextScheduledRun(schedule.start_time, days) : null;

    res.json({
      ...schedule,
      days: days,
      next_run: nextRun ? nextRun.toISOString() : null,
      target_name: schedule.zone_name || schedule.group_name
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
    const { zone_id, group_id, start_time, duration, days, enabled } = req.body;

    // Validate that exactly one of zone_id or group_id is provided
    if (!zone_id && !group_id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Either zone_id or group_id is required' });
    }
    if (zone_id && group_id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Cannot schedule both a zone and a group' });
    }

    let targetValidation;
    let targetExists;

    if (zone_id) {
      // Validate zone_id
      targetValidation = validateZoneId(zone_id);
      if (!targetValidation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: targetValidation.error });
      }

      // Check zone exists
      targetExists = await getOne('SELECT * FROM zones WHERE id = ?', [targetValidation.value]);
      if (!targetExists) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Zone not found' });
      }
    } else {
      // Validate group_id
      targetValidation = validateZoneId(group_id); // Reuse validation
      if (!targetValidation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: targetValidation.error });
      }

      // Check group exists
      targetExists = await getOne('SELECT * FROM zone_groups WHERE id = ?', [targetValidation.value]);
      if (!targetExists) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Group not found' });
      }
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
      `INSERT INTO schedules (zone_id, group_id, start_time, duration, days, enabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        zone_id ? targetValidation.value : null,
        group_id ? targetValidation.value : null,
        timeValidation.value,
        durationValidation.value,
        JSON.stringify(daysValidation.value),
        enabledValue
      ]
    );

    // Get created schedule
    const newSchedule = await getOne(
      `SELECT s.*,
        z.name as zone_name,
        g.name as group_name,
        CASE
          WHEN s.zone_id IS NOT NULL THEN 'zone'
          WHEN s.group_id IS NOT NULL THEN 'group'
        END as schedule_type
       FROM schedules s
       LEFT JOIN zones z ON s.zone_id = z.id
       LEFT JOIN zone_groups g ON s.group_id = g.id
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
      next_run: nextRun ? nextRun.toISOString() : null,
      target_name: newSchedule.zone_name || newSchedule.group_name
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
      `SELECT s.*,
        z.name as zone_name,
        g.name as group_name,
        CASE
          WHEN s.zone_id IS NOT NULL THEN 'zone'
          WHEN s.group_id IS NOT NULL THEN 'group'
        END as schedule_type
       FROM schedules s
       LEFT JOIN zones z ON s.zone_id = z.id
       LEFT JOIN zone_groups g ON s.group_id = g.id
       WHERE s.id = ?`,
      [scheduleId]
    );

    const days = JSON.parse(updatedSchedule.days);
    const nextRun = updatedSchedule.enabled ? getNextScheduledRun(updatedSchedule.start_time, days) : null;

    res.json({
      ...updatedSchedule,
      days: days,
      next_run: nextRun ? nextRun.toISOString() : null,
      target_name: updatedSchedule.zone_name || updatedSchedule.group_name
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
