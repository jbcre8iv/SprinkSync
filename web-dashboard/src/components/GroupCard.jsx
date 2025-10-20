/**
 * SprinkSync - Group Card Component
 *
 * Displays a zone group with run and manage options
 */

import { useState } from 'react';
import Button from './Button';
import { runGroup, deleteGroup } from '../api/client';

const GroupCard = ({ group, zones, onUpdate, onEdit }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [customDuration, setCustomDuration] = useState(group.default_duration || 15);

  const handleRun = async () => {
    if (!window.confirm(`Start running "${group.name}" with ${customDuration} minutes per zone?`)) return;

    setIsRunning(true);
    try {
      await runGroup(group.id, customDuration);
      alert(`Started running group "${group.name}"`);
      onUpdate();
    } catch (error) {
      alert(`Failed to run group: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete group "${group.name}"?`)) return;

    try {
      await deleteGroup(group.id);
      alert(`Deleted group "${group.name}"`);
      onUpdate();
    } catch (error) {
      alert(`Failed to delete group: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border-2 hover:shadow-md transition-all p-4"
      style={{ borderColor: group.color || '#3B82F6' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {group.custom_image ? (
            <img
              src={group.custom_image}
              alt={group.name}
              className="w-10 h-10 object-cover rounded-lg border border-gray-300"
            />
          ) : (
            <span className="text-2xl">{group.icon || '🌱'}</span>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{group.name}</h3>
            {group.description && (
              <p className="text-xs text-gray-500">{group.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(group)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Zone Pills */}
      <div className="mb-4 min-h-[60px]">
        <p className="text-xs text-gray-500 mb-2">{group.zone_count} zones in sequence:</p>
        <div className="flex flex-wrap gap-1.5">
          {group.zones?.map((zone, index) => (
            <span
              key={zone.id}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
            >
              <span className="text-gray-400">#{index + 1}</span>
              {zone.name}
            </span>
          ))}
        </div>
      </div>

      {/* Duration Control */}
      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-1">Duration per zone (min)</label>
        <input
          type="number"
          min="1"
          max="60"
          value={customDuration}
          onChange={(e) => setCustomDuration(parseInt(e.target.value))}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Run Button */}
      <Button
        onClick={handleRun}
        disabled={isRunning}
        className="w-full"
        style={{ backgroundColor: group.color || '#3B82F6' }}
      >
        {isRunning ? 'Starting...' : `Run Group (${customDuration * group.zone_count} min total)`}
      </Button>
    </div>
  );
};

export default GroupCard;
