/**
 * SprinkSync - Zone Card Component
 *
 * Displays a single zone with controls and status.
 */

import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import { startZone, stopZone, updateZone } from '../api/client';
import { getZoneStatusText, getZoneStatusColor, formatTimestamp } from '../utils/helpers';

const ZoneCard = ({ zone, onUpdate }) => {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [duration, setDuration] = useState(zone.default_duration);
  const [zoneName, setZoneName] = useState(zone.name);
  const [defaultDuration, setDefaultDuration] = useState(zone.default_duration);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startZone(zone.id, duration);
      setShowStartModal(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert(`Failed to start zone: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    if (!window.confirm(`Stop ${zone.name}?`)) return;

    setIsStopping(true);
    try {
      await stopZone(zone.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert(`Failed to stop zone: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsStopping(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateZone(zone.id, {
        name: zoneName,
        default_duration: defaultDuration,
      });
      setShowSettingsModal(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert(`Failed to update zone: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <>
      <div className="card">
        {/* Zone Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{zone.name}</h3>
            <p className="text-sm text-gray-500">Zone {zone.id}</p>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div className={`mb-4 ${getZoneStatusColor(zone.is_running)}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${zone.is_running ? 'bg-success' : 'bg-gray-300'}`}></div>
            <span className="font-medium">{getZoneStatusText(zone)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          {zone.is_running ? (
            <Button
              variant="danger"
              onClick={handleStop}
              disabled={isStopping}
              className="flex-1"
            >
              {isStopping ? 'Stopping...' : 'Stop'}
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={() => setShowStartModal(true)}
              className="flex-1"
            >
              Start
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1 pt-3 border-t">
          <div>Last run: {formatTimestamp(zone.last_run)}</div>
          <div>Total runtime: {zone.total_runtime} min</div>
        </div>
      </div>

      {/* Start Modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title={`Start ${zone.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStartModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleStart} disabled={isStarting}>
              {isStarting ? 'Starting...' : 'Start Zone'}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Run Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="input w-full"
          />
          <p className="text-sm text-gray-500 mt-2">
            Default: {zone.default_duration} min | Max: 60 min
          </p>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title={`${zone.name} Settings`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSettings}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Name
            </label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="input w-full"
              maxLength="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(parseInt(e.target.value))}
              className="input w-full"
            />
          </div>

          <div className="text-sm text-gray-500 pt-3 border-t">
            <div>GPIO Pin: {zone.gpio_pin}</div>
            <div>Total Runtime: {zone.total_runtime} minutes</div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ZoneCard;
