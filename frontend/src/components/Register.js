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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: 'none' });
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, level: 'none', feedback: [] };
    
    let score = 0;
    const feedback = [];
    
    // Length scoring
    if (password.length >= 8) {
      score += 1;
      feedback.push('✓ Minimum length met');
    } else {
      feedback.push('✗ At least 8 characters needed');
    }
    
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push('✓ Contains lowercase');
    } else {
      feedback.push('✗ Add lowercase letters');
    }
    
    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push('✓ Contains uppercase');
    } else {
      feedback.push('✗ Add uppercase letters');
    }
    
    if (/\d/.test(password)) {
      score += 1;
      feedback.push('✓ Contains numbers');
    } else {
      feedback.push('✗ Add numbers');
    }
    
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
      feedback.push('✓ Contains special characters');
    } else {
      feedback.push('✗ Add special characters (@$!%*?&)');
    }
    
    // Patterns (reduce score for patterns)
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('⚠ Avoid repeating characters');
    }
    
    // Determine strength level
    let level = 'weak';
    let color = '#ff4444';
    
    if (score >= 6) {
      level = 'strong';
      color = '#4caf50';
    } else if (score >= 4) {
      level = 'medium';
      color = '#ffa726';
    }
    
    return { score: Math.max(0, score), level, color, feedback };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Calculate password strength in real-time
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
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

    if (passwordStrength.level === 'weak') {
      validationErrors.push('Password is too weak. Please choose a stronger password.');
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
      const response = await api.post('/auth/customer/register', dataToSend);
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
      } else if (err.response?.data?.message) {
        errorMessages = [err.response.data.message];
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
              Exactly 13 digits (validated with Luhn algorithm)
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
              placeholder="Example: SecurePass123!"
              autoComplete="new-password"
            />
            
            {/* Password Strength Meter */}
            {formData.password && (
              <div style={{marginTop: '10px'}}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{fontSize: '12px', color: '#666'}}>Password Strength:</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: passwordStrength.color,
                    textTransform: 'uppercase'
                  }}>
                    {passwordStrength.level}
                  </span>
                </div>
                
                {/* Strength Bar */}
                <div style={{
                  height: '6px',
                  background: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(passwordStrength.score / 7) * 100}%`,
                    background: passwordStrength.color,
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
                
                {/* Feedback */}
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}>
                  {passwordStrength.feedback.slice(0, 4).map((item, idx) => (
                    <div key={idx} style={{
                      color: item.startsWith('✓') ? '#4caf50' : item.startsWith('✗') ? '#ff4444' : '#ffa726',
                      marginBottom: '3px'
                    }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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