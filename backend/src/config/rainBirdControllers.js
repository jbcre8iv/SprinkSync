/**
 * SprinkSync - Rain Bird Controller Models
 *
 * Comprehensive configuration profiles for all Rain Bird irrigation controller models.
 * Each model defines its capabilities and recommended settings.
 *
 * Based on official Rain Bird product specifications (2024)
 */

/**
 * Rain Bird Controller Model Configurations
 */
const RAINBIRD_CONTROLLERS = {
  // ========== ESP SERIES - RESIDENTIAL & LIGHT COMMERCIAL ==========

  'esp-me': {
    id: 'esp-me',
    name: 'ESP-Me',
    manufacturer: 'Rain Bird',
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
    manufacturer: 'Rain Bird',
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

  'esp-rzx4': {
    id: 'esp-rzx4',
    name: 'ESP-RZX 4-Station',
    manufacturer: 'Rain Bird',
    description: 'Outdoor 4-station controller',
    max_zones: 4,
    expandable_to: 4,
    max_concurrent_zones: 1,
    features: ['seasonal_adjust', 'easy_retrieve'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-rzx6': {
    id: 'esp-rzx6',
    name: 'ESP-RZX 6-Station',
    manufacturer: 'Rain Bird',
    description: 'Outdoor 6-station controller',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 1,
    features: ['seasonal_adjust', 'easy_retrieve'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-rzx8': {
    id: 'esp-rzx8',
    name: 'ESP-RZX 8-Station',
    manufacturer: 'Rain Bird',
    description: 'Outdoor 8-station controller',
    max_zones: 8,
    expandable_to: 8,
    max_concurrent_zones: 2,
    features: ['seasonal_adjust', 'easy_retrieve'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-rzxe4': {
    id: 'esp-rzxe4',
    name: 'ESP-RZXe 4-Station',
    manufacturer: 'Rain Bird',
    description: 'Outdoor WiFi controller - 4 zones',
    max_zones: 4,
    expandable_to: 4,
    max_concurrent_zones: 1,
    features: ['wifi', 'app_control', 'weather_integration', 'seasonal_adjust'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-rzxe6': {
    id: 'esp-rzxe6',
    name: 'ESP-RZXe 6-Station',
    manufacturer: 'Rain Bird',
    description: 'Outdoor WiFi controller - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 2,
    features: ['wifi', 'app_control', 'weather_integration', 'seasonal_adjust'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-rzxe8': {
    id: 'esp-rzxe8',
    name: 'ESP-RZXe 8-Station',
    manufacturer: 'Rain Bird',
    description: 'Outdoor WiFi controller - 8 zones',
    max_zones: 8,
    expandable_to: 8,
    max_concurrent_zones: 2,
    features: ['wifi', 'app_control', 'weather_integration', 'seasonal_adjust'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-tm2-4': {
    id: 'esp-tm2-4',
    name: 'ESP-TM2 4-Station',
    manufacturer: 'Rain Bird',
    description: 'Indoor/Outdoor controller - 4 zones',
    max_zones: 4,
    expandable_to: 4,
    max_concurrent_zones: 1,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-tm2-6': {
    id: 'esp-tm2-6',
    name: 'ESP-TM2 6-Station',
    manufacturer: 'Rain Bird',
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
    manufacturer: 'Rain Bird',
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
    manufacturer: 'Rain Bird',
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

  'esp-lxivm-4': {
    id: 'esp-lxivm-4',
    name: 'ESP-LXIVM 4-Station',
    manufacturer: 'Rain Bird',
    description: 'Indoor/Outdoor modular controller - 4 zones',
    max_zones: 4,
    expandable_to: 4,
    max_concurrent_zones: 1,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-lxivm-6': {
    id: 'esp-lxivm-6',
    name: 'ESP-LXIVM 6-Station',
    manufacturer: 'Rain Bird',
    description: 'Indoor/Outdoor modular controller - 6 zones',
    max_zones: 6,
    expandable_to: 6,
    max_concurrent_zones: 2,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'esp-lxivm-9': {
    id: 'esp-lxivm-9',
    name: 'ESP-LXIVM 9-Station',
    manufacturer: 'Rain Bird',
    description: 'Indoor/Outdoor modular controller - 9 zones',
    max_zones: 9,
    expandable_to: 9,
    max_concurrent_zones: 2,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs'],
    recommended_for: ['residential_lawn', 'landscaping', 'vineyard'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'esp-lxivm-12': {
    id: 'esp-lxivm-12',
    name: 'ESP-LXIVM 12-Station',
    manufacturer: 'Rain Bird',
    description: 'Indoor/Outdoor modular controller - 12 zones',
    max_zones: 12,
    expandable_to: 12,
    max_concurrent_zones: 2,
    features: ['advanced_scheduling', 'seasonal_adjust', 'multiple_programs'],
    recommended_for: ['residential_lawn', 'landscaping', 'vineyard', 'orchard'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'esp-lx-basic': {
    id: 'esp-lx-basic',
    name: 'ESP-LX Basic',
    manufacturer: 'Rain Bird',
    description: 'Entry-level modular controller, expandable to 22 zones',
    max_zones: 6,
    expandable_to: 22,
    max_concurrent_zones: 1,
    features: ['basic_scheduling', 'seasonal_adjust', 'modular_expansion'],
    recommended_for: ['residential_lawn', 'small_garden'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'esp-lx': {
    id: 'esp-lx',
    name: 'ESP-LX',
    manufacturer: 'Rain Bird',
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

  'esp-lxme': {
    id: 'esp-lxme',
    name: 'ESP-LXMe',
    manufacturer: 'Rain Bird',
    description: 'ESP-LX with WiFi module, expandable to 22 zones',
    max_zones: 22,
    expandable_to: 22,
    max_concurrent_zones: 2,
    features: ['wifi', 'app_control', 'weather_integration', 'advanced_scheduling', 'modular_expansion'],
    recommended_for: ['motocross_track', 'golf_course', 'sports_field', 'commercial'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  // ========== ST8 SERIES - SMART RESIDENTIAL ==========

  'st8-2-outdoor': {
    id: 'st8-2-outdoor',
    name: 'ST8-2.0 WiFi Outdoor',
    manufacturer: 'Rain Bird',
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

  'st8-2-indoor': {
    id: 'st8-2-indoor',
    name: 'ST8I-2.0 WiFi Indoor',
    manufacturer: 'Rain Bird',
    description: '8-zone indoor WiFi smart controller',
    max_zones: 8,
    expandable_to: 8,
    max_concurrent_zones: 2,
    features: ['wifi', 'app_control', 'weather_integration', 'seasonal_adjust', 'voice_control'],
    recommended_for: ['residential_lawn', 'landscaping'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  // ========== COMMERCIAL SATELLITE CONTROLLERS ==========

  'esp-smte': {
    id: 'esp-smte',
    name: 'ESP-SMTe',
    manufacturer: 'Rain Bird',
    description: 'Commercial satellite controller, expandable to 48 zones',
    max_zones: 36,
    expandable_to: 48,
    max_concurrent_zones: 4,
    features: ['commercial', 'central_control', 'flow_monitoring', 'advanced_diagnostics', 'modular_expansion'],
    recommended_for: ['golf_course', 'commercial', 'parks', 'campus'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  // ========== IQ4 SERIES - CLOUD-BASED COMMERCIAL ==========

  'iq4-600': {
    id: 'iq4-600',
    name: 'IQ4-600',
    manufacturer: 'Rain Bird',
    description: 'Cloud-based commercial controller, 6-60 zones',
    max_zones: 60,
    expandable_to: 60,
    max_concurrent_zones: 4,
    features: ['cloud_based', 'wifi', 'cellular', 'weather_integration', 'flow_monitoring', 'advanced_diagnostics', 'remote_management'],
    recommended_for: ['golf_course', 'commercial', 'parks', 'campus', 'sports_field'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'iq4-1200': {
    id: 'iq4-1200',
    name: 'IQ4-1200',
    manufacturer: 'Rain Bird',
    description: 'Cloud-based commercial controller, 12-120 zones',
    max_zones: 120,
    expandable_to: 120,
    max_concurrent_zones: 6,
    features: ['cloud_based', 'wifi', 'cellular', 'weather_integration', 'flow_monitoring', 'advanced_diagnostics', 'remote_management'],
    recommended_for: ['golf_course', 'commercial', 'parks', 'campus', 'sports_field'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  // ========== IC SYSTEM - CENTRAL CONTROL ==========

  'ic-600-ss': {
    id: 'ic-600-ss',
    name: 'IC-600-SS',
    manufacturer: 'Rain Bird',
    description: 'Standard satellite controller, 6-60 zones (IC System)',
    max_zones: 60,
    expandable_to: 60,
    max_concurrent_zones: 4,
    features: ['central_control', 'commercial', 'advanced_scheduling', 'multiple_programs'],
    recommended_for: ['golf_course', 'commercial', 'parks', 'campus'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: false
  },

  'ic-600-fs': {
    id: 'ic-600-fs',
    name: 'IC-600-FS',
    manufacturer: 'Rain Bird',
    description: 'Flow satellite controller, 6-60 zones (IC System)',
    max_zones: 60,
    expandable_to: 60,
    max_concurrent_zones: 4,
    features: ['central_control', 'commercial', 'flow_monitoring', 'advanced_diagnostics', 'multiple_programs'],
    recommended_for: ['golf_course', 'commercial', 'parks', 'campus'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  // ========== PROFESSIONAL SYSTEMS ==========

  'maxicom2': {
    id: 'maxicom2',
    name: 'Maxicom2',
    manufacturer: 'Rain Bird',
    description: 'Large-scale central control system for golf courses',
    max_zones: 999,
    expandable_to: 999,
    max_concurrent_zones: 20,
    features: ['central_control', 'golf_specific', 'weather_integration', 'flow_monitoring', 'pump_control', 'advanced_diagnostics'],
    recommended_for: ['golf_course'],
    supports_master_valve: true,
    supports_rain_sensor: true,
    supports_flow_sensor: true
  },

  'stp-plus': {
    id: 'stp-plus',
    name: 'STP-PLUS',
    manufacturer: 'Rain Bird',
    description: 'Professional turf pump station controller',
    max_zones: 1,
    expandable_to: 1,
    max_concurrent_zones: 1,
    features: ['pump_control', 'pressure_regulation', 'flow_monitoring', 'advanced_diagnostics'],
    recommended_for: ['golf_course', 'sports_field', 'commercial'],
    supports_master_valve: false,
    supports_rain_sensor: false,
    supports_flow_sensor: true
  },

  // ========== CUSTOM/GENERIC ==========

  'custom': {
    id: 'custom',
    name: 'Custom Configuration',
    manufacturer: 'Generic',
    description: 'Manual configuration for non-Rain Bird or custom systems',
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
  return RAINBIRD_CONTROLLERS[modelId] || null;
};

/**
 * Get all available controller models
 * @returns {Array} - Array of controller configurations
 */
const getAllControllers = () => {
  return Object.values(RAINBIRD_CONTROLLERS);
};

/**
 * Get controllers recommended for a specific use case
 * @param {string} useCase - Use case profile ID
 * @returns {Array} - Array of recommended controllers
 */
const getRecommendedControllers = (useCase) => {
  return Object.values(RAINBIRD_CONTROLLERS).filter(controller =>
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

/**
 * Get controllers by series
 * @param {string} series - Series name (e.g., 'ESP', 'IQ4', 'ST8')
 * @returns {Array} - Array of controllers in that series
 */
const getControllersBySeries = (series) => {
  const seriesPrefix = series.toLowerCase();
  return Object.values(RAINBIRD_CONTROLLERS).filter(controller =>
    controller.id.startsWith(seriesPrefix) ||
    controller.name.toLowerCase().startsWith(seriesPrefix)
  );
};

module.exports = {
  RAINBIRD_CONTROLLERS,
  getControllerConfig,
  getAllControllers,
  getRecommendedControllers,
  isZoneCountCompatible,
  getControllersBySeries
};
