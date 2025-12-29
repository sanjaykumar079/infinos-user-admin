import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './contexts/AdminAuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAdminAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#ff6b35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return isAdminAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

// Public Route Component - Redirect to dashboard if already authenticated
function PublicRoute({ children }) {
  const { isAdminAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #111827 0%, #1a1a1a 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#ff6b35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return isAdminAuthenticated ? <Navigate to="/admin/dashboard" replace /> : children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Public Login Route */}
        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />

        {/* Protected Dashboard Route */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
