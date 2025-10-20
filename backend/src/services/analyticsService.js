/**
 * SprinkSync - Analytics Service
 *
 * Tracks water usage, calculates costs, and provides insights
 * and recommendations based on historical data.
 */

const { getOne, getAll, runQuery } = require('../config/database');
const logger = require('./logger');

// Average gallons per minute for standard sprinkler head
const DEFAULT_FLOW_RATE = 1.5; // GPM

/**
 * Get system settings
 * @returns {Promise<Object>} System settings
 */
async function getSystemSettings() {
  const settings = await getOne('SELECT * FROM system_settings WHERE id = 1');
  if (!settings) {
    throw new Error('System settings not found');
  }
  return settings;
}

/**
 * Calculate gallons used based on duration
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} flowRate - Flow rate in GPM (optional)
 * @returns {number} Gallons used
 */
function calculateGallons(durationMinutes, flowRate = DEFAULT_FLOW_RATE) {
  return durationMinutes * flowRate;
}

/**
 * Calculate cost based on gallons
 * @param {number} gallons - Gallons used
 * @param {number} ratePerGallon - Cost per gallon (optional)
 * @returns {Promise<number>} Cost in currency
 */
async function calculateCost(gallons, ratePerGallon = null) {
  if (!ratePerGallon) {
    const settings = await getSystemSettings();
    ratePerGallon = settings.water_rate_per_gallon || 0.01;
  }
  return gallons * ratePerGallon;
}

/**
 * Record watering activity in analytics
 * @param {number} zoneId - Zone ID
 * @param {number} durationMinutes - Duration in minutes
 * @param {string} trigger - Trigger type ('manual' or 'scheduled')
 */
async function recordWateringActivity(zoneId, durationMinutes, trigger) {
  try {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const gallons = calculateGallons(durationMinutes);
    const cost = await calculateCost(gallons);

    // Check if record exists for today/zone
    const existing = await getOne(`
      SELECT * FROM analytics
      WHERE date = ? AND zone_id = ?
    `, [date, zoneId]);

    if (existing) {
      // Update existing record
      const manualRuns = trigger === 'manual' ? existing.manual_runs + 1 : existing.manual_runs;
      const scheduledRuns = trigger === 'scheduled' ? existing.scheduled_runs + 1 : existing.scheduled_runs;

      await runQuery(`
        UPDATE analytics
        SET total_runtime = total_runtime + ?,
            total_gallons = total_gallons + ?,
            total_cost = total_cost + ?,
            manual_runs = ?,
            scheduled_runs = ?
        WHERE date = ? AND zone_id = ?
      `, [durationMinutes, gallons, cost, manualRuns, scheduledRuns, date, zoneId]);
    } else {
      // Insert new record
      await runQuery(`
        INSERT INTO analytics
        (date, zone_id, total_runtime, total_gallons, total_cost, manual_runs, scheduled_runs)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        date,
        zoneId,
        durationMinutes,
        gallons,
        cost,
        trigger === 'manual' ? 1 : 0,
        trigger === 'scheduled' ? 1 : 0,
      ]);
    }

    logger.info(`Recorded analytics: Zone ${zoneId}, ${durationMinutes}min, ${gallons.toFixed(1)}gal, $${cost.toFixed(2)}`);
  } catch (error) {
    logger.error('Error recording watering activity:', error);
    // Don't throw - analytics failure shouldn't break watering
  }
}

/**
 * Record a weather skip event
 * @param {number} zoneId - Zone ID (optional, null for system-wide)
 */
async function recordWeatherSkip(zoneId = null) {
  try {
    const date = new Date().toISOString().split('T')[0];

    const existing = await getOne(`
      SELECT * FROM analytics
      WHERE date = ? AND ${zoneId ? 'zone_id = ?' : 'zone_id IS NULL'}
    `, zoneId ? [date, zoneId] : [date]);

    if (existing) {
      await runQuery(`
        UPDATE analytics
        SET weather_skips = weather_skips + 1
        WHERE date = ? AND ${zoneId ? 'zone_id = ?' : 'zone_id IS NULL'}
      `, zoneId ? [date, zoneId] : [date]);
    } else {
      await runQuery(`
        INSERT INTO analytics (date, zone_id, weather_skips)
        VALUES (?, ?, 1)
      `, [date, zoneId]);
    }

    logger.info(`Recorded weather skip for zone ${zoneId || 'all'}`);
  } catch (error) {
    logger.error('Error recording weather skip:', error);
  }
}

/**
 * Get analytics for a date range
 * @param {number} days - Number of days to look back
 * @param {number} zoneId - Zone ID (optional, null for all zones)
 * @returns {Promise<Array>} Analytics data
 */
async function getAnalytics(days = 30, zoneId = null) {
  try {
    const query = `
      SELECT
        date,
        zone_id,
        total_runtime,
        total_gallons,
        total_cost,
        manual_runs,
        scheduled_runs,
        weather_skips
      FROM analytics
      WHERE date >= date('now', '-${days} days')
        ${zoneId ? 'AND zone_id = ?' : ''}
      ORDER BY date DESC
    `;

    const params = zoneId ? [zoneId] : [];
    return await getAll(query, params);
  } catch (error) {
    logger.error('Error getting analytics:', error);
    return [];
  }
}

/**
 * Get summary statistics
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Summary statistics
 */
async function getSummaryStats(days = 30) {
  try {
    const settings = await getSystemSettings();

    // Overall stats
    const overall = await getOne(`
      SELECT
        SUM(total_runtime) as total_runtime,
        SUM(total_gallons) as total_gallons,
        SUM(total_cost) as total_cost,
        SUM(manual_runs) as manual_runs,
        SUM(scheduled_runs) as scheduled_runs,
        SUM(weather_skips) as weather_skips,
        COUNT(DISTINCT date) as active_days
      FROM analytics
      WHERE date >= date('now', '-${days} days')
    `);

    // Per-zone stats
    const perZone = await getAll(`
      SELECT
        z.id as zone_id,
        z.name as zone_name,
        COALESCE(SUM(a.total_runtime), 0) as total_runtime,
        COALESCE(SUM(a.total_gallons), 0) as total_gallons,
        COALESCE(SUM(a.total_cost), 0) as total_cost,
        COALESCE(SUM(a.manual_runs), 0) as manual_runs,
        COALESCE(SUM(a.scheduled_runs), 0) as scheduled_runs
      FROM zones z
      LEFT JOIN analytics a ON z.id = a.zone_id
        AND a.date >= date('now', '-${days} days')
      GROUP BY z.id, z.name
      ORDER BY total_runtime DESC
    `);

    // Daily average
    const dailyAvg = overall.active_days > 0 ? {
      runtime: overall.total_runtime / overall.active_days,
      gallons: overall.total_gallons / overall.active_days,
      cost: overall.total_cost / overall.active_days,
    } : { runtime: 0, gallons: 0, cost: 0 };

    // Water savings from weather skips (estimate)
    const avgZoneDuration = 15; // minutes
    const savedGallons = (overall.weather_skips || 0) * calculateGallons(avgZoneDuration);
    const savedCost = await calculateCost(savedGallons);

    // Comparison to traditional timer (estimate: 3x per week, 15min, all zones)
    const traditionalWeeklyRuns = 3 * 7 * 8; // 3x/week * days * 8 zones
    const traditionalGallons = traditionalWeeklyRuns * calculateGallons(15);
    const traditionalCost = await calculateCost(traditionalGallons);
    const smartSavings = {
      gallons: traditionalGallons - (overall.total_gallons || 0),
      cost: traditionalCost - (overall.total_cost || 0),
      percentage: overall.total_gallons > 0
        ? ((traditionalGallons - overall.total_gallons) / traditionalGallons) * 100
        : 0,
    };

    return {
      period: `${days} days`,
      overall: {
        totalRuntime: Math.round(overall.total_runtime || 0),
        totalGallons: Math.round(overall.total_gallons || 0),
        totalCost: parseFloat((overall.total_cost || 0).toFixed(2)),
        manualRuns: overall.manual_runs || 0,
        scheduledRuns: overall.scheduled_runs || 0,
        weatherSkips: overall.weather_skips || 0,
        activeDays: overall.active_days || 0,
      },
      daily: {
        avgRuntime: Math.round(dailyAvg.runtime),
        avgGallons: Math.round(dailyAvg.gallons),
        avgCost: parseFloat(dailyAvg.cost.toFixed(2)),
      },
      savings: {
        weatherSkipsSavedGallons: Math.round(savedGallons),
        weatherSkipsSavedCost: parseFloat(savedCost.toFixed(2)),
        vsTraditionalGallons: Math.round(smartSavings.gallons),
        vsTraditionalCost: parseFloat(smartSavings.cost.toFixed(2)),
        vsTraditionalPercent: Math.round(smartSavings.percentage),
      },
      perZone,
      currency: settings.currency || 'USD',
    };
  } catch (error) {
    logger.error('Error getting summary stats:', error);
    throw error;
  }
}

/**
 * Get insights and recommendations based on analytics
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Array>} Array of insight objects
 */
async function getInsights(days = 30) {
  const insights = [];

  try {
    const stats = await getSummaryStats(days);
    const analytics = await getAnalytics(days);

    // Insight 1: High water usage
    if (stats.overall.totalGallons > 1000) {
      insights.push({
        type: 'info',
        category: 'usage',
        title: 'High Water Usage',
        message: `You've used ${stats.overall.totalGallons} gallons in the last ${days} days. Consider reducing zone durations.`,
        priority: 2,
      });
    }

    // Insight 2: Cost savings
    if (stats.savings.vsTraditionalCost > 0) {
      insights.push({
        type: 'success',
        category: 'savings',
        title: 'Smart Savings!',
        message: `You've saved $${stats.savings.vsTraditionalCost.toFixed(2)} (${stats.savings.vsTraditionalPercent}%) vs traditional timer`,
        priority: 1,
      });
    }

    // Insight 3: Weather skips working
    if (stats.overall.weatherSkips > 0) {
      insights.push({
        type: 'success',
        category: 'weather',
        title: 'Weather-Smart Watering',
        message: `Smart skip saved ${stats.savings.weatherSkipsSavedGallons} gallons ($${stats.savings.weatherSkipsSavedCost.toFixed(2)}) by skipping during rain`,
        priority: 1,
      });
    }

    // Insight 4: Uneven zone usage
    const zoneUsage = stats.perZone.map(z => z.total_runtime).filter(r => r > 0);
    if (zoneUsage.length > 1) {
      const avg = zoneUsage.reduce((a, b) => a + b, 0) / zoneUsage.length;
      const max = Math.max(...zoneUsage);
      if (max > avg * 2) {
        const heaviestZone = stats.perZone.find(z => z.total_runtime === max);
        insights.push({
          type: 'warning',
          category: 'usage',
          title: 'Uneven Zone Usage',
          message: `${heaviestZone.zone_name} uses 2x more water than average. Check for leaks or adjust schedule.`,
          priority: 2,
        });
      }
    }

    // Insight 5: Mostly manual runs (user not using schedules)
    if (stats.overall.manualRuns > stats.overall.scheduledRuns * 2) {
      insights.push({
        type: 'info',
        category: 'automation',
        title: 'Consider Scheduling',
        message: `Most of your watering is manual. Set up schedules to save time and optimize watering.`,
        priority: 3,
      });
    }

    // Insight 6: No activity in a while
    if (stats.overall.activeDays === 0 && days >= 7) {
      insights.push({
        type: 'warning',
        category: 'activity',
        title: 'No Recent Watering',
        message: `No watering activity in the last ${days} days. Your lawn may need attention.`,
        priority: 1,
      });
    }

    // Sort by priority (1 = highest)
    insights.sort((a, b) => a.priority - b.priority);

    return insights;
  } catch (error) {
    logger.error('Error getting insights:', error);
    return [];
  }
}

/**
 * Get analytics chart data for visualization
 * @param {number} days - Number of days
 * @param {string} metric - Metric to chart ('gallons', 'cost', 'runtime')
 * @returns {Promise<Array>} Chart data
 */
async function getChartData(days = 30, metric = 'gallons') {
  try {
    const analytics = await getAnalytics(days);

    // Group by date
    const dailyData = {};
    analytics.forEach(record => {
      if (!dailyData[record.date]) {
        dailyData[record.date] = {
          date: record.date,
          gallons: 0,
          cost: 0,
          runtime: 0,
        };
      }
      dailyData[record.date].gallons += record.total_gallons;
      dailyData[record.date].cost += record.total_cost;
      dailyData[record.date].runtime += record.total_runtime;
    });

    // Convert to array and sort by date
    return Object.values(dailyData)
      .map(d => ({
        date: d.date,
        value: d[metric],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    logger.error('Error getting chart data:', error);
    return [];
  }
}

module.exports = {
  recordWateringActivity,
  recordWeatherSkip,
  getAnalytics,
  getSummaryStats,
  getInsights,
  getChartData,
  calculateGallons,
  calculateCost,
};
