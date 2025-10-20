/**
 * SprinkSync - Use Case Profiles
 *
 * Defines different use case profiles with their unique characteristics,
 * recommendations, and optimization strategies.
 */

const USE_CASE_PROFILES = {
  residential_lawn: {
    id: 'residential_lawn',
    name: 'Residential Lawn',
    icon: '🏡',
    description: 'Healthy green grass for home lawns',

    // Watering strategy
    strategy: {
      frequency: 'deep_infrequent', // Deep, infrequent watering encourages root growth
      preferredTimes: ['04:00', '05:00', '06:00'], // Early morning
      durationMultiplier: 1.0, // Standard duration
      minDaysBetween: 2, // Don't water same zone daily
    },

    // Weather sensitivity
    weather: {
      skipOnRain: true,
      rainThreshold: 0.25, // inches - skip if this much rain forecast
      skipOnFreeze: true,
      freezeThreshold: 32, // °F
      reduceInCool: true,
      coolThreshold: 60, // °F - reduce watering when temps drop
      increaseInHeat: true,
      heatThreshold: 85, // °F - increase watering in heat
    },

    // Metrics to track
    metrics: {
      primary: ['lawn_health', 'water_savings', 'cost'],
      secondary: ['rainfall', 'temperature', 'humidity'],
    },

    // Recommendations
    recommendations: [
      'Water 1-1.5 inches per week during growing season',
      'Avoid evening watering (increases fungus risk)',
      'Water deeply but infrequently to encourage deep roots',
      'Reduce watering by 50% in fall and spring',
      'Consider dormancy in winter (minimal or no watering)',
    ],

    // Ideal zone settings
    zoneDefaults: {
      duration: 15, // minutes
      flowRate: 1.5, // gallons per minute (typical sprinkler head)
    },
  },

  motocross_track: {
    id: 'motocross_track',
    name: 'Motocross/Dirt Track',
    icon: '🏍️',
    description: 'Surface moisture for dust control and traction',

    strategy: {
      frequency: 'light_frequent', // Light, frequent surface watering
      preferredTimes: ['06:00', '14:00', '18:00'], // Multiple times per day
      durationMultiplier: 0.5, // Shorter durations, more frequent
      minDaysBetween: 0, // Can water multiple times per day
    },

    weather: {
      skipOnRain: false, // Tracks may water BEFORE rain to compact
      waterBeforeRain: true, // Unique to tracks!
      rainThreshold: 0.5,
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: false, // Track needs may not depend on temp
      increaseInHeat: true,
      heatThreshold: 80,
      increaseInWind: true, // Wind increases dust
      windThreshold: 15, // mph
    },

    metrics: {
      primary: ['surface_moisture', 'dust_control', 'traction'],
      secondary: ['wind_speed', 'humidity', 'usage_schedule'],
    },

    recommendations: [
      'Water 30-60 minutes before riders arrive',
      'Light watering to maintain surface moisture (not saturation)',
      'Increase watering frequency on windy days for dust control',
      'Consider watering before rain to help compact track',
      'Adjust based on track usage schedule (practice vs events)',
    ],

    zoneDefaults: {
      duration: 8, // minutes - shorter, more frequent
      flowRate: 2.0, // May use higher flow for quick coverage
    },
  },

  vegetable_garden: {
    id: 'vegetable_garden',
    name: 'Vegetable Garden',
    icon: '🥕',
    description: 'Zone-specific watering for different crops',

    strategy: {
      frequency: 'consistent_moisture', // Consistent soil moisture
      preferredTimes: ['06:00', '07:00', '18:00'], // Morning or evening
      durationMultiplier: 1.2, // Slightly longer for soil penetration
      minDaysBetween: 1, // Daily watering may be needed
      zoneSpecific: true, // Each zone can have different crop
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.5, // Gardens can use more rain
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 65,
      increaseInHeat: true,
      heatThreshold: 80,
    },

    metrics: {
      primary: ['crop_health', 'soil_moisture', 'yield'],
      secondary: ['rainfall', 'temperature', 'per_zone_usage'],
    },

    recommendations: [
      'Tomatoes: 1-2 inches per week, consistent moisture',
      'Leafy greens: Daily light watering, keep soil moist',
      'Root vegetables: Deep watering 2-3x per week',
      'Squash/cucumbers: Heavy watering, 1-2 inches per week',
      'Use drip irrigation or soaker hoses when possible',
      'Mulch to retain moisture and reduce watering needs',
    ],

    zoneDefaults: {
      duration: 20, // minutes - depends on crop
      flowRate: 1.0, // Slower for soil absorption
    },

    // Crop-specific settings
    cropTypes: {
      tomatoes: { duration: 20, frequency: 3, notes: 'Consistent moisture prevents blossom end rot' },
      lettuce: { duration: 10, frequency: 6, notes: 'Keep soil consistently moist' },
      carrots: { duration: 25, frequency: 3, notes: 'Deep watering encourages straight roots' },
      peppers: { duration: 20, frequency: 3, notes: 'Similar to tomatoes' },
      cucumbers: { duration: 25, frequency: 4, notes: 'Heavy water needs' },
      beans: { duration: 15, frequency: 3, notes: 'Moderate water needs' },
    },
  },

  sports_field: {
    id: 'sports_field',
    name: 'Sports Field/Golf Course',
    icon: '⛳',
    description: 'Professional-grade turf management',

    strategy: {
      frequency: 'precision_scheduled', // Precise ET-based scheduling
      preferredTimes: ['04:00', '05:00', '23:00'], // Early morning or late night
      durationMultiplier: 1.0,
      minDaysBetween: 1,
      etBased: true, // Use evapotranspiration calculations
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.25,
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 60,
      increaseInHeat: true,
      heatThreshold: 85,
      etAdjustment: true, // Full ET calculations
    },

    metrics: {
      primary: ['turf_quality', 'playability', 'uniformity'],
      secondary: ['et_rate', 'soil_moisture', 'rainfall'],
    },

    recommendations: [
      'Use ET-based scheduling for optimal water efficiency',
      'Water between events/games when possible',
      'Maintain consistent soil moisture for playability',
      'Monitor for dry spots and adjust zone durations',
      'Consider soil moisture sensors for precision',
    ],

    zoneDefaults: {
      duration: 15,
      flowRate: 1.5,
    },
  },

  greenhouse_commercial: {
    id: 'greenhouse_commercial',
    name: 'Greenhouse/Commercial',
    icon: '🌱',
    description: 'High-frequency precision control',

    strategy: {
      frequency: 'high_frequency', // Multiple times per day
      preferredTimes: ['06:00', '10:00', '14:00', '18:00'],
      durationMultiplier: 0.3, // Very short bursts
      minDaysBetween: 0,
      microWatering: true,
    },

    weather: {
      skipOnRain: false, // Covered greenhouse
      weatherIndependent: true, // Less affected by outside weather
      skipOnFreeze: true, // May still affect greenhouse temp
      freezeThreshold: 32,
    },

    metrics: {
      primary: ['plant_growth', 'yield', 'efficiency'],
      secondary: ['humidity', 'temperature', 'usage_per_cycle'],
    },

    recommendations: [
      'Short, frequent watering cycles for container plants',
      'Monitor soil/media moisture levels closely',
      'Adjust based on plant growth stage',
      'Consider drip/micro-irrigation for efficiency',
      'Track water usage per crop cycle',
    ],

    zoneDefaults: {
      duration: 5, // Very short cycles
      flowRate: 0.5, // Precision drip
    },
  },

  drought_conservation: {
    id: 'drought_conservation',
    name: 'Drought/Conservation Mode',
    icon: '🌵',
    description: 'Minimize water while keeping plants alive',

    strategy: {
      frequency: 'minimal_survival', // Bare minimum
      preferredTimes: ['04:00', '05:00'], // Best efficiency time
      durationMultiplier: 0.5, // Reduced watering
      minDaysBetween: 3, // Infrequent
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.1, // Skip on any rain
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 70, // Aggressive reduction
      increaseInHeat: false, // Don't increase even in heat
      maxWeatherSkip: true, // Maximum weather-based skipping
    },

    metrics: {
      primary: ['water_saved', 'gallons_per_week', 'cost_savings'],
      secondary: ['rainfall_captured', 'efficiency_rate'],
    },

    recommendations: [
      'Water only enough to keep plants alive',
      'Skip all non-essential watering',
      'Let lawn go dormant in summer (it will recover)',
      'Prioritize trees and shrubs over lawn',
      'Consider removing high-water plants',
      'Maximize rainfall capture',
    ],

    zoneDefaults: {
      duration: 10, // Minimal
      flowRate: 1.0,
    },
  },

  golf_course: {
    id: 'golf_course',
    name: 'Golf Course',
    icon: '⛳',
    description: 'Professional turf management for greens, fairways, and rough',

    strategy: {
      frequency: 'precision_professional', // Professional-grade precision
      preferredTimes: ['23:00', '00:00', '01:00', '02:00'], // Night watering to avoid play
      durationMultiplier: 1.0,
      minDaysBetween: 0, // Daily watering often needed
      etBased: true, // Full ET calculations
      zoneSpecific: true, // Greens vs fairways vs rough
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.25,
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 60,
      increaseInHeat: true,
      heatThreshold: 85,
      etAdjustment: true, // Full ET calculations
    },

    metrics: {
      primary: ['turf_quality', 'playability', 'uniformity'],
      secondary: ['et_rate', 'soil_moisture', 'water_efficiency'],
    },

    recommendations: [
      'Water at night to avoid disrupting play',
      'Greens need daily watering; fairways 3-4x/week',
      'Use ET-based scheduling for precision',
      'Monitor soil moisture for optimal playability',
      'Different zones need different strategies (greens vs rough)',
      'Adjust for tournament schedules',
    ],

    zoneDefaults: {
      duration: 15,
      flowRate: 2.0, // Higher flow for professional systems
    },
  },

  vineyard: {
    id: 'vineyard',
    name: 'Vineyard/Winery',
    icon: '🍇',
    description: 'Precision drip irrigation for wine grapes',

    strategy: {
      frequency: 'controlled_stress', // Intentional water stress
      preferredTimes: ['04:00', '05:00', '06:00'], // Early morning
      durationMultiplier: 0.8, // Less water = better wine
      minDaysBetween: 2, // Infrequent to create stress
      dripIrrigation: true,
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.5,
      skipOnFreeze: false, // May water before freeze for protection
      waterBeforeFreeze: true, // Frost protection
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 65,
      increaseInHeat: false, // Controlled stress in heat
    },

    metrics: {
      primary: ['grape_quality', 'sugar_content', 'water_stress_level'],
      secondary: ['soil_moisture', 'yield', 'vine_health'],
    },

    recommendations: [
      'Controlled water stress improves wine quality',
      'Reduce watering 4-6 weeks before harvest',
      'Drip irrigation delivers water directly to roots',
      'Monitor soil moisture at 12" and 24" depth',
      'Water before freeze for frost protection',
      'Hillside vineyards: use check valves for even distribution',
    ],

    zoneDefaults: {
      duration: 30, // Longer for deep soil penetration
      flowRate: 0.5, // Low flow drip
    },
  },

  orchard: {
    id: 'orchard',
    name: 'Fruit Orchard',
    icon: '🍎',
    description: 'Targeted tree irrigation for fruit production',

    strategy: {
      frequency: 'root_zone_targeted', // Target root zone
      preferredTimes: ['05:00', '06:00'], // Early morning
      durationMultiplier: 1.2,
      minDaysBetween: 1,
      zoneSpecific: true, // Young trees vs mature trees
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.5,
      skipOnFreeze: false,
      waterBeforeFreeze: true, // Frost protection
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 65,
      increaseInHeat: true,
      heatThreshold: 85,
    },

    metrics: {
      primary: ['fruit_quality', 'tree_health', 'yield'],
      secondary: ['soil_moisture', 'water_efficiency', 'root_development'],
    },

    recommendations: [
      'Young trees (1-3 years) need more frequent watering',
      'Mature trees: deep watering 1-2x per week',
      'Water before freeze for frost protection',
      'Target root zone, not trunk',
      'Increase watering during fruit development',
      'Reduce watering 2-3 weeks before harvest',
    ],

    zoneDefaults: {
      duration: 25,
      flowRate: 1.0,
    },

    treeTypes: {
      apple: { duration: 25, frequency: 2, notes: 'Deep watering twice weekly' },
      cherry: { duration: 20, frequency: 2, notes: 'Moderate water needs' },
      peach: { duration: 30, frequency: 3, notes: 'High water needs during fruit development' },
      citrus: { duration: 20, frequency: 3, notes: 'Frequent shallow watering' },
      avocado: { duration: 30, frequency: 2, notes: 'Sensitive to overwatering' },
    },
  },

  dust_control: {
    id: 'dust_control',
    name: 'Dust Control',
    icon: '🏗️',
    description: 'Mining, construction, and haul road dust suppression',

    strategy: {
      frequency: 'surface_suppression', // Surface moisture for dust control
      preferredTimes: ['06:00', '10:00', '14:00', '18:00'], // Multiple times daily
      durationMultiplier: 0.4, // Short bursts
      minDaysBetween: 0, // Multiple times per day
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.25,
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: false,
      increaseInHeat: true,
      heatThreshold: 75, // Increase in heat/dry conditions
      increaseInWind: true, // Key feature for dust control
      windThreshold: 10, // mph
    },

    metrics: {
      primary: ['dust_suppression', 'pm10_levels', 'visibility'],
      secondary: ['wind_speed', 'humidity', 'safety_compliance'],
    },

    recommendations: [
      'Water before work shifts to minimize dust',
      'Increase frequency on windy days',
      'Focus on haul roads and high-traffic areas',
      'Monitor PM10 levels for compliance',
      'Short, frequent applications better than long soaks',
      'Consider chemical suppressants for long-term control',
    ],

    zoneDefaults: {
      duration: 5, // Short bursts
      flowRate: 3.0, // High flow for quick coverage
    },
  },

  park_athletic: {
    id: 'park_athletic',
    name: 'Park & Athletic Fields',
    icon: '⚽',
    description: 'Municipal parks, soccer fields, and recreation areas',

    strategy: {
      frequency: 'heavy_use_turf', // Turf under heavy foot traffic
      preferredTimes: ['23:00', '00:00', '04:00', '05:00'], // Night/early AM
      durationMultiplier: 1.1,
      minDaysBetween: 1,
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.25,
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 60,
      increaseInHeat: true,
      heatThreshold: 85,
    },

    metrics: {
      primary: ['turf_durability', 'playability', 'recovery_rate'],
      secondary: ['water_usage', 'cost_per_acre', 'public_satisfaction'],
    },

    recommendations: [
      'Water at night to allow turf to dry before use',
      'Increase watering in high-traffic areas (goal mouths, baselines)',
      'Aerate compacted areas regularly',
      'Avoid watering before scheduled events',
      'Monitor for bare spots and adjust coverage',
      'Consider overseeding in fall for year-round green',
    ],

    zoneDefaults: {
      duration: 20,
      flowRate: 1.5,
    },
  },

  nursery_commercial: {
    id: 'nursery_commercial',
    name: 'Nursery/Landscape Pro',
    icon: '🌻',
    description: 'Commercial plant production and landscape installation',

    strategy: {
      frequency: 'high_frequency_production', // Production nursery needs
      preferredTimes: ['06:00', '10:00', '14:00'], // Multiple daily cycles
      durationMultiplier: 0.6,
      minDaysBetween: 0, // Daily watering
      containerFocused: true,
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.5,
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 65,
      increaseInHeat: true,
      heatThreshold: 80,
    },

    metrics: {
      primary: ['plant_health', 'growth_rate', 'sales_quality'],
      secondary: ['water_per_plant', 'production_cycle', 'inventory_turnover'],
    },

    recommendations: [
      'Container plants dry out quickly - check daily',
      'Hanging baskets need more frequent watering',
      'Drip irrigation for ground beds, overhead for containers',
      'Water early to allow foliage to dry (prevents disease)',
      'Adjust for plant size and container volume',
      'Group plants by water needs for efficiency',
    ],

    zoneDefaults: {
      duration: 10,
      flowRate: 1.0,
    },
  },

  hobby_farm: {
    id: 'hobby_farm',
    name: 'Hobby Farm/Homestead',
    icon: '🚜',
    description: 'Small-scale agriculture and self-sufficiency',

    strategy: {
      frequency: 'mixed_use', // Mix of garden, pasture, animals
      preferredTimes: ['06:00', '07:00', '18:00'], // Morning and evening
      durationMultiplier: 1.0,
      minDaysBetween: 1,
      zoneSpecific: true, // Different needs per area
    },

    weather: {
      skipOnRain: true,
      rainThreshold: 0.5,
      skipOnFreeze: true,
      freezeThreshold: 32,
      reduceInCool: true,
      coolThreshold: 65,
      increaseInHeat: true,
      heatThreshold: 85,
    },

    metrics: {
      primary: ['crop_yield', 'pasture_health', 'water_cost'],
      secondary: ['rainfall', 'soil_health', 'self_sufficiency'],
    },

    recommendations: [
      'Prioritize food crops over decorative plantings',
      'Use drip irrigation for vegetable gardens',
      'Pasture needs less frequent, deep watering',
      'Consider rainwater collection for animals',
      'Zone planning: vegetables, pasture, orchard separate',
      'Compost and mulch to reduce watering needs',
    ],

    zoneDefaults: {
      duration: 15,
      flowRate: 1.0,
    },

    areaTypes: {
      vegetable_garden: { duration: 20, frequency: 5, notes: 'Daily during growing season' },
      pasture: { duration: 30, frequency: 2, notes: 'Deep watering twice weekly' },
      chicken_run: { duration: 5, frequency: 6, notes: 'Light watering for dust control' },
      orchard: { duration: 25, frequency: 2, notes: 'Target root zones' },
      herb_garden: { duration: 10, frequency: 3, notes: 'Most herbs prefer drier soil' },
    },
  },
};

/**
 * Get profile by ID
 * @param {string} profileId - Profile ID
 * @returns {Object} Profile configuration
 */
const getProfile = (profileId) => {
  return USE_CASE_PROFILES[profileId] || USE_CASE_PROFILES.residential_lawn;
};

/**
 * Get all available profiles
 * @returns {Array} Array of profile objects
 */
const getAllProfiles = () => {
  return Object.values(USE_CASE_PROFILES);
};

/**
 * Get profile names for selection
 * @returns {Array} Array of {id, name, icon, description}
 */
const getProfileOptions = () => {
  return getAllProfiles().map(profile => ({
    id: profile.id,
    name: profile.name,
    icon: profile.icon,
    description: profile.description,
  }));
};

module.exports = {
  USE_CASE_PROFILES,
  getProfile,
  getAllProfiles,
  getProfileOptions,
};
