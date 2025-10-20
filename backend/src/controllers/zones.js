/**
 * SprinkSync - Zones Controller
 *
 * Business logic for zone management endpoints.
 */

const { getAll, getOne, runQuery } = require('../config/database');
const { startZoneManaged, stopZoneManaged, stopAllZonesManaged, getZoneState } = require('../services/zone-manager');
const { validateZoneId, validateDuration, validateZoneName } = require('../utils/validation');
const { HTTP_STATUS } = require('../config/constants');
const { getZoneConfig, isValidZoneCount, VALID_ZONE_COUNTS } = require('../config/zoneConfigs');

/**
 * Get all zones with current status
 */
const getAllZones = async (req, res, next) => {
  try {
    const zones = await getAll('SELECT * FROM zones ORDER BY id');

    // Add runtime status to each zone
    const zonesWithStatus = zones.map(zone => {
      const state = getZoneState(zone.id);
      return {
        ...zone,
        is_running: state.is_running,
        remaining_time: state.remaining_time
      };
    });

    res.json(zonesWithStatus);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single zone by ID
 */
const getZoneById = async (req, res, next) => {
  try {
    const validation = validateZoneId(req.params.id);
    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.error });
    }

    const zone = await getOne('SELECT * FROM zones WHERE id = ?', [validation.value]);

    if (!zone) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Zone not found' });
    }

    // Add runtime status
    const state = getZoneState(zone.id);

    res.json({
      ...zone,
      is_running: state.is_running,
      remaining_time: state.remaining_time
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update zone details (name, default_duration)
 */
const updateZone = async (req, res, next) => {
  try {
    const zoneIdValidation = validateZoneId(req.params.id);
    if (!zoneIdValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: zoneIdValidation.error });
    }

    const zoneId = zoneIdValidation.value;

    // Check zone exists
    const zone = await getOne('SELECT * FROM zones WHERE id = ?', [zoneId]);
    if (!zone) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Zone not found' });
    }

    // Validate and update fields
    const updates = [];
    const values = [];

    if (req.body.name !== undefined) {
      const nameValidation = validateZoneName(req.body.name);
      if (!nameValidation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: nameValidation.error });
      }
      updates.push('name = ?');
      values.push(nameValidation.value);
    }

    if (req.body.default_duration !== undefined) {
      const durationValidation = validateDuration(req.body.default_duration);
      if (!durationValidation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: durationValidation.error });
      }
      updates.push('default_duration = ?');
      values.push(durationValidation.value);
    }

    if (updates.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'No valid fields to update' });
    }

    // Add updated_at
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    // Add zone ID for WHERE clause
    values.push(zoneId);

    // Execute update
    await runQuery(
      `UPDATE zones SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated zone
    const updatedZone = await getOne('SELECT * FROM zones WHERE id = ?', [zoneId]);
    const state = getZoneState(zoneId);

    res.json({
      ...updatedZone,
      is_running: state.is_running,
      remaining_time: state.remaining_time
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Start a zone
 */
const startZone = async (req, res, next) => {
  try {
    const zoneIdValidation = validateZoneId(req.params.id);
    if (!zoneIdValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: zoneIdValidation.error });
    }

    const zoneId = zoneIdValidation.value;

    // Get duration from body or use zone default
    let duration;
    if (req.body.duration !== undefined) {
      const durationValidation = validateDuration(req.body.duration);
      if (!durationValidation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: durationValidation.error });
      }
      duration = durationValidation.value;
    } else {
      // Use zone's default duration
      const zone = await getOne('SELECT default_duration FROM zones WHERE id = ?', [zoneId]);
      if (!zone) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Zone not found' });
      }
      duration = zone.default_duration;
    }

    // Start zone
    const result = await startZoneManaged(zoneId, duration);

    res.json({
      message: `Zone ${zoneId} started`,
      zone_id: result.zone_id,
      zone_name: result.zone_name,
      duration: result.duration,
      will_stop_at: result.will_stop_at
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Stop a zone
 */
const stopZone = async (req, res, next) => {
  try {
    const zoneIdValidation = validateZoneId(req.params.id);
    if (!zoneIdValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: zoneIdValidation.error });
    }

    const zoneId = zoneIdValidation.value;

    // Stop zone
    const result = await stopZoneManaged(zoneId);

    res.json({
      message: `Zone ${zoneId} stopped`,
      zone_id: result.zone_id,
      zone_name: result.zone_name,
      runtime: result.runtime
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Stop all zones (emergency stop)
 */
const stopAllZones = async (req, res, next) => {
  try {
    const result = await stopAllZonesManaged();

    res.json({
      message: 'All zones stopped',
      stopped_zones: result.stopped_zones,
      count: result.count
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Initialize system with predefined zone configuration
 */
const initializeSystem = async (req, res, next) => {
  try {
    const { zone_count } = req.body;

    // Validate zone count
    if (!zone_count) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'zone_count is required',
        valid_options: VALID_ZONE_COUNTS
      });
    }

    const zoneCount = parseInt(zone_count);
    if (!isValidZoneCount(zoneCount)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: `Invalid zone count. Must be one of: ${VALID_ZONE_COUNTS.join(', ')}`,
        valid_options: VALID_ZONE_COUNTS
      });
    }

    // Check if system already has zones
    const existingZones = await getAll('SELECT id FROM zones');
    if (existingZones.length > 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'System already configured. Use reset endpoint to reconfigure.',
        existing_zone_count: existingZones.length
      });
    }

    // Get zone configuration
    const config = getZoneConfig(zoneCount);
    const now = new Date().toISOString();

    // Create all zones
    const createdZones = [];
    for (const zoneConfig of config.zones) {
      await runQuery(
        `INSERT INTO zones (id, name, gpio_pin, default_duration, total_runtime, created_at, updated_at)
         VALUES (?, ?, ?, 15, 0, ?, ?)`,
        [zoneConfig.id, zoneConfig.name, zoneConfig.gpio_pin, now, now]
      );

      const zone = await getOne('SELECT * FROM zones WHERE id = ?', [zoneConfig.id]);
      createdZones.push({
        ...zone,
        is_running: false,
        remaining_time: 0
      });
    }

    res.status(HTTP_STATUS.CREATED).json({
      message: `${config.name} initialized successfully`,
      zone_count: zoneCount,
      config_name: config.name,
      zones: createdZones
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Reset system (delete all zones and schedules)
 */
const resetSystem = async (req, res, next) => {
  try {
    // Check for running zones
    const zones = await getAll('SELECT * FROM zones');
    const runningZones = zones.filter(z => getZoneState(z.id).is_running);

    if (runningZones.length > 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Cannot reset system while zones are running. Stop all zones first.',
        running_zones: runningZones.map(z => ({ id: z.id, name: z.name }))
      });
    }

    // Get counts for response
    const zoneCount = zones.length;
    const schedules = await getAll('SELECT id FROM schedules');
    const scheduleCount = schedules.length;

    // Delete all zones (CASCADE will delete schedules)
    await runQuery('DELETE FROM zones');

    res.json({
      message: 'System reset successfully',
      zones_deleted: zoneCount,
      schedules_deleted: scheduleCount
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllZones,
  getZoneById,
  updateZone,
  startZone,
  stopZone,
  stopAllZones,
  initializeSystem,
  resetSystem
};
