import React, { useState } from 'react';
import axios from 'axios';
import './EmployeeLogin.css';

const EmployeeLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    employeeId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Input validation regex
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const employeeIdRegex = /^EMP[0-9]{3,6}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Whitelist input - remove any potentially harmful characters
    let sanitizedValue = value;
    
    if (name === 'username') {
      sanitizedValue = value.replace(/[^a-zA-Z0-9_]/g, '');
    } else if (name === 'employeeId') {
      sanitizedValue = value.replace(/[^A-Z0-9]/g, '');
    }
    
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.employeeId || !formData.password) {
      setError('All fields are required');
      return false;
    }

    if (!usernameRegex.test(formData.username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscore only)');
      return false;
    }

    if (!employeeIdRegex.test(formData.employeeId)) {
      setError('Invalid Employee ID format (e.g., EMP001)');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://localhost:3001/api/employees/login',
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Store token
        localStorage.setItem('employeeToken', response.data.token);
        localStorage.setItem('employeeData', JSON.stringify(response.data.employee));
        
        // Redirect to employee dashboard
        window.location.href = '/employee-dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-container">
      <div className="employee-login-card">
        <div className="login-header">
          <h2>Employee Portal</h2>
          <p>International Payments Verification System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              maxLength="20"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="employeeId">Employee ID</label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="e.g., EMP001"
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="login-info">
            <p><strong>Note:</strong> This portal is for authorized bank employees only.</p>
            <p>No registration is available. Contact IT if you need access.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLogin;