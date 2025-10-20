/**
 * SprinkSync - GPIO Controller
 *
 * Manages GPIO pins for controlling sprinkler zone relays.
 * Handles initialization, zone control, and cleanup.
 *
 * IMPORTANT: This module switches between real and mock GPIO based on
 * the GPIO_MODE environment variable.
 */

const { RELAY, SAFETY } = require('../config/constants');
const { getAll } = require('../config/database');

// Determine which GPIO implementation to use
const GPIO_MODE = process.env.GPIO_MODE || 'mock';
let Gpio;

if (GPIO_MODE === 'real') {
  try {
    Gpio = require('onoff').Gpio;
    console.log('🔌 Using REAL GPIO (Raspberry Pi mode)');
  } catch (error) {
    console.error('❌ Error loading onoff library. Falling back to mock GPIO.');
    console.error('   Install onoff with: npm install onoff');
    Gpio = require('./mock-gpio');
  }
} else {
  Gpio = require('./mock-gpio');
  console.log('🔌 Using MOCK GPIO (Development mode)');
}

// Store GPIO instances for each zone
const gpioPins = {};

// Track which zones are currently running
const runningZones = new Map();

/**
 * Initialize all GPIO pins
 * Sets all zones to OFF state (relays open, valves closed)
 * Loads zones dynamically from database to ensure sync
 */
const initializeGPIO = async () => {
  console.log('🚀 Initializing GPIO pins...');

  try {
    // Load zones from database
    const zones = await getAll('SELECT id, gpio_pin FROM zones ORDER BY id');

    if (!zones || zones.length === 0) {
      console.log('⚠️  No zones found in database. GPIO not initialized.');
      return;
    }

    // Initialize each zone's GPIO pin based on database
    for (const zone of zones) {
      const zoneId = zone.id;
      const pin = zone.gpio_pin;

      gpioPins[zoneId] = new Gpio(pin, 'out');
      gpioPins[zoneId].writeSync(RELAY.OFF); // Start with relay OFF
    }

    // Wait for relay stabilization
    await new Promise(resolve => setTimeout(resolve, SAFETY.GPIO_STABILIZATION_MS));

    console.log(`✅ All GPIO pins initialized (all zones OFF)`);
  } catch (error) {
    console.error('❌ Error initializing GPIO:', error.message);
    throw error;
  }
};

/**
 * Start a zone (open valve)
 * @param {number} zoneId - Zone ID
 * @returns {Promise<void>}
 */
const startZone = async (zoneId) => {
  try {
    if (!gpioPins[zoneId]) {
      throw new Error(`GPIO pin for zone ${zoneId} not initialized`);
    }

    gpioPins[zoneId].writeSync(RELAY.ON); // Turn relay ON (valve opens)
    console.log(`✅ Zone ${zoneId} started (valve opened)`);
  } catch (error) {
    console.error(`❌ Error starting zone ${zoneId}:`, error.message);
    throw error;
  }
};

/**
 * Stop a zone (close valve)
 * @param {number} zoneId - Zone ID
 * @returns {Promise<void>}
 */
const stopZone = async (zoneId) => {
  try {
    if (!gpioPins[zoneId]) {
      throw new Error(`GPIO pin for zone ${zoneId} not initialized`);
    }

    gpioPins[zoneId].writeSync(RELAY.OFF); // Turn relay OFF (valve closes)
    console.log(`✅ Zone ${zoneId} stopped (valve closed)`);
  } catch (error) {
    console.error(`❌ Error stopping zone ${zoneId}:`, error.message);
    throw error;
  }
};

/**
 * Stop all zones immediately (emergency stop)
 * @returns {Promise<void>}
 */
const stopAllZones = async () => {
  console.log('🛑 Stopping all zones...');

  try {
    for (const zoneId of Object.keys(gpioPins)) {
      if (gpioPins[zoneId]) {
        gpioPins[zoneId].writeSync(RELAY.OFF);
      }
    }
    console.log('✅ All zones stopped');
  } catch (error) {
    console.error('❌ Error stopping all zones:', error.message);
    throw error;
  }
};

/**
 * Get the current state of a zone
 * @param {number} zoneId - Zone ID (1-8)
 * @returns {boolean} - true if zone is ON, false if OFF
 */
const getZoneState = (zoneId) => {
  if (!gpioPins[zoneId]) {
    return false;
  }
  const value = gpioPins[zoneId].readSync();
  return value === RELAY.ON;
};

/**
 * Cleanup GPIO on shutdown
 * Stops all zones and unexports all pins
 */
const cleanupGPIO = async () => {
  console.log('🧹 Cleaning up GPIO...');

  try {
    // Stop all zones first
    await stopAllZones();

    // Wait briefly for relays to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    // Unexport all pins
    for (const zoneId of Object.keys(gpioPins)) {
      if (gpioPins[zoneId]) {
        gpioPins[zoneId].unexport();
      }
    }

    console.log('✅ GPIO cleanup complete');
  } catch (error) {
    console.error('❌ Error during GPIO cleanup:', error.message);
  }
};

/**
 * Setup signal handlers for graceful shutdown
 * Ensures GPIO is cleaned up on SIGINT (Ctrl+C) and SIGTERM
 */
const setupSignalHandlers = () => {
  const signals = ['SIGINT', 'SIGTERM'];

  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\n📡 Received ${signal} signal`);
      await cleanupGPIO();
      process.exit(0);
    });
  });

  console.log('✅ Signal handlers registered (SIGINT, SIGTERM)');
};

module.exports = {
  initializeGPIO,
  startZone,
  stopZone,
  stopAllZones,
  getZoneState,
  cleanupGPIO,
  setupSignalHandlers,
  GPIO_MODE
};
