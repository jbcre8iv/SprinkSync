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
  stopAllZones
} = require('../controllers/zones');

// GET /api/zones - Get all zones
router.get('/', getAllZones);

// GET /api/zones/:id - Get single zone
router.get('/:id', getZoneById);

// PUT /api/zones/:id - Update zone
router.put('/:id', updateZone);

// POST /api/zones/:id/start - Start zone
router.post('/:id/start', startZone);

// POST /api/zones/:id/stop - Stop zone
router.post('/:id/stop', stopZone);

// POST /api/zones/stop-all - Stop all zones
router.post('/stop-all', stopAllZones);

module.exports = router;
