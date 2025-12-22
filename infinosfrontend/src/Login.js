// FILE: infinosfrontend/src/Login.js
// FIXED - Simplified User Authentication

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Simple Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email first");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data?.user) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) {
        setError("Google sign-in failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
                <path d="M12 18h.01" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="brand-title">INFINOS</h1>
            <p className="brand-tagline">IoT Device Management System</p>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" />
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
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    <path d="M12 1v6m0 6v6" strokeWidth="2" />
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
                    <path d="M3 3v18h18" strokeWidth="2" />
                    <path d="m19 9-5 5-4-4-5 5" strokeWidth="2" />
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
                <div className="stat-label">Devices</div>
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
              <p className="login-subtitle">Sign in to your account</p>
            </div>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Google Login Button */}
            <button
              type="button"
              className="google-login-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="divider">
              <span>Or continue with email</span>
            </div>

            {/* Email/Password Form */}
            <form className="login-form" onSubmit={handleEmailLogin}>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2" />
                      <polyline points="22,6 12,13 2,6" strokeWidth="2" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-toggle"
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

              <button
                type="submit"
                className="google-login-btn"
                disabled={loading}
                style={{
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                }}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                      <polyline points="12 5 19 12 12 19" strokeWidth="2" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <button 
                className="admin-access-btn"
                onClick={() => navigate('/admin/login')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                </svg>
                Admin Access
              </button>

              <p className="footer-text">
                By signing in, you agree to our{" "}
                <a href="#" className="footer-link">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="footer-link">Privacy Policy</a>
              </p>
            </div>

            <div className="help-section">
              <p>
                Need help?{" "}
                <a href="mailto:support@infinos.com" className="help-link">
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