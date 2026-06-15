import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import PhoneLogin from './pages/PhoneLogin';
import OtpVerify from './pages/OtpVerify';
import Dashboard from './pages/Dashboard';
import DashboardSkeleton from './components/common/DashboardSkeleton';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <DashboardSkeleton />;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Animated Routes Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Show "Session Restored" toast if user is found after loading
  useEffect(() => {
    if (!loading && user) {
      toast.success('Secure session restored', {
        id: 'session-restored',
        style: {
          borderRadius: '10px',
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155'
        },
      });
    }
  }, [loading, user]);

  if (loading) return <DashboardSkeleton />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PhoneLogin />} />
        <Route path="/verify" element={<OtpVerify />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-4">
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
              },
            }}
          />
          
          {/* Background decoration */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
          </div>

          <AnimatedRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
