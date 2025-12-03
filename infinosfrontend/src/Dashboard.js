import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard({ user }) {
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSummary() {
      const res = await axios.get("/device/summary", {
        params: { ownerId: user.id },
      });
      setSummary(res.data);
    }
    fetchSummary();
  }, [user.id]);

  if (!summary) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Hi, {user.user_metadata?.name || user.email} 👋</h1>
      <p>You have {summary.totalDevices} devices.</p>

      {/* Top summary cards */}
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <div style={cardStyle}>
          <h3>Total Devices</h3>
          <p style={bigNumber}>{summary.totalDevices}</p>
        </div>
        <div style={cardStyle}>
          <h3>Online</h3>
          <p style={bigNumber}>{summary.onlineDevices}</p>
        </div>
        <div style={cardStyle}>
          <h3>Offline</h3>
          <p style={bigNumber}>{summary.offlineDevices}</p>
        </div>
      </div>

      {/* Device list */}
      <h2 style={{ marginTop: 32 }}>Your Devices</h2>
      {summary.devices.length === 0 && <p>No devices yet. Add one from Devices page.</p>}

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thTd}>Name</th>
            <th style={thTd}>Status</th>
            <th style={thTd}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {summary.devices.map((d) => (
            <tr key={d._id}>
              <td style={thTd}>{d.name}</td>
              <td style={thTd}>{d.status ? "Online" : "Offline"}</td>
              <td style={thTd}>
                <button
                  onClick={() => {
                    localStorage.setItem("deviceid", d._id);
                    localStorage.setItem("open", "true");
                    navigate("/control");
                  }}
                  style={{ marginRight: 8 }}
                >
                  Control
                </button>
                {/* Later: Manage Access */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cardStyle = {
  flex: 1,
  padding: 16,
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
};

const bigNumber = { fontSize: 28, fontWeight: "bold" };

const thTd = {
  borderBottom: "1px solid #eee",
  padding: "8px 4px",
  textAlign: "left",
};

export default Dashboard;
