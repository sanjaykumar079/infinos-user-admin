// FILE: infinosfrontend/src/utils/api.js
// Enhanced API utility with JWT authentication

import axios from 'axios';
import { authHelpers } from '../supabaseClient';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  async (config) => {
    try {
      // Get fresh access token from Supabase
      const accessToken = await authHelpers.getAccessToken();
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    } catch (error) {
      console.error('Error adding auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session
        const { data, error: refreshError } = await authHelpers.refreshSession();

        if (refreshError || !data.session) {
          // Refresh failed - redirect to login
          console.error('Session refresh failed:', refreshError);
          await authHelpers.signOut();
          window.location.href = '/';
          return Promise.reject(error);
        }

        // Retry the original request with new token
        const newAccessToken = data.session.access_token;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        await authHelpers.signOut();
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error('Access forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 429:
          console.error('Too many requests - please slow down');
          break;
        case 500:
          console.error('Server error - please try again later');
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Device API calls
export const deviceAPI = {
  // Get all devices for a user
  getMyDevices: (ownerId) => api.get('/device/my-devices', { params: { ownerId } }),
  
  // Get device summary
  getSummary: (ownerId) => api.get('/device/summary', { params: { ownerId } }),
  
  // Get specific device
  getDevice: (deviceId) => api.get('/device/get_device', { params: { device_id: deviceId } }),
  
  // Verify device code
  verifyDeviceCode: (deviceCode) => api.get('/device/verify-code', { params: { deviceCode } }),
  
  // Claim device
  claimDevice: (deviceCode, ownerId, deviceName) => 
    api.post('/device/claim', { deviceCode, ownerId, deviceName }),
  
  // Authenticate device (for hardware)
  authenticateDevice: (deviceCode, deviceSecret) =>
    api.post('/device/auth', { deviceCode, deviceSecret }),
  
  // Update device status
  updateDevice: (deviceId, status) => 
    api.post('/device/update_device', { device_id: deviceId, status }),
  
  // Update hot zone
  updateHotZone: (deviceId, temp, humidity) =>
    api.post('/device/update_hot_zone', { device_id: deviceId, temp, humidity }),
  
  // Update cold zone
  updateColdZone: (deviceId, temp, humidity) =>
    api.post('/device/update_cold_zone', { device_id: deviceId, temp, humidity }),
  
  // Update battery
  updateBattery: (deviceId, chargeLevel, voltage, isCharging) =>
    api.post('/device/update_battery', { 
      device_id: deviceId, 
      charge_level: chargeLevel, 
      voltage, 
      is_charging: isCharging 
    }),
  
  // Update hot zone settings
  updateHotZoneSettings: (deviceId, targetTemp, heaterOn, fanOn) =>
    api.post('/device/update_hot_zone_settings', {
      device_id: deviceId,
      target_temp: targetTemp,
      heater_on: heaterOn,
      fan_on: fanOn,
    }),
  
  // Update cold zone settings
  updateColdZoneSettings: (deviceId, targetTemp, coolerOn, fanOn) =>
    api.post('/device/update_cold_zone_settings', {
      device_id: deviceId,
      target_temp: targetTemp,
      cooler_on: coolerOn,
      fan_on: fanOn,
    }),
  
  // Get alerts
  getAlerts: (deviceId) => api.get('/device/alerts', { params: { device_id: deviceId } }),
  
  // Admin endpoints
  getAllDevices: () => api.get('/device/all-devices'),
  getAdminStats: () => api.get('/device/admin-stats'),
};

// Export the configured axios instance for non-device endpoints
export default api;

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: (userId) => api.get(`/user/profile/${userId}`),
  
  // Update user profile
  updateProfile: (userId, updates) => api.put(`/user/profile/${userId}`, updates),
  
  // Delete user account
  deleteAccount: (userId) => api.delete(`/user/account/${userId}`),
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { session } = await authHelpers.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { user } = await authHelpers.getUser();
    return user;
  } catch (error) {
    return null;
  }
};

