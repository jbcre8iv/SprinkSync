/**
 * SprinkSync - History Routes
 *
 * API routes for activity history.
 */

const express = require('express');
const router = express.Router();
const { getHistory, getStats } = require('../controllers/history');

// GET /api/history - Get activity history
router.get('/', getHistory);

// GET /api/history/stats - Get summary statistics
router.get('/stats', getStats);

module.exports = router;
