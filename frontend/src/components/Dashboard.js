// ============================================================================
// frontend/src/components/Dashboard.jsx
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    provider: 'SWIFT',
    payeeName: '',
    payeeAccountNumber: '',
    swiftCode: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    
    // Check if password change is required
    if (userData.requirePasswordChange) {
      console.log('⚠️ Password change required - redirecting');
      navigate('/change-password', { state: { firstLogin: true } });
      return;
    }
    
    setUser(userData);
    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/customer/transactions');
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateSwiftCode = (code) => {
    
    // Remove spaces and convert to uppercase
    const cleanCode = code.replace(/\s/g, '').toUpperCase();
    
    // Must be 8 or 11 characters
    if (cleanCode.length !== 8 && cleanCode.length !== 11) {
      return false;
    }
    
    // First 6 characters must be letters (bank code + country code)
    if (!/^[A-Z]{6}/.test(cleanCode)) {
      return false;
    }
    
    // Remaining characters can be letters or digits
    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanCode)) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Clean and validate SWIFT code
    const cleanSwiftCode = formData.swiftCode.replace(/\s/g, '').toUpperCase();
    
    if (!validateSwiftCode(cleanSwiftCode)) {
      setError('SWIFT code must be 8 or 11 characters. Format: AAAABBCCXXX (e.g., ABCDZAJJ or ABCDZAJJXXX)');
      return;
    }

    setLoading(true);

    try {
      // Send with cleaned SWIFT code
      const paymentData = {
        ...formData,
        swiftCode: cleanSwiftCode
      };
      
      const response = await api.post('/customer/payment', paymentData);
      setSuccess('✅ Payment submitted successfully and sent for verification!');
      setFormData({
        amount: '',
        currency: 'USD',
        provider: 'SWIFT',
        payeeName: '',
        payeeAccountNumber: '',
        swiftCode: ''
      });
      fetchTransactions();
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = err.response?.data?.errors?.join(', ') || 
                       err.response?.data?.message || 
                       err.response?.data?.error || 
                       'Payment submission failed.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1>International Payment Portal</h1>
        <div className="nav-right">
          <span>Welcome, {user.fullName}</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="payment-form-section">
          <h2>Make International Payment</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="e.g., 500 or 500.50"
                min="0.01"
                max="999999999.99"
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange} required>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="ZAR">ZAR - South African Rand</option>
              </select>
            </div>

            <div className="form-group">
              <label>Provider</label>
              <select name="provider" value={formData.provider} onChange={handleChange} required>
                <option value="SWIFT">SWIFT</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payee Name</label>
              <input
                type="text"
                name="payeeName"
                value={formData.payeeName}
                onChange={handleChange}
                required
                placeholder="e.g., John Smith"
                minLength="2"
                maxLength="100"
              />
              <small style={{color: '#666', fontSize: '12px', marginTop: '5px', display: 'block'}}>
                Full name of the person or company receiving the payment
              </small>
            </div>

            <div className="form-group">
              <label>Payee Account Number</label>
              <input
                type="text"
                name="payeeAccountNumber"
                value={formData.payeeAccountNumber}
                onChange={handleChange}
                required
                placeholder="e.g., 1234567890123"
                minLength="8"
                maxLength="16"
              />
              <small style={{color: '#666', fontSize: '12px', marginTop: '5px', display: 'block'}}>
                8-16 digits
              </small>
            </div>

            <div className="form-group">
              <label>SWIFT Code</label>
              <input
                type="text"
                name="swiftCode"
                value={formData.swiftCode.toUpperCase()}
                onChange={handleChange}
                required
                maxLength="11"
                placeholder="e.g., ABCDZAJJ or ABCDZAJJXXX"
                style={{textTransform: 'uppercase'}}
              />
              <small style={{color: '#666', fontSize: '12px', marginTop: '5px', display: 'block'}}>
                8 or 11 characters. Format: Bank(4) + Country(2) + Location(2) + Branch(3, optional)
              </small>
              <small style={{color: '#999', fontSize: '11px', marginTop: '3px', display: 'block'}}>
                Examples: ABCDZAJJ, DEUTDEFF, CHASUS33 or with branch: ABCDZAJJXXX
              </small>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Processing...' : 'Submit Payment'}
            </button>
          </form>
        </div>

        <div className="transactions-section">
          <h2>My Transactions</h2>
          <div className="transactions-list">
            {transactions.length === 0 ? (
              <p>No transactions yet.</p>
            ) : (
              transactions.map((txn) => (
                <div key={txn.id || txn._id} className="transaction-card">
                  <div className="txn-header">
                    <span className={`status-badge status-${txn.status}`}>
                      {txn.status}
                    </span>
                    <span className="txn-amount">{txn.currency} {txn.amount}</span>
                  </div>
                  <div className="txn-details">
                    <p><strong>Payee:</strong> {txn.payeeName}</p>
                    <p><strong>Account:</strong> {txn.payeeAccountNumber}</p>
                    <p><strong>SWIFT:</strong> {txn.swiftCode}</p>
                    <p><strong>Reference:</strong> {txn.transactionRef}</p>
                    <p><strong>Date:</strong> {new Date(txn.createdAt).toLocaleString()}</p>
                    {txn.verifiedBy && (
                      <p><strong>Verified By:</strong> {txn.verifiedBy.name}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;