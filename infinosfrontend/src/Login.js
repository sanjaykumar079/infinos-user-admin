// FILE: infinosfrontend/src/Login.js
// REPLACE ENTIRE FILE

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useAdminAuth } from "./contexts/AdminAuthContext";
import "./Login.css";

function Login() {
  const [loginMode, setLoginMode] = useState("user"); // "user" or "admin"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminPasskey, setAdminPasskey] = useState("");
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  const handleUserLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Login error:", error.message);
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    
    if (!adminPasskey.trim()) {
      setError("Please enter the admin passkey");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      const result = loginAdmin(adminPasskey);
      
      if (result.success) {
        navigate("/admin/dashboard");
      } else {
        setError(result.error || "Invalid admin passkey");
        setAdminPasskey("");
      }
      
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-layout">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/>
                <path d="M12 18h.01" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="brand-title">INFINOS</h1>
            <p className="brand-tagline">IoT Device Management System</p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Real-time Monitoring</h3>
                  <p>Track temperature, humidity, and battery levels instantly</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                    <path d="M12 1v6m0 6v6" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Remote Control</h3>
                  <p>Adjust settings and manage devices from anywhere</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 3v18h18" strokeWidth="2"/>
                    <path d="m19 9-5 5-4-4-5 5" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Data Analytics</h3>
                  <p>Visualize trends and generate compliance reports</p>
                </div>
              </div>
            </div>

            <div className="branding-stats">
              <div className="stat-box">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Devices Managed</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Monitoring</div>
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
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Choose your login method</p>
            </div>

            {/* Login Mode Tabs */}
            <div className="login-mode-tabs">
              <button
                className={`login-mode-tab ${loginMode === "user" ? "login-mode-tab-active" : ""}`}
                onClick={() => {
                  setLoginMode("user");
                  setError("");
                  setAdminPasskey("");
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                </svg>
                User Login
              </button>
              <button
                className={`login-mode-tab ${loginMode === "admin" ? "login-mode-tab-active" : ""}`}
                onClick={() => {
                  setLoginMode("admin");
                  setError("");
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                </svg>
                Admin Login
              </button>
            </div>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* User Login */}
            {loginMode === "user" && (
              <div className="login-form">
                <button
                  className="google-login-btn"
                  onClick={handleUserLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="btn-spinner"></div>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <div className="divider">
                  <span>User Access</span>
                </div>

                <div className="alternative-login">
                  <p>Sign in to manage your IoT devices</p>
                </div>
              </div>
            )}

            {/* Admin Login */}
            {loginMode === "admin" && (
              <form onSubmit={handleAdminLogin} className="login-form">
                <div className="admin-input-group">
                  <label htmlFor="passkey" className="admin-input-label">
                    Admin Passkey
                  </label>
                  <div className="admin-input-wrapper">
                    <div className="admin-input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2"/>
                      </svg>
                    </div>
                    <input
                      id="passkey"
                      type="password"
                      className="admin-input-field"
                      value={adminPasskey}
                      onChange={(e) => setAdminPasskey(e.target.value)}
                      placeholder="Enter admin passkey"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="google-login-btn"
                  disabled={loading || !adminPasskey.trim()}
                  style={{
                    background: loading || !adminPasskey.trim() 
                      ? '#E5E7EB' 
                      : 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner" style={{borderColor: 'white', borderTopColor: 'transparent'}}></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeWidth="2"/>
                        <polyline points="10 17 15 12 10 7" strokeWidth="2"/>
                        <line x1="15" y1="12" x2="3" y2="12" strokeWidth="2"/>
                      </svg>
                      <span>Sign In as Admin</span>
                    </>
                  )}
                </button>

                <div className="divider">
                  <span>Secure Admin Access</span>
                </div>

                <div className="alternative-login">
                  <p>⚠️ Unauthorized access attempts are logged</p>
                </div>
              </form>
            )}

            <div className="login-footer">
              <p className="footer-text">
                By signing in, you agree to our{" "}
                <a href="#" className="footer-link">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="footer-link">Privacy Policy</a>
              </p>
            </div>

            <div className="help-section">
              <p>Need help? <a href="#" className="help-link">Contact Support</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;