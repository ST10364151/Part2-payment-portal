import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function EmployeeLogin() {
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/employee/login', formData);
      
      localStorage.setItem('employeeToken', response.data.token);
      localStorage.setItem('employee', JSON.stringify(response.data.employee));
      
      navigate('/employee/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
            <label htmlFor="employeeId">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
              placeholder="e.g., EMP001"
              autoComplete="off"
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
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

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
            <strong>Employee ID:</strong>{' '}
            <code style={{
              background: '#667eea', 
              color: 'white',
              padding: '3px 8px', 
              borderRadius: '4px',
              fontWeight: '600'
            }}>EMP001</code>
          </div>
          <div>
            <strong>Password:</strong>{' '}
            <code style={{
              background: '#667eea', 
              color: 'white',
              padding: '3px 8px', 
              borderRadius: '4px',
              fontWeight: '600'
            }}>Admin123!</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLogin;
