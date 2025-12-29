// infinosfrontend-admin/src/utils/api.js

import axios from 'axios';

// API URL handling for production
const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        const backendUrl = process.env.REACT_APP_API_URL;

        if (!backendUrl) {
            console.error('⚠️ REACT_APP_API_URL not set!');
            return 'http://infinos-prod-env.eba-jgg4gcm3.ap-south-1.elasticbeanstalk.com';
        }

        console.log('✅ Using backend URL:', backendUrl);
        return backendUrl;
    }

    return process.env.REACT_APP_API_URL || 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        try {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);

            // Admin routes - add passkey header
            const adminPasskey = localStorage.getItem('admin_passkey');
            if (adminPasskey) {
                config.headers['x-admin-passkey'] = adminPasskey;
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
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Log error details
        console.error('❌ API Error:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });

        // Handle network errors
        if (error.message === 'Network Error') {
            console.error('❌ NETWORK ERROR - Check:');
            console.error('1. Backend is running');
            console.error('2. CORS is configured');
            console.error('3. URL is correct:', API_BASE_URL);
        }

        // Handle 403 admin - redirect to login
        if (error.response?.status === 403) {
            localStorage.removeItem('admin_authenticated');
            localStorage.removeItem('admin_auth_expiry');
            localStorage.removeItem('admin_passkey');
            window.location.href = '/admin/login';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

// Device API calls
export const deviceAPI = {
    // Health check
    healthCheck: () => api.get('/health'),

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
