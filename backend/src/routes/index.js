/**
 * SprinkSync - Main Router
 *
 * Combines all API routes under /api prefix.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const zonesRoutes = require('./zones');
const schedulesRoutes = require('./schedules');
const historyRoutes = require('./history');
const systemRoutes = require('./system');
const settingsRoutes = require('./settings');
const weatherRoutes = require('./weather');
const analyticsRoutes = require('./analytics');

// Mount routes
router.use('/zones', zonesRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/history', historyRoutes);
router.use('/system', systemRoutes);
router.use('/settings', settingsRoutes);
router.use('/weather', weatherRoutes);
router.use('/analytics', analyticsRoutes);

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'SprinkSync API',
    version: '2.0.0',
    endpoints: {
      zones: '/api/zones',
      schedules: '/api/schedules',
      history: '/api/history',
      system: '/api/system',
      settings: '/api/settings',
      weather: '/api/weather',
      analytics: '/api/analytics'
    },
    features: {
      useCaseProfiles: true,
      weatherIntegration: true,
      smartScheduling: true,
      costTracking: true,
      analytics: true
    }
  });
});

module.exports = router;
