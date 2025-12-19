// FILE: infinosfrontend/src/supabaseClient.js
// Enhanced Supabase client with authentication helpers

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://alvkqnhltsdrufcyoueo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdmtxbmhsdHNkcnVmY3lvdWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Mzc1NDUsImV4cCI6MjA4MDMxMzU0NX0.Sq4NaZo1kSTM6yTS9wWPGGlgBpps7ycErdA-u6_rDgo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  // Sign up with email and password
  signUp: async (email, password, metadata = {}) => {
    try {
      console.log('Signing up with Supabase:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
      } else {
        console.log('Supabase signup success:', data);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Signup exception:', error);
      return { data: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      return { session: null, error };
    }
  },

  // Get current user
  getUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Update user metadata
  updateUser: async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser(updates);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reset password request
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update password
  updatePassword: async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get access token (JWT)
  getAccessToken: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Refresh session
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Verify email with OTP
  verifyOtp: async (email, token, type = 'email') => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  // Handle different auth events
  switch (event) {
    case 'SIGNED_IN':
      console.log('User signed in');
      break;
    case 'SIGNED_OUT':
      console.log('User signed out');
      localStorage.removeItem('auth_token');
      break;
    case 'TOKEN_REFRESHED':
      console.log('Token refreshed');
      break;
    case 'USER_UPDATED':
      console.log('User updated');
      break;
    case 'PASSWORD_RECOVERY':
      console.log('Password recovery initiated');
      break;
    default:
      break;
  }
});