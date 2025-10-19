/**
 * SprinkSync - History Controller
 *
 * Business logic for activity history endpoints.
 */

const { getAll } = require('../config/database');
const { validateZoneId, validateDate, validatePositiveInt } = require('../utils/validation');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Get activity history with filters
 */
const getHistory = async (req, res, next) => {
  try {
    let query = `
      SELECT h.*, z.name as zone_name
      FROM history h
      JOIN zones z ON h.zone_id = z.id
    `;
    const conditions = [];
    const values = [];

    // Filter by zone_id
    if (req.query.zone_id) {
      const validation = validateZoneId(req.query.zone_id);
      if (validation.valid) {
        conditions.push('h.zone_id = ?');
        values.push(validation.value);
      }
    }

    // Filter by start_date
    if (req.query.start_date) {
      const validation = validateDate(req.query.start_date);
      if (validation.valid) {
        conditions.push('h.start_time >= ?');
        values.push(validation.value.toISOString());
      }
    }

    // Filter by end_date
    if (req.query.end_date) {
      const validation = validateDate(req.query.end_date);
      if (validation.valid) {
        conditions.push('h.start_time <= ?');
        values.push(validation.value.toISOString());
      }
    }

    // Filter by trigger
    if (req.query.trigger) {
      const trigger = req.query.trigger.toLowerCase();
      if (trigger === 'manual' || trigger === 'scheduled') {
        conditions.push('h.trigger = ?');
        values.push(trigger);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Order by most recent first
    query += ' ORDER BY h.start_time DESC';

    // Limit results
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    if (limit > 0) {
      query += ' LIMIT ?';
      values.push(limit);
    }

    const history = await getAll(query, values);

    res.json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Get summary statistics
 */
const getStats = async (req, res, next) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const zoneId = req.query.zone_id ? parseInt(req.query.zone_id) : null;

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    let query = `
      SELECT
        zone_id,
        COUNT(*) as runs,
        SUM(duration) as total_runtime,
        AVG(duration) as avg_runtime,
        MAX(start_time) as last_run
      FROM history
      WHERE start_time >= ?
    `;
    const values = [dateThreshold.toISOString()];

    if (zoneId) {
      query += ' AND zone_id = ?';
      values.push(zoneId);
    }

    query += ' GROUP BY zone_id';

    const zoneStats = await getAll(query, values);

    // Get zone names
    const statsWithNames = await Promise.all(
      zoneStats.map(async (stat) => {
        const zone = await getAll('SELECT name FROM zones WHERE id = ?', [stat.zone_id]);
        return {
          zone_id: stat.zone_id,
          zone_name: zone[0]?.name || `Zone ${stat.zone_id}`,
          runs: stat.runs,
          total_runtime: stat.total_runtime || 0,
          avg_runtime: Math.round(stat.avg_runtime || 0),
          last_run: stat.last_run
        };
      })
    );

    // Calculate totals
    const totalRuns = statsWithNames.reduce((sum, stat) => sum + stat.runs, 0);
    const totalRuntime = statsWithNames.reduce((sum, stat) => sum + stat.total_runtime, 0);

    res.json({
      total_runs: totalRuns,
      total_runtime: totalRuntime,
      zones: statsWithNames
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  getStats
};
