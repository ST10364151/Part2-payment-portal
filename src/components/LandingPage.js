import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>International Payment Portal</h1>
        <p className="subtitle">Secure Banking Solutions</p>
        
        <div className="login-cards">
          <div className="login-card" onClick={() => navigate('/login')}>
            <div className="card-icon">👤</div>
            <h2>Customer Login</h2>
            <p>Make international payments securely</p>
            <button className="btn-card">Continue as Customer</button>
          </div>

          <div className="login-card" onClick={() => navigate('/employee/login')}>
            <div className="card-icon">💼</div>
            <h2>Employee Login</h2>
            <p>Verify and process transactions</p>
            <button className="btn-card">Continue as Employee</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
