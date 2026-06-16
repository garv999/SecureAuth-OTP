import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppProvider } from './hooks/useAppContext';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardSkeleton from './components/common/DashboardSkeleton';

// Lazy load pages
const PhoneLogin = lazy(() => import('./pages/PhoneLogin'));
const OtpVerify = lazy(() => import('./pages/OtpVerify'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Security = lazy(() => import('./pages/Security'));
const Activity = lazy(() => import('./pages/Activity'));
const Settings = lazy(() => import('./pages/Settings'));
const Layout = lazy(() => import('./components/Layout'));

// Subtle Loading Component
const PageLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center min-h-[60vh] w-full"
  >
    <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
  </motion.div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <DashboardSkeleton />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// Animated Routes Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) return <DashboardSkeleton />;

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
};


function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}


export default App;
