// FILE: infinosfrontend/src/AdminDashboard.js - COMPLETE UPDATED VERSION

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { deviceAPI } from "./utils/api";
import { useAdminAuth } from "./contexts/AdminAuthContext";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const navigate = useNavigate();
  const { logoutAdmin } = useAdminAuth();

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin statistics
      const statsRes = await deviceAPI.getAdminStats();
      setStats(statsRes.data);
      
      // Fetch all devices
      const devicesRes = await deviceAPI.getAllDevices();
      setDevices(devicesRes.data || []);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-layout">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-brand">
            <div className="admin-header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2"/>
                <path d="M2 17l10 5 10-5" strokeWidth="2"/>
                <path d="M2 12l10 5 10-5" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h1 className="admin-header-title">INFINOS Admin</h1>
              <p className="admin-header-subtitle">System Overview Dashboard</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              className="admin-add-device-btn"
              onClick={() => setShowAddDeviceModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Device
            </button>
            
            <button className="admin-logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2"/>
                <polyline points="16 17 21 12 16 7" strokeWidth="2"/>
                <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats Grid */}
        {stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card admin-stat-primary">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Unique Owners</p>
                <h2 className="admin-stat-value">{stats.uniqueOwners}</h2>
                <p className="admin-stat-description">Active users</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-devices">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/>
                  <path d="M12 18h.01" strokeWidth="2"/>
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Total Devices</p>
                <h2 className="admin-stat-value">{stats.totalDevices}</h2>
                <p className="admin-stat-description">All bags registered</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-success">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2"/>
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Online Devices</p>
                <h2 className="admin-stat-value">{stats.onlineDevices}</h2>
                <p className="admin-stat-description">Currently active</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-warning">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Offline Devices</p>
                <h2 className="admin-stat-value">{stats.offlineDevices}</h2>
                <p className="admin-stat-description">Needs attention</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-dual">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v20M2 12h20" strokeWidth="2"/>
                  <circle cx="7" cy="7" r="3" fill="#EF4444" stroke="none"/>
                  <circle cx="17" cy="17" r="3" fill="#3B82F6" stroke="none"/>
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Dual-Zone Bags</p>
                <h2 className="admin-stat-value">{stats.dualZoneBags}</h2>
                <p className="admin-stat-description">Hot & Cold zones</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-heating">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v20" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="5" fill="#EF4444" stroke="none"/>
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Heating-Only Bags</p>
                <h2 className="admin-stat-value">{stats.heatingOnlyBags}</h2>
                <p className="admin-stat-description">Hot zone only</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-success">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2"/>
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Claimed Devices</p>
                <h2 className="admin-stat-value">{stats.claimedDevices}</h2>
                <p className="admin-stat-description">Assigned to users</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-warning">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/>
                  <path d="M12 18h.01" strokeWidth="2"/>
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Unclaimed Devices</p>
                <h2 className="admin-stat-value">{stats.unclaimedDevices}</h2>
                <p className="admin-stat-description">Available inventory</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "overview" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" strokeWidth="2"/>
            </svg>
            Overview
          </button>
          <button
            className={`admin-tab ${activeTab === "devices" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/>
              <path d="M12 18h.01" strokeWidth="2"/>
            </svg>
            All Devices ({devices.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="admin-overview">
            <div className="admin-card">
              <h3 className="admin-card-title">System Health</h3>
              <div className="admin-health-grid">
                <div className="admin-health-item">
                  <div className="admin-health-bar">
                    <div 
                      className="admin-health-fill admin-health-success" 
                      style={{ 
                        width: `${stats && stats.totalDevices > 0 
                          ? (stats.onlineDevices / stats.totalDevices * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="admin-health-label">
                    Device Uptime: {stats && stats.totalDevices > 0 
                      ? (stats.onlineDevices / stats.totalDevices * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card-title">Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  className="admin-action-btn"
                  onClick={() => setShowAddDeviceModal(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add New Device
                </button>
                <button 
                  className="admin-action-btn-secondary"
                  onClick={() => setActiveTab("devices")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                  View All Devices
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Device Code</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Claimed</th>
                  <th>Battery</th>
                  <th>Hot Zone</th>
                  <th>Cold Zone</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                      <p style={{ color: '#6B7280', fontSize: '14px' }}>
                        No devices found. Click "Add Device" to create your first device.
                      </p>
                    </td>
                  </tr>
                ) : (
                  devices.map((device) => (
                    <tr key={device.id}>
                      <td><strong>{device.name}</strong></td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {device.device_code}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-type-badge ${device.bag_type === 'dual-zone' ? 'admin-type-dual' : 'admin-type-heating'}`}>
                          {device.bag_type === 'dual-zone' ? 'Dual-Zone' : 'Heating-Only'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${device.status ? 'admin-badge-success' : 'admin-badge-error'}`}>
                          {device.status ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${device.is_claimed ? 'admin-badge-success' : 'admin-badge-error'}`}>
                          {device.is_claimed ? 'Claimed' : 'Available'}
                        </span>
                      </td>
                      <td>{device.battery_charge_level?.toFixed(0) || 0}%</td>
                      <td>{device.hot_zone_current_temp?.toFixed(1) || 'N/A'}°C</td>
                      <td>
                        {device.bag_type === 'dual-zone' 
                          ? `${device.cold_zone_current_temp?.toFixed(1) || 'N/A'}°C`
                          : '-'}
                      </td>
                      <td>
                        <small>{device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      {showAddDeviceModal && (
        <AddDeviceModal 
          onClose={() => setShowAddDeviceModal(false)}
          onDeviceAdded={() => {
            setShowAddDeviceModal(false);
            fetchAdminData();
          }}
        />
      )}
    </div>
  );
}

// Add Device Modal Component
function AddDeviceModal({ onClose, onDeviceAdded }) {
  const [formData, setFormData] = useState({
    bagType: 'heating-only',
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdDevices, setCreatedDevices] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setCreatedDevices([]);

    try {
      const response = await api.post('/device/seed-devices', {
        bagType: formData.bagType,
        quantity: parseInt(formData.quantity),
      });

      if (response.data.success) {
        setCreatedDevices(response.data.devices);
        setSuccess(response.data.message);
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onDeviceAdded();
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to create devices');
      }
    } catch (err) {
      console.error('Error creating devices:', err);
      setError(err.response?.data?.message || 'Failed to create devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Add New Devices</h2>
          <button style={modalStyles.closeBtn} onClick={onClose} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <div style={modalStyles.errorBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={modalStyles.successBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Bag Type</label>
            <select
              value={formData.bagType}
              onChange={(e) => setFormData({ ...formData, bagType: e.target.value })}
              style={modalStyles.select}
              disabled={loading || success}
            >
              <option value="heating-only">Heating-Only (Hot Zone)</option>
              <option value="dual-zone">Dual-Zone (Hot & Cold)</option>
            </select>
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Quantity</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              style={modalStyles.input}
              disabled={loading || success}
            />
            <p style={modalStyles.hint}>Number of devices to create (1-100)</p>
          </div>

          {createdDevices.length > 0 && (
            <div style={modalStyles.devicesCreated}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                Created Devices ({createdDevices.length}):
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '13px' }}>
                {createdDevices.map((device, index) => (
                  <div key={index} style={{ 
                    padding: '8px', 
                    background: '#F9FAFB', 
                    marginBottom: '6px', 
                    borderRadius: '6px',
                    fontFamily: 'monospace'
                  }}>
                    <strong>{device.code}</strong>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                      {device.type === 'dual-zone' ? 'Dual-Zone' : 'Heating-Only'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={modalStyles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={modalStyles.cancelBtn}
              disabled={loading}
            >
              {success ? 'Close' : 'Cancel'}
            </button>
            {!success && (
              <button
                type="submit"
                style={{
                  ...modalStyles.submitBtn,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div style={modalStyles.spinner}></div>
                    Creating...
                  </>
                ) : (
                  `Create ${formData.quantity} Device(s)`
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '1px solid #E5E7EB',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    color: '#6B7280',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background 0.2s',
  },
  form: {
    padding: '24px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    height: '44px',
    padding: '0 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    height: '44px',
    padding: '0 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '16px',
  },
  hint: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '8px 0 0 0',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    fontSize: '14px',
    borderBottom: '1px solid #FECACA',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontSize: '14px',
    borderBottom: '1px solid #A7F3D0',
  },
  devicesCreated: {
    marginBottom: '20px',
    padding: '16px',
    background: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  cancelBtn: {
    flex: 1,
    height: '44px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    background: 'white',
    color: '#374151',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  submitBtn: {
    flex: 1,
    height: '44px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};

export default AdminDashboard;