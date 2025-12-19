import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

// Admin passkey from environment variable (fallback for development)
const ADMIN_PASSKEY = (process.env.REACT_APP_ADMIN_PASSKEY || "INFINOS2025ADMIN").trim();

// Debug: Log the passkey being used
console.log('🔐 Admin passkey loaded:', ADMIN_PASSKEY ? '✓ Set' : '✗ Not set');

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated
    const checkAuth = () => {
      try {
        const adminAuth = localStorage.getItem('admin_authenticated');
        const adminExpiry = localStorage.getItem('admin_auth_expiry');
        
        if (adminAuth === 'true' && adminExpiry) {
          const expiryTime = parseInt(adminExpiry);
          const now = Date.now();
          
          // Check if session is still valid (24 hours)
          if (now < expiryTime) {
            setIsAdminAuthenticated(true);
          } else {
            // Session expired, clear it
            localStorage.removeItem('admin_authenticated');
            localStorage.removeItem('admin_auth_expiry');
            setIsAdminAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginAdmin = (passkey) => {
    // Normalize: trim whitespace and compare
    const normalizedInput = (passkey || '').trim();
    const normalizedExpected = ADMIN_PASSKEY.trim();
    
    console.log('🔑 Passkey input length:', normalizedInput.length);
    console.log('🔑 Expected passkey length:', normalizedExpected.length);
    console.log('🔑 Input first 5 chars:', normalizedInput?.substring(0, 5) + '...');
    console.log('🔑 Expected first 5 chars:', normalizedExpected?.substring(0, 5) + '...');
    console.log('🔑 Exact match:', normalizedInput === normalizedExpected);
    
    if (normalizedInput === normalizedExpected) {
      setIsAdminAuthenticated(true);
      
      // Set expiry to 24 hours from now
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_auth_expiry', expiryTime.toString());
      
      console.log('✅ Admin login successful');
      return { success: true };
    }
    
    console.log('❌ Admin login failed - passkey mismatch');
    console.log('📝 Expected:', normalizedExpected);
    console.log('📝 Got:', normalizedInput);
    return { success: false, error: 'Invalid passkey. Please check and try again.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_expiry');
    console.log('Admin logged out');
  };

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdminAuthenticated, 
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