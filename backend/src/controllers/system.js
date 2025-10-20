/**
 * SprinkSync - System Controller
 *
 * Business logic for system status and control endpoints.
 */

const { getRunningZones } = require('../services/zone-manager');
const { getActiveScheduleCount } = require('../services/scheduler');
const { GPIO_MODE } = require('../hardware/gpio');
const { HTTP_STATUS } = require('../config/constants');
const { getOne } = require('../config/database');

// Track server start time
const serverStartTime = Date.now();

/**
 * Get system status
 */
const getSystemStatus = async (req, res, next) => {
  try {
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000); // seconds
    const runningZones = getRunningZones();

    // Get actual zone count from database
    const zoneCountResult = await getOne('SELECT COUNT(*) as count FROM zones');
    const totalZones = zoneCountResult ? zoneCountResult.count : 0;

    // Memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024 * 10) / 10,
      total: Math.round(memUsage.heapTotal / 1024 / 1024 * 10) / 10
    };
    memUsageMB.percentage = Math.round((memUsageMB.used / memUsageMB.total) * 100 * 10) / 10;

    res.json({
      app_name: process.env.APP_NAME || 'SprinkSync',
      version: '1.0.0',
      uptime: uptime,
      gpio_mode: GPIO_MODE,
      active_zones: runningZones.length,
      total_zones: totalZones,
      database_status: 'connected',
      scheduler_status: 'running',
      active_schedules: getActiveScheduleCount(),
      memory_usage: memUsageMB,
      running_zones: runningZones.map(zone => ({
        zone_id: zone.zone_id,
        elapsed: zone.elapsed_minutes,
        remaining: zone.remaining_minutes
      }))
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Health check
 */
const getHealth = async (req, res, next) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restart system
 * In production, this would trigger a process restart via PM2 or systemd
 */
const restartSystem = async (req, res, next) => {
  try {
    res.json({
      message: 'System restart not implemented in development mode',
      timestamp: new Date().toISOString()
    });

    // In production with PM2:
    // process.exit(0); // PM2 will automatically restart
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStatus,
  getHealth,
  restartSystem
};
