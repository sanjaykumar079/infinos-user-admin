// FILE: infinosfrontend-admin/src/AdminLogin.js
// FULLY RESPONSIVE Admin Login with Passkey Authentication

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './contexts/AdminAuthContext';
import './AdminLogin.css';

function AdminLogin() {
    const [passkey, setPasskey] = useState('');
    const [showPasskey, setShowPasskey] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginAdmin } = useAdminAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await loginAdmin(passkey);

            if (result.success) {
                console.log('✅ Login successful, redirecting to dashboard...');
                navigate('/admin/dashboard');
            } else {
                setError(result.error || 'Invalid passkey. Please try again.');
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-layout">
            <div className="admin-login-container">
                {/* Branding Side - Hidden on Mobile */}
                <div className="admin-login-branding">
                    <div className="branding-content">
                        <div className="brand-logo">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" />
                                <path d="M2 17l10 5 10-5" strokeWidth="2" />
                                <path d="M2 12l10 5 10-5" strokeWidth="2" />
                            </svg>
                        </div>
                        <h1 className="brand-title">INFINOS</h1>
                        <p className="brand-tagline">Smart Thermal Bag Management System</p>

                        <div className="features-list">
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                                        <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                                        <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
                                        <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className="feature-text">
                                    <h3>Real-Time Monitoring</h3>
                                    <p>Track all devices and user activities in real-time with comprehensive dashboards</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className="feature-text">
                                    <h3>Secure Access</h3>
                                    <p>Enterprise-grade security with encrypted passkey authentication</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className="feature-text">
                                    <h3>Advanced Analytics</h3>
                                    <p>Get insights into device performance and user engagement metrics</p>
                                </div>
                            </div>
                        </div>

                        <div className="branding-stats">
                            <div className="stat-box">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Uptime</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">Secure</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">∞</div>
                                <div className="stat-label">Devices</div>
                            </div>
                        </div>
                    </div>

                    {/* Animated Background Pattern */}
                    <div className="branding-pattern">
                        <div className="pattern-circle pattern-circle-1"></div>
                        <div className="pattern-circle pattern-circle-2"></div>
                        <div className="pattern-circle pattern-circle-3"></div>
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="login-form-side">
                    <div className="login-form-container">
                        {/* Mobile Logo - Shown only on mobile */}
                        <div className="mobile-logo">
                            <div className="mobile-logo-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" />
                                    <path d="M2 17l10 5 10-5" strokeWidth="2" />
                                    <path d="M2 12l10 5 10-5" strokeWidth="2" />
                                </svg>
                            </div>
                            <span>INFINOS Admin</span>
                        </div>

                        {/* Login Header */}
                        <div className="login-header">
                            <div className="lock-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <h2 className="login-title">Admin Access</h2>
                            <p className="login-subtitle">Enter your passkey to continue</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Login Form */}
                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label" htmlFor="passkey">
                                    Admin Passkey
                                </label>
                                <div className="input-wrapper">
                                    <svg
                                        className="input-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                    >
                                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeWidth="2" />
                                    </svg>
                                    <input
                                        id="passkey"
                                        type={showPasskey ? 'text' : 'password'}
                                        className="input-field"
                                        value={passkey}
                                        onChange={(e) => setPasskey(e.target.value)}
                                        placeholder="Enter admin passkey"
                                        disabled={loading}
                                        required
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        className="input-toggle"
                                        onClick={() => setShowPasskey(!showPasskey)}
                                        disabled={loading}
                                        aria-label={showPasskey ? 'Hide passkey' : 'Show passkey'}
                                    >
                                        {showPasskey ? (
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
                                <p className="input-hint">
                                    Use the secure passkey provided by your system administrator
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
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeWidth="2" />
                                            <polyline points="10 17 15 12 10 7" strokeWidth="2" />
                                            <line x1="15" y1="12" x2="3" y2="12" strokeWidth="2" />
                                        </svg>
                                        <span>Access Dashboard</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="login-footer">
                            <div className="security-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" />
                                    <polyline points="9 12 11 14 15 10" strokeWidth="2" />
                                </svg>
                                Secure Connection
                            </div>
                            <p className="footer-text">
                                Protected by enterprise-grade encryption. Your passkey is never stored in plain text.
                            </p>

                            <div className="help-section">
                                <p>
                                    Lost your passkey? Contact{' '}
                                    <a href="mailto:admin@infinos.com" className="help-link">
                                        admin@infinos.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
