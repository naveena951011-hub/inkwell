import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useToast } from './hooks/useToast';
import Navbar   from './components/Navbar';
import Toast    from './components/Toast';
import FeedPage    from './pages/FeedPage';
import AuthPage    from './pages/AuthPage';
import ArticlePage from './pages/ArticlePage';
import ComposePage from './pages/ComposePage';
import EditPage    from './pages/EditPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  return user ? children : <Navigate to="/auth" replace />;
}

function AppInner() {
  const { toast, showToast } = useToast();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                 element={<FeedPage />} />
        <Route path="/auth"             element={<AuthPage />} />
        <Route path="/posts/:id"        element={<ArticlePage showToast={showToast} />} />
        <Route path="/compose"          element={<ProtectedRoute><ComposePage showToast={showToast} /></ProtectedRoute>} />
        <Route path="/posts/:id/edit"   element={<ProtectedRoute><EditPage showToast={showToast} /></ProtectedRoute>} />
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
      <Toast toast={toast} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}
