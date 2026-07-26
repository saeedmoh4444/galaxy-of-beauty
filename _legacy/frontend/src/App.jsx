import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import TermsUpdateModal from './components/ui/TermsUpdateModal';
import { useSocket } from './hooks/useSocket';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const TechnicianDashboard = lazy(() => import('./pages/TechnicianDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const SurpriseMePage = lazy(() => import('./pages/SurpriseMePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  const { i18n } = useTranslation();

  // Initialize Socket.IO for real-time updates
  useSocket();

  // Set HTML dir and lang based on current language
  useEffect(() => {
    const lang = i18n.language;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <ErrorBoundary>
      <TermsUpdateModal />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<Layout />}>
            {/* ---- Public Routes ---- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/services/surprise-me" element={<SurpriseMePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ---- Authenticated (Any Role) ---- */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/:serviceId?"
              element={
                <ProtectedRoute roles={['CUSTOMER']}>
                  <BookingPage />
                </ProtectedRoute>
              }
            />

            {/* ---- Customer Only ---- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ---- Technician Only ---- */}
            <Route
              path="/tech/dashboard"
              element={
                <ProtectedRoute roles={['TECHNICIAN']}>
                  <TechnicianDashboard />
                </ProtectedRoute>
              }
            />

            {/* ---- Admin Only ---- */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ---- 404 ---- */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
