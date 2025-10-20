/**
 * SprinkSync - Weather Widget
 *
 * Displays current weather, forecast, and smart skip status
 */

import { useState, useEffect } from 'react';
import { getWeather } from '../api/client';
import LoadingSpinner from './LoadingSpinner';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const data = await getWeather();
      setWeather(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Weather data unavailable');
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWeather(true); // Force refresh
      setWeather(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to refresh weather:', err);
      setError('Failed to refresh weather');
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

  if (error || !weather || !weather.enabled) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Weather</h2>
        <p className="text-sm text-gray-500">
          {error || 'Weather integration disabled. Enable in Settings.'}
        </p>
      </div>
    );
  }

  if (!weather.configured) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Weather</h2>
        <p className="text-sm text-gray-500">
          Weather not configured. Add your location in Settings.
        </p>
      </div>
    );
  }

  const today = weather.forecast?.[0];
  const tomorrow = weather.forecast?.[1];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Weather Forecast</h2>
        <button
          onClick={handleRefresh}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Current Weather */}
      {weather.current && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current</span>
            <span className="text-2xl font-bold text-primary">
              {Math.round(weather.current.temp)}°F
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="capitalize">{weather.current.description}</span>
            <span>•</span>
            <span>{weather.current.humidity}% humidity</span>
          </div>
        </div>
      )}

      {/* Today's Forecast */}
      {today && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Today</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">High/Low</span>
              <p className="font-semibold">{today.tempHigh}° / {today.tempLow}°</p>
            </div>
            <div>
              <span className="text-gray-600">Rain</span>
              <p className="font-semibold">
                {today.precipitation}" ({today.precipProb}%)
              </p>
            </div>
            <div>
              <span className="text-gray-600">Humidity</span>
              <p className="font-semibold">{today.humidity}%</p>
            </div>
            <div>
              <span className="text-gray-600">Wind</span>
              <p className="font-semibold">{today.windSpeed} mph</p>
            </div>
          </div>
        </div>
      )}

      {/* Tomorrow's Forecast */}
      {tomorrow && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Tomorrow</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">High/Low</span>
              <p className="font-semibold">{tomorrow.tempHigh}° / {tomorrow.tempLow}°</p>
            </div>
            <div>
              <span className="text-gray-600">Rain</span>
              <p className="font-semibold">
                {tomorrow.precipitation}" ({tomorrow.precipProb}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cache indicator */}
      {weather.fromCache && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Cached data • Updates every 4 hours
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
