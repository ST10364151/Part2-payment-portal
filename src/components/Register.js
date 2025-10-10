import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    idNumber: '',
    accountNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    setErrors([]);
  };

  const validatePassword = (password) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const isLongEnough = password.length >= 8;
    const onlyAllowedChars = /^[A-Za-z\d@$!%*?&]+$/.test(password);

    return hasLowercase && hasUppercase && hasNumber && hasSpecial && isLongEnough && onlyAllowedChars;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setErrors([]);
    setSuccess('');
    setLoading(true);

    console.log('🔄 Registration attempt:', {
      fullName: formData.fullName,
      username: formData.username,
      idNumber: formData.idNumber,
      accountNumber: formData.accountNumber
    });

    const validationErrors = [];

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    if (!validatePassword(formData.password)) {
      validationErrors.push('Password must be at least 8 characters with uppercase, lowercase, number and special character (@$!%*?&)');
    }

    if (formData.idNumber.length !== 13) {
      validationErrors.push('ID Number must be exactly 13 digits');
    }

    if (formData.accountNumber.length < 10 || formData.accountNumber.length > 16) {
      validationErrors.push('Account Number must be between 10-16 digits');
    }

    if (validationErrors.length > 0) {
      console.log('❌ Client-side validation failed:', validationErrors);
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      
      console.log('📤 Sending registration request...');
      const response = await api.post('/auth/register', dataToSend);
      
      console.log('✅ Registration successful:', response.data);
      
      setSuccess('✅ Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessages = [];
      
      if (err.response?.data?.errors) {
        errorMessages = err.response.data.errors;
      } else if (err.response?.data?.error) {
        errorMessages = [err.response.data.error];
      } else {
        errorMessages = ['Registration failed. Please try again.'];
      }
      
      setErrors(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Customer Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="e.g., John Doe"
              autoComplete="name"
            />
            <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '5px', display: 'block'}}>
              Only letters and spaces (2-100 characters)
            </small>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="e.g., johndoe"
              autoComplete="username"
            />
            <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '5px', display: 'block'}}>
              3-30 characters (letters, numbers, underscore)
            </small>
          </div>

          <div className="form-group">
            <label>ID Number</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              required
              maxLength="13"
              placeholder="e.g., 9001010001088"
              autoComplete="off"
            />
            <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '5px', display: 'block'}}>
              Exactly 13 digits
            </small>
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              placeholder="e.g., 1234567890"
              autoComplete="off"
            />
            <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '5px', display: 'block'}}>
              10-16 digits
            </small>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Example: Password1!"
              autoComplete="new-password"
            />
            <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '5px', display: 'block'}}>
              Min 8 characters: uppercase, lowercase, number, special (@$!%*?&)
            </small>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>

          {errors.length > 0 && (
            <div className="error-message">
              {errors.map((err, idx) => (
                <div key={idx} style={{marginBottom: '8px'}}>• {err}</div>
              ))}
            </div>
          )}

          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
