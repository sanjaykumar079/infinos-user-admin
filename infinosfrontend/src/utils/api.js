// FILE: infinosfrontend/src/utils/api.js
// FIXED: Proper API URL configuration for production

import axios from 'axios';
import { authHelpers } from '../supabaseClient';

// CRITICAL FIX: Get API URL from environment variable
const getApiBaseUrl = () => {
  // Check if we're in production (Amplify)
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'http://infinos-prod-env.eba-jgg4gcm3.ap-south-1.elasticbeanstalk.com';
  }
  // Development
  return 'http://localhost:4000';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for Elastic Beanstalk
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Log the request
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      
      // Check if this is an admin request
      const isAdminRoute = config.url?.includes('/admin') || 
                          config.url?.includes('admin-stats') || 
                          config.url?.includes('all-devices') ||
                          config.url?.includes('seed-devices');
      
      if (isAdminRoute) {
        const adminPasskey = localStorage.getItem('admin_passkey');
        
        if (adminPasskey) {
          config.headers['x-admin-passkey'] = adminPasskey;
          console.log('✅ Admin passkey added to request');
        } else {
          console.warn('⚠️ No admin passkey found');
        }
      } else {
        // Regular user request
        const accessToken = await authHelpers.getAccessToken();
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log('✅ User token added to request');
        }
      }

      return config;
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle 403 for admin endpoints
    if (error.response?.status === 403) {
      const isAdminRoute = originalRequest.url?.includes('/admin') || 
                          originalRequest.url?.includes('admin-stats') || 
                          originalRequest.url?.includes('all-devices');
      
      if (isAdminRoute) {
        console.error('❌ Admin auth failed - clearing session');
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_expiry');
        localStorage.removeItem('admin_passkey');
        
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    }

    // Handle 401 for users
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Attempting to refresh session...');
        const { data, error: refreshError } = await authHelpers.refreshSession();

        if (refreshError || !data.session) {
          console.error('❌ Session refresh failed');
          await authHelpers.signOut();
          window.location.href = '/';
          return Promise.reject(error);
        }

        const newAccessToken = data.session.access_token;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log('✅ Session refreshed, retrying request');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh error:', refreshError);
        await authHelpers.signOut();
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    // Network errors
    if (!error.response) {
      console.error('❌ Network error - cannot reach server');
      console.error('Is the backend running at:', API_BASE_URL);
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
  
  // Admin endpoints
  getAllDevices: () => api.get('/device/all-devices'),
  getAdminStats: () => api.get('/device/admin-stats'),
  seedDevices: (bagType, quantity) => api.post('/device/seed-devices', { bagType, quantity }),
};

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