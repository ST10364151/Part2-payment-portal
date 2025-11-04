// ============================================================================
// frontend/src/components/EmployeeDashboard.jsx 
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './EmployeeDashboard.css';

function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    const token = localStorage.getItem('employeeToken');
    
    if (!storedEmployee || !token) {
      navigate('/employee/login');
      return;
    }
    
    setEmployee(JSON.parse(storedEmployee));
    
    // Set token for employee API calls
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch all transactions (pending, verified, and submitted)
      const response = await api.get('/employee/transactions/pending');
      console.log('📦 Fetched transactions:', response.data);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setMessage({ type: 'error', text: 'Failed to load transactions' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (transactionId) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put(`/employee/transactions/${transactionId}/verify`);
      setMessage({ type: 'success', text: 'Transaction verified successfully!' });
      fetchTransactions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      }
      return [...prev, transactionId];
    });
  };

  const handleSubmitToSwift = async () => {
    if (selectedTransactions.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one verified transaction' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post('/employee/transactions/submit', {
        transactionIds: selectedTransactions
      });
      
      setMessage({ type: 'success', text: response.data.message });
      setSelectedTransactions([]);
      fetchTransactions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'SWIFT submission failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employee');
    navigate('/employee/login');
  };

  const handleCreateCustomer = () => {
    navigate('/employee/create-customer');
  };

  if (!employee) return null;

  // Check if employee can create customer accounts (only managers and admins)
  const canCreateCustomers = employee.employeeRole === 'manager' || employee.employeeRole === 'admin';

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'all') return true;
    return txn.status === filter;
  });

  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const verifiedCount = transactions.filter(t => t.status === 'verified').length;
  const submittedCount = transactions.filter(t => t.status === 'submitted').length;
  const verifiedTransactions = transactions.filter(t => t.status === 'verified');

  return (
    <div className="employee-dashboard">
      <nav className="employee-nav">
        <h1>Employee Portal - {employee.employeeRole || employee.role}</h1>
        <div className="nav-right">
          {canCreateCustomers && (
            <button onClick={handleCreateCustomer} className="btn-create-customer">
              ➕ Create Customer Account
            </button>
          )}
          <span>{employee.fullName}</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="employee-content">
        {/* Role-based welcome message */}
        {canCreateCustomers && (
          <div className="welcome-banner">
            <div className="banner-icon">👤</div>
            <div className="banner-content">
              <h3>Welcome, {employee.fullName}</h3>
              <p>
                {employee.employeeRole === 'manager' 
                  ? 'As a Manager, you can create customer accounts and verify transactions.'
                  : 'As an Admin, you have full access to all portal features including account creation and transaction approval.'}
              </p>
            </div>
          </div>
        )}

        <div className="controls-section">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({transactions.length})
            </button>
            <button 
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button 
              className={filter === 'verified' ? 'active' : ''}
              onClick={() => setFilter('verified')}
            >
              Verified ({verifiedCount})
            </button>
            <button 
              className={filter === 'submitted' ? 'active' : ''}
              onClick={() => setFilter('submitted')}
            >
              Submitted ({submittedCount})
            </button>
          </div>

          {verifiedTransactions.length > 0 && (
            <div className="swift-section">
              <button 
                onClick={handleSubmitToSwift} 
                disabled={loading || selectedTransactions.length === 0}
                className="btn-swift"
              >
                Submit {selectedTransactions.length} to SWIFT
              </button>
            </div>
          )}
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="transactions-grid">
          {filteredTransactions.length === 0 ? (
            <p className="no-data">
              {loading ? 'Loading transactions...' : `No ${filter === 'all' ? '' : filter} transactions to display`}
            </p>
          ) : (
            filteredTransactions.map((txn) => (
              <div key={txn.id || txn._id} className="employee-transaction-card">
                <div className="card-header">
                  <span className={`status-badge status-${txn.status}`}>
                    {txn.status.toUpperCase()}
                  </span>
                  <span className="amount">{txn.currency} {txn.amount}</span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <strong>Ref:</strong> {txn.transactionRef || 'N/A'}
                  </div>
                  <div className="info-row">
                    <strong>Customer:</strong> {txn.customer?.name || txn.customerName || 'N/A'}
                  </div>
                  <div className="info-row">
                    <strong>Account:</strong> {txn.customer?.accountNumber || txn.customerAccountNumber || 'N/A'}
                  </div>
                  <div className="info-row">
                    <strong>Payee Name:</strong> {txn.payeeName || 'N/A'}
                  </div>
                  <div className="info-row">
                    <strong>Payee Account:</strong> {txn.payeeAccountNumber}
                  </div>
                  <div className="info-row">
                    <strong>SWIFT Code:</strong> {txn.swiftCode}
                  </div>
                  <div className="info-row">
                    <strong>Provider:</strong> {txn.provider}
                  </div>
                  <div className="info-row">
                    <strong>Created:</strong> {new Date(txn.createdAt).toLocaleString()}
                  </div>
                  {txn.verifiedBy && (
                    <div className="info-row">
                      <strong>Verified By:</strong> {txn.verifiedBy.name || txn.verifiedBy.fullName} 
                      {txn.verifiedBy.employeeId && ` (${txn.verifiedBy.employeeId})`}
                    </div>
                  )}
                  {txn.verifiedAt && (
                    <div className="info-row">
                      <strong>Verified At:</strong> {new Date(txn.verifiedAt).toLocaleString()}
                    </div>
                  )}
                  {txn.submittedAt && (
                    <div className="info-row">
                      <strong>Submitted At:</strong> {new Date(txn.submittedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  {txn.status === 'pending' && (
                    <button 
                      onClick={() => handleVerify(txn.id || txn._id)}
                      disabled={loading}
                      className="btn-verify"
                    >
                      ✓ Verify Transaction
                    </button>
                  )}
                  
                  {txn.status === 'verified' && (
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(txn.id || txn._id)}
                        onChange={() => handleSelectTransaction(txn.id || txn._id)}
                      />
                      Select for SWIFT Submission
                    </label>
                  )}
                  
                  {txn.status === 'submitted' && (
                    <span className="submitted-badge">✓ Submitted to SWIFT</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;