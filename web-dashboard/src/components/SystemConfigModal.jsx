/**
 * SprinkSync - System Configuration Modal
 *
 * Modal for selecting predefined zone configuration (4, 6, 8, or 12 zones)
 */

import { useState } from 'react';
import Button from './Button';

const ZONE_CONFIGS = [
  {
    count: 4,
    name: '4-Zone System',
    description: 'Small residential',
    icon: '🏡',
    details: 'Perfect for small yards and basic irrigation needs'
  },
  {
    count: 6,
    name: '6-Zone System',
    description: 'Medium residential',
    icon: '🏘️',
    details: 'Ideal for medium-sized properties with multiple areas'
  },
  {
    count: 8,
    name: '8-Zone System',
    description: 'Large residential / Small commercial',
    icon: '🏛️',
    details: 'Great for large properties or small commercial applications'
  },
  {
    count: 12,
    name: '12-Zone System',
    description: 'Commercial / Large property',
    icon: '🏢',
    details: 'For extensive commercial properties or large estates'
  }
];

const SystemConfigModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!selectedConfig) {
      setError('Please select a system configuration');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(selectedConfig);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to initialize system');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Configure Your System</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select your irrigation controller size
              </p>
            </div>
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
        <div className="px-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {/* Config Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ZONE_CONFIGS.map((config) => (
              <button
                key={config.count}
                onClick={() => setSelectedConfig(config.count)}
                disabled={isSubmitting}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${selectedConfig === config.count
                    ? 'border-primary bg-primary/5 ring-2 ring-primary ring-opacity-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{config.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {config.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {config.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {config.details}
                    </p>
                  </div>
                  {selectedConfig === config.count && (
                    <div className="text-primary">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Match your hardware controller
                </p>
                <p className="text-xs text-blue-800">
                  Choose the configuration that matches your Rain Bird or compatible irrigation controller.
                  Zones will be automatically created with correct GPIO pin mappings. You can rename zones later to match your property.
                </p>
              </div>
            </div>
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
            type="button"
            onClick={handleSubmit}
            disabled={!selectedConfig || isSubmitting}
          >
            {isSubmitting ? 'Initializing...' : 'Initialize System'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigModal;
