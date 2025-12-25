// FILE: infinosfrontend/src/AdminLogin.js
// FIXED - Proper Admin Authentication

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "./contexts/AdminAuthContext";
import "./AdminLogin.css";

function AdminLogin() {
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (!passkey.trim()) {
      setError("Please enter your admin passkey");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('🔐 Attempting admin login...');
      
      // Call login function from context
      const result = await loginAdmin(passkey.trim());
      
      if (result.success) {
        console.log('✅ Admin login successful - redirecting to dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('❌ Admin login failed:', result.error);
        setError(result.error || 'Invalid admin passkey. Please try again.');
        setPasskey("");
      }
    } catch (err) {
      console.error('❌ Admin login exception:', err);
      setError('An error occurred during login. Please try again.');
      setPasskey("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-layout">
      <button className="back-to-user-btn" onClick={() => navigate('/')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to User Login
      </button>

      <div className="admin-login-container">
        {/* Left Side - Branding */}
        <div className="admin-login-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="brand-title">INFINOS</h1>
            <p className="brand-tagline">Administrative Control Panel</p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Complete System Control</h3>
                  <p>Monitor all devices, users, and system metrics from one centralized dashboard</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Secure Authentication</h3>
                  <p>Enterprise-grade security with passkey-based access control</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Real-Time Analytics</h3>
                  <p>Live insights into system performance and user engagement</p>
                </div>
              </div>
            </div>

            <div className="branding-stats">
              <div className="stat-box">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Monitoring</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">100%</div>
                <div className="stat-label">Secure</div>
              </div>
            </div>
          </div>

          <div className="branding-pattern">
            <div className="pattern-circle pattern-circle-1"></div>
            <div className="pattern-circle pattern-circle-2"></div>
            <div className="pattern-circle pattern-circle-3"></div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-side">
          <div className="login-form-container">
            {/* Logo for mobile */}
            <div className="mobile-logo">
              <div className="mobile-logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2"/>
                  <path d="M2 17l10 5 10-5" strokeWidth="2"/>
                  <path d="M2 12l10 5 10-5" strokeWidth="2"/>
                </svg>
              </div>
              <span>INFINOS Admin</span>
            </div>

            <div className="login-header">
              <div className="lock-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className="login-title">Admin Access</h2>
              <p className="login-subtitle">
                Enter your administrative passkey to continue
              </p>
            </div>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleAdminLogin}>
              <div className="input-group">
                <label className="input-label" htmlFor="passkey">
                  Administrative Passkey
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                    </svg>
                  </div>
                  <input
                    id="passkey"
                    type={showPasskey ? "text" : "password"}
                    placeholder="Enter your passkey"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="input-field"
                    autoFocus
                    disabled={loading}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowPasskey(!showPasskey)}
                    disabled={loading}
                  >
                    {showPasskey ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="input-hint">
                  Contact your system administrator if you've forgotten your passkey
                </p>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading || !passkey.trim()}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Access Admin Panel</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <div className="security-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>Secured by INFINOS</span>
              </div>
              <p className="footer-text">
                This is a restricted area. Unauthorized access attempts are logged and monitored.
              </p>
            </div>

            <div className="help-section">
              <p>
                Need assistance? Contact{" "}
                <a href="mailto:admin@infinos.com" className="help-link">
                  admin@infinos.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;