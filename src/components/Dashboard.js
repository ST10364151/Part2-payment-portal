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
    setUser(JSON.parse(storedUser));
    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/payments/my-transactions');
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
    // SWIFT code must be 8 or 11 characters, all uppercase letters and numbers
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return swiftRegex.test(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate SWIFT code
    if (!validateSwiftCode(formData.swiftCode)) {
      setError('SWIFT code must be 8 or 11 characters (e.g., ABCDEF12 or ABCDEF12345)');
      return;
    }

    setLoading(true);

    try {
      await api.post('/payments/submit', formData);
      setSuccess('Payment submitted successfully!');
      setFormData({
        amount: '',
        currency: 'USD',
        provider: 'SWIFT',
        payeeAccountNumber: '',
        swiftCode: ''
      });
      fetchTransactions();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Payment submission failed.');
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
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="e.g., 500 or 500.50"
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange} required>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="ZAR">ZAR</option>
              </select>
            </div>

            <div className="form-group">
              <label>Provider</label>
              <select name="provider" value={formData.provider} onChange={handleChange} required>
                <option value="SWIFT">SWIFT</option>
              </select>
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
              />
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
                placeholder="e.g., ABCDEF12 or ABCDEF12345"
                style={{textTransform: 'uppercase'}}
              />
              <small style={{color: '#666', fontSize: '12px', marginTop: '5px', display: 'block'}}>
                Must be 8 or 11 uppercase characters (letters and numbers only)
              </small>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Processing...' : 'Pay Now'}
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
                <div key={txn._id} className="transaction-card">
                  <div className="txn-header">
                    <span className={`status-badge status-${txn.status}`}>
                      {txn.status}
                    </span>
                    <span className="txn-amount">{txn.currency} {txn.amount}</span>
                  </div>
                  <div className="txn-details">
                    <p><strong>To:</strong> {txn.payeeAccountNumber}</p>
                    <p><strong>SWIFT:</strong> {txn.swiftCode}</p>
                    <p><strong>Date:</strong> {new Date(txn.createdAt).toLocaleString()}</p>
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
