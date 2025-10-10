import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [userType, setUserType] = useState('customer'); // 'customer' or 'employee'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (userType === 'customer') {
      navigate('/register');
    } else {
      navigate('/employee/login');
    }
  };

  const handleLogin = () => {
    if (userType === 'customer') {
      navigate('/login');
    } else {
      navigate('/employee/login');
    }
  };

  const features = [
    {
      icon: '🔒',
      title: 'Bank-Grade Security',
      description: 'Military-grade encryption with multi-factor authentication protecting every transaction'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Process international payments in seconds with our optimized SWIFT integration'
    },
    {
      icon: '🌍',
      title: 'Global Reach',
      description: 'Send money to over 200 countries with competitive exchange rates'
    }
  ];

  const stats = [
    { number: '50M+', label: 'Transactions' },
    { number: '195', label: 'Countries' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">💎</span>
            <span className="logo-text">SecureBank</span>
          </div>
          
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="nav-buttons">
            {/* User Type Toggle */}
            <div className="user-type-toggle">
              <button 
                className={`toggle-btn ${userType === 'customer' ? 'active' : ''}`}
                onClick={() => setUserType('customer')}
              >
                👤 Customer
              </button>
              <button 
                className={`toggle-btn ${userType === 'employee' ? 'active' : ''}`}
                onClick={() => setUserType('employee')}
              >
                💼 Employee
              </button>
            </div>

            <button className="btn-outline" onClick={handleLogin}>
              Sign In
            </button>
            <button className="btn-primary" onClick={handleGetStarted}>
              {userType === 'customer' ? 'Get Started' : 'Staff Portal'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              {userType === 'customer' ? 'Trusted by millions worldwide' : 'Secure Staff Portal'}
            </div>
            
            <h1 className="hero-title">
              {userType === 'customer' ? (
                <>International Payments<span className="gradient-text"> Reimagined</span></>
              ) : (
                <>Employee Portal<span className="gradient-text"> Transaction Verification</span></>
              )}
            </h1>
            
            <p className="hero-subtitle">
              {userType === 'customer' 
                ? 'Experience the future of global banking with our secure, lightning-fast payment platform. Send money internationally with confidence and ease.'
                : 'Secure employee access for transaction verification and approval. Manage international payments with advanced security protocols.'}
            </p>

            <div className="hero-buttons">
              <button className="btn-hero-primary" onClick={handleGetStarted}>
                {userType === 'customer' ? 'Open Account' : 'Access Portal'}
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-hero-secondary" onClick={handleLogin}>
                <span className="play-icon">▶</span>
                {userType === 'customer' ? 'Watch Demo' : 'Sign In'}
              </button>
            </div>

            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="card-mockup card-1">
              <div className="card-header">
                <div className="card-chip"></div>
                <div className="card-logo">💎</div>
              </div>
              <div className="card-number">•••• •••• •••• 4829</div>
              <div className="card-footer">
                <div>
                  <div className="card-label">CARDHOLDER</div>
                  <div className="card-name">John Doe</div>
                </div>
                <div>
                  <div className="card-label">EXPIRES</div>
                  <div className="card-name">12/25</div>
                </div>
              </div>
            </div>

            <div className="floating-notification">
              <div className="notif-icon">✓</div>
              <div className="notif-content">
                <div className="notif-title">
                  {userType === 'customer' ? 'Payment Successful' : 'Transaction Approved'}
                </div>
                <div className="notif-desc">
                  {userType === 'customer' ? '$5,000 sent to UK' : 'Payment verified'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose SecureBank</h2>
          <p className="section-subtitle">
            Experience banking built for the modern world
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card ${activeFeature === index ? 'active' : ''}`}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="security-section">
        <div className="security-content">
          <div className="security-left">
            <div className="security-badge">
              <span className="badge-icon">🛡️</span>
              Bank-Grade Protection
            </div>
            <h2 className="security-title">
              Your Money, <br />
              <span className="gradient-text">Always Protected</span>
            </h2>
            <p className="security-description">
              We use military-grade 256-bit encryption, multi-factor authentication, 
              and real-time fraud detection to keep your transactions secure.
            </p>
            
            <div className="security-features">
              <div className="security-item">
                <div className="security-item-icon">✓</div>
                <div>
                  <h4>End-to-End Encryption</h4>
                  <p>All data encrypted in transit and at rest</p>
                </div>
              </div>
              <div className="security-item">
                <div className="security-item-icon">✓</div>
                <div>
                  <h4>Multi-Factor Authentication</h4>
                  <p>Extra layer of security for all transactions</p>
                </div>
              </div>
              <div className="security-item">
                <div className="security-item-icon">✓</div>
                <div>
                  <h4>24/7 Monitoring</h4>
                  <p>Real-time fraud detection and prevention</p>
                </div>
              </div>
            </div>

            <button className="btn-security" onClick={handleGetStarted}>
              {userType === 'customer' ? 'Start Secure Banking' : 'Access Staff Portal'}
            </button>
          </div>

          <div className="security-right">
            <div className="security-visual">
              <div className="security-circle circle-1"></div>
              <div className="security-circle circle-2"></div>
              <div className="security-circle circle-3"></div>
              <div className="security-lock">🔒</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">
            {userType === 'customer' 
              ? 'Ready to Transform Your Banking?' 
              : 'Access Your Employee Portal'}
          </h2>
          <p className="cta-subtitle">
            {userType === 'customer'
              ? 'Join millions of customers who trust SecureBank for their international payments'
              : 'Secure access for transaction verification and approval'}
          </p>
          <div className="cta-buttons">
            <button className="btn-cta-primary" onClick={handleGetStarted}>
              {userType === 'customer' ? 'Open Your Account' : 'Staff Login'}
            </button>
            <button className="btn-cta-secondary" onClick={handleLogin}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <div className="footer-logo">
              <span className="logo-icon">💎</span>
              <span className="logo-text">SecureBank</span>
            </div>
            <p className="footer-description">
              The most trusted platform for international payments and secure banking.
            </p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="#pricing">Pricing</a>
            <a href="#api">API</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">About Us</a>
            <a href="#careers">Careers</a>
            <a href="#press">Press</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#help">Help Center</a>
            <a href="#docs">Documentation</a>
            <a href="#blog">Blog</a>
            <a href="#status">Status</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 SecureBank. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
