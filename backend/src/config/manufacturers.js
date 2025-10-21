/**
 * SprinkSync - Controller Manufacturers
 *
 * Comprehensive list of supported irrigation controller manufacturers.
 * Each manufacturer includes brand info, market position, and popular models.
 */

/**
 * Controller Manufacturer Configurations
 */
const MANUFACTURERS = {
  'rain-bird': {
    id: 'rain-bird',
    name: 'Rain Bird',
    description: 'Premium irrigation controllers with smart technology',
    logo_url: null, // Can be added later
    founded: 1933,
    headquarters: 'Azusa, California',
    market_position: 'Premium',
    specialties: ['residential', 'commercial', 'golf_course', 'smart_technology'],
    website: 'https://www.rainbird.com',
    popular_series: ['ESP-Me', 'ESP-TM2', 'ESP-LX', 'ST8-2.0', 'IQ4'],
    features_known_for: ['wifi_connectivity', 'weather_integration', 'modular_design', 'professional_grade']
  },

  'hunter': {
    id: 'hunter',
    name: 'Hunter Industries',
    description: 'Industry-leading controllers for residential and commercial use',
    logo_url: null,
    founded: 1981,
    headquarters: 'San Marcos, California',
    market_position: 'Premium',
    specialties: ['residential', 'commercial', 'sports_field', 'smart_technology'],
    website: 'https://www.hunterindustries.com',
    popular_series: ['Pro-C', 'X-Core', 'X2', 'ICC2', 'Hydrawise'],
    features_known_for: ['reliability', 'weather_sensing', 'solar_compatible', 'hybrid_control']
  },

  'orbit': {
    id: 'orbit',
    name: 'Orbit Irrigation',
    description: 'Affordable smart irrigation solutions for homeowners',
    logo_url: null,
    founded: 1986,
    headquarters: 'Bountiful, Utah',
    market_position: 'Value',
    specialties: ['residential', 'small_garden', 'budget_friendly', 'smart_technology'],
    website: 'https://www.orbitonline.com',
    popular_series: ['B-hyve', 'Easy Dial', '6-Station Timer'],
    features_known_for: ['affordability', 'wifi_enabled', 'app_control', 'easy_installation']
  },

  'toro': {
    id: 'toro',
    name: 'Toro',
    description: 'Professional-grade controllers for demanding applications',
    logo_url: null,
    founded: 1914,
    headquarters: 'Bloomington, Minnesota',
    market_position: 'Premium',
    specialties: ['golf_course', 'commercial', 'sports_field', 'professional'],
    website: 'https://www.toro.com',
    popular_series: ['DDC', 'Evolution', 'Lynx', 'Sentinel'],
    features_known_for: ['professional_grade', 'central_control', 'golf_optimization', 'precision']
  }
};

/**
 * Get manufacturer configuration
 * @param {string} manufacturerId - Manufacturer ID
 * @returns {object|null} - Manufacturer configuration or null
 */
const getManufacturer = (manufacturerId) => {
  return MANUFACTURERS[manufacturerId] || null;
};

/**
 * Get all manufacturers
 * @returns {Array} - Array of manufacturer configurations
 */
const getAllManufacturers = () => {
  return Object.values(MANUFACTURERS);
};

/**
 * Get manufacturers by market position
 * @param {string} position - Market position ('premium', 'value')
 * @returns {Array} - Array of manufacturers
 */
const getManufacturersByMarket = (position) => {
  return Object.values(MANUFACTURERS).filter(mfr =>
    mfr.market_position.toLowerCase() === position.toLowerCase()
  );
};

/**
 * Get manufacturers by specialty
 * @param {string} specialty - Specialty area (e.g., 'residential', 'commercial')
 * @returns {Array} - Array of manufacturers
 */
const getManufacturersBySpecialty = (specialty) => {
  return Object.values(MANUFACTURERS).filter(mfr =>
    mfr.specialties.includes(specialty)
  );
};

module.exports = {
  MANUFACTURERS,
  getManufacturer,
  getAllManufacturers,
  getManufacturersByMarket,
  getManufacturersBySpecialty
};
