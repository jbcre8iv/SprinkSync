/**
 * SprinkSync - Weather Controller
 *
 * Handles weather data, forecasts, and smart watering decisions
 */

const { getWeatherForecast, shouldSkipWatering } = require('../services/weatherService');
const { getProfile } = require('../config/useCaseProfiles');
const { getSystemSettings } = require('../services/weatherService');
const logger = require('../services/logger');

/**
 * Get current weather and forecast
 * GET /api/weather
 */
const getWeather = async (req, res) => {
  try {
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';

    const weather = await getWeatherForecast(forceRefresh);

    res.json({
      success: true,
      ...weather
    });
  } catch (error) {
    logger.error('Error getting weather:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weather data',
      message: error.message
    });
  }
};

/**
 * Check if watering should be skipped for a zone
 * GET /api/weather/should-skip/:zoneId
 */
const checkShouldSkip = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const zoneIdNum = parseInt(zoneId, 10);

    if (isNaN(zoneIdNum) || zoneIdNum < 1 || zoneIdNum > 8) {
      return res.status(400).json({
        success: false,
        error: 'Invalid zone ID'
      });
    }

    // Get current use case profile
    const settings = await getSystemSettings();
    const profile = getProfile(settings.use_case_profile);

    // Check if watering should be skipped
    const result = await shouldSkipWatering(zoneIdNum, profile);

    res.json({
      success: true,
      zoneId: zoneIdNum,
      ...result
    });
  } catch (error) {
    logger.error('Error checking should skip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check weather skip',
      message: error.message
    });
  }
};

module.exports = {
  getWeather,
  checkShouldSkip,
};
