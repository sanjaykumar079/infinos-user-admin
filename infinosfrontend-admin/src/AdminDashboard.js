// FILE: infinosfrontend/src/AdminDashboard.js
// FULLY RESPONSIVE with Mobile Support

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deviceAPI } from "./utils/api";
import { useAdminAuth } from "./contexts/AdminAuthContext";
import "./AdminDashboard.css";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [userDevicesMap, setUserDevicesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [newDevice, setNewDevice] = useState({
    name: "",
    device_code: "",
    bag_type: "dual-zone"
  });
  const [addDeviceError, setAddDeviceError] = useState(null);
  const [addDeviceLoading, setAddDeviceLoading] = useState(false);
  const navigate = useNavigate();
  const { logoutAdmin } = useAdminAuth();

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, [retryCount]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching admin data...');

      const adminPasskey = localStorage.getItem('admin_passkey');
      if (!adminPasskey) {
        throw new Error('Admin authentication required');
      }

      console.log('🔑 Admin passkey found:', adminPasskey ? 'YES' : 'NO');

      // Fetch admin statistics
      const statsRes = await deviceAPI.getAdminStats();
      console.log('✅ Stats loaded:', statsRes.data);
      setStats(statsRes.data);

      // Fetch all devices
      const devicesRes = await deviceAPI.getAllDevices();
      console.log('✅ Devices loaded:', devicesRes.data?.length || 0);
      const allDevices = devicesRes.data || [];
      setDevices(allDevices);

      // Fetch all users with admin passkey
      console.log('👥 Fetching users from /auth/users endpoint...');
      try {
        const usersRes = await axios.get(`${API_BASE_URL}/auth/users`, {
          headers: {
            'x-admin-passkey': adminPasskey
          }
        });

        console.log('📦 Users API Response:', usersRes.data);

        const allUsers = usersRes.data?.users || [];
        console.log('✅ Parsed users count:', allUsers.length);

        if (allUsers.length > 0) {
          console.log('👤 Sample user structure:', JSON.stringify(allUsers[0], null, 2));
        }

        setUsers(allUsers);

        // Group devices by user
        const devicesByUser = {};

        console.log('🔍 Starting device grouping process...');

        const claimedDevices = allDevices.filter(d => d.is_claimed && d.owner_id);
        console.log('✅ Claimed devices:', claimedDevices.length);

        claimedDevices.forEach(device => {
          const user = allUsers.find(u => u.id === device.owner_id);

          console.log(`🔗 Processing device: "${device.name}" (owner: ${device.owner_id})`);

          if (user) {
            if (!devicesByUser[device.owner_id]) {
              devicesByUser[device.owner_id] = {
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name || user.user_metadata?.name || user.email.split('@')[0],
                  emailVerified: !!user.emailVerified || !!user.email_confirmed_at,
                  createdAt: user.createdAt || user.created_at
                },
                devices: []
              };
            }
            devicesByUser[device.owner_id].devices.push(device);
          } else {
            console.warn(`⚠️ No user found for owner_id: ${device.owner_id}`);
            if (!devicesByUser[device.owner_id]) {
              devicesByUser[device.owner_id] = {
                user: {
                  id: device.owner_id,
                  email: 'Unknown User',
                  name: 'Unknown User',
                  emailVerified: false
                },
                devices: []
              };
            }
            devicesByUser[device.owner_id].devices.push(device);
          }
        });

        console.log('✅ Grouped users with devices:', Object.keys(devicesByUser).length);
        setUserDevicesMap(devicesByUser);

      } catch (err) {
        console.error('❌ Error fetching users:', err);
        if (err.response?.status === 404) {
          console.error('❌ /auth/users endpoint not found! Check server.js');
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching admin data:", err);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
      setLoading(false);

      if (err.response?.status === 403) {
        logoutAdmin();
        navigate('/admin/login');
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const getBagTypeDisplay = (bagType) => {
    if (bagType === 'dual-zone') return 'Dual';
    if (bagType === 'heating-only') return 'Heat';
    if (bagType === 'cooling-only') return 'Cold';
    return bagType;
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    setAddDeviceError(null);
    setAddDeviceLoading(true);

    try {
      // Use the simple endpoint
      await axios.post(`${API_BASE_URL}/admin/add-device`, {
        name: newDevice.name,
        device_code: newDevice.device_code,
        bag_type: newDevice.bag_type,
        admin_key: 'infinos-admin-2024' // Pass in body
      });

      setNewDevice({ name: "", device_code: "", bag_type: "dual-zone" });
      setShowAddDeviceModal(false);
      fetchAdminData(); // Refresh the list
      alert('✅ Device created successfully!');
    } catch (err) {
      setAddDeviceError(err.response?.data?.message || 'Failed to add device');
    } finally {
      setAddDeviceLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="admin-dashboard-layout">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-dashboard-layout">
        <div className="admin-error">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
            </svg>
          </div>
          <h2>Failed to Load Dashboard</h2>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="admin-action-btn" onClick={handleRetry}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              Retry
            </button>
            <button className="admin-action-btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
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
                <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" />
                <path d="M2 17l10 5 10-5" strokeWidth="2" />
                <path d="M2 12l10 5 10-5" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h1 className="admin-header-title">INFINOS Admin</h1>
              <p className="admin-header-subtitle">System Overview Dashboard</p>
            </div>
          </div>

          <div className="admin-header-actions">
            <button
              className="admin-add-device-btn"
              onClick={() => setShowAddDeviceModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="btn-text">Add Device</span>
            </button>

            <button className="admin-logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" />
                <polyline points="16 17 21 12 16 7" strokeWidth="2" />
                <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" />
              </svg>
              <span className="btn-text">Logout</span>
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
                  <circle cx="9" cy="7" r="4" strokeWidth="2" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Unique Owners</p>
                <h2 className="admin-stat-value">{stats.uniqueOwners || 0}</h2>
                <p className="admin-stat-description">Active users</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-devices">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
                  <path d="M12 18h.01" strokeWidth="2" />
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Total Devices</p>
                <h2 className="admin-stat-value">{stats.totalDevices || 0}</h2>
                <p className="admin-stat-description">All bags registered</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-success">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" />
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Online Devices</p>
                <h2 className="admin-stat-value">{stats.onlineDevices || 0}</h2>
                <p className="admin-stat-description">Currently active</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-warning">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Offline Devices</p>
                <h2 className="admin-stat-value">{stats.offlineDevices || 0}</h2>
                <p className="admin-stat-description">Needs attention</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-dual">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v20M2 12h20" strokeWidth="2" />
                  <circle cx="7" cy="7" r="3" fill="#EF4444" stroke="none" />
                  <circle cx="17" cy="17" r="3" fill="#3B82F6" stroke="none" />
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Dual-Zone Bags</p>
                <h2 className="admin-stat-value">{stats.dualZoneBags || 0}</h2>
                <p className="admin-stat-description">Hot & Cold zones</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-heating">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v20" strokeWidth="2" />
                  <circle cx="12" cy="12" r="5" fill="#EF4444" stroke="none" />
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Heating-Only Bags</p>
                <h2 className="admin-stat-value">{stats.heatingOnlyBags || 0}</h2>
                <p className="admin-stat-description">Hot zone only</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-devices">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v20M2 12h20" strokeWidth="2" />
                  <circle cx="12" cy="12" r="5" fill="#3B82F6" stroke="none" />
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Cooling-Only Bags</p>
                <h2 className="admin-stat-value">{stats.coolingOnlyBags || 0}</h2>
                <p className="admin-stat-description">Cold zone only</p>
              </div>
            </div>

            <div className="admin-stat-card admin-stat-success">
              <div className="admin-stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                </svg>
              </div>
              <div className="admin-stat-content">
                <p className="admin-stat-label">Claimed Devices</p>
                <h2 className="admin-stat-value">{stats.claimedDevices || 0}</h2>
                <p className="admin-stat-description">Assigned to users</p>
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
              <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
            </svg>
            <span className="tab-text">Overview</span>
          </button>
          <button
            className={`admin-tab ${activeTab === "users" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
              <circle cx="9" cy="7" r="4" strokeWidth="2" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
            </svg>
            <span className="tab-text">Users & Devices ({Object.keys(userDevicesMap).length})</span>
          </button>
          <button
            className={`admin-tab ${activeTab === "devices" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
              <path d="M12 18h.01" strokeWidth="2" />
            </svg>
            <span className="tab-text">All Devices ({devices.length})</span>
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Device
                </button>
                <button
                  className="admin-action-btn-secondary"
                  onClick={() => setActiveTab("users")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  View Users & Devices
                </button>
                <button
                  className="admin-action-btn-secondary"
                  onClick={handleRetry}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users & Devices Tab */}
        {activeTab === "users" && (
          <div style={{ background: 'transparent' }}>
            {Object.keys(userDevicesMap).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '12px' }}>
                  No users with claimed devices yet.
                </p>
                <button
                  className="admin-action-btn-secondary"
                  onClick={handleRetry}
                  style={{ marginTop: '12px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  Refresh to Check Again
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(userDevicesMap).map(([userId, userData]) => (
                  <div key={userId} style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid #E5E7EB'
                  }}>
                    {/* User Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '20px',
                      paddingBottom: '20px',
                      borderBottom: '2px solid #F3F4F6'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6B35, #E55A2B)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        flexShrink: 0
                      }}>
                        {userData.user.name?.[0] || userData.user.email?.[0] || 'U'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {userData.user.name || 'Unknown User'}
                        </h3>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: '#6B7280',
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {userData.user.email}
                        </p>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        background: '#F3F4F6',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        {userData.devices.length} {userData.devices.length === 1 ? 'Device' : 'Devices'}
                      </div>
                    </div>

                    {/* User's Devices - Responsive Table */}
                    {/* User's Devices - Scrollable Table */}
                    <div style={{
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB'
                    }}>
                      <table className="admin-table" style={{ marginBottom: 0 }}>
                        <thead>
                          <tr>
                            <th>Device Name</th>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Battery</th>
                            <th>Hot Zone</th>
                            <th>Cold Zone</th>
                            <th>Last Seen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userData.devices.map((device) => (
                            <tr key={device.id}>
                              <td><strong>{device.name}</strong></td>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                  {device.device_code}
                                </span>
                              </td>
                              <td>
                                <span className={`admin-type-badge ${device.bag_type === 'dual-zone' ? 'admin-type-dual' :
                                    device.bag_type === 'cooling-only' ? 'admin-type-cooler' :
                                      'admin-type-heating'
                                  }`}>
                                  {getBagTypeDisplay(device.bag_type)}
                                </span>
                              </td>
                              <td>
                                <span className={`admin-badge ${device.status ? 'admin-badge-success' : 'admin-badge-error'}`}>
                                  {device.status ? 'Online' : 'Offline'}
                                </span>
                              </td>
                              <td>{device.battery_charge_level?.toFixed(0) || 0}%</td>
                              <td>
                                {device.bag_type !== 'cooling-only'
                                  ? `${device.hot_zone_current_temp?.toFixed(1) || 'N/A'}°C`
                                  : '-'}
                              </td>
                              <td>
                                {device.bag_type !== 'heating-only'
                                  ? `${device.cold_zone_current_temp?.toFixed(1) || 'N/A'}°C`
                                  : '-'}
                              </td>
                              <td>
                                <small>{device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Devices Tab */}
        {activeTab === "devices" && (
          <div className="admin-table-container">
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Device Name</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Claimed</th>
                    <th className="hide-mobile">Battery</th>
                    <th className="hide-mobile">Hot Zone</th>
                    <th className="hide-mobile">Cold Zone</th>
                    <th className="hide-mobile">Last Seen</th>
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
                          <span className={`admin-type-badge ${device.bag_type === 'dual-zone' ? 'admin-type-dual' :
                              device.bag_type === 'cooling-only' ? 'admin-type-cooler' :
                                'admin-type-heating'
                            }`}>
                            {getBagTypeDisplay(device.bag_type)}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${device.status ? 'admin-badge-success' : 'admin-badge-error'}`}>
                            {device.status ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${device.is_claimed ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                            {device.is_claimed ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="hide-mobile">{device.battery_charge_level?.toFixed(0) || 0}%</td>
                        <td className="hide-mobile">
                          {device.bag_type !== 'cooling-only'
                            ? `${device.hot_zone_current_temp?.toFixed(1) || 'N/A'}°C`
                            : '-'}
                        </td>
                        <td className="hide-mobile">
                          {device.bag_type !== 'heating-only'
                            ? `${device.cold_zone_current_temp?.toFixed(1) || 'N/A'}°C`
                            : '-'}
                        </td>
                        <td className="hide-mobile">
                          <small>{device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}</small>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      {showAddDeviceModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddDeviceModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Add New Device</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowAddDeviceModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {addDeviceError && (
              <div className="admin-form-error">
                {addDeviceError}
              </div>
            )}

            <form onSubmit={handleAddDevice}>
              <div className="admin-form-group">
                <label className="admin-form-label">Device Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="e.g., My INFINOS Bag"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Device Code</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={newDevice.device_code}
                  onChange={(e) => setNewDevice({ ...newDevice, device_code: e.target.value })}
                  placeholder="e.g., INF-1234"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Bag Type</label>
                <select
                  className="admin-form-select"
                  value={newDevice.bag_type}
                  onChange={(e) => setNewDevice({ ...newDevice, bag_type: e.target.value })}
                >
                  <option value="dual-zone">Dual-Zone (Hot & Cold)</option>
                  <option value="heating-only">Heating-Only</option>
                  <option value="cooling-only">Cooling-Only</option>
                </select>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-form-cancel"
                  onClick={() => setShowAddDeviceModal(false)}
                  disabled={addDeviceLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-form-submit"
                  disabled={addDeviceLoading}
                >
                  {addDeviceLoading ? 'Adding...' : 'Add Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;