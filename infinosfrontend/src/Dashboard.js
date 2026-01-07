import { useEffect, useState } from "react";
import { deviceAPI } from "./utils/api";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import "./Dashboard.css";

function Dashboard({ user }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await deviceAPI.getSummary(user.id);
        setSummary(res.data);
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [user.id]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Navbar user={user} />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="dashboard-layout">
        <Navbar user={user} />
        <div className="dashboard-error">
          <p>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar user={user} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Welcome back, {user.user_metadata?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your Bags today
            </p>
          </div>
          <div className="dashboard-header-actions" style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              }
            >
              Home
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/devices')}
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add Device
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <Card className="stat-card stat-card-total" hoverable>
            <div className="stat-icon stat-icon-total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Devices</p>
              <h2 className="stat-value">{summary.totalDevices}</h2>
              <p className="stat-description">Registered devices</p>
            </div>
          </Card>

          <Card className="stat-card stat-card-online" hoverable>
            <div className="stat-icon stat-icon-online">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Online</p>
              <h2 className="stat-value">{summary.onlineDevices}</h2>
              <p className="stat-description stat-success">
                {summary.totalDevices > 0
                  ? `${Math.round((summary.onlineDevices / summary.totalDevices) * 100)}% active`
                  : 'No devices'}
              </p>
            </div>
          </Card>

          <Card className="stat-card stat-card-offline" hoverable>
            <div className="stat-icon stat-icon-offline">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Offline</p>
              <h2 className="stat-value">{summary.offlineDevices}</h2>
              <p className="stat-description stat-warning">
                {summary.offlineDevices > 0 ? 'Needs attention' : 'All good'}
              </p>
            </div>
          </Card>

          <Card className="stat-card stat-card-alerts" hoverable>
            <div className="stat-icon stat-icon-alerts">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Alerts</p>
              <h2 className="stat-value">0</h2>
              <p className="stat-description">Active alerts</p>
            </div>
          </Card>
        </div>

        {/* Devices Table */}
        <Card
          title="Your Devices"
          subtitle={`${summary.totalDevices} device${summary.totalDevices !== 1 ? 's' : ''} registered`}
          className="devices-table-card"
        >
          {summary.devices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <path d="M12 18h.01" />
                </svg>
              </div>
              <h3 className="empty-state-title">No devices yet</h3>
              <p className="empty-state-description">
                Get started by adding your first IoT device
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/devices')}
                leftIcon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                }
              >
                Add Your First Device
              </Button>
            </div>
          ) : (
            <div className="devices-table-wrapper">
              <table className="devices-table">
                <thead>
                  <tr>
                    <th>Device Name</th>
                    <th>Status</th>
                    <th>Components</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.devices.map((device) => (
                    <tr key={device._id} className="device-row">
                      <td>
                        <div className="device-name-cell">
                          <div className="device-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <rect x="5" y="2" width="14" height="20" rx="2" />
                              <path d="M12 18h.01" />
                            </svg>
                          </div>
                          <span className="device-name">{device.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${device.status ? 'status-online' : 'status-offline'}`}>
                          <span className="status-dot"></span>
                          {device.status ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <div className="component-badges">
                          {device.heating?.length > 0 && (
                            <span className="component-badge component-heater">
                              {device.heating.length} Heater{device.heating.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {device.cooling?.length > 0 && (
                            <span className="component-badge component-cooler">
                              {device.cooling.length} Cooler{device.cooling.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {device.battery?.length > 0 && (
                            <span className="component-badge component-battery">
                              {device.battery.length} Battery
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="last-updated">Just now</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              localStorage.setItem("deviceid", device._id);
                              localStorage.setItem("open", "true");
                              navigate("/control");
                            }}
                            disabled={!device.status}
                          >
                            Control
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/devices')}
                          >
                            Manage
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Card title="Quick Actions" className="quick-actions-card">
            <div className="quick-action-grid">
              <button className="quick-action-btn" onClick={() => navigate('/devices')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Device</span>
              </button>

              <button className="quick-action-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>View Reports</span>
              </button>

              <button className="quick-action-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6" />
                </svg>
                <span>Settings</span>
              </button>

              <button className="quick-action-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>Help & Support</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;