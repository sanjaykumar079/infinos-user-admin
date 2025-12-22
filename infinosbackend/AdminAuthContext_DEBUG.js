// FILE: AdminAuthContext_DEBUG.js
// Simplified version with extensive logging for debugging

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

// HARDCODED passkey for testing - should match exactly
const ADMIN_PASSKEY = "INFINOS2025ADMIN";

console.log('🔐 AdminAuthContext loaded');
console.log('📝 Expected passkey:', ADMIN_PASSKEY);
console.log('📝 Passkey length:', ADMIN_PASSKEY.length);

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    console.log('🔍 Checking admin authentication...');
    try {
      const adminAuth = localStorage.getItem('admin_authenticated');
      const adminExpiry = localStorage.getItem('admin_auth_expiry');
      const adminPasskeyStored = localStorage.getItem('admin_passkey');
      
      console.log('📦 LocalStorage values:', {
        adminAuth,
        adminExpiry,
        adminPasskeyStored
      });
      
      if (adminAuth === 'true' && adminExpiry && adminPasskeyStored) {
        const expiryTime = parseInt(adminExpiry);
        const now = Date.now();
        
        console.log('⏰ Expiry check:', {
          expiryTime,
          now,
          isValid: now < expiryTime
        });
        
        if (now < expiryTime) {
          if (adminPasskeyStored === ADMIN_PASSKEY) {
            setIsAdminAuthenticated(true);
            setAdminUser({ role: 'admin', passkey: adminPasskeyStored });
            console.log('✅ Admin session restored');
          } else {
            console.log('❌ Stored passkey mismatch');
            console.log('   Stored:', adminPasskeyStored);
            console.log('   Expected:', ADMIN_PASSKEY);
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
    console.log('🧹 Clearing admin session...');
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_expiry');
    localStorage.removeItem('admin_passkey');
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  };

  const loginAdmin = async (passkey) => {
    console.log('\n🔑 Admin login attempt started');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Log raw input
      console.log('📥 Raw input:', passkey);
      console.log('📏 Raw length:', passkey?.length);
      
      // Normalize input
      const normalizedInput = (passkey || '').trim();
      const normalizedExpected = ADMIN_PASSKEY.trim();
      
      console.log('\n📝 After normalization:');
      console.log('   Input:', `"${normalizedInput}"`);
      console.log('   Expected:', `"${normalizedExpected}"`);
      console.log('   Input length:', normalizedInput.length);
      console.log('   Expected length:', normalizedExpected.length);
      
      // Character-by-character comparison
      console.log('\n🔤 Character comparison:');
      for (let i = 0; i < Math.max(normalizedInput.length, normalizedExpected.length); i++) {
        const inputChar = normalizedInput[i] || '(missing)';
        const expectedChar = normalizedExpected[i] || '(missing)';
        const match = inputChar === expectedChar ? '✅' : '❌';
        console.log(`   [${i}] "${inputChar}" vs "${expectedChar}" ${match}`);
      }
      
      // Final comparison
      const isMatch = normalizedInput === normalizedExpected;
      console.log('\n🎯 Final result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
      
      if (!isMatch) {
        console.log('❌ Login failed - passkey mismatch');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return { 
          success: false, 
          error: 'Invalid admin passkey. Please check and try again.' 
        };
      }

      // Set admin session
      setIsAdminAuthenticated(true);
      setAdminUser({ role: 'admin', passkey: normalizedInput });
      
      // Store in localStorage
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_auth_expiry', expiryTime.toString());
      localStorage.setItem('admin_passkey', normalizedInput);
      
      console.log('✅ Admin login successful');
      console.log('📦 Stored in localStorage');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Admin login error:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
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