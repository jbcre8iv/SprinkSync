/**
 * SprinkSync - Zones Controller
 *
 * Business logic for zone management endpoints.
 */

const { getAll, getOne, runQuery } = require('../config/database');
const { startZoneManaged, stopZoneManaged, stopAllZonesManaged, getZoneState } = require('../services/zone-manager');
const { validateZoneId, validateDuration, validateZoneName } = require('../utils/validation');
const { HTTP_STATUS } = require('../config/constants');

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

module.exports = {
  getAllZones,
  getZoneById,
  updateZone,
  startZone,
  stopZone,
  stopAllZones
};
