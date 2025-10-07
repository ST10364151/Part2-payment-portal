// API service for making requests
const API_URL = 'https://localhost:3001/api';

class ApiService {
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
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  customerRegister(data) {
    return this.request('/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  customerLogin(data) {
    return this.request('/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  employeeLogin(data) {
    return this.request('/auth/employee/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getCurrentUser() {
    return this.request('/auth/me');
  }

  // Customer endpoints
  createPayment(data) {
    return this.request('/customer/payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getMyTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/customer/transactions${query ? '?' + query : ''}`);
  }

  // Employee endpoints
  getPendingTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/employee/transactions/pending${query ? '?' + query : ''}`);
  }

  verifyTransaction(id, notes = '') {
    return this.request(`/employee/transactions/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  submitToSwift(transactionIds) {
    return this.request('/employee/transactions/submit', {
      method: 'POST',
      body: JSON.stringify({ transactionIds }),
    });
  }
}

export default new ApiService();