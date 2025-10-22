/**
 * SprinkSync - Settings Controller
 *
 * Handles system settings, use case profiles, and configuration
 */

const { getOne, runQuery, getAll } = require('../config/database');
const { getProfileOptions, getProfile } = require('../config/useCaseProfiles');
const { getAllControllers, getControllerConfig, getControllersByManufacturer } = require('../config/controllers');
const { getAllManufacturers, getManufacturer } = require('../config/manufacturers');
const { getZoneConfig, isValidZoneCount } = require('../config/zoneConfigs');
const { initializeGPIO } = require('../hardware/gpio');
const logger = require('../services/logger');

/**
 * Get system settings
 * GET /api/settings
 */
const getSettings = async (req, res) => {
  try {
    const settings = await getOne('SELECT * FROM system_settings WHERE id = 1');

    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'System settings not found'
      });
    }

    // Get current profile info
    const profile = getProfile(settings.use_case_profile);

    res.json({
      success: true,
      settings: {
        useCaseProfile: settings.use_case_profile,
        controllerModel: settings.controller_model,
        profileInfo: {
          id: profile.id,
          name: profile.name,
          icon: profile.icon,
          description: profile.description,
        },
        location: {
          lat: settings.location_lat,
          lon: settings.location_lon,
          zip: settings.location_zip,
          city: settings.location_city,
        },
        waterRate: {
          perGallon: settings.water_rate_per_gallon,
          currency: settings.currency,
        },
        weather: {
          enabled: Boolean(settings.weather_enabled),
          apiKey: settings.weather_api_key ? '***' : null, // Masked
          smartSkipEnabled: Boolean(settings.smart_skip_enabled),
          rainThreshold: settings.rain_threshold,
        },
      }
    });
  } catch (error) {
    logger.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system settings'
    });
  }
};

/**
 * Update system settings
 * PUT /api/settings
 */
const updateSettings = async (req, res) => {
  try {
    const {
      useCaseProfile,
      controllerModel,
      location,
      waterRate,
      weather
    } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (useCaseProfile) {
      // Validate profile exists
      const profile = getProfile(useCaseProfile);
      if (!profile) {
        return res.status(400).json({
          success: false,
          error: 'Invalid use case profile'
        });
      }
      updates.push('use_case_profile = ?');
      values.push(useCaseProfile);
    }

    let zonesInitialized = false;
    let zoneInitInfo = null;

    if (controllerModel) {
      // Validate controller exists
      const controller = getControllerConfig(controllerModel);
      if (!controller) {
        return res.status(400).json({
          success: false,
          error: 'Invalid controller model'
        });
      }
      updates.push('controller_model = ?');
      values.push(controllerModel);

      // Also update max_concurrent_zones based on controller spec
      updates.push('max_concurrent_zones = ?');
      values.push(controller.max_concurrent_zones);

      // Check if we need to initialize/update zones
      const currentZones = await getAll('SELECT COUNT(*) as count FROM zones');
      const currentZoneCount = currentZones[0].count;
      const targetZoneCount = controller.max_zones;

      // If no zones exist OR zone count doesn't match controller, initialize zones
      if (currentZoneCount === 0 || (req.body.autoInitializeZones && currentZoneCount !== targetZoneCount)) {
        logger.info(`Initializing ${targetZoneCount} zones for ${controller.name}`);

        // Find closest valid zone configuration
        let zoneConfig = getZoneConfig(targetZoneCount);

        // If exact match not found, find closest valid configuration
        if (!zoneConfig) {
          const validCounts = [4, 6, 8, 12, 18, 22];
          const closest = validCounts.reduce((prev, curr) =>
            Math.abs(curr - targetZoneCount) < Math.abs(prev - targetZoneCount) ? curr : prev
          );
          zoneConfig = getZoneConfig(closest);
          logger.info(`Using ${closest}-zone configuration (closest to ${targetZoneCount})`);
        }

        if (zoneConfig) {
          // Delete existing zones if any
          if (currentZoneCount > 0) {
            await runQuery('DELETE FROM zones');
            logger.info('Cleared existing zones');
          }

          // Insert new zones based on configuration
          for (const zone of zoneConfig.zones) {
            await runQuery(
              `INSERT INTO zones (id, name, gpio_pin, default_duration)
               VALUES (?, ?, ?, ?)`,
              [zone.id, zone.name, zone.gpio_pin, 15]
            );
          }

          // Reinitialize GPIO with new zones
          await initializeGPIO();

          zonesInitialized = true;
          zoneInitInfo = {
            zoneCount: zoneConfig.zones.length,
            configName: zoneConfig.name,
            message: `Initialized ${zoneConfig.zones.length} zones for ${controller.name}`
          };

          logger.info(`✅ Zones initialized: ${zoneConfig.zones.length} zones created`);
        }
      }
    }

    if (location) {
      if (location.lat !== undefined) {
        updates.push('location_lat = ?');
        values.push(location.lat);
      }
      if (location.lon !== undefined) {
        updates.push('location_lon = ?');
        values.push(location.lon);
      }
      if (location.zip !== undefined) {
        updates.push('location_zip = ?');
        values.push(location.zip);
      }
      if (location.city !== undefined) {
        updates.push('location_city = ?');
        values.push(location.city);
      }
    }

    if (waterRate) {
      if (waterRate.perGallon !== undefined) {
        updates.push('water_rate_per_gallon = ?');
        values.push(waterRate.perGallon);
      }
      if (waterRate.currency !== undefined) {
        updates.push('currency = ?');
        values.push(waterRate.currency);
      }
    }

    if (weather) {
      if (weather.enabled !== undefined) {
        updates.push('weather_enabled = ?');
        values.push(weather.enabled ? 1 : 0);
      }
      if (weather.apiKey !== undefined && weather.apiKey !== '***') {
        updates.push('weather_api_key = ?');
        values.push(weather.apiKey);
      }
      if (weather.smartSkipEnabled !== undefined) {
        updates.push('smart_skip_enabled = ?');
        values.push(weather.smartSkipEnabled ? 1 : 0);
      }
      if (weather.rainThreshold !== undefined) {
        updates.push('rain_threshold = ?');
        values.push(weather.rainThreshold);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    // Add updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Execute update
    const query = `
      UPDATE system_settings
      SET ${updates.join(', ')}
      WHERE id = 1
    `;

    await runQuery(query, values);

    logger.info('System settings updated');

    // Return updated settings
    const updated = await getOne('SELECT * FROM system_settings WHERE id = 1');
    const profile = getProfile(updated.use_case_profile);

    const response = {
      success: true,
      message: 'Settings updated successfully',
      settings: {
        useCaseProfile: updated.use_case_profile,
        controllerModel: updated.controller_model,
        profileInfo: {
          id: profile.id,
          name: profile.name,
          icon: profile.icon,
          description: profile.description,
        },
        location: {
          lat: updated.location_lat,
          lon: updated.location_lon,
          zip: updated.location_zip,
          city: updated.location_city,
        },
        waterRate: {
          perGallon: updated.water_rate_per_gallon,
          currency: updated.currency,
        },
        weather: {
          enabled: Boolean(updated.weather_enabled),
          apiKey: updated.weather_api_key ? '***' : null,
          smartSkipEnabled: Boolean(updated.smart_skip_enabled),
          rainThreshold: updated.rain_threshold,
        },
      }
    };

    // Add zone initialization info if zones were initialized
    if (zonesInitialized && zoneInitInfo) {
      response.zonesInitialized = true;
      response.zoneInfo = zoneInitInfo;
      response.message = `Settings updated. ${zoneInitInfo.message}`;
    }

    res.json(response);
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update system settings'
    });
  }
};

/**
 * Get available use case profiles
 * GET /api/settings/profiles
 */
const getUseCaseProfiles = async (req, res) => {
  try {
    const profiles = getProfileOptions();

    res.json({
      success: true,
      profiles
    });
  } catch (error) {
    logger.error('Error getting use case profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get use case profiles'
    });
  }
};

/**
 * Get specific profile details with recommendations
 * GET /api/settings/profiles/:profileId
 */
const getProfileDetails = async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = getProfile(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        icon: profile.icon,
        description: profile.description,
        strategy: profile.strategy,
        weather: profile.weather,
        metrics: profile.metrics,
        recommendations: profile.recommendations,
        zoneDefaults: profile.zoneDefaults,
        cropTypes: profile.cropTypes || null,
      }
    });
  } catch (error) {
    logger.error('Error getting profile details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile details'
    });
  }
};

/**
 * Get available Rain Bird controller models
 * GET /api/settings/controllers
 */
const getControllerModels = async (req, res) => {
  try {
    const controllers = getAllControllers();

    res.json({
      success: true,
      controllers: controllers.map(ctrl => ({
        id: ctrl.id,
        name: ctrl.name,
        manufacturer: ctrl.manufacturer,
        description: ctrl.description,
        maxZones: ctrl.max_zones,
        zoneCount: ctrl.max_zones,  // Alias for mobile app compatibility
        expandableTo: ctrl.expandable_to,
        maxConcurrentZones: ctrl.max_concurrent_zones,
        type: ctrl.features?.includes('wifi') ? 'WiFi' : ctrl.features?.includes('bluetooth') ? 'Bluetooth' : 'Wired',
        features: ctrl.features,
      }))
    });
  } catch (error) {
    logger.error('Error getting controller models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get controller models'
    });
  }
};

/**
 * Get specific controller details
 * GET /api/settings/controllers/:controllerId
 */
const getControllerDetails = async (req, res) => {
  try {
    const { controllerId } = req.params;
    const controller = getControllerConfig(controllerId);

    if (!controller) {
      return res.status(404).json({
        success: false,
        error: 'Controller not found'
      });
    }

    res.json({
      success: true,
      controller: {
        id: controller.id,
        name: controller.name,
        manufacturer: controller.manufacturer,
        description: controller.description,
        maxZones: controller.max_zones,
        zoneCount: controller.max_zones,  // Alias for mobile app compatibility
        expandableTo: controller.expandable_to,
        maxConcurrentZones: controller.max_concurrent_zones,
        type: controller.features?.includes('wifi') ? 'WiFi' : controller.features?.includes('bluetooth') ? 'Bluetooth' : 'Wired',
        features: controller.features,
        recommendedFor: controller.recommended_for,
        supportsMasterValve: controller.supports_master_valve,
        supportsRainSensor: controller.supports_rain_sensor,
        supportsFlowSensor: controller.supports_flow_sensor,
      }
    });
  } catch (error) {
    logger.error('Error getting controller details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get controller details'
    });
  }
};

/**
 * Get all manufacturers
 * GET /api/settings/manufacturers
 */
const getManufacturers = async (req, res) => {
  try {
    const manufacturers = getAllManufacturers();

    res.json({
      success: true,
      manufacturers: manufacturers.map(mfr => ({
        id: mfr.id,
        name: mfr.name,
        description: mfr.description,
        marketPosition: mfr.market_position,
        specialties: mfr.specialties,
        popularSeries: mfr.popular_series,
        featuresKnownFor: mfr.features_known_for,
      }))
    });
  } catch (error) {
    logger.error('Error getting manufacturers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get manufacturers'
    });
  }
};

/**
 * Get specific manufacturer details
 * GET /api/settings/manufacturers/:manufacturerId
 */
const getManufacturerDetails = async (req, res) => {
  try {
    const { manufacturerId } = req.params;
    const manufacturer = getManufacturer(manufacturerId);

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        error: 'Manufacturer not found'
      });
    }

    res.json({
      success: true,
      manufacturer: {
        id: manufacturer.id,
        name: manufacturer.name,
        description: manufacturer.description,
        founded: manufacturer.founded,
        headquarters: manufacturer.headquarters,
        marketPosition: manufacturer.market_position,
        specialties: manufacturer.specialties,
        website: manufacturer.website,
        popularSeries: manufacturer.popular_series,
        featuresKnownFor: manufacturer.features_known_for,
      }
    });
  } catch (error) {
    logger.error('Error getting manufacturer details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get manufacturer details'
    });
  }
};

/**
 * Get controllers by manufacturer
 * GET /api/settings/manufacturers/:manufacturerId/controllers
 */
const getControllersByMfr = async (req, res) => {
  try {
    const { manufacturerId } = req.params;
    const controllers = getControllersByManufacturer(manufacturerId);

    if (!controllers || controllers.length === 0) {
      return res.json({
        success: true,
        controllers: [],
        message: 'No controllers found for this manufacturer'
      });
    }

    res.json({
      success: true,
      controllers: controllers.map(ctrl => ({
        id: ctrl.id,
        name: ctrl.name,
        manufacturer: ctrl.manufacturer,
        description: ctrl.description,
        maxZones: ctrl.max_zones,
        zoneCount: ctrl.max_zones,  // Alias for mobile app compatibility
        expandableTo: ctrl.expandable_to,
        maxConcurrentZones: ctrl.max_concurrent_zones,
        type: ctrl.features?.includes('wifi') ? 'WiFi' : ctrl.features?.includes('bluetooth') ? 'Bluetooth' : 'Wired',
        features: ctrl.features,
      }))
    });
  } catch (error) {
    logger.error('Error getting controllers by manufacturer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get controllers'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getUseCaseProfiles,
  getProfileDetails,
  getControllerModels,
  getControllerDetails,
  getManufacturers,
  getManufacturerDetails,
  getControllersByMfr,
};
