// FILE: infinosfrontend/src/utils/api.js
// CRITICAL FIX: Use HTTPS and correct backend URL

import axios from 'axios';
import { authHelpers } from '../supabaseClient';

// ✅ FIXED: Always use HTTPS in production (Amplify requires HTTPS)
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // ❌ OLD (Mixed Content Error):
    // return 'http://infinos-prod-env.eba-jgg4gcm3.ap-south-1.elasticbeanstalk.com';
    
    // ✅ NEW: Check if backend supports HTTPS first
    const backendUrl = process.env.REACT_APP_API_URL;
    
    if (!backendUrl) {
      console.error('⚠️ REACT_APP_API_URL not set in environment!');
      return 'http://infinos-prod-env.eba-jgg4gcm3.ap-south-1.elasticbeanstalk.com';
    }
    
    // Ensure HTTPS for production
    return backendUrl.replace('http://', 'https://');
  }
  
  // Development
  return process.env.REACT_APP_API_URL || 'http://localhost:4000';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📍 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ NEW: Add withCredentials for CORS
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      
      // Admin routes
      const isAdminRoute = config.url?.includes('/admin') || 
                          config.url?.includes('admin-stats') || 
                          config.url?.includes('all-devices');
      
      if (isAdminRoute) {
        const adminPasskey = localStorage.getItem('admin_passkey');
        if (adminPasskey) {
          config.headers['x-admin-passkey'] = adminPasskey;
          console.log('✅ Admin passkey added');
        } else {
          console.warn('⚠️ No admin passkey for admin route');
        }
      } else {
        // User routes
        const accessToken = await authHelpers.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log('✅ User token added');
        } else {
          console.warn('⚠️ No access token for user route');
        }
      }

      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
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
    console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log detailed error info
    console.error('❌ API Error Details:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      baseURL: originalRequest?.baseURL,
    });

    // Handle specific errors
    if (error.message === 'Network Error') {
      console.error('❌ NETWORK ERROR - Cannot reach backend');
      console.error('Backend URL:', API_BASE_URL);
      console.error('Is backend running and accessible?');
      console.error('Check CORS configuration on backend');
    }

    // Handle 403 for admin
    if (error.response?.status === 403) {
      const isAdminRoute = originalRequest.url?.includes('/admin');
      if (isAdminRoute) {
        console.error('❌ Admin auth failed');
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_expiry');
        localStorage.removeItem('admin_passkey');
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }
    }

    // Handle 401 for users
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data, error: refreshError } = await authHelpers.refreshSession();
        if (!refreshError && data.session) {
          originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed');
      }
      await authHelpers.signOut();
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

// Device API calls
export const deviceAPI = {
  // Test endpoint
  healthCheck: () => api.get('/health'),
  
  // User endpoints
  getMyDevices: (ownerId) => {
    console.log('📱 Fetching devices for owner:', ownerId);
    return api.get('/device/my-devices', { params: { ownerId } });
  },
  
  getSummary: (ownerId) => {
    console.log('📊 Fetching summary for owner:', ownerId);
    return api.get('/device/summary', { params: { ownerId } });
  },
  
  getDevice: (deviceId) => {
    console.log('📱 Fetching device:', deviceId);
    return api.get('/device/get_device', { params: { device_id: deviceId } });
  },
  
  verifyDeviceCode: (deviceCode) => {
    console.log('🔍 Verifying device code:', deviceCode);
    return api.get('/device/verify-code', { params: { deviceCode } });
  },
  
  claimDevice: (deviceCode, ownerId, deviceName) => {
    console.log('🎯 Claiming device:', { deviceCode, ownerId, deviceName });
    return api.post('/device/claim', { deviceCode, ownerId, deviceName });
  },
  
  updateDevice: (deviceId, status) => {
    console.log('🔄 Updating device status:', { deviceId, status });
    return api.post('/device/update_device', { device_id: deviceId, status });
  },
  
  updateHotZoneSettings: (deviceId, targetTemp, heaterOn, fanOn) => {
    console.log('🔥 Updating hot zone:', { deviceId, targetTemp, heaterOn, fanOn });
    return api.post('/device/update_hot_zone_settings', {
      device_id: deviceId,
      target_temp: targetTemp,
      heater_on: heaterOn,
      fan_on: fanOn,
    });
  },
  
  updateColdZoneSettings: (deviceId, targetTemp, coolerOn, fanOn) => {
    console.log('❄️ Updating cold zone:', { deviceId, targetTemp, coolerOn, fanOn });
    return api.post('/device/update_cold_zone_settings', {
      device_id: deviceId,
      target_temp: targetTemp,
      cooler_on: coolerOn,
      fan_on: fanOn,
    });
  },
  
  // Admin endpoints
  getAllDevices: () => {
    console.log('👑 Fetching all devices (admin)');
    return api.get('/device/all-devices');
  },
  
  getAdminStats: () => {
    console.log('📊 Fetching admin stats');
    return api.get('/device/admin-stats');
  },
};

export default api;

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