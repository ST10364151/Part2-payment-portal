// ============================================================================
// frontend/src/components/employee/CreateCustomer.jsx 
// ============================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './CreateCustomer.css';

function CreateCustomer() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    idNumber: '',
    accountNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);
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
    
    // Clear messages when user starts typing
    setErrors([]);
    setSuccess(null);
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
    setSuccess(null);
    setLoading(true);

    console.log('👤 Creating customer account:', {
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
      
      console.log('📤 Sending account creation request...');
      const response = await api.post('/employee/create-customer', dataToSend);
      console.log('✅ Account created successfully:', response.data);
      
      setSuccess({
        message: 'Customer account created successfully!',
        account: response.data.account
      });
      
      // Clear form
      setFormData({
        fullName: '',
        username: '',
        idNumber: '',
        accountNumber: '',
        password: '',
        confirmPassword: ''
      });
      setPasswordStrength({ score: 0, level: 'none' });
      
    } catch (err) {
      console.error('❌ Account creation error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessages = [];
      
      if (err.response?.data?.errors) {
        errorMessages = err.response.data.errors;
      } else if (err.response?.data?.message) {
        errorMessages = [err.response.data.message];
      } else if (err.response?.data?.error) {
        errorMessages = [err.response.data.error];
      } else {
        errorMessages = ['Account creation failed. Please try again.'];
      }
      
      setErrors(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/employee/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to Dashboard
        </button>
        
        <h2>Create Customer Account</h2>
        <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', fontSize: '14px'}}>
          In-Person Account Opening
        </p>

        {!success ? (
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
                placeholder="Re-enter password"
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

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating Account...' : 'Create Customer Account'}
            </button>
          </form>
        ) : (
          <div className="success-container">
            <div className="success-message" style={{marginBottom: '24px'}}>
              ✅ {success.message}
            </div>
            
            <div className="credentials-box">
              <h4>📋 Provide These Credentials to Customer:</h4>
              
              <div className="credential-item">
                <strong>Full Name:</strong> {success.account.fullName}
              </div>
              
              <div className="credential-item">
                <strong>Username:</strong> {success.account.username}
              </div>
              
              <div className="credential-item">
                <strong>Account Number:</strong> {success.account.accountNumber}
              </div>
              
              <div className="credential-item">
                <strong>ID Number:</strong> {success.account.idNumber}
              </div>
              
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)'
              }}>
                <strong style={{color: '#ffc107', display: 'block', marginBottom: '8px'}}>⚠️ Important:</strong>
                <ul style={{margin: 0, paddingLeft: '20px'}}>
                  <li>Write down these credentials on secure paper</li>
                  <li>Give credentials to customer in sealed envelope</li>
                  <li>Customer should login and verify account</li>
                  <li>Do not send credentials via email or SMS</li>
                </ul>
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
              <button onClick={() => setSuccess(null)} className="btn-secondary">
                Create Another Account
              </button>
              <button onClick={handleBackToDashboard} className="btn-primary">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateCustomer;