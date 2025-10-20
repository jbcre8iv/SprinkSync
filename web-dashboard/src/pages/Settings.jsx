/**
 * SprinkSync - Settings Page (v2.0)
 *
 * System settings with use case profiles, location, and weather configuration.
 */

import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import {
  getSystemStatus,
  getSettings,
  updateSettings,
  getUseCaseProfiles,
  getProfileDetails,
  getControllerModels,
  getControllerDetails
} from '../api/client';
import { formatDuration } from '../utils/helpers';

const Settings = () => {
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [controllers, setControllers] = useState([]);
  const [selectedController, setSelectedController] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [useCaseProfile, setUseCaseProfile] = useState('');
  const [controllerModel, setControllerModel] = useState('');
  const [locationLat, setLocationLat] = useState('');
  const [locationLon, setLocationLon] = useState('');
  const [locationZip, setLocationZip] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [waterRate, setWaterRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [weatherApiKey, setWeatherApiKey] = useState('');
  const [smartSkipEnabled, setSmartSkipEnabled] = useState(true);
  const [rainThreshold, setRainThreshold] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusData, settingsData, profilesData, controllersData] = await Promise.all([
        getSystemStatus(),
        getSettings(),
        getUseCaseProfiles(),
        getControllerModels()
      ]);

      setStatus(statusData);
      setSettings(settingsData.settings);
      setProfiles(profilesData.profiles);
      setControllers(controllersData.controllers);

      // Populate form with current settings
      const s = settingsData.settings;
      setUseCaseProfile(s.useCaseProfile);
      setControllerModel(s.controllerModel || 'custom');
      setLocationLat(s.location.lat || '');
      setLocationLon(s.location.lon || '');
      setLocationZip(s.location.zip || '');
      setLocationCity(s.location.city || '');
      setWaterRate(s.waterRate.perGallon || '0.01');
      setCurrency(s.waterRate.currency || 'USD');
      setWeatherEnabled(s.weather.enabled);
      setWeatherApiKey(''); // Don't show masked key
      setSmartSkipEnabled(s.weather.smartSkipEnabled);
      setRainThreshold(s.weather.rainThreshold || '0.25');

      // Load profile details
      if (s.useCaseProfile) {
        const profileData = await getProfileDetails(s.useCaseProfile);
        setSelectedProfile(profileData.profile);
      }

      // Load controller details
      if (s.controllerModel) {
        const controllerData = await getControllerDetails(s.controllerModel);
        setSelectedController(controllerData.controller);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setIsLoading(false);
    }
  };

  const handleProfileChange = async (profileId) => {
    setUseCaseProfile(profileId);
    setHasUnsavedChanges(true);
    try {
      const profileData = await getProfileDetails(profileId);
      setSelectedProfile(profileData.profile);
    } catch (error) {
      console.error('Failed to fetch profile details:', error);
    }
  };

  const handleControllerChange = async (controllerId) => {
    setControllerModel(controllerId);
    setHasUnsavedChanges(true);
    try {
      const controllerData = await getControllerDetails(controllerId);
      setSelectedController(controllerData.controller);

      // Check if zones need to be initialized
      const statusData = await getSystemStatus();
      if (statusData.total_zones === 0 || statusData.total_zones !== controllerData.controller.maxZones) {
        // Zones will be initialized automatically when saving
        console.log(`Will initialize ${controllerData.controller.maxZones} zones for ${controllerData.controller.name}`);
      }
    } catch (error) {
      console.error('Failed to fetch controller details:', error);
    }
  };

  // Mark form as dirty when any field changes
  const handleFieldChange = (setter) => (value) => {
    setter(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const updateData = {
        useCaseProfile,
        controllerModel,
        autoInitializeZones: true, // Always auto-initialize zones when controller model changes
        location: {
          lat: parseFloat(locationLat) || null,
          lon: parseFloat(locationLon) || null,
          zip: locationZip || null,
          city: locationCity || null,
        },
        waterRate: {
          perGallon: parseFloat(waterRate),
          currency,
        },
        weather: {
          enabled: weatherEnabled,
          smartSkipEnabled,
          rainThreshold: parseFloat(rainThreshold),
        }
      };

      // Only include API key if changed
      if (weatherApiKey && weatherApiKey !== '***') {
        updateData.weather.apiKey = weatherApiKey;
      }

      const response = await updateSettings(updateData);

      // Check if zones were initialized
      if (response.zonesInitialized) {
        setSaveMessage(response.message || 'Settings saved and zones initialized!');
        // Refresh after zone initialization
        setTimeout(async () => {
          await fetchData();
          window.location.reload(); // Reload to reinitialize everything
        }, 1500);
      } else {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
        // Refresh settings
        await fetchData();
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-md">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium text-yellow-800">Unsaved changes</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Use Case Profile */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Use Case Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Use Case
                </label>
                <select
                  value={useCaseProfile}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.icon} {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProfile && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{selectedProfile.icon}</span>
                    <div>
                      <h3 className="font-semibold">{selectedProfile.name}</h3>
                      <p className="text-sm text-gray-600">{selectedProfile.description}</p>
                    </div>
                  </div>

                  {selectedProfile.recommendations && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Recommendations:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {selectedProfile.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Controller Model */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Controller Model</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rain Bird Controller
                </label>
                <select
                  value={controllerModel}
                  onChange={(e) => handleControllerChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {controllers.map((controller) => (
                    <option key={controller.id} value={controller.id}>
                      {controller.name} ({controller.maxZones} zones)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Zones will be automatically configured to match your controller when you save
                </p>
              </div>

              {selectedController && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-2">
                    <h3 className="font-semibold">{selectedController.name}</h3>
                    <p className="text-sm text-gray-600">{selectedController.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Max Zones</p>
                      <p className="text-sm text-gray-900">{selectedController.maxZones}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Concurrent Zones</p>
                      <p className="text-sm text-gray-900">{selectedController.maxConcurrentZones}</p>
                    </div>
                  </div>

                  {selectedController.features && selectedController.features.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedController.features.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {feature.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={locationZip}
                    onChange={(e) => handleFieldChange(setLocationZip)(e.target.value)}
                    placeholder="12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={locationCity}
                    onChange={(e) => handleFieldChange(setLocationCity)(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={locationLat}
                    onChange={(e) => handleFieldChange(setLocationLat)(e.target.value)}
                    placeholder="37.7749"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={locationLon}
                    onChange={(e) => handleFieldChange(setLocationLon)(e.target.value)}
                    placeholder="-122.4194"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Location is used for weather-based smart watering
              </p>
            </div>
          </div>

          {/* Water Cost Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Water Cost Tracking</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate per Gallon
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={waterRate}
                    onChange={(e) => handleFieldChange(setWaterRate)(e.target.value)}
                    placeholder="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => handleFieldChange(setCurrency)(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Check your water bill for your actual rate per gallon
              </p>
            </div>
          </div>

          {/* Weather Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Weather Integration</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Enable Weather Integration</p>
                  <p className="text-xs text-gray-500">Use weather data for smart watering decisions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weatherEnabled}
                    onChange={(e) => { handleFieldChange(setWeatherEnabled)(e.target.checked); }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Smart Skip</p>
                  <p className="text-xs text-gray-500">Skip watering when rain is forecast</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smartSkipEnabled}
                    onChange={(e) => { handleFieldChange(setSmartSkipEnabled)(e.target.checked); }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rain Threshold (inches)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={rainThreshold}
                  onChange={(e) => handleFieldChange(setRainThreshold)(e.target.value)}
                  placeholder="0.25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Skip watering if this much rain is forecast
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenWeatherMap API Key (optional)
                </label>
                <input
                  type="password"
                  value={weatherApiKey}
                  onChange={(e) => handleFieldChange(setWeatherApiKey)(e.target.value)}
                  placeholder="Enter API key to override demo key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get a free API key at <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openweathermap.org</a>
                </p>
              </div>
            </div>
          </div>

          {/* Save Button - Sticky */}
          <div className={`sticky bottom-4 p-4 rounded-lg shadow-lg transition-all ${
            hasUnsavedChanges
              ? 'bg-yellow-50 border-2 border-yellow-400'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className={`flex-1 ${hasUnsavedChanges ? 'animate-pulse' : ''}`}
              >
                {isSaving ? 'Saving...' : hasUnsavedChanges ? '💾 Save Changes' : '✓ All Changes Saved'}
              </Button>
              {saveMessage && (
                <span className={`text-sm font-medium ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
            {hasUnsavedChanges && (
              <p className="text-xs text-yellow-700 mt-2 text-center">
                ⚠️ Click "Save Changes" to apply your settings
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* System Information */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">System Info</h2>
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
                <span className="text-gray-600">Database</span>
                <span className="font-medium text-success">{status?.database_status}</span>
              </div>
            </div>
          </div>

          {/* Active Zones */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Active Zones</h2>
            <div className="text-2xl font-bold text-primary mb-2">
              {status?.active_zones} / {status?.total_zones}
            </div>
            <div className="text-sm text-gray-600">zones running</div>
          </div>

          {/* Safety Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Safety</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Max Runtime</span>
                <span className="font-medium">60 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auto-shutoff</span>
                <span className="font-medium text-success">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p className="font-semibold mb-1">SprinkSync v2.0</p>
        <p>Smart watering, perfectly synced</p>
      </div>
    </div>
  );
};

export default Settings;
