/**
 * SprinkSync - Schedules Page
 *
 * Manage automated watering schedules.
 */

import { useState } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  getAllSchedules,
  getAllZones,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule,
} from '../api/client';
import { usePolling } from '../hooks/usePolling';
import { formatTime12Hour, formatDays, formatNextRun, DAY_NAMES } from '../utils/helpers';

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    zone_id: 1,
    start_time: '06:00',
    duration: 15,
    days: [],
    enabled: true,
  });

  const fetchData = async () => {
    try {
      const [schedulesData, zonesData] = await Promise.all([
        getAllSchedules(),
        getAllZones(),
      ]);
      setSchedules(schedulesData);
      setZones(zonesData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setIsLoading(false);
    }
  };

  usePolling(fetchData, 10000);

  const handleCreate = async () => {
    if (formData.days.length === 0) {
      alert('Please select at least one day');
      return;
    }

    try {
      await createSchedule(formData);
      setShowCreateModal(false);
      resetForm();
      await fetchData();
    } catch (error) {
      alert(`Failed to create schedule: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateSchedule(editingSchedule.id, formData);
      setEditingSchedule(null);
      resetForm();
      await fetchData();
    } catch (error) {
      alert(`Failed to update schedule: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Delete this schedule?')) return;

    try {
      await deleteSchedule(scheduleId);
      await fetchData();
    } catch (error) {
      alert(`Failed to delete schedule: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleToggle = async (scheduleId) => {
    try {
      await toggleSchedule(scheduleId);
      await fetchData();
    } catch (error) {
      alert(`Failed to toggle schedule: ${error.response?.data?.error || error.message}`);
    }
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      zone_id: schedule.zone_id,
      start_time: schedule.start_time,
      duration: schedule.duration,
      days: schedule.days,
      enabled: Boolean(schedule.enabled),
    });
  };

  const resetForm = () => {
    setFormData({
      zone_id: 1,
      start_time: '06:00',
      duration: 15,
      days: [],
      enabled: true,
    });
  };

  const toggleDay = (day) => {
    if (formData.days.includes(day)) {
      setFormData({ ...formData, days: formData.days.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, days: [...formData.days, day].sort((a, b) => a - b) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-600 mt-1">{schedules.length} schedule{schedules.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Create Schedule
        </Button>
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => handleToggle(schedule.id)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      schedule.enabled ? 'bg-success' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        schedule.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                  <h3 className="text-lg font-semibold">{schedule.zone_name}</h3>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>🕐</span>
                    <span>{formatTime12Hour(schedule.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏱</span>
                    <span>{schedule.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{formatDays(schedule.days)}</span>
                  </div>
                </div>

                {schedule.enabled && schedule.next_run && (
                  <div className="text-sm text-gray-500 mt-2">
                    Next run: {formatNextRun(schedule.next_run)}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(schedule)}
                  className="text-primary hover:text-blue-600"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="text-danger hover:text-red-600"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {schedules.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No schedules yet. Create one to get started!
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || editingSchedule !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSchedule(null);
          resetForm();
        }}
        title={editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setEditingSchedule(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={editingSchedule ? handleUpdate : handleCreate}
            >
              {editingSchedule ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Zone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
            <select
              value={formData.zone_id}
              onChange={(e) => setFormData({ ...formData, zone_id: parseInt(e.target.value) })}
              className="input w-full"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="input w-full"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="input w-full"
            />
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
            <div className="grid grid-cols-7 gap-2">
              {DAY_NAMES.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`px-2 py-2 text-sm rounded-lg border transition-colors ${
                    formData.days.includes(index)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
              Enabled
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Schedules;
