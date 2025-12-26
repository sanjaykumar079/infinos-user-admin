import "./Home.css";
import logo from "./images/logo.jpg";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import home_icon from "./images/home_page.png";

function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-layout">
      {/* Header */}
      <header className={`home-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="home-header-content">
          <img 
            className="home-logo" 
            src={logo} 
            alt="INFINOS Logo"
            onClick={() => navigate("/")}
          />
          <button 
            className="secondary-button"
            onClick={() => navigate("/devices")}
          >
            View Dashboard
          </button>
        </div>
      </header>

      <main className="home-content">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-hero-content">
            <h1>
              Smart Temperature Monitoring for <span>Critical Logistics</span>
            </h1>
            <p>
              Real-time monitoring and control of temperature-regulated delivery systems. 
              Enterprise-grade reliability for medical, pharmaceutical, and food logistics.
            </p>
            
            <div className="button-group">
              <button 
                className="primary-button"
                onClick={() => navigate("/devices")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l3 3l6 -6" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Get Started
              </button>
              <button 
                className="secondary-button"
                onClick={() => navigate("/dashboard")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 8v8" strokeWidth="2"/>
                  <path d="M8 12h8" strokeWidth="2"/>
                </svg>
                View Demo
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">&lt;5s</span>
                <span className="stat-label">Updates</span>
              </div>
            </div>
          </div>

          <div className="home-hero-image">
            <img src={home_icon} alt="INFINOS Smart Delivery Bag Dashboard" />
          </div>
        </section>

        {/* Features Section */}
        <section className="home-features">
          <div className="section-header">
            <h2>Enterprise-Grade Features</h2>
            <p>Everything you need for reliable cold chain management</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Real-Time Monitoring</h3>
              <p>
                Continuous tracking of temperature, humidity, and location with 
                instant alerts for any deviations from safe ranges.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Compliance Reporting</h3>
              <p>
                Automated reports for regulatory compliance with full audit trails 
                and detailed documentation for quality assurance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" strokeWidth="2"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" strokeWidth="2"/>
                  <path d="M6 1v3" strokeWidth="2"/>
                  <path d="M10 1v3" strokeWidth="2"/>
                  <path d="M14 1v3" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Remote Control</h3>
              <p>
                Adjust device settings, manage heating/cooling zones, and control 
                your entire fleet from a single dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="home-cta">
          <div className="cta-content">
            <h2>Ready to Optimize Your Logistics?</h2>
            <p>
              Join leading companies in medical, pharmaceutical, and food industries 
              who trust INFINOS for their critical temperature-controlled deliveries.
            </p>
            <button 
              className="primary-button"
              onClick={() => navigate("/devices")}
              style={{ background: 'white', color: 'var(--gray-900)' }}
            >
              Start Free Trial
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>INFINOS</h4>
            <ul className="footer-links">
              <li><a href="/">Smart IoT device management for temperature-controlled logistics</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Product</h4>
            <ul className="footer-links">
              <li><a href="/devices">Devices</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 INFINOS. All rights reserved.</p>
          <div className="social-links">
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;