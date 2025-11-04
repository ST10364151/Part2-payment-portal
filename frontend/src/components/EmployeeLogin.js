import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function EmployeeLogin() {
  const [formData, setFormData] = useState({
    username: '',
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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Employee login attempt:', formData.username);

    try {
      console.log('Sending request to /auth/employee/login');
      const response = await api.post('/auth/employee/login', formData);
      
      console.log('Login successful:', response.data);
      
      localStorage.setItem('employeeToken', response.data.token);
      localStorage.setItem('employee', JSON.stringify(response.data.user));
      
      navigate('/employee/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      const status = err.response?.status;
      const data = err.response?.data;
      
      // Handle different error scenarios 
      if (status === 423) {
        setAccountLocked(true);
        setLockUntil(data.lockUntil);
        setError(data.message || 'Account is temporarily locked.');
      } else if (status === 429) {
        setError(data.message || 'Too many login attempts. Please try again later.');
      } else if (status === 401) {
        setError(data.message || 'Invalid credentials');
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
          console.log('⚠️ Attempts remaining:', data.attemptsRemaining);
        }
      } else if (status === 403) {
        setError(data.message || 'Access denied');
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
        <h2>Employee Login</h2>
        <p style={{textAlign: 'center', color: '#666', marginBottom: '24px', fontSize: '14px'}}>
          Staff Portal - Transaction Verification
        </p>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="e.g., mike.admin"
              autoComplete="off"
              disabled={accountLocked}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="new-password"
              disabled={accountLocked}
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
                Too many failed login attempts. Please contact IT support
                {lockUntil && ` or try again after ${new Date(lockUntil).toLocaleTimeString()}`}.
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
            <li>IP whitelist verification</li>
            <li>All connections secured with SSL/TLS</li>
            <li>Password encryption with bcrypt</li>
          </ul>
        </div>

        <p className="auth-link">
          <a href="/login">Customer Login</a>
        </p>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '12px',
          fontSize: '13px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{fontWeight: '700', marginBottom: '8px', color: '#333'}}>
            Test Credentials:
          </div>
          <div style={{marginBottom: '4px'}}>
            <strong>Username:</strong>{' '}
            <code style={{
              background: '#667eea',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>mike.admin</code>
          </div>
          <div>
            <strong>Password:</strong>{' '}
            <code style={{
              background: '#667eea',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>Admin@789</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLogin;