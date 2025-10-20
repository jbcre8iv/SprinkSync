/**
 * SprinkSync - Analytics Routes
 *
 * API routes for water usage analytics, cost tracking, and insights
 */

const express = require('express');
const router = express.Router();
const {
  getAnalyticsData,
  getSummary,
  getInsightsData,
  getChartDataEndpoint,
} = require('../controllers/analyticsController');

// GET /api/analytics - Get raw analytics data
router.get('/', getAnalyticsData);

// GET /api/analytics/summary - Get summary statistics
router.get('/summary', getSummary);

// GET /api/analytics/insights - Get insights and recommendations
router.get('/insights', getInsightsData);

// GET /api/analytics/chart - Get chart data for visualization
router.get('/chart', getChartDataEndpoint);

module.exports = router;
