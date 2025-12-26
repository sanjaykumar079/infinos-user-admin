// FILE: infinosfrontend/src/AdminDashboard.js
// UPDATED - Categorize devices by user with detailed user info

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deviceAPI } from "./utils/api";
import { useAdminAuth } from "./contexts/AdminAuthContext";
import "./AdminDashboard.css";
import axios from "axios";

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
      try {
        const usersRes = await axios.get('http://localhost:4000/auth/users', {
          headers: {
            'x-admin-passkey': adminPasskey
          }
        });
        console.log('✅ Users loaded:', usersRes.data?.users?.length || 0);
        
        const allUsers = usersRes.data?.users || [];
        setUsers(allUsers);

        // Group devices by user
        const devicesByUser = {};
        
        console.log('🔍 Debugging device grouping:');
        console.log('Total devices:', allDevices.length);
        console.log('Total users:', allUsers.length);
        
        allDevices.forEach(device => {
          console.log('Device:', device.name, 'owner_id:', device.owner_id, 'is_claimed:', device.is_claimed);
          
          if (device.owner_id && device.is_claimed) {
            if (!devicesByUser[device.owner_id]) {
              const user = allUsers.find(u => u.id === device.owner_id);
              console.log('Found user for device:', user);
              devicesByUser[device.owner_id] = {
                user: user || { 
                  id: device.owner_id, 
                  email: 'Unknown User',
                  name: 'Unknown User'
                },
                devices: []
              };
            }
            devicesByUser[device.owner_id].devices.push(device);
          }
        });

        console.log('Final devicesByUser:', devicesByUser);
        setUserDevicesMap(devicesByUser);
        console.log('✅ Grouped devices by user:', Object.keys(devicesByUser).length);
      } catch (err) {
        console.error('❌ Error fetching users:', err);
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
      await deviceAPI.createDevice({
        name: newDevice.name,
        device_code: newDevice.device_code,
        bag_type: newDevice.bag_type
      });

      // Reset form and close modal
      setNewDevice({ name: "", device_code: "", bag_type: "dual-zone" });
      setShowAddDeviceModal(false);
      
      // Refresh data
      fetchAdminData();
    } catch (err) {
      setAddDeviceError(err.response?.data?.message || err.message || 'Failed to add device');
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
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
            </svg>
          </div>
          <h2>Failed to Load Dashboard</h2>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="admin-action-btn" onClick={handleRetry}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
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
          
          <div className="admin-header-actions">
            <button 
              className="admin-add-device-btn"
              onClick={() => setShowAddDeviceModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="btn-text">Add Device</span>
            </button>
            
            <button className="admin-logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2"/>
                <polyline points="16 17 21 12 16 7" strokeWidth="2"/>
                <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2"/>
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
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
                  <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/>
                  <path d="M12 18h.01" strokeWidth="2"/>
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
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2"/>
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
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
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
                  <path d="M12 2v20M2 12h20" strokeWidth="2"/>
                  <circle cx="7" cy="7" r="3" fill="#EF4444" stroke="none"/>
                  <circle cx="17" cy="17" r="3" fill="#3B82F6" stroke="none"/>
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
                  <path d="M12 2v20" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="5" fill="#EF4444" stroke="none"/>
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
                  <path d="M12 2v20M2 12h20" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="5" fill="#3B82F6" stroke="none"/>
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2"/>
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
              <rect x="3" y="3" width="7" height="7" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" strokeWidth="2"/>
            </svg>
            <span className="tab-text">Overview</span>
          </button>
          <button
            className={`admin-tab ${activeTab === "users" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
              <circle cx="9" cy="7" r="4" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"/>
            </svg>
            <span className="tab-text">Users & Devices ({Object.keys(userDevicesMap).length})</span>
          </button>
          <button
            className={`admin-tab ${activeTab === "devices" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/>
              <path d="M12 18h.01" strokeWidth="2"/>
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
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add New Device
                </button>
                <button 
                  className="admin-action-btn-secondary"
                  onClick={() => setActiveTab("users")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                  View Users & Devices
                </button>
                <button 
                  className="admin-action-btn-secondary"
                  onClick={handleRetry}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users & Devices Tab */}
        {activeTab === "users" && (
          <div className="admin-table-container" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            {Object.keys(userDevicesMap).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>
                  No users with claimed devices yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(userDevicesMap).map(([userId, userData]) => (
                  <div key={userId} style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
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
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6B35, #E55A2B)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {userData.user.name?.[0] || userData.user.email?.[0] || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '18px', 
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '4px'
                        }}>
                          {userData.user.name || 'Unknown User'}
                        </h3>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '14px', 
                          color: '#6B7280',
                          fontFamily: 'monospace'
                        }}>
                          {userData.user.email}
                        </p>
                      </div>
                      <div style={{
                        padding: '8px 16px',
                        background: '#F3F4F6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        {userData.devices.length} {userData.devices.length === 1 ? 'Device' : 'Devices'}
                      </div>
                    </div>

                    {/* User's Devices */}
                    <table className="admin-table" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th>Device Name</th>
                          <th>Device Code</th>
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
                              <span className={`admin-type-badge ${
                                device.bag_type === 'dual-zone' ? 'admin-type-dual' : 
                                device.bag_type === 'cooling-only' ? 'admin-type-cooler' : 
                                'admin-type-heating'
                              }`} style={{
                                background: device.bag_type === 'cooling-only' ? '#DBEAFE' : undefined,
                                color: device.bag_type === 'cooling-only' ? '#1E40AF' : undefined
                              }}>
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Devices Tab */}
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
                        <span className={`admin-type-badge ${
                          device.bag_type === 'dual-zone' ? 'admin-type-dual' : 
                          device.bag_type === 'cooling-only' ? 'admin-type-cooler' :
                          'admin-type-heating'
                        }`} style={{
                          background: device.bag_type === 'cooling-only' ? '#DBEAFE' : undefined,
                          color: device.bag_type === 'cooling-only' ? '#1E40AF' : undefined
                        }}>
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
        )}
      </div>

      {/* Add Device Modal */}
      {showAddDeviceModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddDeviceModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Add New Device</h2>
              <button 
                className="admin-modal-close"
                onClick={() => setShowAddDeviceModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddDevice}>
              <div className="admin-form-group">
                <label htmlFor="deviceName">Device Name</label>
                <input
                  id="deviceName"
                  type="text"
                  placeholder="e.g., Delivery Bag #1"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="deviceCode">Device Code</label>
                <input
                  id="deviceCode"
                  type="text"
                  placeholder="e.g., INF-001"
                  value={newDevice.device_code}
                  onChange={(e) => setNewDevice({ ...newDevice, device_code: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="bagType">Bag Type</label>
                <select
                  id="bagType"
                  value={newDevice.bag_type}
                  onChange={(e) => setNewDevice({ ...newDevice, bag_type: e.target.value })}
                  required
                >
                  <option value="dual-zone">Dual-Zone (Hot & Cold)</option>
                  <option value="heating-only">Heating Only</option>
                  <option value="cooling-only">Cooling Only</option>
                </select>
              </div>

              {addDeviceError && (
                <div className="admin-form-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {addDeviceError}
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setShowAddDeviceModal(false)}
                  disabled={addDeviceLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn"
                  disabled={addDeviceLoading}
                >
                  {addDeviceLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add Device
                    </>
                  )}
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