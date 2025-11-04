// ============================================================================
// frontend/src/components/ChangePassword.jsx
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: 'none' });
  const navigate = useNavigate();
  const location = useLocation();
  
  const isFirstLogin = location.state?.firstLogin || false;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

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
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear errors when user starts typing
    setErrors([]);
    setSuccess('');
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

    const validationErrors = [];

    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.push('New passwords do not match');
    }

    if (!validatePassword(formData.newPassword)) {
      validationErrors.push('New password must be at least 8 characters with uppercase, lowercase, number and special character (@$!%*?&)');
    }

    if (passwordStrength.level === 'weak') {
      validationErrors.push('New password is too weak. Please choose a stronger password.');
    }

    if (formData.currentPassword === formData.newPassword) {
      validationErrors.push('New password must be different from current password');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      console.log('Password changed successfully:', response.data);
      
      setSuccess('Password changed successfully! Redirecting to dashboard...');
      
      // Update user data to remove requirePasswordChange flag
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.requirePasswordChange = false;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Password change error:', err);
      
      let errorMessages = [];
      
      if (err.response?.data?.errors) {
        errorMessages = err.response.data.errors;
      } else if (err.response?.data?.message) {
        errorMessages = [err.response.data.message];
      } else {
        errorMessages = ['Password change failed. Please try again.'];
      }
      
      setErrors(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Change Password</h2>
        
        {isFirstLogin && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#ffc107'
          }}>
            <strong>⚠️ First Login - Password Change Required</strong>
            <p style={{margin: '8px 0 0 0', color: '#666', fontSize: '13px'}}>
              For security reasons, you must change your temporary password before accessing your account.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
            <small style={{color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '5px', display: 'block'}}>
              The temporary password provided by the bank
            </small>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Enter your new password"
              autoComplete="new-password"
            />
            
            {/* Password Strength Meter */}
            {formData.newPassword && (
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
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your new password"
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
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        {!isFirstLogin && (
          <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{marginTop: '12px', width: '100%'}}>
            Cancel
          </button>
        )}

        {isFirstLogin && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center'
          }}>
            <p style={{margin: 0, color: '#666'}}>
              You must change your password to continue.
            </p>
            <button onClick={handleLogout} style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#666',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePassword;