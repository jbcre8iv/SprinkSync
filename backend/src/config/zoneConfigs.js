/**
 * SprinkSync - Zone Configuration Presets
 *
 * Predefined zone configurations matching standard irrigation controller sizes.
 * Maps zone count to GPIO pin assignments.
 */

/**
 * Standard zone configurations
 * Matches Rain Bird and other major irrigation controller configurations
 */
const ZONE_CONFIGS = {
  4: {
    name: '4-Zone System',
    description: 'Small residential (up to 4 zones)',
    zones: [
      { id: 1, name: 'Zone 1', gpio_pin: 17 },
      { id: 2, name: 'Zone 2', gpio_pin: 27 },
      { id: 3, name: 'Zone 3', gpio_pin: 22 },
      { id: 4, name: 'Zone 4', gpio_pin: 23 }
    ]
  },
  6: {
    name: '6-Zone System',
    description: 'Medium residential (up to 6 zones)',
    zones: [
      { id: 1, name: 'Zone 1', gpio_pin: 17 },
      { id: 2, name: 'Zone 2', gpio_pin: 27 },
      { id: 3, name: 'Zone 3', gpio_pin: 22 },
      { id: 4, name: 'Zone 4', gpio_pin: 23 },
      { id: 5, name: 'Zone 5', gpio_pin: 24 },
      { id: 6, name: 'Zone 6', gpio_pin: 25 }
    ]
  },
  8: {
    name: '8-Zone System',
    description: 'Large residential/Small commercial (up to 8 zones)',
    zones: [
      { id: 1, name: 'Zone 1', gpio_pin: 17 },
      { id: 2, name: 'Zone 2', gpio_pin: 27 },
      { id: 3, name: 'Zone 3', gpio_pin: 22 },
      { id: 4, name: 'Zone 4', gpio_pin: 23 },
      { id: 5, name: 'Zone 5', gpio_pin: 24 },
      { id: 6, name: 'Zone 6', gpio_pin: 25 },
      { id: 7, name: 'Zone 7', gpio_pin: 5 },
      { id: 8, name: 'Zone 8', gpio_pin: 6 }
    ]
  },
  12: {
    name: '12-Zone System',
    description: 'Commercial/Large property (up to 12 zones)',
    zones: [
      { id: 1, name: 'Zone 1', gpio_pin: 17 },
      { id: 2, name: 'Zone 2', gpio_pin: 27 },
      { id: 3, name: 'Zone 3', gpio_pin: 22 },
      { id: 4, name: 'Zone 4', gpio_pin: 23 },
      { id: 5, name: 'Zone 5', gpio_pin: 24 },
      { id: 6, name: 'Zone 6', gpio_pin: 25 },
      { id: 7, name: 'Zone 7', gpio_pin: 5 },
      { id: 8, name: 'Zone 8', gpio_pin: 6 },
      { id: 9, name: 'Zone 9', gpio_pin: 12 },
      { id: 10, name: 'Zone 10', gpio_pin: 13 },
      { id: 11, name: 'Zone 11', gpio_pin: 16 },
      { id: 12, name: 'Zone 12', gpio_pin: 19 }
    ]
  },
  18: {
    name: '18-Zone System',
    description: 'Large commercial (up to 18 zones)',
    zones: [
      { id: 1, name: 'Zone 1', gpio_pin: 17 },
      { id: 2, name: 'Zone 2', gpio_pin: 27 },
      { id: 3, name: 'Zone 3', gpio_pin: 22 },
      { id: 4, name: 'Zone 4', gpio_pin: 23 },
      { id: 5, name: 'Zone 5', gpio_pin: 24 },
      { id: 6, name: 'Zone 6', gpio_pin: 25 },
      { id: 7, name: 'Zone 7', gpio_pin: 5 },
      { id: 8, name: 'Zone 8', gpio_pin: 6 },
      { id: 9, name: 'Zone 9', gpio_pin: 12 },
      { id: 10, name: 'Zone 10', gpio_pin: 13 },
      { id: 11, name: 'Zone 11', gpio_pin: 16 },
      { id: 12, name: 'Zone 12', gpio_pin: 19 },
      { id: 13, name: 'Zone 13', gpio_pin: 26 },
      { id: 14, name: 'Zone 14', gpio_pin: 20 },
      { id: 15, name: 'Zone 15', gpio_pin: 21 },
      { id: 16, name: 'Zone 16', gpio_pin: 4 },
      { id: 17, name: 'Zone 17', gpio_pin: 18 },
      { id: 18, name: 'Zone 18', gpio_pin: 15 }
    ]
  },
  22: {
    name: '22-Zone System',
    description: 'Professional/Rain Bird ESP-LX Max (up to 22 zones)',
    zones: [
      { id: 1, name: 'Zone 1', gpio_pin: 17 },
      { id: 2, name: 'Zone 2', gpio_pin: 27 },
      { id: 3, name: 'Zone 3', gpio_pin: 22 },
      { id: 4, name: 'Zone 4', gpio_pin: 23 },
      { id: 5, name: 'Zone 5', gpio_pin: 24 },
      { id: 6, name: 'Zone 6', gpio_pin: 25 },
      { id: 7, name: 'Zone 7', gpio_pin: 5 },
      { id: 8, name: 'Zone 8', gpio_pin: 6 },
      { id: 9, name: 'Zone 9', gpio_pin: 12 },
      { id: 10, name: 'Zone 10', gpio_pin: 13 },
      { id: 11, name: 'Zone 11', gpio_pin: 16 },
      { id: 12, name: 'Zone 12', gpio_pin: 19 },
      { id: 13, name: 'Zone 13', gpio_pin: 26 },
      { id: 14, name: 'Zone 14', gpio_pin: 20 },
      { id: 15, name: 'Zone 15', gpio_pin: 21 },
      { id: 16, name: 'Zone 16', gpio_pin: 4 },
      { id: 17, name: 'Zone 17', gpio_pin: 18 },
      { id: 18, name: 'Zone 18', gpio_pin: 15 },
      { id: 19, name: 'Zone 19', gpio_pin: 14 },
      { id: 20, name: 'Zone 20', gpio_pin: 2 },
      { id: 21, name: 'Zone 21', gpio_pin: 3 },
      { id: 22, name: 'Zone 22', gpio_pin: 8 }
    ]
  }
};

/**
 * Valid zone counts
 */
const VALID_ZONE_COUNTS = [4, 6, 8, 12, 18, 22];

/**
 * Get zone configuration by count
 * @param {number} zoneCount - Number of zones (4, 6, 8, or 12)
 * @returns {object|null} - Zone configuration or null if invalid
 */
const getZoneConfig = (zoneCount) => {
  return ZONE_CONFIGS[zoneCount] || null;
};

/**
 * Validate zone count
 * @param {number} zoneCount - Number of zones to validate
 * @returns {boolean} - True if valid zone count
 */
const isValidZoneCount = (zoneCount) => {
  return VALID_ZONE_COUNTS.includes(zoneCount);
};

module.exports = {
  ZONE_CONFIGS,
  VALID_ZONE_COUNTS,
  getZoneConfig,
  isValidZoneCount
};
