// FILE: infinosfrontend/src/contexts/AdminAuthContext.js
// FIXED - Admin Authentication with better debugging and validation

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

// Admin passkey - MUST match exactly with backend .env
const ADMIN_PASSKEY = "INFINOS2025ADMIN";

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      console.log('🔍 Checking admin authentication...');
      
      const adminAuth = localStorage.getItem('admin_authenticated');
      const adminExpiry = localStorage.getItem('admin_auth_expiry');
      const adminPasskeyStored = localStorage.getItem('admin_passkey');
      
      if (adminAuth === 'true' && adminExpiry && adminPasskeyStored) {
        const expiryTime = parseInt(adminExpiry);
        const now = Date.now();
        
        // Check if session is still valid (24 hours)
        if (now < expiryTime) {
          // Verify the passkey is still correct
          if (adminPasskeyStored === ADMIN_PASSKEY) {
            setIsAdminAuthenticated(true);
            setAdminUser({ role: 'admin', passkey: adminPasskeyStored });
            console.log('✅ Admin session restored');
          } else {
            console.log('❌ Stored passkey mismatch, clearing session');
            clearAdminSession();
          }
        } else {
          console.log('⏰ Admin session expired');
          clearAdminSession();
        }
      } else {
        console.log('ℹ️ No admin session found');
      }
    } catch (error) {
      console.error('❌ Error checking admin auth:', error);
      clearAdminSession();
    } finally {
      setLoading(false);
    }
  };

  const clearAdminSession = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_expiry');
    localStorage.removeItem('admin_passkey');
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  };

  const loginAdmin = async (passkey) => {
    try {
      console.log('🔑 Admin login attempt');
      console.log('📝 Expected passkey:', ADMIN_PASSKEY);
      console.log('📝 Expected length:', ADMIN_PASSKEY.length);
      
      // Trim and normalize input - remove ALL whitespace
      const normalizedInput = (passkey || '').replace(/\s+/g, '').toUpperCase();
      const normalizedExpected = ADMIN_PASSKEY.replace(/\s+/g, '').toUpperCase();
      
      console.log('📝 Normalized input:', normalizedInput);
      console.log('📝 Input length:', normalizedInput.length);
      console.log('📝 Normalized expected:', normalizedExpected);
      console.log('📝 Expected length:', normalizedExpected.length);
      
      if (!normalizedInput) {
        console.log('❌ Empty passkey');
        return { 
          success: false, 
          error: 'Please enter your admin passkey' 
        };
      }
      
      // Compare normalized strings
      if (normalizedInput !== normalizedExpected) {
        console.log('❌ Invalid passkey');
        console.log('🔍 Character-by-character comparison:');
        for (let i = 0; i < Math.max(normalizedInput.length, normalizedExpected.length); i++) {
          const inputChar = normalizedInput[i] || 'MISSING';
          const expectedChar = normalizedExpected[i] || 'MISSING';
          const match = inputChar === expectedChar ? '✓' : '✗';
          console.log(`  [${i}] Input: "${inputChar}" Expected: "${expectedChar}" ${match}`);
        }
        return { 
          success: false, 
          error: 'Invalid admin passkey. Please check and try again.' 
        };
      }

      // Set admin session
      console.log('✅ Passkey verified - setting session');
      setIsAdminAuthenticated(true);
      setAdminUser({ role: 'admin', passkey: ADMIN_PASSKEY });
      
      // Store in localStorage with 24-hour expiry
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_auth_expiry', expiryTime.toString());
      localStorage.setItem('admin_passkey', ADMIN_PASSKEY);
      
      console.log('✅ Admin login successful');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Admin login error:', error);
      return { 
        success: false, 
        error: 'An error occurred during login. Please try again.' 
      };
    }
  };

  const logoutAdmin = () => {
    console.log('👋 Admin logging out');
    clearAdminSession();
  };

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdminAuthenticated, 
        adminUser,
        loginAdmin, 
        logoutAdmin, 
        loading 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;