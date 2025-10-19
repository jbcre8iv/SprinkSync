/**
 * SprinkSync - API Client
 *
 * Axios-based API client for communicating with the backend.
 * All API calls go through this client.
 */

import axios from 'axios';

// Base URL for API (backend server)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ========== ZONES API ==========

/**
 * Get all zones
 */
export const getAllZones = async () => {
  const response = await apiClient.get('/zones');
  return response.data;
};

/**
 * Get single zone by ID
 */
export const getZone = async (zoneId) => {
  const response = await apiClient.get(`/zones/${zoneId}`);
  return response.data;
};

/**
 * Update zone (name, default_duration)
 */
export const updateZone = async (zoneId, data) => {
  const response = await apiClient.put(`/zones/${zoneId}`, data);
  return response.data;
};

/**
 * Start a zone
 */
export const startZone = async (zoneId, duration) => {
  const response = await apiClient.post(`/zones/${zoneId}/start`, { duration });
  return response.data;
};

/**
 * Stop a zone
 */
export const stopZone = async (zoneId) => {
  const response = await apiClient.post(`/zones/${zoneId}/stop`);
  return response.data;
};

/**
 * Emergency stop all zones
 */
export const stopAllZones = async () => {
  const response = await apiClient.post('/zones/stop-all');
  return response.data;
};

// ========== SCHEDULES API ==========

/**
 * Get all schedules
 */
export const getAllSchedules = async (params = {}) => {
  const response = await apiClient.get('/schedules', { params });
  return response.data;
};

/**
 * Get single schedule by ID
 */
export const getSchedule = async (scheduleId) => {
  const response = await apiClient.get(`/schedules/${scheduleId}`);
  return response.data;
};

/**
 * Create new schedule
 */
export const createSchedule = async (data) => {
  const response = await apiClient.post('/schedules', data);
  return response.data;
};

/**
 * Update schedule
 */
export const updateSchedule = async (scheduleId, data) => {
  const response = await apiClient.put(`/schedules/${scheduleId}`, data);
  return response.data;
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (scheduleId) => {
  const response = await apiClient.delete(`/schedules/${scheduleId}`);
  return response.data;
};

/**
 * Toggle schedule enabled/disabled
 */
export const toggleSchedule = async (scheduleId) => {
  const response = await apiClient.post(`/schedules/${scheduleId}/toggle`);
  return response.data;
};

// ========== HISTORY API ==========

/**
 * Get activity history
 */
export const getHistory = async (params = {}) => {
  const response = await apiClient.get('/history', { params });
  return response.data;
};

/**
 * Get history statistics
 */
export const getHistoryStats = async (params = {}) => {
  const response = await apiClient.get('/history/stats', { params });
  return response.data;
};

// ========== SYSTEM API ==========

/**
 * Get system status
 */
export const getSystemStatus = async () => {
  const response = await apiClient.get('/system/status');
  return response.data;
};

/**
 * Health check
 */
export const getHealth = async () => {
  const response = await apiClient.get('/system/health');
  return response.data;
};

export default apiClient;
