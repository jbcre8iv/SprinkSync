/**
 * SprinkSync - Mock GPIO Controller
 *
 * Simulates GPIO behavior for development without Raspberry Pi hardware.
 * Provides the same interface as the real GPIO controller but only logs actions.
 *
 * This allows full development and testing of the system without needing
 * actual hardware connected.
 */

/**
 * Mock GPIO class that simulates onoff library's Gpio class
 */
class MockGpio {
  /**
   * Create a mock GPIO pin
   * @param {number} pin - GPIO pin number
   * @param {string} direction - 'in' or 'out'
   */
  constructor(pin, direction) {
    this.pin = pin;
    this.direction = direction;
    this.value = 1; // Start with HIGH (relay OFF)
    console.log(`[MOCK GPIO] Pin ${pin} initialized as ${direction.toUpperCase()}, value: ${this.value}`);
  }

  /**
   * Write a value to the GPIO pin (synchronous)
   * @param {number} value - 0 (LOW) or 1 (HIGH)
   */
  writeSync(value) {
    this.value = value;
    const state = value === 0 ? 'ON (Valve OPEN)' : 'OFF (Valve CLOSED)';
    console.log(`[MOCK GPIO] Pin ${this.pin} → ${value} [${state}]`);
  }

  /**
   * Read the current value of the GPIO pin (synchronous)
   * @returns {number} - Current pin value (0 or 1)
   */
  readSync() {
    return this.value;
  }

  /**
   * Unexport the GPIO pin (cleanup)
   */
  unexport() {
    console.log(`[MOCK GPIO] Pin ${this.pin} unexported`);
  }
}

module.exports = MockGpio;
