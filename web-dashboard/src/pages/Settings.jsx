/**
 * SprinkSync - Settings Page
 *
 * System information and settings.
 */

import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSystemStatus } from '../api/client';
import { usePolling } from '../hooks/usePolling';
import { formatDuration } from '../utils/helpers';

const Settings = () => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const data = await getSystemStatus();
      setStatus(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setIsLoading(false);
    }
  };

  usePolling(fetchStatus, 5000);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* System Information */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">System Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Version</span>
            <span className="font-medium">{status?.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Uptime</span>
            <span className="font-medium">{formatDuration(Math.floor((status?.uptime || 0) / 60))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GPIO Mode</span>
            <span className="font-medium">{status?.gpio_mode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Database</span>
            <span className="font-medium text-success">{status?.database_status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Scheduler</span>
            <span className="font-medium text-success">{status?.scheduler_status}</span>
          </div>
        </div>
      </div>

      {/* Active Zones */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Active Zones</h2>
        <div className="text-2xl font-bold text-primary mb-2">
          {status?.active_zones} / {status?.total_zones}
        </div>
        <div className="text-sm text-gray-600">zones running</div>
      </div>

      {/* Safety Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Safety Settings</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Max Runtime per Zone</span>
            <span className="font-medium">60 minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Max Concurrent Zones</span>
            <span className="font-medium">2 zones</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Auto-shutoff</span>
            <span className="font-medium text-success">Enabled</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p className="font-semibold mb-1">SprinkSync</p>
        <p>Smart watering, perfectly synced</p>
      </div>
    </div>
  );
};

export default Settings;
