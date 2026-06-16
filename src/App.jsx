import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppProvider, useAppContext } from './hooks/useAppContext';
import PhoneLogin from './pages/PhoneLogin';
import OtpVerify from './pages/OtpVerify';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import DashboardSkeleton from './components/common/DashboardSkeleton';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <DashboardSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Animated Routes Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) return <DashboardSkeleton />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<PhoneLogin />} />
        <Route path="/verify" element={<OtpVerify />} />
        
        {/* Private Routes with Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security" element={<Security />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};


function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen w-full transition-colors duration-300 bg-[var(--bg-color)] text-[var(--text-primary)]">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)'
                },
              }}
            />
            <AnimatedRoutes />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}


export default App;
