/**
 * SprinkSync - Weather Service
 *
 * Integrates with OpenWeatherMap API to fetch weather data,
 * cache forecasts, and provide smart watering recommendations.
 */

const { getOne, getAll, runQuery } = require('../config/database');
const logger = require('./logger');

// OpenWeatherMap API base URL
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Cache duration (4 hours - OpenWeather updates every 3 hours)
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000;

/**
 * Get system settings (location, API key, etc.)
 * @returns {Promise<Object>} System settings
 */
async function getSystemSettings() {
  const settings = await getOne('SELECT * FROM system_settings WHERE id = 1');

  if (!settings) {
    throw new Error('System settings not found');
  }

  return settings;
}

/**
 * Fetch current weather from OpenWeatherMap
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} apiKey - OpenWeatherMap API key
 * @returns {Promise<Object>} Current weather data
 */
async function fetchCurrentWeather(lat, lon, apiKey) {
  try {
    const url = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      clouds: data.clouds.all,
      rain: data.rain ? data.rain['1h'] || 0 : 0,
      timestamp: new Date(data.dt * 1000),
    };
  } catch (error) {
    logger.error('Error fetching current weather:', error);
    throw error;
  }
}

/**
 * Fetch 5-day forecast from OpenWeatherMap
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} apiKey - OpenWeatherMap API key
 * @returns {Promise<Array>} Forecast data
 */
async function fetchForecast(lat, lon, apiKey) {
  try {
    const url = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Process forecast data into daily summaries
    const dailyForecasts = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];

      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          tempHigh: item.main.temp_max,
          tempLow: item.main.temp_min,
          humidity: [],
          windSpeed: [],
          precipitation: 0,
          precipProb: 0,
          conditions: [],
        };
      }

      // Update daily stats
      dailyForecasts[date].tempHigh = Math.max(dailyForecasts[date].tempHigh, item.main.temp_max);
      dailyForecasts[date].tempLow = Math.min(dailyForecasts[date].tempLow, item.main.temp_min);
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].windSpeed.push(item.wind.speed);
      dailyForecasts[date].conditions.push(item.weather[0].main);

      // Precipitation
      const rain = item.rain ? item.rain['3h'] || 0 : 0;
      const snow = item.snow ? item.snow['3h'] || 0 : 0;
      dailyForecasts[date].precipitation += (rain + snow) / 25.4; // Convert mm to inches

      // Probability of precipitation
      dailyForecasts[date].precipProb = Math.max(dailyForecasts[date].precipProb, (item.pop || 0) * 100);
    });

    // Calculate averages
    return Object.values(dailyForecasts).map(day => ({
      date: day.date,
      tempHigh: Math.round(day.tempHigh),
      tempLow: Math.round(day.tempLow),
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round((day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length) * 10) / 10,
      precipitation: Math.round(day.precipitation * 100) / 100,
      precipProb: Math.round(day.precipProb),
      conditions: getMostCommonCondition(day.conditions),
    }));
  } catch (error) {
    logger.error('Error fetching forecast:', error);
    throw error;
  }
}

/**
 * Get most common weather condition from array
 * @param {Array<string>} conditions - Array of condition strings
 * @returns {string} Most common condition
 */
function getMostCommonCondition(conditions) {
  const counts = {};
  conditions.forEach(c => counts[c] = (counts[c] || 0) + 1);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

/**
 * Cache weather forecast in database
 * @param {Array} forecast - Forecast data to cache
 */
async function cacheWeatherForecast(forecast) {
  try {
    // Clear old cache
    await runQuery('DELETE FROM weather_cache WHERE fetched_at < datetime("now", "-4 hours")');

    // Insert new forecast
    for (const day of forecast) {
      await runQuery(`
        INSERT OR REPLACE INTO weather_cache
        (forecast_date, temp_high, temp_low, precipitation, precipitation_prob, humidity, wind_speed, conditions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        day.date,
        day.tempHigh,
        day.tempLow,
        day.precipitation,
        day.precipProb,
        day.humidity,
        day.windSpeed,
        day.conditions,
      ]);
    }

    logger.info(`Cached weather forecast for ${forecast.length} days`);
  } catch (error) {
    logger.error('Error caching weather forecast:', error);
    throw error;
  }
}

/**
 * Get cached weather forecast
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Array>} Cached forecast data
 */
async function getCachedForecast(days = 5) {
  try {
    const forecast = await getAll(`
      SELECT * FROM weather_cache
      WHERE forecast_date >= date('now')
      ORDER BY forecast_date
      LIMIT ?
    `, [days]);

    return forecast.map(f => ({
      date: f.forecast_date,
      tempHigh: f.temp_high,
      tempLow: f.temp_low,
      precipitation: f.precipitation,
      precipProb: f.precipitation_prob,
      humidity: f.humidity,
      windSpeed: f.wind_speed,
      conditions: f.conditions,
      cachedAt: f.fetched_at,
    }));
  } catch (error) {
    logger.error('Error getting cached forecast:', error);
    return [];
  }
}

/**
 * Check if cached forecast is still fresh
 * @returns {Promise<boolean>} True if cache is fresh
 */
async function isCacheFresh() {
  try {
    const result = await getOne(`
      SELECT MAX(fetched_at) as last_fetch FROM weather_cache
    `);

    if (!result || !result.last_fetch) {
      return false;
    }

    const lastFetch = new Date(result.last_fetch);
    const now = new Date();
    const age = now - lastFetch;

    return age < CACHE_DURATION_MS;
  } catch (error) {
    logger.error('Error checking cache freshness:', error);
    return false;
  }
}

/**
 * Get weather forecast (from cache or API)
 * @param {boolean} forceRefresh - Force API call even if cache is fresh
 * @returns {Promise<Object>} Weather forecast and current conditions
 */
async function getWeatherForecast(forceRefresh = false) {
  try {
    const settings = await getSystemSettings();

    // Check if weather is enabled
    if (!settings.weather_enabled) {
      return { enabled: false, message: 'Weather integration disabled' };
    }

    // Check if location is set
    if (!settings.location_lat || !settings.location_lon) {
      return { enabled: true, configured: false, message: 'Location not configured' };
    }

    // Check if API key is set (optional - use demo key if not set)
    const apiKey = settings.weather_api_key || 'DEMO_KEY'; // Users should add their own key

    // Check cache first
    if (!forceRefresh) {
      const cacheFresh = await isCacheFresh();
      if (cacheFresh) {
        const cached = await getCachedForecast(5);
        if (cached.length > 0) {
          logger.info('Using cached weather forecast');
          return {
            enabled: true,
            configured: true,
            forecast: cached,
            fromCache: true,
          };
        }
      }
    }

    // Fetch fresh data from API
    logger.info('Fetching fresh weather data from API');

    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(settings.location_lat, settings.location_lon, apiKey),
      fetchForecast(settings.location_lat, settings.location_lon, apiKey),
    ]);

    // Cache the forecast
    await cacheWeatherForecast(forecast);

    return {
      enabled: true,
      configured: true,
      current,
      forecast,
      fromCache: false,
    };
  } catch (error) {
    logger.error('Error getting weather forecast:', error);

    // Try to return cached data on error
    const cached = await getCachedForecast(5);
    if (cached.length > 0) {
      logger.warn('API error, returning stale cached data');
      return {
        enabled: true,
        configured: true,
        forecast: cached,
        fromCache: true,
        error: error.message,
      };
    }

    throw error;
  }
}

/**
 * Check if watering should be skipped based on weather
 * @param {number} zoneId - Zone ID to check
 * @param {Object} profile - Use case profile
 * @returns {Promise<Object>} { skip: boolean, reason: string }
 */
async function shouldSkipWatering(zoneId, profile) {
  try {
    const weather = await getWeatherForecast();

    if (!weather.enabled || !weather.configured || !weather.forecast) {
      return { skip: false, reason: 'Weather data not available' };
    }

    const settings = await getSystemSettings();
    const today = weather.forecast[0];
    const tomorrow = weather.forecast[1];

    // Check if smart skip is enabled
    if (!settings.smart_skip_enabled) {
      return { skip: false, reason: 'Smart skip disabled' };
    }

    // Check for freeze conditions
    if (profile.weather.skipOnFreeze) {
      if (today.tempLow <= profile.weather.freezeThreshold) {
        return { skip: true, reason: `Freeze warning (${today.tempLow}°F)` };
      }
    }

    // Check for rain (profile-specific thresholds)
    if (profile.weather.skipOnRain) {
      const rainThreshold = profile.weather.rainThreshold || settings.rain_threshold;

      // Check today's forecast
      if (today.precipitation >= rainThreshold || today.precipProb >= 80) {
        return {
          skip: true,
          reason: `Rain forecast: ${today.precipitation}" (${today.precipProb}% chance)`
        };
      }

      // Check tomorrow's forecast
      if (tomorrow && (tomorrow.precipitation >= rainThreshold || tomorrow.precipProb >= 70)) {
        return {
          skip: true,
          reason: `Rain forecast tomorrow: ${tomorrow.precipitation}" (${tomorrow.precipProb}% chance)`
        };
      }
    }

    // Motocross tracks: may want to water BEFORE rain
    if (profile.weather.waterBeforeRain) {
      if (today.precipProb >= 60) {
        return {
          skip: false,
          reason: `Track mode: Water before rain (${today.precipProb}% chance)`,
          recommendation: 'Water lightly to help compact track before rain'
        };
      }
    }

    return { skip: false, reason: 'Weather conditions favorable' };
  } catch (error) {
    logger.error('Error checking weather skip:', error);
    // Don't skip on error - better to water than not
    return { skip: false, reason: 'Weather check failed, proceeding with watering' };
  }
}

/**
 * Calculate recommended watering duration based on weather
 * @param {number} baseDuration - Base duration in minutes
 * @param {Object} profile - Use case profile
 * @returns {Promise<number>} Adjusted duration in minutes
 */
async function calculateWeatherAdjustedDuration(baseDuration, profile) {
  try {
    const weather = await getWeatherForecast();

    if (!weather.enabled || !weather.configured || !weather.forecast) {
      return baseDuration; // No adjustment
    }

    let multiplier = 1.0;
    const today = weather.forecast[0];

    // Adjust for temperature
    if (profile.weather.increaseInHeat && today.tempHigh >= profile.weather.heatThreshold) {
      const heatIncrease = Math.min((today.tempHigh - profile.weather.heatThreshold) / 20, 0.5);
      multiplier += heatIncrease; // Up to 50% increase
    }

    if (profile.weather.reduceInCool && today.tempHigh <= profile.weather.coolThreshold) {
      const coolReduction = Math.min((profile.weather.coolThreshold - today.tempHigh) / 20, 0.4);
      multiplier -= coolReduction; // Up to 40% reduction
    }

    // Adjust for humidity
    if (today.humidity >= 80) {
      multiplier -= 0.15; // Reduce 15% in high humidity
    } else if (today.humidity <= 30) {
      multiplier += 0.15; // Increase 15% in low humidity
    }

    // Adjust for wind (for tracks)
    if (profile.weather.increaseInWind && today.windSpeed >= profile.weather.windThreshold) {
      multiplier += 0.2; // Increase 20% for dust control
    }

    // Apply profile-specific duration multiplier
    multiplier *= profile.strategy.durationMultiplier;

    // Ensure multiplier is reasonable (0.5x to 2.0x)
    multiplier = Math.max(0.5, Math.min(2.0, multiplier));

    const adjustedDuration = Math.round(baseDuration * multiplier);

    logger.info(`Weather-adjusted duration: ${baseDuration}min → ${adjustedDuration}min (${Math.round(multiplier * 100)}%)`);

    return adjustedDuration;
  } catch (error) {
    logger.error('Error calculating weather-adjusted duration:', error);
    return baseDuration; // Return base duration on error
  }
}

module.exports = {
  getWeatherForecast,
  shouldSkipWatering,
  calculateWeatherAdjustedDuration,
  getSystemSettings,
};
