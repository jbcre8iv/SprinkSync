/**
 * SprinkSync - Create Zone Modal
 *
 * Modal for creating new zones with name, GPIO pin, and duration
 */

import { useState, useEffect } from 'react';
import Button from './Button';
import { getAllZones } from '../api/client';

const CreateZoneModal = ({ isOpen, onClose, onSubmit }) => {
  const [zoneName, setZoneName] = useState('');
  const [gpioPin, setGpioPin] = useState('');
  const [defaultDuration, setDefaultDuration] = useState('15');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [usedPins, setUsedPins] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch existing zones to check which GPIO pins are in use
      fetchUsedPins();
      // Reset form
      setZoneName('');
      setGpioPin('');
      setDefaultDuration('15');
      setError(null);
    }
  }, [isOpen]);

  const fetchUsedPins = async () => {
    try {
      const zones = await getAllZones();
      const pins = zones.map(z => z.gpio_pin);
      setUsedPins(pins);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!zoneName.trim()) {
      setError('Zone name is required');
      return;
    }

    if (!gpioPin) {
      setError('GPIO pin is required');
      return;
    }

    const pin = parseInt(gpioPin);
    if (isNaN(pin) || pin < 0 || pin > 27) {
      setError('GPIO pin must be between 0 and 27');
      return;
    }

    if (usedPins.includes(pin)) {
      setError(`GPIO pin ${pin} is already in use`);
      return;
    }

    const duration = parseInt(defaultDuration);
    if (isNaN(duration) || duration < 1 || duration > 60) {
      setError('Duration must be between 1 and 60 minutes');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(zoneName.trim(), pin, duration);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create zone');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Common GPIO pins for Raspberry Pi
  const commonPins = [17, 27, 22, 23, 24, 25, 5, 6, 12, 13, 16, 19, 20, 21, 26];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Zone</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Zone Name */}
            <div>
              <label htmlFor="zoneName" className="block text-sm font-medium text-gray-700 mb-1">
                Zone Name
              </label>
              <input
                id="zoneName"
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="e.g., Front Lawn, Garden Bed 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={50}
                disabled={isSubmitting}
              />
            </div>

            {/* GPIO Pin */}
            <div>
              <label htmlFor="gpioPin" className="block text-sm font-medium text-gray-700 mb-1">
                GPIO Pin Number
              </label>
              <input
                id="gpioPin"
                type="number"
                value={gpioPin}
                onChange={(e) => setGpioPin(e.target.value)}
                placeholder="e.g., 17"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min={0}
                max={27}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Common pins: {commonPins.filter(p => !usedPins.includes(p)).join(', ')}
              </p>
              {usedPins.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  In use: {usedPins.sort((a, b) => a - b).join(', ')}
                </p>
              )}
            </div>

            {/* Default Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Default Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min={1}
                max={60}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Zone'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateZoneModal;
