// FILE: infinosfrontend/src/Login.js
// Updated with better email verification handling

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authHelpers } from "./supabaseClient";
import { useAdminAuth } from "./contexts/AdminAuthContext";
import "./Login.css";

function Login() {
  const [loginMode, setLoginMode] = useState("user"); // "user" or "admin"
  const [authMode, setAuthMode] = useState("signin"); // "signin", "signup", "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState("");
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  // Email/Password Sign In
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authHelpers.signIn(email, password);

      if (error) {
        // Handle specific error messages
        if (error.message.includes("Email not confirmed")) {
          setError(
            "Please verify your email address before signing in. Check your inbox (and spam folder) for the verification link."
          );
        } else if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(error.message || "Failed to sign in");
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          setError(
            "Please verify your email address before signing in. Check your inbox for the verification link."
          );
          setLoading(false);
          return;
        }

        // Successfully signed in, navigate to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign Up
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email || !password || !confirmPassword || !fullName) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authHelpers.signUp(email, password, {
        name: fullName,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(error.message || "Failed to sign up");
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Check if email confirmation is required
        const confirmationRequired = !data.user.email_confirmed_at && !data.session;

        if (confirmationRequired) {
          // Email confirmation required
          setSuccess(
            "🎉 Account created! Please check your email (including spam/junk folder) to verify your account. " +
            "Once verified, you can sign in. Didn't receive the email? Try signing up again or contact support."
          );
        } else {
          // Email confirmation disabled or already confirmed
          setSuccess("🎉 Account created successfully! Redirecting to dashboard...");
          
          // Automatically redirect after 2 seconds
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }

        // Clear form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");

        // If confirmation required, switch to sign in after delay
        if (confirmationRequired) {
          setTimeout(() => {
            setAuthMode("signin");
            setSuccess("");
            setError("");
          }, 8000);
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authHelpers.resetPassword(email);

      if (error) {
        setError(error.message || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSuccess(
        "✉️ Password reset email sent! Please check your inbox (and spam folder). " +
        "Click the link in the email to reset your password."
      );
      setEmail("");

      // Switch back to sign in after 5 seconds
      setTimeout(() => {
        setAuthMode("signin");
        setSuccess("");
        setError("");
      }, 5000);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await authHelpers.signInWithGoogle();

      if (error) {
        setError("Failed to sign in with Google. Please try again.");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Admin Login
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

  // Email validation helper
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
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
                  setSuccess("");
                  setAdminPasskey("");
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                  <circle cx="12" cy="7" r="4" strokeWidth="2" />
                </svg>
                User Login
              </button>
              <button
                className={`login-mode-tab ${loginMode === "admin" ? "login-mode-tab-active" : ""}`}
                onClick={() => {
                  setLoginMode("admin");
                  setError("");
                  setSuccess("");
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                </svg>
                Admin Login
              </button>
            </div>

            {/* Error/Success Messages */}
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

            {success && (
              <div className="success-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* User Login Forms */}
            {loginMode === "user" && (
              <>
                {authMode === "signin" && (
                  <form className="login-form" onSubmit={handleEmailSignIn}>
                    <div className="input-group">
                      <label className="input-label" htmlFor="email">
                        Email Address
                      </label>
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
                      <label className="input-label" htmlFor="password">
                        Password
                      </label>
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

                    <div className="forgot-password">
                      <button
                        type="button"
                        className="forgot-password-link"
                        onClick={() => {
                          setAuthMode("reset");
                          setError("");
                          setSuccess("");
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button type="submit" className="google-login-btn" disabled={loading}>
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

                    <div className="divider">
                      <span>Or continue with</span>
                    </div>

                    <button
                      type="button"
                      className="google-oauth-btn"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
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
                    </button>

                    <div className="auth-switch">
                      <p>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          className="auth-switch-link"
                          onClick={() => {
                            setAuthMode("signup");
                            setError("");
                            setSuccess("");
                          }}
                        >
                          Sign up
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {authMode === "signup" && (
                  <form className="login-form" onSubmit={handleEmailSignUp}>
                    <div className="input-group">
                      <label className="input-label" htmlFor="fullName">
                        Full Name
                      </label>
                      <div className="input-wrapper">
                        <div className="input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                            <circle cx="12" cy="7" r="4" strokeWidth="2" />
                          </svg>
                        </div>
                        <input
                          id="fullName"
                          type="text"
                          className="input-field"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          disabled={loading}
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="signupEmail">
                        Email Address
                      </label>
                      <div className="input-wrapper">
                        <div className="input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2" />
                            <polyline points="22,6 12,13 2,6" strokeWidth="2" />
                          </svg>
                        </div>
                        <input
                          id="signupEmail"
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
                      <label className="input-label" htmlFor="signupPassword">
                        Password
                      </label>
                      <div className="input-wrapper">
                        <div className="input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                          </svg>
                        </div>
                        <input
                          id="signupPassword"
                          type={showPassword ? "text" : "password"}
                          className="input-field"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={loading}
                          autoComplete="new-password"
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
                      <p className="input-hint">Minimum 8 characters</p>
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="confirmPassword">
                        Confirm Password
                      </label>
                      <div className="input-wrapper">
                        <div className="input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                          </svg>
                        </div>
                        <input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          className="input-field"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={loading}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <button type="submit" className="google-login-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="btn-spinner"></div>
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                            <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                          </svg>
                        </>
                      )}
                    </button>

                    <div className="auth-switch">
                      <p>
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="auth-switch-link"
                          onClick={() => {
                            setAuthMode("signin");
                            setError("");
                            setSuccess("");
                          }}
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {authMode === "reset" && (
                  <form className="login-form" onSubmit={handlePasswordReset}>
                    <div className="reset-password-info">
                      <p>
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="resetEmail">
                        Email Address
                      </label>
                      <div className="input-wrapper">
                        <div className="input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2" />
                            <polyline points="22,6 12,13 2,6" strokeWidth="2" />
                          </svg>
                        </div>
                        <input
                          id="resetEmail"
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

                    <button type="submit" className="google-login-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="btn-spinner"></div>
                          Sending reset link...
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" />
                          </svg>
                        </>
                      )}
                    </button>

                    <div className="auth-switch">
                      <p>
                        Remember your password?{" "}
                        <button
                          type="button"
                          className="auth-switch-link"
                          onClick={() => {
                            setAuthMode("signin");
                            setError("");
                            setSuccess("");
                          }}
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </>
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
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" />
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
                    background:
                      loading || !adminPasskey.trim()
                        ? "#E5E7EB"
                        : "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
                    color: "white",
                    border: "none",
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        className="btn-spinner"
                        style={{ borderColor: "white", borderTopColor: "transparent" }}
                      ></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeWidth="2" />
                        <polyline points="10 17 15 12 10 7" strokeWidth="2" />
                        <line x1="15" y1="12" x2="3" y2="12" strokeWidth="2" />
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
                <a href="#" className="footer-link">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="footer-link">
                  Privacy Policy
                </a>
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