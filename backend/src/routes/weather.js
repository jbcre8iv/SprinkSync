/**
 * SprinkSync - Weather Routes
 *
 * API routes for weather data and smart watering decisions
 */

const express = require('express');
const router = express.Router();
const {
  getWeather,
  checkShouldSkip,
} = require('../controllers/weatherController');

// GET /api/weather - Get current weather and forecast
router.get('/', getWeather);

// GET /api/weather/should-skip/:zoneId - Check if watering should be skipped
router.get('/should-skip/:zoneId', checkShouldSkip);

module.exports = router;
