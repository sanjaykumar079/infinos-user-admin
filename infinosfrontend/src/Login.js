// FILE: infinosfrontend/src/Login.js
// ENHANCED - Modern UI with Resend email integration

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./Login.css";

function Login() {
  const [mode, setMode] = useState("signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for saved email
    const savedEmail = localStorage.getItem('infinos_remember_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    // Check for email verification or password reset tokens
    const type = searchParams.get('type');
    const token = searchParams.get('token');

    if (type === 'recovery' && token) {
      setMode('reset-password');
      setSuccess('Please enter your new password');
    } else if (type === 'signup' && token) {
      handleEmailVerification();
    }
  }, [searchParams]);

  const handleEmailVerification = async () => {
    try {
      setLoading(true);
      console.log('✅ Email verified automatically by Supabase');
      setSuccess('Email verified successfully! You can now sign in.');
      setMode('signin');
    } catch (err) {
      console.error('❌ Email verification error:', err);
      setError(err.message || 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return null;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', color: '#EF4444', width: '33%' };
    if (strength <= 4) return { level: 'medium', color: '#F59E0B', width: '66%' };
    return { level: 'strong', color: '#10B981', width: '100%' };
  };

  // Sign Up Handler with Resend
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Creating new account with Resend email...');

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      console.log('✅ Account created:', data);

      if (data?.user && !data.user.confirmed_at) {
        setSuccess(
          `🎉 Account created successfully! We've sent a verification email to ${formData.email}. Please check your inbox and verify your account before signing in.`
        );
        setMode('verify-email');
      } else {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      }

      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
      });
    } catch (err) {
      console.error('❌ Sign up error:', err);
      if (err.message.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign In Handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Signing in...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) throw error;

      console.log('✅ Sign in successful:', data);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('infinos_remember_email', formData.email.trim());
      } else {
        localStorage.removeItem('infinos_remember_email');
      }

      if (data?.user) {
        navigate("/");
      }
    } catch (err) {
      console.error('❌ Sign in error:', err);
      if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Please verify your email address before signing in. Check your inbox for the verification email.");
        setMode('verify-email');
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      console.log('🔐 Initiating Google sign in...');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('❌ Google sign in error:', err);
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  // Forgot Password Handler with Resend
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log('📧 Sending password reset email via Resend...');

      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email.trim(),
        {
          redirectTo: `${window.location.origin}/`,
        }
      );

      if (error) throw error;

      setSuccess(
        `📧 Password reset email sent to ${formData.email}! Please check your inbox (and spam folder) for the reset link.`
      );
      console.log('✅ Password reset email sent via Resend');
    } catch (err) {
      console.error('❌ Password reset error:', err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.password) {
      setError("Please enter a new password");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log('🔒 Updating password...');

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      setSuccess("✅ Password updated successfully! Redirecting to dashboard...");
      console.log('✅ Password updated');

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error('❌ Password update error:', err);
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Email
  const resendVerificationEmail = async () => {
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('📧 Resending verification email via Resend...');

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email.trim(),
      });

      if (error) throw error;

      setSuccess(`✅ Verification email resent to ${formData.email}!`);
    } catch (err) {
      console.error('❌ Resend error:', err);
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
    setFormData({
      email: formData.email,
      password: "",
      confirmPassword: "",
      fullName: "",
    });
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <div className="modern-login-layout">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="modern-login-container">
        {/* Left Side - Enhanced Branding */}
        <div className="modern-branding">
          <div className="branding-header">
            <div className="logo-container">
              <div className="logo-glow"></div>
              <svg className="logo-icon" width="60" height="60" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12l10 5 10-5" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="100%" stopColor="#F7931E" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="brand-title-modern">INFINOS</h1>
            <p className="brand-subtitle-modern">Smart Delivery Bag Management</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-modern">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Real-Time Control</h3>
              <p>Monitor temperature & humidity instantly</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-modern">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Battery Monitoring</h3>
              <p>Track power levels and charging status</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-modern">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeWidth="2" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeWidth="2" />
                  <line x1="12" y1="22.08" x2="12" y2="12" strokeWidth="2" />
                </svg>
              </div>
              <h3>Cloud Sync</h3>
              <p>Access your data from anywhere, anytime</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-modern">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                </svg>
              </div>
              <h3>Secure Access</h3>
              <p>Enterprise-grade security & encryption</p>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Active Devices</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>


        </div>

        {/* Right Side - Modern Form */}
        <div className="modern-form-side">
          <div className="modern-form-container">
            {/* Mobile Logo */}
            <div className="mobile-brand">
              <div className="mobile-logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#FF6B35" strokeWidth="2" />
                  <path d="M2 17l10 5 10-5" stroke="#FF6B35" strokeWidth="2" />
                  <path d="M2 12l10 5 10-5" stroke="#FF6B35" strokeWidth="2" />
                </svg>
              </div>
              <span>INFINOS</span>
            </div>

            {/* Form Header */}
            <div className="form-header-modern">
              <h2 className="form-title-modern">
                {mode === 'signin' && '👋 Welcome Back'}
                {mode === 'signup' && '🚀 Create Account'}
                {mode === 'forgot-password' && '🔐 Reset Password'}
                {mode === 'reset-password' && '🔑 New Password'}
                {mode === 'verify-email' && '📧 Verify Email'}
              </h2>
              <p className="form-subtitle-modern">
                {mode === 'signin' && 'Sign in to manage your smart delivery bags'}
                {mode === 'signup' && 'Join INFINOS and start managing your devices'}
                {mode === 'forgot-password' && "We'll send you a secure reset link"}
                {mode === 'reset-password' && 'Choose a strong password for your account'}
                {mode === 'verify-email' && 'Check your email to complete registration'}
              </p>
            </div>

            {/* Mode Tabs */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="mode-tabs-modern">
                <button
                  className={`mode-tab-modern ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => switchMode('signin')}
                  disabled={loading}
                >
                  Sign In
                </button>
                <button
                  className={`mode-tab-modern ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => switchMode('signup')}
                  disabled={loading}
                >
                  Sign Up
                </button>
                <div className={`tab-indicator ${mode === 'signup' ? 'right' : 'left'}`}></div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="message-box error-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
                  <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="message-box success-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            {(mode === 'signin' || mode === 'signup') && (
              <>
                <button
                  type="button"
                  className="google-btn-modern"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="divider-modern">
                  <span>or continue with email</span>
                </div>
              </>
            )}

            {/* Forms */}
            {mode === 'signin' && (
              <form className="modern-form" onSubmit={handleSignIn}>
                <div className="input-group-modern">
                  <label className="input-label-modern">Email Address</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
                      <path d="M3 7l9 6 9-6" strokeWidth="2" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      className="input-field-modern"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="input-group-modern">
                  <label className="input-label-modern">Password</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="input-field-modern"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-password-modern"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" />
                          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label-modern">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="checkbox-custom"></span>
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-link-modern"
                    onClick={() => switchMode('forgot-password')}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="submit-btn-modern"
                  disabled={loading || !formData.email || !formData.password}
                >
                  {loading ? (
                    <>
                      <div className="spinner-modern"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                        <polyline points="12 5 19 12 12 19" strokeWidth="2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {mode === 'signup' && (
              <form className="modern-form" onSubmit={handleSignUp}>
                <div className="input-group-modern">
                  <label className="input-label-modern">Full Name</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                      <circle cx="12" cy="7" r="4" strokeWidth="2" />
                    </svg>
                    <input
                      type="text"
                      name="fullName"
                      className="input-field-modern"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="input-group-modern">
                  <label className="input-label-modern">Email Address</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
                      <path d="M3 7l9 6 9-6" strokeWidth="2" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      className="input-field-modern"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="input-group-modern">
                  <label className="input-label-modern">Password</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="input-field-modern"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password-modern"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" />
                          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: passwordStrength.width,
                            backgroundColor: passwordStrength.color
                          }}
                        ></div>
                      </div>
                      <span className="strength-label" style={{ color: passwordStrength.color }}>
                        {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                      </span>
                    </div>
                  )}
                  <p className="input-hint-modern">
                    Must be 8+ characters with uppercase, lowercase & number
                  </p>
                </div>

                <div className="input-group-modern">
                  <label className="input-label-modern">Confirm Password</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                    </svg>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="input-field-modern"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password-modern"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" />
                          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn-modern"
                  disabled={loading || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword}
                >
                  {loading ? (
                    <>
                      <div className="spinner-modern"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                        <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {mode === 'forgot-password' && (
              <form className="modern-form" onSubmit={handleForgotPassword}>
                <div className="reset-info-box">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" />
                  </svg>
                  <p>Enter your email address and we'll send you a secure link to reset your password via Resend.</p>
                </div>

                <div className="input-group-modern">
                  <label className="input-label-modern">Email Address</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
                      <path d="M3 7l9 6 9-6" strokeWidth="2" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      className="input-field-modern"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      disabled={loading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn-modern"
                  disabled={loading || !formData.email}
                >
                  {loading ? (
                    <>
                      <div className="spinner-modern"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="back-btn-modern"
                  onClick={() => switchMode('signin')}
                  disabled={loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="19" y1="12" x2="5" y2="12" strokeWidth="2" />
                    <polyline points="12 19 5 12 12 5" strokeWidth="2" />
                  </svg>
                  <span>Back to Sign In</span>
                </button>
              </form>
            )}

            {mode === 'reset-password' && (
              <form className="modern-form" onSubmit={handleResetPassword}>
                <div className="input-group-modern">
                  <label className="input-label-modern">New Password</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="input-field-modern"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="toggle-password-modern"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" />
                          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: passwordStrength.width,
                            backgroundColor: passwordStrength.color
                          }}
                        ></div>
                      </div>
                      <span className="strength-label" style={{ color: passwordStrength.color }}>
                        {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="input-group-modern">
                  <label className="input-label-modern">Confirm New Password</label>
                  <div className="input-wrapper-modern">
                    <svg className="input-icon-modern" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                    </svg>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="input-field-modern"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password-modern"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" />
                          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn-modern"
                  disabled={loading || !formData.password || !formData.confirmPassword}
                >
                  {loading ? (
                    <>
                      <div className="spinner-modern"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                        <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {mode === 'verify-email' && (
              <div className="verify-email-modern">
                <div className="verify-icon-large">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2" />
                    <polyline points="22,6 12,13 2,6" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="verify-title">Check Your Email</h3>
                <p className="verify-text">
                  We've sent a verification email to <strong>{formData.email}</strong>.
                  Click the link in the email to verify your account.
                </p>
                <div className="verify-actions">
                  <button
                    className="resend-btn-modern"
                    onClick={resendVerificationEmail}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-modern"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="23 4 23 10 17 10" strokeWidth="2" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" strokeWidth="2" />
                        </svg>
                        <span>Resend Email</span>
                      </>
                    )}
                  </button>
                  <button
                    className="back-btn-modern"
                    onClick={() => switchMode('signin')}
                    disabled={loading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="19" y1="12" x2="5" y2="12" strokeWidth="2" />
                      <polyline points="12 19 5 12 12 5" strokeWidth="2" />
                    </svg>
                    <span>Back to Sign In</span>
                  </button>
                </div>
                <p className="verify-hint">
                  Didn't receive the email? Check your spam folder or click resend.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="form-footer-modern">
              {/* <button
                className="admin-link-modern"
                onClick={() => navigate('/admin/login')}
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                </svg>
                Admin Access
              </button> */}

              <p className="terms-text">
                By continuing, you agree to our{" "}
                <a href="#" className="terms-link">Terms</a>
                {" & "}
                <a href="#" className="terms-link">Privacy Policy</a>
              </p>

              <p className="support-text">
                Need help?{" "}
                <a href="mailto:support@infinos.com" className="support-link">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;