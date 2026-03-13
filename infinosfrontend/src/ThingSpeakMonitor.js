import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { thingspeakService } from './utils/thingspeak-api';
import Navbar from './components/layout/Navbar';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import { Line } from 'react-chartjs-2';
import './Control.css';

function ThingSpeakMonitor({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [latest, historyData] = await Promise.all([
        thingspeakService.getLatestReading(),
        thingspeakService.getHistory(20)
      ]);

      setData(latest);
      setHistory(historyData);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load ThingSpeak data');
      setLoading(false);
    }
  };

  const getChartData = (field, label, color) => {
    if (!history || history.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [], label, borderColor: color }]
      };
    }

    return {
      labels: history.map(h => new Date(h.timestamp).toLocaleTimeString()),
      datasets: [{
        data: history.map(h => h[field]),
        label,
        borderColor: color,
        backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
        tension: 0.4,
      }]
    };
  };

  if (loading) {
    return (
      <div className="control-layout">
        <Navbar user={user} />
        <div className="devices-loading">
          <div className="loading-spinner"></div>
          <p>Loading ThingSpeak data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="control-layout">
        <Navbar user={user} />
        <div className="devices-error">
          <p>{error}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="control-layout">
        <Navbar user={user} />
        <div className="devices-error">
          <h3>No Data Available</h3>
          <p>ThingSpeak channel has no readings yet, or the API key is incorrect.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            Ask your team: Is the ESP32 sending data? Is C8DUVRKN6XZTK1A2 the correct READ API key?
          </p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
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
            <h1 className="control-title">ThingSpeak Monitor</h1>
            <p className="control-subtitle">Live sensor data from Channel 3297681</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Status Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
          border: '2px solid #3B82F6',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white">
              <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" />
              <path d="M2 17l10 5 10-5" strokeWidth="2" />
              <path d="M2 12l10 5 10-5" strokeWidth="2" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E40AF' }}>
              📡 ThingSpeak Data Source
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1E3A8A' }}>
              Real-time data from external ESP32. Last update: {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Current Readings */}
        <div className="control-grid">
          <Card title="🔥 Hot Zone" className="component-card heater-card">
            <div className="readings-grid">
              <div className="reading-item">
                <span className="reading-label">Temperature</span>
                <span className="reading-value">{data.hotTemp?.toFixed(1) || 'N/A'}°C</span>
              </div>
              <div className="reading-item">
                <span className="reading-label">Humidity</span>
                <span className="reading-value">{data.hotHumidity?.toFixed(1) || 'N/A'}%</span>
              </div>
            </div>
          </Card>

          <Card title="❄️ Cold Zone" className="component-card cooler-card">
            <div className="readings-grid">
              <div className="reading-item">
                <span className="reading-label">Temperature</span>
                <span className="reading-value">{data.coldTemp?.toFixed(1) || 'N/A'}°C</span>
              </div>
              <div className="reading-item">
                <span className="reading-label">Humidity</span>
                <span className="reading-value">{data.coldHumidity?.toFixed(1) || 'N/A'}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="analysis-grid">
          <Card title="🔥 Hot Zone Temperature" className="chart-card">
            <div className="chart-wrapper" style={{ minHeight: '300px' }}>
              <Line
                data={getChartData('hotTemp', 'Temperature (°C)', 'rgb(239, 68, 68)')}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                  scales: {
                    y: { ticks: { stepSize: 5 } },
                  }
                }}
              />
            </div>
          </Card>

          <Card title="❄️ Cold Zone Temperature" className="chart-card">
            <div className="chart-wrapper" style={{ minHeight: '300px' }}>
              <Line
                data={getChartData('coldTemp', 'Temperature (°C)', 'rgb(59, 130, 246)')}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                  scales: {
                    y: { ticks: { stepSize: 5 } },
                  }
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ThingSpeakMonitor;