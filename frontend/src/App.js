// ============================================================================
// frontend/src/App.js
// ============================================================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';  // Keep for now (can be removed later)
import ChangePassword from './components/ChangePassword';  // NEW
import Dashboard from './components/Dashboard';
import EmployeeLogin from './components/EmployeeLogin';
import EmployeeDashboard from './components/EmployeeDashboard';
import CreateCustomer from './components/employee/CreateCustomer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/create-customer" element={<CreateCustomer />} />
      </Routes>
    </Router>
  );
}

export default App;