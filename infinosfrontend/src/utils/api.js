// FILE: infinosfrontend/src/utils/api.js
// FIXED: Properly sends admin passkey in request headers

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

// Request interceptor - FIXED to actually send admin passkey
api.interceptors.request.use(
  async (config) => {
    try {
      // Check if this is an admin request
      const isAdminRoute = config.url?.includes('/admin') || 
                          config.url?.includes('admin-stats') || 
                          config.url?.includes('all-devices') ||
                          config.url?.includes('seed-devices');
      
      if (isAdminRoute) {
        // Get admin passkey from localStorage
        const adminPasskey = localStorage.getItem('admin_passkey');
        
        if (adminPasskey) {
          // ✅ CRITICAL: Send passkey in header
          config.headers['x-admin-passkey'] = adminPasskey;
          console.log('✅ Admin passkey added to request header');
        } else {
          console.warn('⚠️ No admin passkey found in localStorage');
        }
      } else {
        // Regular user request - add JWT
        const accessToken = await authHelpers.getAccessToken();
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
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

// Response interceptor - FIXED to handle admin 403 properly
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 for admin endpoints
    if (error.response?.status === 403) {
      const isAdminRoute = originalRequest.url?.includes('/admin') || 
                          originalRequest.url?.includes('admin-stats') || 
                          originalRequest.url?.includes('all-devices') ||
                          originalRequest.url?.includes('seed-devices');
      
      if (isAdminRoute) {
        console.error('❌ Admin authentication failed - clearing session');
        // Clear admin session
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_expiry');
        localStorage.removeItem('admin_passkey');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    }

    // Handle 401 Unauthorized for regular users
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data, error: refreshError } = await authHelpers.refreshSession();

        if (refreshError || !data.session) {
          console.error('Session refresh failed:', refreshError);
          await authHelpers.signOut();
          window.location.href = '/';
          return Promise.reject(error);
        }

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
  // User device endpoints
  getMyDevices: (ownerId) => api.get('/device/my-devices', { params: { ownerId } }),
  getSummary: (ownerId) => api.get('/device/summary', { params: { ownerId } }),
  getDevice: (deviceId) => api.get('/device/get_device', { params: { device_id: deviceId } }),
  verifyDeviceCode: (deviceCode) => api.get('/device/verify-code', { params: { deviceCode } }),
  claimDevice: (deviceCode, ownerId, deviceName) => 
    api.post('/device/claim', { deviceCode, ownerId, deviceName }),
  authenticateDevice: (deviceCode, deviceSecret) =>
    api.post('/device/auth', { deviceCode, deviceSecret }),
  updateDevice: (deviceId, status) => 
    api.post('/device/update_device', { device_id: deviceId, status }),
  updateHotZone: (deviceId, temp, humidity) =>
    api.post('/device/update_hot_zone', { device_id: deviceId, temp, humidity }),
  updateColdZone: (deviceId, temp, humidity) =>
    api.post('/device/update_cold_zone', { device_id: deviceId, temp, humidity }),
  updateBattery: (deviceId, chargeLevel, voltage, isCharging) =>
    api.post('/device/update_battery', { 
      device_id: deviceId, 
      charge_level: chargeLevel, 
      voltage, 
      is_charging: isCharging 
    }),
  updateHotZoneSettings: (deviceId, targetTemp, heaterOn, fanOn) =>
    api.post('/device/update_hot_zone_settings', {
      device_id: deviceId,
      target_temp: targetTemp,
      heater_on: heaterOn,
      fan_on: fanOn,
    }),
  createDevice: async (deviceData) => {
    const adminPasskey = localStorage.getItem('admin_passkey');
    return api.post('/device/create', deviceData, {
      headers: {
        'x-admin-passkey': adminPasskey
      }
    });
  },
  updateColdZoneSettings: (deviceId, targetTemp, coolerOn, fanOn) =>
    api.post('/device/update_cold_zone_settings', {
      device_id: deviceId,
      target_temp: targetTemp,
      cooler_on: coolerOn,
      fan_on: fanOn,
    }),
  getAlerts: (deviceId) => api.get('/device/alerts', { params: { device_id: deviceId } }),
  
  // Admin endpoints - passkey automatically added by interceptor
  getAllDevices: () => api.get('/device/all-devices'),
  getAdminStats: () => api.get('/device/admin-stats'),
  seedDevices: (bagType, quantity) => api.post('/device/seed-devices', { bagType, quantity }),
};

// Export the configured axios instance
export default api;

// User API calls
export const userAPI = {
  getProfile: (userId) => api.get(`/user/profile/${userId}`),
  updateProfile: (userId, updates) => api.put(`/user/profile/${userId}`, updates),
  deleteAccount: (userId) => api.delete(`/user/account/${userId}`),
};

// Helper functions
export const isAuthenticated = async () => {
  try {
    const { session } = await authHelpers.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const { user } = await authHelpers.getUser();
    return user;
  } catch (error) {
    return null;
  }
};