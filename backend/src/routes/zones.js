/**
 * SprinkSync - Zones Routes
 *
 * API routes for zone management.
 */

const express = require('express');
const router = express.Router();
const {
  getAllZones,
  getZoneById,
  updateZone,
  startZone,
  stopZone,
  stopAllZones,
  initializeSystem,
  resetSystem
} = require('../controllers/zones');

// GET /api/zones - Get all zones
router.get('/', getAllZones);

// POST /api/zones/initialize - Initialize system with zone configuration
router.post('/initialize', initializeSystem);

// POST /api/zones/reset - Reset system (delete all zones)
router.post('/reset', resetSystem);

// POST /api/zones/stop-all - Stop all zones
router.post('/stop-all', stopAllZones);

// GET /api/zones/:id - Get single zone
router.get('/:id', getZoneById);

// PUT /api/zones/:id - Update zone
router.put('/:id', updateZone);

// POST /api/zones/:id/start - Start zone
router.post('/:id/start', startZone);

// POST /api/zones/:id/stop - Stop zone
router.post('/:id/stop', stopZone);

module.exports = router;
