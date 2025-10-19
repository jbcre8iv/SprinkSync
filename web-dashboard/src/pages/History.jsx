/**
 * SprinkSync - History Page
 *
 * View activity history and statistics.
 */

import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getHistory, getHistoryStats } from '../api/client';
import { usePolling } from '../hooks/usePolling';
import { formatTimestamp, formatDuration } from '../utils/helpers';

const History = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [historyData, statsData] = await Promise.all([
        getHistory({ limit: 50 }),
        getHistoryStats({ days: 30 }),
      ]);
      setHistory(historyData);
      setStats(statsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setIsLoading(false);
    }
  };

  usePolling(fetchData, 10000);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity History</h1>

      {/* Stats */}
      {stats && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Last 30 Days</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.total_runs}</div>
              <div className="text-sm text-gray-600">Total Runs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{formatDuration(stats.total_runtime)}</div>
              <div className="text-sm text-gray-600">Total Runtime</div>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{entry.zone_name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <div>{formatTimestamp(entry.start_time)}</div>
                  <div>Duration: {entry.duration} minutes</div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  entry.trigger === 'manual'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {entry.trigger}
              </span>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No activity history yet
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
