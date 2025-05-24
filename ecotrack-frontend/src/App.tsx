import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', background: '#f2f2f2' }}>
        <Link to="/dashboard">Dashboard</Link> |{' '}
        <Link to="/orders">Orders</Link> |{' '}
        <Link to="/profile">Profile</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}
