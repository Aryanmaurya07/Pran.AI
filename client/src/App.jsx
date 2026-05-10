import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SymptomInput from './pages/SymptomInput';
import Results from './pages/Results';
import NearbyDoctors from './pages/NearbyDoctors';
import History from './pages/History';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Admin routes don't show the user Navbar/Footer
const ADMIN_PATHS    = ['/admin', '/admin/dashboard'];
const NO_FOOTER_PATHS = ['/dashboard', '/symptoms', '/results', '/nearby-doctors', '/history'];

const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = ADMIN_PATHS.some(p => location.pathname.startsWith(p));
  const showFooter   = !NO_FOOTER_PATHS.includes(location.pathname) && !isAdminRoute;
  const showNavbar   = !isAdminRoute;

  // Wake up Render backend on app load (prevents cold-start delay on login)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health`, { method: 'GET' })
      .catch(() => {});
  }, []);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* ── Public routes ────────────────────────────── */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about"   element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms"   element={<Terms />} />

        {/* ── Protected user routes ────────────────────── */}
        <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/symptoms"       element={<ProtectedRoute><SymptomInput /></ProtectedRoute>} />
        <Route path="/results"        element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/nearby-doctors" element={<ProtectedRoute><NearbyDoctors /></ProtectedRoute>} />
        <Route path="/history"        element={<ProtectedRoute><History /></ProtectedRoute>} />

        {/* ── Admin routes (no auth wrapper — admin handles its own auth) ── */}
        <Route path="/admin"           element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* ── Fallback ─────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;