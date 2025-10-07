import React, { useState, useEffect, createContext, useContext } from 'react';
import { AlertCircle, CheckCircle, DollarSign, Lock, User, CreditCard, Building, Shield, LogOut, FileText } from 'lucide-react';

// API Configuration
const API_URL = 'https://localhost:3001/api';

// Auth Context
const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// API Service
const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Auth
  customerRegister: (data) => api.request('/auth/customer/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  customerLogin: (data) => api.request('/auth/customer/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  employeeLogin: (data) => api.request('/auth/employee/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Customer
  createPayment: (data) => api.request('/customer/payment', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getMyTransactions: () => api.request('/customer/transactions'),

  // Employee
  getPendingTransactions: () => api.request('/employee/transactions/pending'),
  
  verifyTransaction: (id) => api.request(`/employee/transactions/${id}/verify`, {
    method: 'PUT',
  }),
  
  submitToSwift: (transactionIds) => api.request('/employee/transactions/submit', {
    method: 'POST',
    body: JSON.stringify({ transactionIds }),
  }),
};

// Input Validation (matching backend)
const validators = {
  fullName: (value) => /^[a-zA-Z\s'-]{2,100}$/.test(value),
  username: (value) => /^[a-zA-Z0-9_-]{3,30}$/.test(value),
  idNumber: (value) => /^[0-9]{13}$/.test(value),
  accountNumber: (value) => /^[0-9]{8,16}$/.test(value),
  amount: (value) => /^[0-9]+(\.[0-9]{1,2})?$/.test(value) && parseFloat(value) > 0,
  currency: (value) => /^[A-Z]{3}$/.test(value),
  swiftCode: (value) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value),
  password: (value) => {
    if (value.length < 8) return false;
    if (!/[A-Z]/.test(value)) return false;
    if (!/[a-z]/.test(value)) return false;
    if (!/\d/.test(value)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value)) return false;
    return true;
  },
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Alert Component
const Alert = ({ type = 'info', message }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} flex items-start gap-3`}>
      <Icon className="w-5 h-5 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

// Customer Registration
const CustomerRegister = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    idNumber: '',
    accountNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!validators.fullName(formData.fullName)) {
      newErrors.fullName = 'Full name must contain only letters, spaces, hyphens (2-100 chars)';
    }
    if (!validators.username(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters (letters, numbers, _, -)';
    }
    if (!validators.idNumber(formData.idNumber)) {
      newErrors.idNumber = 'ID number must be exactly 13 digits';
    }
    if (!validators.accountNumber(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 8-16 digits';
    }
    if (!validators.password(formData.password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number, and special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await api.customerRegister(formData);
      setAlert({ type: 'success', message: 'Registration successful! Please log in.' });
      setTimeout(() => onSuccess(), 2000);
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 mx-auto mb-2 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Customer Registration</h2>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            maxLength={13}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.idNumber && <p className="text-red-600 text-xs mt-1">{errors.idNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.accountNumber && <p className="text-red-600 text-xs mt-1">{errors.accountNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

// Customer Login
const CustomerLogin = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', accountNumber: '', password: '' });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      const response = await api.customerLogin(formData);
      login(response.token, response.user);
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <User className="w-12 h-12 mx-auto mb-2 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Customer Login</h2>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

// Employee Login
const EmployeeLogin = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setLoading(false);

    try {
      const response = await api.employeeLogin(formData);
      login(response.token, response.user);
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <Building className="w-12 h-12 mx-auto mb-2 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Employee Portal</h2>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Logging in...' : 'Employee Login'}
        </button>
      </form>
    </div>
  );
};

// Payment Form (Customer)
const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    provider: 'SWIFT',
    payeeAccountNumber: '',
    swiftCode: '',
    payeeName: '',
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!validators.amount(formData.amount)) {
      newErrors.amount = 'Enter a valid amount (e.g., 100.50)';
    }
    if (!validators.currency(formData.currency)) {
      newErrors.currency = 'Currency must be 3 uppercase letters (e.g., USD)';
    }
    if (!validators.accountNumber(formData.payeeAccountNumber)) {
      newErrors.payeeAccountNumber = 'Account number must be 8-16 digits';
    }
    if (!validators.swiftCode(formData.swiftCode)) {
      newErrors.swiftCode = 'Invalid SWIFT code format (e.g., ABCDZAJJ)';
    }
    if (!validators.fullName(formData.payeeName)) {
      newErrors.payeeName = 'Invalid payee name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.createPayment(formData);
      setAlert({ type: 'success', message: 'Payment created successfully and sent for verification!' });
      setFormData({
        amount: '',
        currency: 'USD',
        provider: 'SWIFT',
        payeeAccountNumber: '',
        swiftCode: '',
        payeeName: '',
      });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <DollarSign className="w-12 h-12 mx-auto mb-2 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">International Payment</h2>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="100.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <select
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="SWIFT">SWIFT</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payee Name</label>
          <input
            type="text"
            value={formData.payeeName}
            onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.payeeName && <p className="text-red-600 text-xs mt-1">{errors.payeeName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payee Account Number</label>
          <input
            type="text"
            value={formData.payeeAccountNumber}
            onChange={(e) => setFormData({ ...formData, payeeAccountNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.payeeAccountNumber && <p className="text-red-600 text-xs mt-1">{errors.payeeAccountNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
          <input
            type="text"
            value={formData.swiftCode}
            onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value.toUpperCase() })}
            placeholder="ABCDZAJJ"
            maxLength={11}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.swiftCode && <p className="text-red-600 text-xs mt-1">{errors.swiftCode}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

// Customer Transactions View
const CustomerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await api.getMyTransactions();
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      submitted: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="text-center py-8">Loading transactions...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Transactions</h2>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No transactions yet</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SWIFT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {txn.transactionRef}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {txn.payeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {txn.currency} {txn.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {txn.swiftCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Employee Transaction Portal
const EmployeePortal = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await api.getPendingTransactions();
      setTransactions(response.transactions);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load transactions' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.verifyTransaction(id);
      setAlert({ type: 'success', message: 'Transaction verified successfully' });
      loadTransactions();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleSubmitToSwift = async () => {
    if (selectedIds.length === 0) {
      setAlert({ type: 'error', message: 'Please select transactions to submit' });
      return;
    }

    try {
      await api.submitToSwift(selectedIds);
      setAlert({ type: 'success', message: `${selectedIds.length} transaction(s) submitted to SWIFT` });
      setSelectedIds([]);
      loadTransactions();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="text-center py-8">Loading transactions...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pending Transactions</h2>
        <button
          onClick={handleSubmitToSwift}
          disabled={selectedIds.length === 0}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          Submit to SWIFT ({selectedIds.length})
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No pending transactions</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === transactions.filter(t => t.status === 'verified').length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(transactions.filter(t => t.status === 'verified').map(t => t.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SWIFT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className={selectedIds.includes(txn.id) ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-4">
                    {txn.status === 'verified' && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(txn.id)}
                        onChange={() => toggleSelection(txn.id)}
                        className="rounded border-gray-300"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {txn.transactionRef}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{txn.customer.name}</div>
                    <div className="text-xs text-gray-400">{txn.customer.accountNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{txn.payeeName}</div>
                    <div className="text-xs text-gray-400">{txn.payeeAccountNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {txn.currency} {txn.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {txn.swiftCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {txn.status === 'pending' && (
                      <button
                        onClick={() => handleVerify(txn.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Verify
                      </button>
                    )}
                    {txn.status === 'verified' && (
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const { user, logout, loading } = useAuth();
  const [view, setView] = useState('login');
  const [userType, setUserType] = useState('customer');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">International Payments Portal</h1>
            <p className="text-gray-600">Secure banking with SSL encryption</p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setUserType('customer')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                userType === 'customer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setUserType('employee')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                userType === 'employee'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Employee
            </button>
          </div>

          {userType === 'customer' && (
            <>
              {view === 'login' ? (
                <>
                  <CustomerLogin />
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setView('register')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      New customer? Register here
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <CustomerRegister onSuccess={() => setView('login')} />
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setView('login')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Already registered? Login here
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {userType === 'employee' && <EmployeeLogin />}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>🔒 Secured with SSL/TLS encryption</p>
            <p>🛡️ Protected by industry-standard security measures</p>
          </div>
        </div>
      </div>
    );
  }

  // Logged in views
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Payments Portal</h1>
              <p className="text-sm text-gray-600">Welcome, {user.fullName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="py-8">
        {user.role === 'customer' ? (
          <div>
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setView('payment')}
                className={`px-6 py-2 rounded-md font-medium ${
                  view === 'payment' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                New Payment
              </button>
              <button
                onClick={() => setView('transactions')}
                className={`px-6 py-2 rounded-md font-medium ${
                  view === 'transactions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                My Transactions
              </button>
            </div>
            {view === 'payment' ? <PaymentForm /> : <CustomerTransactions />}
          </div>
        ) : (
          <EmployeePortal />
        )}
      </div>
    </div>
  );
};

// Root component with AuthProvider
export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}