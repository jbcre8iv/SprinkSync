/**
 * SprinkSync - Dashboard Page
 *
 * Main dashboard with 8-zone grid and real-time status.
 */

import { useState } from 'react';
import ZoneCard from '../components/ZoneCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAllZones, stopAllZones } from '../api/client';
import { usePolling } from '../hooks/usePolling';

const Dashboard = () => {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoppingAll, setIsStoppingAll] = useState(false);

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

  // Auto-refresh every 5 seconds
  usePolling(fetchZones, 5000);

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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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

      {/* Zone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {zones.map((zone) => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            onUpdate={fetchZones}
          />
        ))}
      </div>

      {/* Empty State */}
      {zones.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No zones found</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
