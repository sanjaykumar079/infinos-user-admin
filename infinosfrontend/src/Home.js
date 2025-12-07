import "./Home.css";
import logo from "./images/logo_black.svg";
import { useNavigate } from "react-router-dom";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import home_icon from "./images/home_page.png";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-layout">
      <div className="home-content">
        <div className="home-header">
          <img 
            className="home-logo" 
            src={logo} 
            alt="INFINOS Logo"
            onClick={() => navigate("/")}
          />
          <Button 
            variant="primary"
            onClick={() => navigate("/devices")}
            leftIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/>
                <path d="M12 18h.01" strokeWidth="2"/>
              </svg>
            }
          >
            View Devices
          </Button>
        </div>

        <div className="home-hero">
          <div className="home-hero-content">
            <h1>
              Smart IoT Device Management
            </h1>
            <p>
              Monitor and control your temperature-regulated devices in real-time. 
              Perfect for medical transport, food logistics, and cold chain management.
            </p>
            <Button 
              variant="primary"
              size="lg"
              onClick={() => navigate("/devices")}
            >
              Get Started
            </Button>
          </div>

          <div className="home-hero-image">
            <img src={home_icon} alt="INFINOS Dashboard Preview" />
          </div>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Real-Time Monitoring</h3>
            <p>
              Track temperature, humidity, and battery levels with live updates every second
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                <path d="M12 1v6m0 6v6" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Remote Control</h3>
            <p>
              Adjust device settings and manage components from anywhere in the world
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3v18h18" strokeWidth="2"/>
                <path d="m19 9-5 5-4-4-5 5" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Data Analytics</h3>
            <p>
              Visualize trends and generate compliance reports with comprehensive logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;