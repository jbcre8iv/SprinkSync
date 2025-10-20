/**
 * SprinkSync - Dashboard Page (v2.0)
 *
 * Main dashboard with zones, weather, analytics, and AI insights.
 */

import { useState, useEffect } from 'react';
import ZoneCard from '../components/ZoneCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import WeatherWidget from '../components/WeatherWidget';
import AnalyticsWidget from '../components/AnalyticsWidget';
import InsightsPanel from '../components/InsightsPanel';
import SystemConfigModal from '../components/SystemConfigModal';
import { getAllZones, stopAllZones, getSettings, initializeSystem, resetSystem } from '../api/client';
import { usePolling } from '../hooks/usePolling';

const Dashboard = () => {
  const [zones, setZones] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoppingAll, setIsStoppingAll] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Fetch settings data
  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  // Fetch zones data
  const fetchZones = async () => {
    try {
      const data = await getAllZones();
      setZones(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
      setIsLoading(false);
    }
  };

  // Auto-refresh zones every 5 seconds
  usePolling(fetchZones, 5000);

  // Auto-refresh settings every 30 seconds (to pick up changes from Settings page)
  usePolling(fetchSettings, 30000);

  // Emergency stop all zones
  const handleStopAll = async () => {
    if (!window.confirm('Stop all running zones?')) return;

    setIsStoppingAll(true);
    try {
      await stopAllZones();
      await fetchZones(); // Refresh immediately
    } catch (error) {
      alert(`Failed to stop all zones: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsStoppingAll(false);
    }
  };

  // Initialize system with zone configuration
  const handleInitializeSystem = async (zoneCount) => {
    await initializeSystem(zoneCount);
    await fetchZones(); // Refresh zones list
  };

  // Reset system (delete all zones)
  const handleResetSystem = async () => {
    const confirmMsg = 'Are you sure you want to reset your system?\n\nThis will delete ALL zones and schedules. This action cannot be undone.';
    if (!window.confirm(confirmMsg)) return;

    try {
      await stopAllZones(); // Stop all zones first
      await resetSystem();
      await fetchZones(); // Refresh zones list
    } catch (error) {
      alert(`Failed to reset system: ${error.response?.data?.error || error.message}`);
    }
  };

  const runningZones = zones.filter(z => z.is_running);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {settings?.profileInfo && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {settings.profileInfo.icon} {settings.profileInfo.name}
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              {runningZones.length > 0
                ? `${runningZones.length} zone${runningZones.length > 1 ? 's' : ''} running`
                : 'All zones idle'
              }
            </p>
          </div>

          {runningZones.length > 0 && (
            <Button
              variant="danger"
              onClick={handleStopAll}
              disabled={isStoppingAll}
            >
              {isStoppingAll ? 'Stopping...' : 'Stop All Zones'}
            </Button>
          )}
        </div>
      </div>

      {/* v2.0 Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weather Widget */}
        <div>
          <WeatherWidget />
        </div>

        {/* Analytics Widget */}
        <div>
          <AnalyticsWidget days={30} />
        </div>

        {/* Insights Panel */}
        <div>
          <InsightsPanel days={30} />
        </div>
      </div>

      {/* Zone Grid */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Zones</h2>
          {zones.length > 0 && (
            <Button
              variant="danger"
              onClick={handleResetSystem}
            >
              Reset System
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {zones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onUpdate={fetchZones}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {zones.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to SprinkSync
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by configuring your irrigation system. Select the number of zones that matches your controller.
            </p>
            <Button onClick={() => setShowConfigModal(true)} className="mx-auto">
              Configure System
            </Button>
          </div>
        </div>
      )}

      {/* System Config Modal */}
      <SystemConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSubmit={handleInitializeSystem}
      />
    </div>
  );
};

export default Dashboard;
