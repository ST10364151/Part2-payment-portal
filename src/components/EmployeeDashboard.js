import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './EmployeeDashboard.css';

function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [filter, setFilter] = useState('pending');
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
  }, [navigate, filter]);

  const fetchTransactions = async () => {
    try {
      const endpoint = filter === 'pending' 
        ? '/employee/transactions/pending' 
        : '/employee/transactions/all';
      
      const response = await api.get(endpoint);
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setMessage({ type: 'error', text: 'Failed to load transactions' });
    }
  };

  const handleVerify = async (transactionId) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.patch(`/employee/transactions/${transactionId}/verify`);
      setMessage({ type: 'success', text: 'Transaction verified successfully!' });
      fetchTransactions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Verification failed' });
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
      const response = await api.post('/employee/transactions/submit-swift', {
        transactionIds: selectedTransactions
      });
      
      setMessage({ type: 'success', text: response.data.message });
      setSelectedTransactions([]);
      fetchTransactions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'SWIFT submission failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employee');
    navigate('/employee/login');
  };

  if (!employee) return null;

  const verifiedTransactions = transactions.filter(t => t.status === 'verified');

  return (
    <div className="employee-dashboard">
      <nav className="employee-nav">
        <h1>Employee Portal - Transaction Verification</h1>
        <div className="nav-right">
          <span>{employee.fullName} ({employee.role})</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="employee-content">
        <div className="controls-section">
          <div className="filter-buttons">
            <button 
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pending ({transactions.filter(t => t.status === 'pending').length})
            </button>
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Transactions ({transactions.length})
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
          {transactions.length === 0 ? (
            <p className="no-data">No transactions to display</p>
          ) : (
            transactions.map((txn) => (
              <div key={txn._id} className="employee-transaction-card">
                <div className="card-header">
                  <span className={`status-badge status-${txn.status}`}>
                    {txn.status}
                  </span>
                  <span className="amount">{txn.currency} {txn.amount}</span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <strong>Customer:</strong> {txn.userId?.fullName || 'N/A'}
                  </div>
                  <div className="info-row">
                    <strong>Account:</strong> {txn.userId?.accountNumber || 'N/A'}
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
                    <strong>Date:</strong> {new Date(txn.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="card-actions">
                  {txn.status === 'pending' && (
                    <button 
                      onClick={() => handleVerify(txn._id)}
                      disabled={loading}
                      className="btn-verify"
                    >
                      Verify
                    </button>
                  )}
                  
                  {txn.status === 'verified' && (
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(txn._id)}
                        onChange={() => handleSelectTransaction(txn._id)}
                      />
                      Select for SWIFT
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
