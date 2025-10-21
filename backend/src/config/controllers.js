/**
 * SprinkSync - Multi-Brand Controller Library
 *
 * Comprehensive configuration profiles for irrigation controllers from all major manufacturers.
 * Includes Rain Bird, Hunter, Orbit, Toro, and other popular brands.
 *
 * Each model defines its capabilities and recommended settings.
 */

/**
 * All Controller Configurations (Organized by Manufacturer)
 */
const CONTROLLERS = {

  // ==================== RAIN BIRD ====================

  // ESP SERIES - RESIDENTIAL & LIGHT COMMERCIAL
  'esp-me': {
    id: 'esp-me',
    name: 'ESP-Me',
    manufacturer: 'rain-bird',
    description: '3-zone WiFi controller with app control',
    max_zones: 3,
    expandable_to: 3,
    max_concurrent_zones: 1,
    features: ['wifi', 'app_control', 'weather_integration', 'cloud_based'],
    recommended_for: ['small_garden', 'container_garden'],
    supports_master_valve: false,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-4me': {
    id: 'esp-4me',
    name: 'ESP-4Me',
    manufacturer: 'rain-bird',
    description: '4-zone WiFi controller with smart features',
    max_zones: 4,
    expandable_to: 4,
    max_concurrent_zones: 1,
    features: ['wifi', 'app_control', 'weather_integration', 'seasonal_adjust'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-tm2-6': {
    id: 'esp-tm2-6',
    name: 'ESP-TM2 6-Station',
    manufacturer: 'rain-bird',
    description: 'Indoor/Outdoor controller - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 2,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'esp-tm2-8': {
    id: 'esp-tm2-8',
    name: 'ESP-TM2 8-Station',
    manufacturer: 'rain-bird',
    description: 'Indoor/Outdoor controller - 8 zones',
    max_zones: 8,
    expandable_to: 8,
    max_concurrent_zones: 2,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs'],
    recommended_for: ['residential_lawn', 'landscaping', 'vineyard'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'esp-tm2-12': {
    id: 'esp-tm2-12',
    name: 'ESP-TM2 12-Station',
    manufacturer: 'rain-bird',
    description: 'Indoor/Outdoor controller - 12 zones',
    max_zones: 12,
    expandable_to: 12,
    max_concurrent_zones: 2,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs'],
    recommended_for: ['residential_lawn', 'vineyard', 'orchard'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'esp-lx': {
    id: 'esp-lx',
    name: 'ESP-LX',
    manufacturer: 'rain-bird',
    description: 'Professional modular controller, expandable to 22 zones',
    max_zones: 22,
    expandable_to: 22,
    max_concurrent_zones: 2,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs', 'modular_expansion'],
    recommended_for: ['motocross_track', 'golf_course', 'sports_field', 'commercial'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'st8-2-outdoor': {
    id: 'st8-2-outdoor',
    name: 'ST8-2.0 WiFi Outdoor',
    manufacturer: 'rain-bird',
    description: '8-zone outdoor WiFi smart controller',
    max_zones: 8,
    expandable_to: 8,
    max_concurrent_zones: 2,
    features: ['wifi', 'app_control', 'weather_integration', 'seasonal_adjust', 'voice_control'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  // ==================== HUNTER ====================

  'hunter-pro-c-6': {
    id: 'hunter-pro-c-6',
    name: 'Pro-C 6-Station',
    manufacturer: 'hunter',
    description: 'Professional outdoor controller - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 2,
    features: ['easy_retrieve', 'seasonal_adjust', 'non_volatile_memory'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'hunter-pro-c-12': {
    id: 'hunter-pro-c-12',
    name: 'Pro-C 12-Station',
    manufacturer: 'hunter',
    description: 'Professional outdoor controller - 12 zones',
    max_zones: 12,
    expandable_to: 12,
    max_concurrent_zones: 2,
    features: ['easy_retrieve', 'seasonal_adjust', 'non_volatile_memory'],
    recommended_for: ['residential_lawn', 'landscaping', 'vineyard'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'hunter-x-core-6': {
    id: 'hunter-x-core-6',
    name: 'X-Core 6-Station',
    manufacturer: 'hunter',
    description: 'Indoor/Outdoor controller - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 1,
    features: ['easy_retrieve', 'seasonal_adjust', 'simple_programming'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'hunter-x-core-8': {
    id: 'hunter-x-core-8',
    name: 'X-Core 8-Station',
    manufacturer: 'hunter',
    description: 'Indoor/Outdoor controller - 8 zones',
    max_zones: 8,
    expandable_to: 8,
    max_concurrent_zones: 2,
    features: ['easy_retrieve', 'seasonal_adjust', 'simple_programming'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'hunter-x2-8': {
    id: 'hunter-x2-8',
    name: 'X2 8-Station',
    manufacturer: 'hunter',
    description: 'Commercial modular controller - 8 zones',
    max_zones: 8,
    expandable_to: 32,
    max_concurrent_zones: 3,
    features: ['modular_expansion', 'advanced_scheduling', 'flow_management', 'remote_capable'],
    recommended_for: ['commercial', 'sports_field', 'parks'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'hunter-x2-16': {
    id: 'hunter-x2-16',
    name: 'X2 16-Station',
    manufacturer: 'hunter',
    description: 'Commercial modular controller - 16 zones',
    max_zones: 16,
    expandable_to: 32,
    max_concurrent_zones: 4,
    features: ['modular_expansion', 'advanced_scheduling', 'flow_management', 'remote_capable'],
    recommended_for: ['commercial', 'motocross_track', 'sports_field', 'parks'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'hunter-icc2-12': {
    id: 'hunter-icc2-12',
    name: 'ICC2 12-Station',
    manufacturer: 'hunter',
    description: 'Commercial central control - 12 zones',
    max_zones: 12,
    expandable_to: 54,
    max_concurrent_zones: 4,
    features: ['central_control', 'commercial', 'flow_management', 'advanced_diagnostics'],
    recommended_for: ['golf_course', 'commercial', 'parks', 'campus'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'hunter-icc2-24': {
    id: 'hunter-icc2-24',
    name: 'ICC2 24-Station',
    manufacturer: 'hunter',
    description: 'Commercial central control - 24 zones',
    max_zones: 24,
    expandable_to: 54,
    max_concurrent_zones: 6,
    features: ['central_control', 'commercial', 'flow_management', 'advanced_diagnostics'],
    recommended_for: ['golf_course', 'commercial', 'motocross_track', 'parks', 'campus'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'hunter-hydrawise-6': {
    id: 'hunter-hydrawise-6',
    name: 'Hydrawise HC 6-Zone',
    manufacturer: 'hunter',
    description: 'WiFi smart controller - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 2,
    features: ['wifi', 'app_control', 'weather_integration', 'predictive_watering', 'cloud_based'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'hunter-hydrawise-12': {
    id: 'hunter-hydrawise-12',
    name: 'Hydrawise HC 12-Zone',
    manufacturer: 'hunter',
    description: 'WiFi smart controller - 12 zones',
    max_zones: 12,
    expandable_to: 12,
    max_concurrent_zones: 3,
    features: ['wifi', 'app_control', 'weather_integration', 'predictive_watering', 'cloud_based'],
    recommended_for: ['residential_lawn', 'landscaping', 'vineyard'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  // ==================== ORBIT ====================

  'orbit-bhyve-6': {
    id: 'orbit-bhyve-6',
    name: 'B-hyve 6-Zone',
    manufacturer: 'orbit',
    description: 'WiFi smart timer - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 1,
    features: ['wifi', 'app_control', 'weather_integration', 'voice_control', 'budget_friendly'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'orbit-bhyve-8': {
    id: 'orbit-bhyve-8',
    name: 'B-hyve 8-Zone Indoor',
    manufacturer: 'orbit',
    description: 'WiFi smart timer - 8 zones',
    max_zones: 8,
    expandable_to: 8,
    max_concurrent_zones: 2,
    features: ['wifi', 'app_control', 'weather_integration', 'voice_control', 'budget_friendly'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'orbit-bhyve-12': {
    id: 'orbit-bhyve-12',
    name: 'B-hyve 12-Zone',
    manufacturer: 'orbit',
    description: 'WiFi smart timer - 12 zones',
    max_zones: 12,
    expandable_to: 12,
    max_concurrent_zones: 2,
    features: ['wifi', 'app_control', 'weather_integration', 'voice_control', 'budget_friendly'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'orbit-easy-dial-6': {
    id: 'orbit-easy-dial-6',
    name: 'Easy Dial 6-Station',
    manufacturer: 'orbit',
    description: 'Simple dial controller - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 1,
    features: ['simple_programming', 'budget_friendly'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'orbit-easy-dial-9': {
    id: 'orbit-easy-dial-9',
    name: 'Easy Dial 9-Station',
    manufacturer: 'orbit',
    description: 'Simple dial controller - 9 zones',
    max_zones: 9,
    expandable_to: 9,
    max_concurrent_zones: 1,
    features: ['simple_programming', 'budget_friendly'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  // ==================== TORO ====================

  'toro-ddc-6': {
    id: 'toro-ddc-6',
    name: 'DDC 6-Station',
    manufacturer: 'toro',
    description: 'Dual-dial controller - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 2,
    features: ['dual_dial', 'seasonal_adjust', 'professional_grade'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'toro-ddc-8': {
    id: 'toro-ddc-8',
    name: 'DDC 8-Station',
    manufacturer: 'toro',
    description: 'Dual-dial controller - 8 zones',
    max_zones: 8,
    expandable_to: 8,
    max_concurrent_zones: 2,
    features: ['dual_dial', 'seasonal_adjust', 'professional_grade'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'toro-ddc-12': {
    id: 'toro-ddc-12',
    name: 'DDC 12-Station',
    manufacturer: 'toro',
    description: 'Dual-dial controller - 12 zones',
    max_zones: 12,
    expandable_to: 12,
    max_concurrent_zones: 3,
    features: ['dual_dial', 'seasonal_adjust', 'professional_grade'],
    recommended_for: ['residential_lawn', 'landscaping', 'vineyard'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'toro-evolution-18': {
    id: 'toro-evolution-18',
    name: 'Evolution Series 18-Station',
    manufacturer: 'toro',
    description: 'Professional controller - 18 zones',
    max_zones: 18,
    expandable_to: 36,
    max_concurrent_zones: 4,
    features: ['professional_grade', 'modular_expansion', 'advanced_scheduling', 'flow_management'],
    recommended_for: ['commercial', 'motocross_track', 'sports_field', 'parks'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'toro-evolution-36': {
    id: 'toro-evolution-36',
    name: 'Evolution Series 36-Station',
    manufacturer: 'toro',
    description: 'Professional controller - 36 zones',
    max_zones: 36,
    expandable_to: 72,
    max_concurrent_zones: 6,
    features: ['professional_grade', 'modular_expansion', 'advanced_scheduling', 'flow_management'],
    recommended_for: ['golf_course', 'commercial', 'parks', 'campus'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'toro-lynx-smart': {
    id: 'toro-lynx-smart',
    name: 'Lynx Smart Module',
    manufacturer: 'toro',
    description: 'WiFi-enabled central control module',
    max_zones: 48,
    expandable_to: 200,
    max_concurrent_zones: 8,
    features: ['wifi', 'central_control', 'cloud_based', 'weather_integration', 'golf_specific'],
    recommended_for: ['golf_course', 'commercial'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'toro-sentinel-8': {
    id: 'toro-sentinel-8',
    name: 'Sentinel 8-Zone',
    manufacturer: 'toro',
    description: 'Commercial decoder controller - 8 zones',
    max_zones: 8,
    expandable_to: 48,
    max_concurrent_zones: 4,
    features: ['decoder_system', 'commercial', 'two_wire', 'advanced_diagnostics'],
    recommended_for: ['commercial', 'sports_field', 'parks'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'toro-sentinel-16': {
    id: 'toro-sentinel-16',
    name: 'Sentinel 16-Zone',
    manufacturer: 'toro',
    description: 'Commercial decoder controller - 16 zones',
    max_zones: 16,
    expandable_to: 48,
    max_concurrent_zones: 6,
    features: ['decoder_system', 'commercial', 'two_wire', 'advanced_diagnostics'],
    recommended_for: ['commercial', 'sports_field', 'motocross_track', 'parks'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  // ==================== CUSTOM/GENERIC ====================

  'custom': {
    id: 'custom',
    name: 'Custom Configuration',
    manufacturer: 'custom',
    description: 'Manual configuration for custom or unlisted systems',
    max_zones: 22,
    expandable_to: 48,
    max_concurrent_zones: 2,
    features: ['custom'],
    recommended_for: ['custom'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  }
};

/**
 * Get controller model configuration
 * @param {string} modelId - Controller model ID
 * @returns {object|null} - Controller configuration or null
 */
const getControllerConfig = (modelId) => {
  return CONTROLLERS[modelId] || null;
};

/**
 * Get all available controller models
 * @returns {Array} - Array of controller configurations
 */
const getAllControllers = () => {
  return Object.values(CONTROLLERS);
};

/**
 * Get controllers by manufacturer
 * @param {string} manufacturerId - Manufacturer ID (e.g., 'rain-bird', 'hunter')
 * @returns {Array} - Array of controllers from that manufacturer
 */
const getControllersByManufacturer = (manufacturerId) => {
  return Object.values(CONTROLLERS).filter(controller =>
    controller.manufacturer === manufacturerId
  );
};

/**
 * Get controllers recommended for a specific use case
 * @param {string} useCase - Use case profile ID
 * @returns {Array} - Array of recommended controllers
 */
const getRecommendedControllers = (useCase) => {
  return Object.values(CONTROLLERS).filter(controller =>
    controller.recommended_for.includes(useCase)
  );
};

/**
 * Validate if zone count is compatible with controller
 * @param {string} modelId - Controller model ID
 * @param {number} zoneCount - Desired zone count
 * @returns {boolean} - True if compatible
 */
const isZoneCountCompatible = (modelId, zoneCount) => {
  const controller = getControllerConfig(modelId);
  if (!controller) return false;
  return zoneCount <= controller.expandable_to;
};

module.exports = {
  CONTROLLERS,
  getControllerConfig,
  getAllControllers,
  getControllersByManufacturer,
  getRecommendedControllers,
  isZoneCountCompatible
};
