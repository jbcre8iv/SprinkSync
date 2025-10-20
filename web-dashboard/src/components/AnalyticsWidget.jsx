/**
 * SprinkSync - Analytics Widget
 *
 * Displays water usage statistics and cost tracking
 */

import { useState, useEffect } from 'react';
import { getSummaryStats } from '../api/client';
import LoadingSpinner from './LoadingSpinner';

const AnalyticsWidget = ({ days = 30 }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    try {
      const data = await getSummaryStats(selectedPeriod);
      setStats(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Analytics</h2>
        <p className="text-sm text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const currencySymbol = stats.currency === 'USD' ? '$' :
                         stats.currency === 'EUR' ? '€' :
                         stats.currency === 'GBP' ? '£' : '$';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Water Usage & Costs</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(Number(e.target.value))}
          className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="text-xs text-gray-600 mb-1">Total Water Used</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.overall.totalGallons.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">gallons</div>
        </div>

        <div className="bg-green-50 p-3 rounded-md">
          <div className="text-xs text-gray-600 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-green-600">
            {currencySymbol}{stats.overall.totalCost.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">{stats.period}</div>
        </div>
      </div>

      {/* Daily Average */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2">Daily Average</div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Runtime</span>
            <p className="font-semibold">{stats.daily.avgRuntime} min</p>
          </div>
          <div>
            <span className="text-gray-600">Gallons</span>
            <p className="font-semibold">{stats.daily.avgGallons}</p>
          </div>
          <div>
            <span className="text-gray-600">Cost</span>
            <p className="font-semibold">{currencySymbol}{stats.daily.avgCost}</p>
          </div>
        </div>
      </div>

      {/* Smart Savings */}
      {stats.savings.vsTraditionalCost > 0 && (
        <div className="bg-green-50 p-3 rounded-md mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Smart Savings</span>
            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
              {stats.savings.vsTraditionalPercent}% saved
            </span>
          </div>
          <div className="text-2xl font-bold text-green-700 mb-1">
            {currencySymbol}{stats.savings.vsTraditionalCost.toFixed(2)}
          </div>
          <div className="text-xs text-green-600">
            vs traditional timer ({stats.savings.vsTraditionalGallons.toLocaleString()} gallons)
          </div>
        </div>
      )}

      {/* Weather Skips */}
      {stats.overall.weatherSkips > 0 && (
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="text-sm font-medium text-blue-800 mb-1">Weather-Smart Skips</div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-semibold">{stats.overall.weatherSkips}</span>
              <span className="text-gray-600"> skips</span>
            </div>
            <div>
              <span className="text-blue-600 font-semibold">
                {stats.savings.weatherSkipsSavedGallons}
              </span>
              <span className="text-gray-600"> gal saved</span>
            </div>
            <div>
              <span className="text-blue-600 font-semibold">
                {currencySymbol}{stats.savings.weatherSkipsSavedCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Activity Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-3 text-xs text-center">
          <div>
            <div className="text-gray-600">Manual Runs</div>
            <div className="font-semibold text-gray-900">{stats.overall.manualRuns}</div>
          </div>
          <div>
            <div className="text-gray-600">Scheduled</div>
            <div className="font-semibold text-gray-900">{stats.overall.scheduledRuns}</div>
          </div>
          <div>
            <div className="text-gray-600">Active Days</div>
            <div className="font-semibold text-gray-900">{stats.overall.activeDays}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
