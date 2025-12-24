import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ROLES } from './utils/constants';
import './App.css';

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Route based on user role
  switch (user.role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin" replace />;
    case ROLES.MANAGER:
      return <Navigate to="/manager" replace />;
    default:
      return <Navigate to="/user" replace />;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<LoginPage />} />

          {/* Password Reset */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Dashboard Router - redirects based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* User Dashboard */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={[ROLES.USER]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Manager Dashboard */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={[ROLES.MANAGER]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
