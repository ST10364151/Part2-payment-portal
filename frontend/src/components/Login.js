// ============================================================================
// frontend/src/components/Login.jsx
// ============================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    accountNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setLoading(true);

    console.log('🔐 Login attempt with:', {
      username: formData.username,
      accountNumber: formData.accountNumber,
      passwordLength: formData.password.length
    });

    try {
      console.log('📤 Sending login request...');
      const response = await api.post('/auth/customer/login', formData);
      
      console.log('✅ Login successful!', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Check if password change is required (first login)
      if (response.data.user.requirePasswordChange) {
        console.log('⚠️ Password change required - redirecting to change password page');
        navigate('/change-password', { state: { firstLogin: true } });
      } else {
        console.log('➡️ Navigating to dashboard...');
        navigate('/dashboard');
      }
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      console.error('❌ Error details:', err.response?.data);
      console.error('❌ Status code:', err.response?.status);
      
      const status = err.response?.status;
      const data = err.response?.data;
      
      // Handle different error scenarios
      if (status === 423) {
        // Account locked
        setAccountLocked(true);
        setLockUntil(data.lockUntil);
        setError(data.message || 'Account is temporarily locked due to too many failed login attempts.');
      } else if (status === 429) {
        // Rate limit exceeded
        setError(data.message || 'Too many login attempts. Please try again later.');
      } else if (status === 401) {
        // Invalid credentials - show specific error
        const errorMessage = data.message || 'Invalid credentials';
        setError(errorMessage);
        
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
          console.log('⚠️ Attempts remaining:', data.attemptsRemaining);
        }
      } else if (status === 400) {
        // Validation error
        const errorMessage = data.errors ? data.errors.join(', ') : data.message;
        setError(errorMessage || 'Invalid input. Please check your credentials.');
      } else {
        setError(data?.message || data?.error || 'Login failed. Please try again.');
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Customer Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              disabled={accountLocked}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              placeholder="Enter your account number"
              disabled={accountLocked}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={accountLocked}
              autoComplete="current-password"
            />
          </div>

          {/* Account Locked Warning */}
          {accountLocked && (
            <div className="error-message" style={{
              background: '#ff4444',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <strong>🔒 Account Temporarily Locked</strong>
              <p style={{margin: '8px 0 0 0', fontSize: '14px'}}>
                Too many failed login attempts. Please try again later
                {lockUntil && ` after ${new Date(lockUntil).toLocaleTimeString()}`}.
              </p>
            </div>
          )}

          {/* Login Attempts Warning */}
          {!accountLocked && attemptsRemaining !== null && attemptsRemaining <= 3 && (
            <div className="error-message" style={{
              background: attemptsRemaining <= 1 ? '#ff6b6b' : '#ffa726',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{fontSize: '20px'}}>⚠️</span>
              <div>
                <strong>Warning:</strong> {attemptsRemaining} login attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                <div style={{fontSize: '12px', marginTop: '4px', opacity: 0.9}}>
                  Your account will be temporarily locked after {attemptsRemaining} more failed attempt{attemptsRemaining !== 1 ? 's' : ''}.
                </div>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {error && !accountLocked && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || accountLocked} 
            className="btn-primary"
          >
            {loading ? 'Logging in...' : accountLocked ? 'Account Locked' : 'Login'}
          </button>
        </form>

        {/* Security Features Info */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          fontSize: '13px',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{fontWeight: '600', marginBottom: '8px', color: '#667eea'}}>
            🛡️ Security Features Active:
          </div>
          <ul style={{margin: 0, paddingLeft: '20px', color: '#666'}}>
            <li>Account locking after 5 failed attempts</li>
            <li>Rate limiting: 5 login attempts per 15 minutes</li>
            <li>All connections secured with SSL/TLS</li>
            <li>Password encryption with bcrypt + pepper</li>
          </ul>
        </div>

        {/* Removed Register Link - Accounts created by employees only */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 193, 7, 0.1)',
          borderRadius: '8px',
          fontSize: '13px',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          textAlign: 'center'
        }}>
          <strong style={{color: '#ffc107', display: 'block', marginBottom: '8px'}}>
            📋 New Customer?
          </strong>
          <p style={{margin: 0, color: '#666', fontSize: '12px'}}>
            Please visit your nearest branch to open an account. Our staff will create your credentials and provide them securely.
          </p>
        </div>

        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <p style={{color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '10px'}}>
            Bank Staff?
          </p>
          <a
            href="/employee/login"
            style={{
              color: '#667eea',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Employee Login →
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;