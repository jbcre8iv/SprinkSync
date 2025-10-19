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

// Mount routes
router.use('/zones', zonesRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/history', historyRoutes);
router.use('/system', systemRoutes);

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'SprinkSync API',
    version: '1.0.0',
    endpoints: {
      zones: '/api/zones',
      schedules: '/api/schedules',
      history: '/api/history',
      system: '/api/system'
    }
  });
});

module.exports = router;
