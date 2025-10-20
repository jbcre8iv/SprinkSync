/**
 * SprinkSync - Analytics Controller
 *
 * Handles water usage analytics, cost tracking, and insights
 */

const {
  getAnalytics,
  getSummaryStats,
  getInsights,
  getChartData,
} = require('../services/analyticsService');
const logger = require('../services/logger');

/**
 * Get analytics data
 * GET /api/analytics
 */
const getAnalyticsData = async (req, res) => {
  try {
    const { days = 30, zoneId } = req.query;
    const daysNum = parseInt(days, 10);
    const zoneIdNum = zoneId ? parseInt(zoneId, 10) : null;

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter (1-365)'
      });
    }

    const analytics = await getAnalytics(daysNum, zoneIdNum);

    res.json({
      success: true,
      days: daysNum,
      zoneId: zoneIdNum,
      analytics
    });
  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics data'
    });
  }
};

/**
 * Get summary statistics
 * GET /api/analytics/summary
 */
const getSummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days, 10);

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter (1-365)'
      });
    }

    const summary = await getSummaryStats(daysNum);

    res.json({
      success: true,
      ...summary
    });
  } catch (error) {
    logger.error('Error getting summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get summary statistics'
    });
  }
};

/**
 * Get insights and recommendations
 * GET /api/analytics/insights
 */
const getInsightsData = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days, 10);

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter (1-365)'
      });
    }

    const insights = await getInsights(daysNum);

    res.json({
      success: true,
      days: daysNum,
      insights
    });
  } catch (error) {
    logger.error('Error getting insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insights'
    });
  }
};

/**
 * Get chart data for visualization
 * GET /api/analytics/chart
 */
const getChartDataEndpoint = async (req, res) => {
  try {
    const { days = 30, metric = 'gallons' } = req.query;
    const daysNum = parseInt(days, 10);

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter (1-365)'
      });
    }

    if (!['gallons', 'cost', 'runtime'].includes(metric)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric (gallons, cost, or runtime)'
      });
    }

    const chartData = await getChartData(daysNum, metric);

    res.json({
      success: true,
      days: daysNum,
      metric,
      data: chartData
    });
  } catch (error) {
    logger.error('Error getting chart data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chart data'
    });
  }
};

module.exports = {
  getAnalyticsData,
  getSummary,
  getInsightsData,
  getChartDataEndpoint,
};
