import "./Control.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import api, { deviceAPI } from "./utils/api";
import Navbar from "./components/layout/Navbar";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import { Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart as ChartJS } from "chart.js/auto";

function BagControl() {
  const [activeTab, setActiveTab] = useState("control");
  const [device, setDevice] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingLogs, setDownloadingLogs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const deviceId = localStorage.getItem("deviceid");
      if (!deviceId) {
        navigate("/devices");
        return;
      }

      await getData();
      const interval = setInterval(getData, 5000);
      return () => clearInterval(interval);
    }
    init();
  }, []);

  const getData = async () => {
    const deviceId = localStorage.getItem("deviceid");
    if (!deviceId) return;

    try {
      const res = await deviceAPI.getDevice(deviceId);
      setDevice(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching device:", err);
      setLoading(false);
    }
  };

  const updateHotZoneSettings = async (targetTemp, heaterOn, fanOn) => {
    try {
      await deviceAPI.updateHotZoneSettings(device._id, targetTemp, heaterOn, fanOn);
      await getData();
    } catch (err) {
      console.error("Error updating hot zone:", err);
    }
  };

  const updateColdZoneSettings = async (targetTemp, coolerOn, fanOn) => {
    try {
      await deviceAPI.updateColdZoneSettings(device._id, targetTemp, coolerOn, fanOn);
      await getData();
    } catch (err) {
      console.error("Error updating cold zone:", err);
    }
  };

const getChartData = (history, label, color) => {
    if (!history || history.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            label,
            borderColor: color,
            backgroundColor: color.replace(")", ", 0.1)").replace("rgb", "rgba"),
          },
        ],
      };
    }

    // Sort by timestamp to ensure chronological order, then take last 20
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    const last20 = sortedHistory.slice(-20);
    
    return {
      labels: last20.map((r) => new Date(r.timestamp).toLocaleTimeString()),
      datasets: [
        {
          data: last20.map((r) => r.value),
          label,
          borderColor: color,
          backgroundColor: color.replace(")", ", 0.1)").replace("rgb", "rgba"),
          tension: 0.4,
        },
      ],
    };
  };

  // Download logs as PDF
  const downloadLogs = async () => {
    try {
      if (!device || !device._id) {
        alert("Device not found");
        return;
      }

      setDownloadingLogs(true);

      const deviceId = device._id;
      const res = await deviceAPI.getDevice(deviceId);

      const currentDevice = res.data;
      console.log("📱 Current device data:", currentDevice);

      const doc = new jsPDF();
      let yPosition = 10;
      let hasContent = false;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(4, 115, 217);
      doc.text(`Device Logs Report`, 10, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Device: ${currentDevice.name}`, 10, yPosition);
      yPosition += 5;
      doc.text(`Device ID: ${currentDevice._id}`, 10, yPosition);
      yPosition += 5;
      doc.text(
        `Bag Type: ${
          currentDevice.bagType === "dual-zone"
            ? "Dual-Zone (Hot & Cold)"
            : "Heating-Only"
        }`,
        10,
        yPosition
      );
      yPosition += 5;
      doc.text(`Downloaded: ${new Date().toLocaleString()}`, 10, yPosition);
      yPosition += 5;
      doc.text(
        `Status: ${currentDevice.status ? "✓ Online" : "✗ Offline"}`,
        10,
        yPosition
      );
      yPosition += 5;

      if (currentDevice.bag_temp !== undefined) {
        doc.text(
          `Current Bag Temperature: ${currentDevice.bag_temp}°C`,
          10,
          yPosition
        );
        yPosition += 5;
      }
      if (currentDevice.safety_low_temp !== undefined) {
        doc.text(
          `Safety Low Temp: ${currentDevice.safety_low_temp}°C`,
          10,
          yPosition
        );
        yPosition += 5;
      }
      if (currentDevice.safety_high_temp !== undefined) {
        doc.text(
          `Safety High Temp: ${currentDevice.safety_high_temp}°C`,
          10,
          yPosition
        );
        yPosition += 5;
      }

      yPosition += 5;

      // Heaters
      const heaterIds = Array.isArray(currentDevice.heating)
        ? currentDevice.heating
        : [];
      console.log("🔥 Heater IDs:", heaterIds);

      if (heaterIds.length > 0) {
        try {
          const heatersRes = await api.get("/device/get_heaters", {
            params: { heater_ids: heaterIds },
          });
          const heaters = Array.isArray(heatersRes.data) ? heatersRes.data : [];
          console.log("🔥 Heaters fetched:", heaters);

          if (heaters.length > 0) {
            doc.setFontSize(13);
            doc.setTextColor(239, 68, 68);
            doc.text("🔥 HOT ZONE - HEATER LOGS", 10, yPosition);
            yPosition += 7;
            hasContent = true;

            heaters.forEach((heater, idx) => {
              if (yPosition > 260) {
                doc.addPage();
                yPosition = 10;
              }

              doc.setFontSize(11);
              doc.setTextColor(50, 50, 50);
              doc.text(
                `Heater ${idx + 1}: ${heater.name || "Unknown"}`,
                10,
                yPosition
              );
              yPosition += 5;

              doc.setFontSize(9);
              doc.text(
                `Target Temperature: ${heater.desired_temp ?? 0}°C`,
                15,
                yPosition
              );
              yPosition += 4;
              doc.text(
                `Continuous Mode: ${heater.continous ? "Yes" : "No"}`,
                15,
                yPosition
              );
              yPosition += 4;
              doc.text(
                `Discrete Mode: ${heater.discrete ? "Yes" : "No"}`,
                15,
                yPosition
              );
              yPosition += 4;
              doc.text(`Fan: ${heater.fan ? "On" : "Off"}`, 15, yPosition);
              yPosition += 5;

              const obsTemp = Array.isArray(heater.observed_temp)
                ? heater.observed_temp
                : [];
              const obsHumidity = Array.isArray(heater.observed_humidity)
                ? heater.observed_humidity
                : [];

              console.log(
                `🔥 Heater ${idx} - Temps:`,
                obsTemp.length,
                "Humidity:",
                obsHumidity.length
              );

              const tableData = obsTemp.map((entry, i) => [
                entry.Date ? new Date(entry.Date).toLocaleString() : "N/A",
                (entry.obs_temp ?? 0).toFixed(2),
                obsHumidity[i]
                  ? (obsHumidity[i].obs_humidity ?? 0).toFixed(2)
                  : "N/A",
              ]);

              if (tableData.length > 0) {
                autoTable(doc, {
                  head: [["Timestamp", "Temp (°C)", "Humidity (%)"]],
                  body: tableData.slice(-25),
                  startY: yPosition,
                  margin: { left: 10, right: 10 },
                  headStyles: {
                    fillColor: [239, 68, 68],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: "bold",
                  },
                  bodyStyles: {
                    textColor: [50, 50, 50],
                    fontSize: 8,
                  },
                  alternateRowStyles: {
                    fillColor: [245, 245, 245],
                  },
                });
                yPosition = doc.lastAutoTable.finalY + 5;
              } else {
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text("No temperature data available", 15, yPosition);
                yPosition += 5;
              }
              yPosition += 3;
            });
          }
        } catch (err) {
          console.error("❌ Error fetching heaters:", err);
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 10;
          }
          doc.setFontSize(9);
          doc.setTextColor(255, 0, 0);
          doc.text("Error loading heater data: " + err.message, 10, yPosition);
          yPosition += 5;
        }
      }

      // Coolers
      const coolerIds = Array.isArray(currentDevice.cooling)
        ? currentDevice.cooling
        : [];
      console.log("❄️ Cooler IDs:", coolerIds);

      if (coolerIds.length > 0) {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 10;
        }

        try {
          const coolersRes = await api.get("/device/get_coolers", {
            params: { cooler_ids: coolerIds },
          });
          const coolers = Array.isArray(coolersRes.data) ? coolersRes.data : [];
          console.log("❄️ Coolers fetched:", coolers);

          if (coolers.length > 0) {
            doc.setFontSize(13);
            doc.setTextColor(59, 130, 246);
            doc.text("❄️ COLD ZONE - COOLER LOGS", 10, yPosition);
            yPosition += 7;
            hasContent = true;

            coolers.forEach((cooler, idx) => {
              if (yPosition > 260) {
                doc.addPage();
                yPosition = 10;
              }

              doc.setFontSize(11);
              doc.setTextColor(50, 50, 50);
              doc.text(
                `Cooler ${idx + 1}: ${cooler.name || "Unknown"}`,
                10,
                yPosition
              );
              yPosition += 5;

              doc.setFontSize(9);
              doc.text(
                `Target Temperature: ${cooler.desired_temp ?? 0}°C`,
                15,
                yPosition
              );
              yPosition += 4;
              doc.text(
                `Continuous Mode: ${cooler.continous ? "Yes" : "No"}`,
                15,
                yPosition
              );
              yPosition += 4;
              doc.text(
                `Discrete Mode: ${cooler.discrete ? "Yes" : "No"}`,
                15,
                yPosition
              );
              yPosition += 4;
              doc.text(`Fan: ${cooler.fan ? "On" : "Off"}`, 15, yPosition);
              yPosition += 5;

              const obsTemp = Array.isArray(cooler.observed_temp)
                ? cooler.observed_temp
                : [];
              const obsHumidity = Array.isArray(cooler.observed_humidity)
                ? cooler.observed_humidity
                : [];

              console.log(
                `❄️ Cooler ${idx} - Temps:`,
                obsTemp.length,
                "Humidity:",
                obsHumidity.length
              );

              const tableData = obsTemp.map((entry, i) => [
                entry.Date ? new Date(entry.Date).toLocaleString() : "N/A",
                (entry.obs_temp ?? 0).toFixed(2),
                obsHumidity[i]
                  ? (obsHumidity[i].obs_humidity ?? 0).toFixed(2)
                  : "N/A",
              ]);

              if (tableData.length > 0) {
                autoTable(doc, {
                  head: [["Timestamp", "Temp (°C)", "Humidity (%)"]],
                  body: tableData.slice(-25),
                  startY: yPosition,
                  margin: { left: 10, right: 10 },
                  headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: "bold",
                  },
                  bodyStyles: {
                    textColor: [50, 50, 50],
                    fontSize: 8,
                  },
                  alternateRowStyles: {
                    fillColor: [245, 245, 245],
                  },
                });
                yPosition = doc.lastAutoTable.finalY + 5;
              } else {
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text("No temperature data available", 15, yPosition);
                yPosition += 5;
              }
              yPosition += 3;
            });
          }
        } catch (err) {
          console.error("❌ Error fetching coolers:", err);
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 10;
          }
          doc.setFontSize(9);
          doc.setTextColor(255, 0, 0);
          doc.text("Error loading cooler data: " + err.message, 10, yPosition);
          yPosition += 5;
        }
      }

      // Batteries
      const batteryIds = Array.isArray(currentDevice.battery)
        ? currentDevice.battery
        : [];
      console.log("🔋 Battery IDs:", batteryIds);

      if (batteryIds.length > 0) {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 10;
        }

        try {
          const batteriesRes = await api.get("/device/get_batteries", {
            params: { battery_ids: batteryIds },
          });
          const batteries = Array.isArray(batteriesRes.data)
            ? batteriesRes.data
            : [];
          console.log("🔋 Batteries fetched:", batteries);

          if (batteries.length > 0) {
            doc.setFontSize(13);
            doc.setTextColor(34, 197, 94);
            doc.text("🔋 BATTERY LOGS", 10, yPosition);
            yPosition += 7;
            hasContent = true;

            batteries.forEach((battery, idx) => {
              if (yPosition > 260) {
                doc.addPage();
                yPosition = 10;
              }

              doc.setFontSize(11);
              doc.setTextColor(50, 50, 50);
              doc.text(
                `Battery ${idx + 1}: ${battery.name || "Unknown"}`,
                10,
                yPosition
              );
              yPosition += 5;

              doc.setFontSize(9);
              doc.text(`Fan: ${battery.fan ? "On" : "Off"}`, 15, yPosition);
              yPosition += 5;

              const chargeData = Array.isArray(battery.battery_charge_left)
                ? battery.battery_charge_left
                : [];
              const tempData = Array.isArray(battery.battery_temp)
                ? battery.battery_temp
                : [];

              console.log(
                `🔋 Battery ${idx} - Charge:`,
                chargeData.length,
                "Temp:",
                tempData.length
              );

              const tableData = chargeData.map((entry, i) => [
                entry.Date ? new Date(entry.Date).toLocaleString() : "N/A",
                (entry.battery_charge_left ?? 0).toFixed(2),
                tempData[i]
                  ? (tempData[i].battery_temp ?? 0).toFixed(2)
                  : "N/A",
              ]);

              if (tableData.length > 0) {
                autoTable(doc, {
                  head: [["Timestamp", "Charge (%)", "Temp (°C)"]],
                  body: tableData.slice(-25),
                  startY: yPosition,
                  margin: { left: 10, right: 10 },
                  headStyles: {
                    fillColor: [34, 197, 94],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: "bold",
                  },
                  bodyStyles: {
                    textColor: [50, 50, 50],
                    fontSize: 8,
                  },
                  alternateRowStyles: {
                    fillColor: [245, 245, 245],
                  },
                });
                yPosition = doc.lastAutoTable.finalY + 5;
              } else {
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text("No battery data available", 15, yPosition);
                yPosition += 5;
              }
              yPosition += 3;
            });
          }
        } catch (err) {
          console.error("❌ Error fetching batteries:", err);
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 10;
          }
          doc.setFontSize(9);
          doc.setTextColor(255, 0, 0);
          doc.text("Error loading battery data: " + err.message, 10, yPosition);
          yPosition += 5;
        }
      }

      if (
        !hasContent &&
        heaterIds.length === 0 &&
        coolerIds.length === 0 &&
        batteryIds.length === 0
      ) {
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text("No components assigned to this device yet.", 10, yPosition);
        yPosition += 5;
        doc.text(
          "Logs will appear here once components are added and collect data.",
          10,
          yPosition
        );
      }

      if (yPosition > 260) {
        doc.addPage();
        yPosition = 10;
      }

      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 5,
          { align: "center" }
        );
      }

      const filename = `${currentDevice.name}_logs_${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      doc.save(filename);

      setDownloadingLogs(false);
      alert("✅ Logs downloaded successfully!");
    } catch (err) {
      console.error("❌ Error downloading logs:", err);
      setDownloadingLogs(false);
      alert("Failed to download logs. See console for details.");
    }
  };

  if (loading) {
    return (
      <div className="control-layout">
        <Navbar user={user} />
        <div className="devices-loading">
          <div className="loading-spinner"></div>
          <p>Loading device...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="control-layout">
        <Navbar user={user} />
        <div className="devices-error">
          <p>Device not found</p>
          <Button onClick={() => navigate("/devices")}>Back to Devices</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="control-layout">
      <Navbar user={user} />

      <div className="control-content">
        <div className="control-header">
          <div>
            <h1 className="control-title">{device.name}</h1>
            <p className="control-subtitle">
              {device.bagType === "dual-zone"
                ? "Dual-Zone Bag (Hot & Cold)"
                : "Heating-Only Bag"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button
              onClick={downloadLogs}
              disabled={downloadingLogs}
              style={{
                backgroundColor: downloadingLogs ? "#ccc" : "#10B981",
                cursor: downloadingLogs ? "not-allowed" : "pointer",
              }}
            >
              {downloadingLogs ? "📥 Downloading..." : "📥 Download Logs"}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/devices")}>
              Back to Devices
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="control-tabs">
          <button
            className={`control-tab ${
              activeTab === "control" ? "control-tab-active" : ""
            }`}
            onClick={() => setActiveTab("control")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6" />
            </svg>
            Control
          </button>
          <button
            className={`control-tab ${
              activeTab === "analysis" ? "control-tab-active" : ""
            }`}
            onClick={() => setActiveTab("analysis")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Analysis
          </button>
        </div>

        {/* Control Tab */}
        {activeTab === "control" && (
          <div className="control-grid">
            {/* Hot Zone Card */}
            <Card
              title="🔥 Hot Zone"
              subtitle="Hot food compartment"
              className="component-card heater-card"
            >
              <div className="control-group">
                <label className="control-label">Target Temperature</label>
                <input
                  type="number"
                  className="control-input"
                  value={device.hotZone?.targetTemp ?? 0}
                  onChange={(e) =>
                    updateHotZoneSettings(
                      Number(e.target.value),
                      device.hotZone?.heaterOn ?? false,
                      device.hotZone?.fanOn ?? false
                    )
                  }
                />
              </div>

              <div className="toggle-group">
                <div className="toggle-item">
                  <span className="toggle-label">Heater</span>
                  <label className="toggle-switch-small">
                    <input
                      type="checkbox"
                      checked={device.hotZone?.heaterOn ?? false}
                      onChange={() =>
                        updateHotZoneSettings(
                          device.hotZone?.targetTemp ?? 0,
                          !(device.hotZone?.heaterOn ?? false),
                          device.hotZone?.fanOn ?? false
                        )
                      }
                    />
                    <span className="toggle-slider-small"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <span className="toggle-label">Fan</span>
                  <label className="toggle-switch-small">
                    <input
                      type="checkbox"
                      checked={device.hotZone?.fanOn ?? false}
                      onChange={() =>
                        updateHotZoneSettings(
                          device.hotZone?.targetTemp ?? 0,
                          device.hotZone?.heaterOn ?? false,
                          !(device.hotZone?.fanOn ?? false)
                        )
                      }
                    />
                    <span className="toggle-slider-small"></span>
                  </label>
                </div>
              </div>

              <div className="readings-grid">
                <div className="reading-item">
                  <span className="reading-label">Temperature</span>
                  <span className="reading-value">
                    {(device.hotZone?.currentTemp ?? 0).toFixed(1)}°C
                  </span>
                </div>
                <div className="reading-item">
                  <span className="reading-label">Humidity</span>
                  <span className="reading-value">
                    {(device.hotZone?.currentHumidity ?? 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Cold Zone Card */}
            {device.bagType === "dual-zone" && (
              <Card
                title="❄️ Cold Zone"
                subtitle="Cold drinks compartment"
                className="component-card cooler-card"
              >
                <div className="control-group">
                  <label className="control-label">Target Temperature</label>
                  <input
                    type="number"
                    className="control-input"
                    value={device.coldZone?.targetTemp ?? 0}
                    onChange={(e) =>
                      updateColdZoneSettings(
                        Number(e.target.value),
                        device.coldZone?.coolerOn ?? false,
                        device.coldZone?.fanOn ?? false
                      )
                    }
                  />
                </div>

                <div className="toggle-group">
                  <div className="toggle-item">
                    <span className="toggle-label">Cooler</span>
                    <label className="toggle-switch-small">
                      <input
                        type="checkbox"
                        checked={device.coldZone?.coolerOn ?? false}
                        onChange={() =>
                          updateColdZoneSettings(
                            device.coldZone?.targetTemp ?? 0,
                            !(device.coldZone?.coolerOn ?? false),
                            device.coldZone?.fanOn ?? false
                          )
                        }
                      />
                      <span className="toggle-slider-small"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <span className="toggle-label">Fan</span>
                    <label className="toggle-switch-small">
                      <input
                        type="checkbox"
                        checked={device.coldZone?.fanOn ?? false}
                        onChange={() =>
                          updateColdZoneSettings(
                            device.coldZone?.targetTemp ?? 0,
                            device.coldZone?.coolerOn ?? false,
                            !(device.coldZone?.fanOn ?? false)
                          )
                        }
                      />
                      <span className="toggle-slider-small"></span>
                    </label>
                  </div>
                </div>

                <div className="readings-grid">
                  <div className="reading-item">
                    <span className="reading-label">Temperature</span>
                    <span className="reading-value">
                      {(device.coldZone?.currentTemp ?? 0).toFixed(1)}°C
                    </span>
                  </div>
                  <div className="reading-item">
                    <span className="reading-label">Humidity</span>
                    <span className="reading-value">
                      {(device.coldZone?.currentHumidity ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Battery Card */}
            <Card
              title="🔋 Battery"
              subtitle="Power status"
              className="component-card battery-card"
            >
              <div className="readings-grid">
                <div className="reading-item">
                  <span className="reading-label">Charge Level</span>
                  <span className="reading-value">
                    {(device.battery?.chargeLevel ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="reading-item">
                  <span className="reading-label">Voltage</span>
                  <span className="reading-value">
                    {(device.battery?.voltage ?? 0).toFixed(2)}V
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    width: "100%",
                    height: "20px",
                    backgroundColor: "#E5E7EB",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${device.battery?.chargeLevel ?? 0}%`,
                      height: "100%",
                      backgroundColor:
                        (device.battery?.chargeLevel ?? 0) > 50
                          ? "#10B981"
                          : (device.battery?.chargeLevel ?? 0) > 20
                          ? "#F59E0B"
                          : "#EF4444",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Safety Thresholds */}
            <Card title="⚠️ Safety Limits" className="component-card safety-card">
              <div className="safety-zones">
                <div className="safety-zone safety-zone-low">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M12 2v20M8 6l4-4 4 4" />
                  </svg>
                  <span className="safety-value">
                    {device.safetyLimits?.minTemp ?? 0}°C
                  </span>
                  <span className="safety-label">Min Temp</span>
                </div>
                <div className="safety-zone safety-zone-high">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M12 2v20M8 18l4 4 4-4" />
                  </svg>
                  <span className="safety-value">
                    {device.safetyLimits?.maxTemp ?? 0}°C
                  </span>
                  <span className="safety-label">Max Temp</span>
                </div>
                <div className="safety-zone safety-zone-bag">
                  <span className="safety-value">
                    {device.safetyLimits?.lowBattery ?? 0}%
                  </span>
                  <span className="safety-label">Low Battery</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && (
          <div className="analysis-grid">
            <Card title="🔥 Hot Zone Temperature" className="chart-card">
              <div className="chart-wrapper" style={{ minHeight: "450px" }}>
                <Line
                  data={getChartData(
                    device.hotZone?.tempHistory,
                    "Temperature (°C)",
                    "rgb(239, 68, 68)"
                  )}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: false },
                    },
                    scales: {
                      y: {
                        ticks: {
                          stepSize: 5,          // << add this
                          beginAtZero: true,    // << and this
                          font: { size: 12 },
                        },
                      },
                      x: {
                        ticks: { font: { size: 10 } },
                      },
                    },
                  }}
                />
              </div>
            </Card>

            <Card title="🔥 Hot Zone Humidity" className="chart-card">
              <div className="chart-wrapper" style={{ minHeight: "450px" }}>
                <Line
                  data={getChartData(
                    device.hotZone?.humidityHistory,
                    "Humidity (%)",
                    "rgb(245, 158, 11)"
                  )}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: false },
                    },
                    scales: {
                      y: { ticks: { font: { size: 12 } } },
                      x: { ticks: { font: { size: 10 } } },
                    },
                  }}
                />
              </div>
            </Card>

            {device.bagType === "dual-zone" && (
              <>
                <Card title="❄️ Cold Zone Temperature" className="chart-card">
                  <div
                    className="chart-wrapper"
                    style={{ minHeight: "450px" }}
                  >
                    <Line
                      data={getChartData(
                        device.coldZone?.tempHistory,
                        "Temperature (°C)",
                        "rgb(59, 130, 246)"
                      )}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top" },
                          title: { display: false },
                        },
                        scales: {
                          y: { ticks: { font: { size: 12 } } },
                          x: { ticks: { font: { size: 10 } } },
                        },
                      }}
                    />
                  </div>
                </Card>

                <Card title="❄️ Cold Zone Humidity" className="chart-card">
                  <div
                    className="chart-wrapper"
                    style={{ minHeight: "450px" }}
                  >
                    <Line
                      data={getChartData(
                        device.coldZone?.humidityHistory,
                        "Humidity (%)",
                        "rgb(14, 165, 233)"
                      )}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top" },
                          title: { display: false },
                        },
                        scales: {
                          y: { ticks: { font: { size: 12 } } },
                          x: { ticks: { font: { size: 10 } } },
                        },
                      }}
                    />
                  </div>
                </Card>
              </>
            )}

            <Card title="🔋 Battery Level" className="chart-card">
              <div className="chart-wrapper" style={{ minHeight: "450px" }}>
                <Line
                  data={getChartData(
                    device.battery?.chargeHistory,
                    "Battery (%)",
                    "rgb(34, 197, 94)"
                  )}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: false },
                    },
                    scales: {
                      y: { ticks: { font: { size: 12 } } },
                      x: { ticks: { font: { size: 10 } } },
                    },
                  }}
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default BagControl;