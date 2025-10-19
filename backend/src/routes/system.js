/**
 * SprinkSync - System Routes
 *
 * API routes for system status and control.
 */

const express = require('express');
const router = express.Router();
const { getSystemStatus, getHealth, restartSystem } = require('../controllers/system');

// GET /api/system/status - Get system status
router.get('/status', getSystemStatus);

// GET /api/system/health - Health check
router.get('/health', getHealth);

// POST /api/system/restart - Restart system
router.post('/restart', restartSystem);

module.exports = router;
