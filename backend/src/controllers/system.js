/**
 * SprinkSync - System Controller
 *
 * Business logic for system status and control endpoints.
 */

const { getRunningZones } = require('../services/zone-manager');
const { getActiveScheduleCount } = require('../services/scheduler');
const { GPIO_MODE } = require('../hardware/gpio');
const { HTTP_STATUS } = require('../config/constants');
const { getOne, runQuery, getAll } = require('../config/database');

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

/**
 * Toggle dev mode
 */
const toggleDevMode = async (req, res, next) => {
  try {
    const { enabled } = req.body;

    // Check if dev_mode column exists, if not add it
    await runQuery(`
      ALTER TABLE system_settings
      ADD COLUMN dev_mode INTEGER DEFAULT 0
    `).catch(() => {
      // Column might already exist, ignore error
    });

    // Update dev mode setting
    await runQuery(
      'UPDATE system_settings SET dev_mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [enabled ? 1 : 0]
    );

    // If enabling dev mode, load sample data
    if (enabled) {
      await loadSampleData();
    } else {
      await clearSampleData();
    }

    res.json({
      success: true,
      dev_mode: enabled,
      message: enabled ? 'Dev mode enabled with sample data' : 'Dev mode disabled and sample data cleared'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get dev mode status
 */
const getDevModeStatus = async (req, res, next) => {
  try {
    const settings = await getOne('SELECT dev_mode FROM system_settings WHERE id = 1');
    res.json({
      dev_mode: settings?.dev_mode === 1
    });
  } catch (error) {
    // If column doesn't exist, dev mode is off
    res.json({ dev_mode: false });
  }
};

/**
 * Load sample data for development/demo purposes
 */
const loadSampleData = async () => {
  console.log('📊 Loading sample data for dev mode...');

  // Get current settings to determine which demo set to load
  const settings = await getOne('SELECT use_case_profile, controller_model FROM system_settings WHERE id = 1');
  const isMotocrossTrack = settings?.use_case_profile === 'motocross_track';
  const isEspLx = settings?.controller_model === 'esp-lx';

  // Configure location based on profile
  if (isMotocrossTrack) {
    // Glen Helen Raceway, San Bernardino, CA
    await runQuery(
      `UPDATE system_settings
       SET location_lat = 34.2864,
           location_lon = -117.4134,
           location_zip = '92407',
           location_city = 'San Bernardino',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`
    );
  } else {
    // San Francisco, CA (residential)
    await runQuery(
      `UPDATE system_settings
       SET location_lat = 37.7749,
           location_lon = -122.4194,
           location_zip = '94102',
           location_city = 'San Francisco',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`
    );
  }

  // Get all zones for scheduling
  const zones = await getAll('SELECT id FROM zones');
  const zoneCount = zones.length;

  // Rename zones for motocross track with proper terminology
  if (isMotocrossTrack && zoneCount >= 18) {
    const motocrossZoneNames = [
      'Start Gate',           // 1
      'Holeshot Straight',    // 2
      'First Turn',           // 3
      'Whoops Section',       // 4
      'Triple Jump',          // 5
      'Step-Up',              // 6
      'Rhythm Section',       // 7
      'Table Top',            // 8
      'Double Jump',          // 9
      'Sand Section',         // 10
      'Berm Turn',            // 11
      'Finish Line',          // 12
      'Pit Lane',             // 13
      'Paddock Area',         // 14
      'Spectator Zone',       // 15
      'Starting Area',        // 16
      'Tech Inspection',      // 17
      'Mechanics Area'        // 18
    ];

    for (let i = 0; i < Math.min(zoneCount, 18); i++) {
      await runQuery(
        'UPDATE zones SET name = ? WHERE id = ?',
        [motocrossZoneNames[i], i + 1]
      );
    }
    console.log('✅ Renamed zones with motocross track terminology');
  }

  // Sample schedules - different for motocross vs residential
  let sampleSchedules;
  if (isMotocrossTrack && zoneCount >= 18) {
    // Motocross track: early morning watering for track maintenance
    sampleSchedules = [
      // Main track sections - every other day (race days)
      { zone_id: 1, start_time: '05:00', duration: 20, days: '0,2,4,6', enabled: 1 },  // Start Gate
      { zone_id: 2, start_time: '05:25', duration: 25, days: '0,2,4,6', enabled: 1 },  // Holeshot
      { zone_id: 3, start_time: '05:55', duration: 20, days: '0,2,4,6', enabled: 1 },  // First Turn
      { zone_id: 4, start_time: '06:20', duration: 30, days: '0,2,4,6', enabled: 1 },  // Whoops
      { zone_id: 5, start_time: '06:55', duration: 25, days: '0,2,4,6', enabled: 1 },  // Triple Jump
      { zone_id: 6, start_time: '07:25', duration: 25, days: '0,2,4,6', enabled: 1 },  // Step-Up

      // Technical sections - practice days
      { zone_id: 7, start_time: '05:00', duration: 35, days: '1,3,5', enabled: 1 },    // Rhythm Section
      { zone_id: 8, start_time: '05:40', duration: 20, days: '1,3,5', enabled: 1 },    // Table Top
      { zone_id: 9, start_time: '06:05', duration: 25, days: '1,3,5', enabled: 1 },    // Double Jump
      { zone_id: 10, start_time: '06:35', duration: 30, days: '1,3,5', enabled: 1 },   // Sand Section
      { zone_id: 11, start_time: '07:10', duration: 20, days: '1,3,5', enabled: 1 },   // Berm Turn
      { zone_id: 12, start_time: '07:35', duration: 20, days: '1,3,5', enabled: 1 },   // Finish Line

      // Support areas - daily
      { zone_id: 13, start_time: '08:00', duration: 15, days: '0,1,2,3,4,5,6', enabled: 1 }, // Pit Lane
      { zone_id: 15, start_time: '08:20', duration: 20, days: '0,1,2,3,4,5,6', enabled: 1 }, // Spectator Zone
    ];
  } else {
    // Residential: standard lawn watering
    const baseSchedules = [
      { zone_id: 1, start_time: '06:00', duration: 20, days: '1,3,5', enabled: 1 },
      { zone_id: 2, start_time: '06:25', duration: 15, days: '1,3,5', enabled: 1 },
      { zone_id: 3, start_time: '18:00', duration: 30, days: '0,2,4,6', enabled: 1 },
      { zone_id: 4, start_time: '18:35', duration: 25, days: '0,2,4,6', enabled: 1 },
    ];
    sampleSchedules = baseSchedules.slice(0, Math.min(zoneCount, 4));
  }

  for (const schedule of sampleSchedules) {
    await runQuery(
      `INSERT OR IGNORE INTO schedules (zone_id, start_time, duration, days, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ABS(RANDOM() % 30) || ' days'))`,
      [schedule.zone_id, schedule.start_time, schedule.duration, schedule.days, schedule.enabled]
    );
  }

  // Sample history entries (last 30 days)
  const triggers = ['manual', 'schedule', 'manual', 'schedule'];

  for (let i = 0; i < 60; i++) {
    const zoneId = zones[Math.floor(Math.random() * zones.length)]?.id;
    if (!zoneId) continue;

    const daysAgo = Math.floor(Math.random() * 30);
    const duration = 10 + Math.floor(Math.random() * 25); // 10-35 minutes
    const trigger = triggers[Math.floor(Math.random() * triggers.length)];

    await runQuery(
      `INSERT INTO history (zone_id, start_time, end_time, duration, trigger, created_at)
       VALUES (?, datetime('now', '-' || ? || ' days', '-' || ? || ' hours'),
               datetime('now', '-' || ? || ' days', '-' || ? || ' hours', '+' || ? || ' minutes'),
               ?, ?, datetime('now', '-' || ? || ' days'))`,
      [zoneId, daysAgo, Math.floor(Math.random() * 12) + 6, daysAgo, Math.floor(Math.random() * 12) + 6, duration, duration, trigger, daysAgo]
    );
  }

  // Sample analytics data - higher usage for motocross
  const waterMultiplier = isMotocrossTrack ? 3.5 : 1.0; // Tracks use much more water

  for (let i = 0; i < 30; i++) {
    const daysAgo = i;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];

    for (const zone of zones) {
      if (!zone.id) continue;

      const runs = Math.floor(Math.random() * 3);
      if (runs === 0) continue;

      const baseRuntime = runs * (15 + Math.floor(Math.random() * 20)); // 15-35 min per run
      const totalRuntime = isMotocrossTrack ? Math.floor(baseRuntime * 1.5) : baseRuntime;
      const gallonsPerMin = (2.5 + Math.random() * 1.5) * waterMultiplier;
      const totalGallons = totalRuntime * gallonsPerMin;
      const totalCost = totalGallons * 0.01;

      await runQuery(
        `INSERT OR IGNORE INTO analytics (date, zone_id, total_runtime, total_gallons, total_cost,
         manual_runs, scheduled_runs, weather_skips, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))`,
        [dateStr, zone.id, totalRuntime, totalGallons.toFixed(2), totalCost.toFixed(2),
         Math.floor(runs * 0.3), Math.floor(runs * 0.7), Math.floor(Math.random() * 2), daysAgo]
      );
    }
  }

  // Sample weather cache (next 7 days)
  const weatherConditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Scattered Showers'];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const tempHigh = 65 + Math.floor(Math.random() * 25);
    const tempLow = tempHigh - 15 - Math.floor(Math.random() * 10);
    const conditions = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const precipitation = conditions.includes('Rain') ? (0.1 + Math.random() * 0.5) : (Math.random() * 0.1);
    const precipProb = conditions.includes('Rain') ? 60 + Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30);

    await runQuery(
      `INSERT OR REPLACE INTO weather_cache
       (forecast_date, temp_high, temp_low, precipitation, precipitation_prob, humidity, wind_speed, conditions, et_rate, fetched_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [dateStr, tempHigh, tempLow, precipitation.toFixed(2), precipProb,
       40 + Math.floor(Math.random() * 40), (5 + Math.random() * 15).toFixed(1),
       conditions, (0.15 + Math.random() * 0.15).toFixed(2)]
    );
  }

  // Sample zone groups - different for motocross vs residential
  if (isMotocrossTrack && zoneCount >= 18) {
    // Motocross track groups for 18 zones
    const trackGroups = [
      {
        name: 'Main Racing Line',
        description: 'Primary track sections for competition',
        duration: 25,
        color: '#EF4444',
        icon: '🏁',
        zones: [1, 2, 3, 4, 5, 6] // Start Gate, Holeshot, First Turn, Whoops, Triple, Step-Up
      },
      {
        name: 'Technical Features',
        description: 'Jump sections and advanced obstacles',
        duration: 30,
        color: '#F59E0B',
        icon: '🏍️',
        zones: [7, 8, 9, 10, 11, 12] // Rhythm, Table Top, Double, Sand, Berm, Finish
      },
      {
        name: 'Facility Zones',
        description: 'Pit, paddock and spectator areas',
        duration: 15,
        color: '#3B82F6',
        icon: '🏕️',
        zones: [13, 14, 15, 16, 17, 18] // Pit, Paddock, Spectator, Starting, Tech, Mechanics
      }
    ];

    for (const group of trackGroups) {
      // Check if group exists
      const existingGroup = await getOne('SELECT id FROM zone_groups WHERE name = ?', [group.name]);
      let groupId = existingGroup?.id;

      if (!groupId) {
        const result = await runQuery(
          `INSERT INTO zone_groups (name, description, default_duration, color, icon)
           VALUES (?, ?, ?, ?, ?)`,
          [group.name, group.description, group.duration, group.color, group.icon]
        );
        groupId = result.lastID;
      }

      // Clear and add members
      if (groupId) {
        await runQuery('DELETE FROM zone_group_members WHERE group_id = ?', [groupId]);
        for (let i = 0; i < group.zones.length; i++) {
          const zoneId = group.zones[i];
          if (zoneId <= zoneCount) {
            await runQuery(
              `INSERT INTO zone_group_members (group_id, zone_id, sequence_order)
               VALUES (?, ?, ?)`,
              [groupId, zoneId, i]
            );
          }
        }
        console.log(`✅ Created track group: ${group.name} with ${group.zones.length} zones`);
      }
    }
  } else {
    // Residential group
    const existingGroup = await getOne('SELECT id FROM zone_groups WHERE name = ?', ['Front Yard']);
    let groupId = existingGroup?.id;

    if (!groupId) {
      const groupResult = await runQuery(
        `INSERT INTO zone_groups (name, description, default_duration, color, icon)
         VALUES (?, ?, ?, ?, ?)`,
        ['Front Yard', 'Front lawn and garden zones', 20, '#10B981', '🏡']
      );
      groupId = groupResult.lastID;
    }

    // Clear existing members and add zones
    if (groupId) {
      await runQuery('DELETE FROM zone_group_members WHERE group_id = ?', [groupId]);

      // Add zones 1 and 2 to the group
      if (zones.length >= 2) {
        await runQuery(
          `INSERT INTO zone_group_members (group_id, zone_id, sequence_order)
           VALUES (?, ?, ?)`,
          [groupId, zones[0].id, 0]
        );
        await runQuery(
          `INSERT INTO zone_group_members (group_id, zone_id, sequence_order)
           VALUES (?, ?, ?)`,
          [groupId, zones[1].id, 1]
        );
        console.log(`✅ Added ${zones.length >= 2 ? 2 : zones.length} zones to Front Yard group`);
      }
    }
  }

  console.log(`✅ Sample data loaded successfully for ${isMotocrossTrack ? 'Motocross Track' : 'Residential Lawn'}`);
};

/**
 * Clear sample data (used when disabling dev mode)
 */
const clearSampleData = async () => {
  console.log('🧹 Clearing sample data...');

  // Clear sample data but keep zones
  await runQuery('DELETE FROM schedules');
  await runQuery('DELETE FROM history');
  await runQuery('DELETE FROM analytics');
  await runQuery('DELETE FROM weather_cache');
  await runQuery('DELETE FROM zone_group_members');
  await runQuery('DELETE FROM zone_groups');

  // Clear location settings
  await runQuery(
    `UPDATE system_settings
     SET location_lat = NULL,
         location_lon = NULL,
         location_zip = NULL,
         location_city = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  );

  console.log('✅ Sample data cleared');
};

module.exports = {
  getSystemStatus,
  getHealth,
  restartSystem,
  toggleDevMode,
  getDevModeStatus
};
