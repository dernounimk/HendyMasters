// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store';

// Layout
import MainLayout from './components/layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import Register from './pages/Register';
import Login from './pages/Login';
import EditProfile from './pages/EditProfile';
import CreatePost from './pages/CreatePost';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';

// Loading Component
import LoadingScreen from './components/LoadingScreen';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || 'يرجى تحديث الصفحة والمحاولة مرة أخرى'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-based Route Component
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route (غير مسجل دخول)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route مع إمكانية الوصول حتى لو كان مسجل دخول
const SemiPublicRoute = ({ children }) => {
  const { isLoading } = useStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return children;
};

function App() {
  const { checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* مسارات عامة (غير مسجل دخول) */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* مسارات إعادة تعيين كلمة المرور (متاحة للجميع) */}
          <Route path="/forgot-password" element={
            <SemiPublicRoute>
              <ForgotPassword />
            </SemiPublicRoute>
          } />
          <Route path="/reset-password" element={
            <SemiPublicRoute>
              <ResetPassword />
            </SemiPublicRoute>
          } />
          
          {/* جميع المسارات المحمية داخل MainLayout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:conversationId" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="profile/edit" element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="saved" element={<Saved />} />
            <Route path="posts/create" element={<CreatePost />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* مسار 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;