/**
 * SprinkSync - System Routes
 *
 * API routes for system status and control.
 */

const express = require('express');
const router = express.Router();
const { getSystemStatus, getHealth, restartSystem, toggleDevMode, getDevModeStatus } = require('../controllers/system');

// GET /api/system/status - Get system status
router.get('/status', getSystemStatus);

// GET /api/system/health - Health check
router.get('/health', getHealth);

// POST /api/system/restart - Restart system
router.post('/restart', restartSystem);

// GET /api/system/dev-mode - Get dev mode status
router.get('/dev-mode', getDevModeStatus);

// POST /api/system/dev-mode - Toggle dev mode
router.post('/dev-mode', toggleDevMode);

module.exports = router;
