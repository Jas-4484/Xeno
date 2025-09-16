import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignHistory from './pages/CampaignHistory';
import AuthHandler from './pages/AuthHandler';
import { CssBaseline } from '@mui/material';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<AuthHandler />} />
        <Route path="/campaigns" element={isAuthenticated ? <Campaigns /> : <Navigate to="/login" />} />
        <Route path="/history" element={isAuthenticated ? <CampaignHistory /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
