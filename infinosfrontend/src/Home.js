import "./Home.css";
import logo from "./images/logo.jpg";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";


import Chatbot from "./components/Chatbot"; // Import Chatbot component

/* ===================================
   GALLERY DATA
   =================================== */
const galleryImages = [
  { src: require('./images/i1.jpg'), tag: 'Featured', title: 'Dual-Zone Container System', desc: 'Revolutionary temperature control' },
  { src: require('./images/i2.jpg'), tag: 'Technology', title: 'Real-Time Monitoring', desc: 'AIoT-powered tracking system' },
  { src: require('./images/i3.jpg'), tag: 'Logistics', title: 'Last-Mile Delivery', desc: 'Efficient urban distribution' },
  { src: require('./images/i4.jpg'), tag: 'Healthcare', title: 'Medical Logistics', desc: 'Ensuring vaccine integrity' },
  { src: require('./images/i5.jpg'), tag: 'Sustainability', title: 'Eco-Friendly Transport', desc: 'Reducing carbon footprint' },
  { src: require('./images/i6.png'), tag: 'Innovation', title: 'Cold Chain Excellence', desc: 'Temperature-controlled precision' },
  { src: require('./images/i7.jpg'), tag: 'Platform', title: 'AIoT Dashboard', desc: 'Comprehensive control and analytics' },
  { src: require('./images/i8.jpg'), tag: 'Control', title: 'Precision Cooling', desc: 'Intelligent temperature management' },
  { src: require('./images/i9.png'), tag: 'Solution', title: 'Innovative Logistics', desc: 'Transforming payload delivery' },
];

function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [deliveryWord, setDeliveryWord] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gallery Logic
  const galleryRef = useRef(null);
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = galleryRef.current;
    if (!scrollContainer) return;

    let animationId;
    const speed = 2; // Fast speed as requested

    const scroll = () => {
      if (!isGalleryPaused && scrollContainer) {
        scrollContainer.scrollLeft += speed;
        // Infinite loop logic: Reset when scrolled halfway (assuming duplicate content)
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isGalleryPaused]);

  const scrollGalleryLeft = () => {
    if (galleryRef.current) galleryRef.current.scrollLeft -= 500;
  };

  const scrollGalleryRight = () => {
    if (galleryRef.current) galleryRef.current.scrollLeft += 500;
  };

  // Scroll event listener for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotate delivery words every 1 second
  useEffect(() => {
    const words = ['far', 'fresh', 'anywhere', 'more'];
    const timer = setInterval(() => {
      setDeliveryWord((prev) => (prev + 1) % words.length);
    }, 1000); // 1 second

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-layout">
      {/* Navbar */}
      <header className={`home-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            <img src={logo} alt="INFINOS" className="navbar-logo" />
            <div className="navbar-brand-text">
              <span className="navbar-title">INFINOS</span>
              <span className="navbar-subtitle">AIOT LOGISTICS</span>
            </div>
          </div>

          <nav className="navbar-menu">
            <a href="#home" className="nav-link active">HOME</a>
            <a href="#about" className="nav-link">CHALLENGE</a>
            <a href="#products" className="nav-link">SOLUTION</a>
            <a href="#gallery" className="nav-link">GALLERY</a>
            <a href="#contact" className="nav-link">CONTACT</a>
          </nav>

          {/* Hamburger Menu Button */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <nav className="mobile-nav">
              <button
                className="mobile-nav-btn mobile-nav-home"
                onClick={() => { navigate("/"); setMobileMenuOpen(false); }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Home
              </button>
              <a href="#home" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>HOME</a>
              <a href="#about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>CHALLENGE</a>
              <a href="#products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>SOLUTION</a>
              <a href="#gallery" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>GALLERY</a>
              <a href="#contact" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>CONTACT</a>
              <div className="mobile-menu-divider"></div>
              <button
                className="mobile-nav-btn"
                onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
              >
                Dashboard
              </button>
              <button
                className="mobile-nav-btn"
                onClick={() => { navigate("/devices"); setMobileMenuOpen(false); }}
              >
                Devices
              </button>
            </nav>
          </div>

          <div className="navbar-profile-menu">
            <button
              className="navbar-profile-btn"
              onClick={() => setScrolled(!scrolled)} // Using scrolled state temporarily for dropdown toggle
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="navbar-dropdown">
              <button className="dropdown-item" onClick={() => navigate("/dashboard")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                </svg>
                <span>Dashboard</span>
              </button>
              <button className="dropdown-item" onClick={() => navigate("/devices")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                </svg>
                <span>Devices</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={() => navigate("/")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="home-content">
        {/* Hero Section with Gradient Background */}
        <section className="home-hero" id="home">
          {/* Animated Gradient Background */}
          <div className="hero-background-gradient">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="hero-content-wrapper">
            <div className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Last-Mile Delivery Solution
            </div>

            <h1 className="hero-title">
              We keep deliveries at the right <span className="title-highlight">temperature</span>
            </h1>

            <p className="hero-description">
              The world's first sustainable, dual temperature zone, AIOT enabled, portable container system
            </p>

            <div className="hero-features-pills">
              <div className="feature-pill">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5" />
                </svg>
                <span>Dual-Zone Control</span>
              </div>
              <div className="feature-pill">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span>AIoT Platform</span>
              </div>
              <div className="feature-pill">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <span>Real-Time Alerts</span>
              </div>
            </div>

            <div className="hero-cta-group">
              <button
                className="btn-primary-hero"
                onClick={() => navigate("/devices")}
              >
                <span>Start Monitoring</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                className="btn-white-hero"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Request Demo</span>
              </button>
            </div>
          </div>

        </section>

        {/* Problem Statement - Investor Grade */}
        <section className="problem-section" id="about">
          <div className="problem-container">
            <div className="problem-header">
              <div className="section-label">The Challenge</div>
              <h2 className="section-title">
                Cold Chain Failures Cost <span className="highlight-text">$35B</span> Annually
              </h2>
            </div>

            <div className="problem-content">
              {/* Left: Impact Metrics */}
              <div className="impact-metrics">
                <div className="metric-item">
                  <div className="metric-number">40%</div>
                  <div className="metric-description">Vaccines lost to temperature breaks</div>
                </div>

                <div className="metric-item">
                  <div className="metric-number">1.3B</div>
                  <div className="metric-description">Tons of food wasted annually</div>
                </div>

                <div className="metric-item">
                  <div className="metric-number">$15M</div>
                  <div className="metric-description">Average pharma company losses</div>
                </div>
              </div>

              {/* Right: Infrastructure Gaps */}
              <div className="infrastructure-gaps">
                <h3 className="gaps-title">Unseen Gaps in Delivery Infrastructure</h3>
                <div className="gaps-list">
                  <div className="gap-item">
                    <div className="gap-content">
                      <h4 style={{ marginBottom: 0 }}>Vaccine wastage logistics</h4>
                    </div>
                  </div>

                  <div className="gap-item">
                    <div className="gap-content">
                      <h4 style={{ marginBottom: 0 }}>Perishable food loss</h4>
                    </div>
                  </div>

                  <div className="gap-item">
                    <div className="gap-content">
                      <h4 style={{ marginBottom: 0 }}>Cold-chain inefficiency</h4>
                    </div>
                  </div>

                  <div className="gap-item">
                    <div className="gap-content">
                      <h4 style={{ marginBottom: 0 }}>Unmet delivery need</h4>
                    </div>
                  </div>

                  <div className="gap-item">
                    <div className="gap-content">
                      <h4 style={{ marginBottom: 0 }}>Low-payload incompatibility</h4>
                    </div>
                  </div>

                  <div className="gap-item">
                    <div className="gap-content">
                      <h4 style={{ marginBottom: 0 }}>Unsustainable chemical coolants</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section - Investor Grade */}
        <section className="solution-section" id="products">
          <div className="solution-container">
            <div className="solution-header">
              <div className="section-label">Our Solution</div>
              <h2 className="section-title">
                3-in-1 Smart Container
              </h2>
              <p className="solution-subtitle">
                Cool only. Heat only. Or both at once — independently controlled for maximum flexibility.
              </p>
              <p className="solution-delivery-tagline">
                Built to deliver <span className="delivery-word">{['far', 'fresh', 'anywhere', 'more'][deliveryWord]}</span>
              </p>
            </div>

            <div className="operation-modes">
              <div className="mode-card mode-cool">
                <div className="mode-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M12 2l-4 4M12 2l4 4M12 22l-4-4M12 22l4-4M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4" />
                  </svg>
                </div>
                <span className="mode-title">Cool Only</span>
              </div>
              <div className="mode-card mode-heat">
                <div className="mode-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
                <span className="mode-title">Heat Only</span>
              </div>
              <div className="mode-card mode-dual">
                <div className="mode-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12M6 12h12" />
                  </svg>
                </div>
                <span className="mode-title">Dual-Zone</span>
              </div>
            </div>

            <div className="solution-visual">
              {/* Hot Zone Card */}
              <div className="zone-card hot-zone">
                <div className="zone-temp-badge hot">50°C - 100°C</div>
                <h3>Hot Zone</h3>
                <div className="zone-benefits">
                  <p>Real-time heating control</p>
                  <p>Medical incubation ready</p>
                  <p>Food warming optimized</p>
                </div>
              </div>

              {/* Product Image Centerpiece */}
              <div className="product-centerpiece">
                <div className="product-image-container">
                  <img src={require('./images/home_page.png')} alt="InfinosTech Dual-Zone Container" className="product-image" />
                  <div className="product-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>AIoT-Powered</span>
                  </div>
                </div>
                <p className="product-tagline">
                  Engineered for drones, bicycles, EVs, and last-mile healthcare delivery at scale
                </p>
              </div>

              {/* Cold Zone Card */}
              <div className="zone-card cold-zone">
                <div className="zone-temp-badge cold">0°C - (-20°C)</div>
                <h3>Cold Zone</h3>
                <div className="zone-benefits">
                  <p>Vaccine-grade precision</p>
                  <p>Pharmaceutical compliant</p>
                  <p>Fresh food safe</p>
                </div>
              </div>
            </div>


          </div>
        </section>

        {/* Gallery Section - Horizontal Sliding Carousel */}
        <section className="gallery-section" id="gallery">
          <div className="gallery-container">
            <div className="gallery-header">
              <div className="section-label">Gallery</div>
              <h2 className="section-title">
                Innovation in Action
              </h2>
              <p className="gallery-subtitle">
                Witness our technology transforming cold chain logistics across industries
              </p>
            </div>

            {/* Horizontal Sliding Gallery */}
            <div className="gallery-slider-container" style={{ position: 'relative' }}>
              <button
                className="gallery-nav-btn gallery-nav-prev"
                onClick={scrollGalleryLeft}
                aria-label="Previous slide"
              >
                ‹
              </button>

              <div
                className="gallery-slider-wrapper"
                ref={galleryRef}
                onMouseEnter={() => setIsGalleryPaused(true)}
                onMouseLeave={() => setIsGalleryPaused(false)}
              >
                <div className="gallery-slider">
                  {/* Duplicate slides for smooth infinite loop (2 sets total) */}
                  {[...galleryImages, ...galleryImages].map((item, index) => (
                    <div className="gallery-slide-card" key={index}>
                      <div className="gallery-slide-inner">
                        <img src={item.src} alt={item.title} />
                        <div className="gallery-slide-overlay">
                          <div className="gallery-slide-content">
                            <span className="gallery-slide-tag">{item.tag}</span>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="gallery-nav-btn gallery-nav-next"
                onClick={scrollGalleryRight}
                aria-label="Next slide"
              >
                ›
              </button>
            </div>


          </div>
        </section>



        {/* Contact Form Section */}
        <section className="contact-section" id="contact">
          <div className="contact-container">
            <div className="contact-header">
              <div className="section-label">Get in Touch</div>
              <h2 className="section-title">Let's Connect</h2>
            </div>

            <div className="contact-content">
              {/* Contact Information */}
              <div className="contact-info">
                <h3>Contact Information</h3>

                <div className="contact-info-item">
                  <div className="contact-icon email">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="contact-details">
                    <div className="contact-label">Email</div>
                    <div className="contact-value">contact@infinostech.com</div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon phone">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="contact-details">
                    <div className="contact-label">Phone</div>
                    <div className="contact-value">+91-XXXXXXXXXX</div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon location">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="contact-details">
                    <div className="contact-label">Location</div>
                    <div className="contact-value">Hyderabad, India</div>
                  </div>
                </div>

              </div>

              {/* Contact Form */}
              <div className="contact-form">
                <form>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Name *</label>
                      <input type="text" id="name" placeholder="Your name" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input type="email" id="email" placeholder="your@email.com" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input type="tel" id="phone" placeholder="+91-XXXXXXXXXX" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="inquiry-type">Inquiry Type *</label>
                      <select id="inquiry-type" required>
                        <option value="">Select inquiry type</option>
                        <option value="demo">Product Demo</option>
                        <option value="partnership">Partnership</option>
                        <option value="support">Technical Support</option>
                        <option value="sales">Sales Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea id="message" rows="6" placeholder="Tell us more about your inquiry..." required></textarea>
                  </div>

                  <button type="submit" className="btn-submit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-column">
            <div className="footer-brand">
              <img src={logo} alt="InfinosTech" className="footer-logo" />
              <p className="footer-tagline">
                World's first sustainable dual-zone AIoT container for critical logistics
              </p>
            </div>
          </div>

          <div className="footer-column">
            <h4>Product</h4>
            <ul className="footer-links">
              <li><a href="/devices">Devices</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">© 2025 InfinosTech Pvt Ltd. All rights reserved.</p>
            <div className="social-links">
              <a href="https://www.linkedin.com/company/infinostech-pvt-ltd/" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://x.com/infinostech" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/infinostech/" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}

export default Home;