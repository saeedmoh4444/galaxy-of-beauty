import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import LanguageSwitcher from '../ui/LanguageSwitcher';

/**
 * Main navigation bar.
 * Adapts based on user role: public nav for guests, dashboards for authenticated users.
 */
export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'CUSTOMER': return '/dashboard';
      case 'TECHNICIAN': return '/tech/dashboard';
      case 'ADMIN': return '/admin';
      default: return null;
    }
  };

  const getDashboardLabel = () => {
    if (!user) return '';
    switch (user.role) {
      case 'CUSTOMER': return t('nav.dashboard');
      case 'TECHNICIAN': return t('nav.dashboard');
      case 'ADMIN': return t('nav.admin');
      default: return '';
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold text-primary-700 font-display hidden sm:block">
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              {t('nav.services')}
            </Link>

            {isAuthenticated && getDashboardLink() && (
              <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                {getDashboardLabel()}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link to="/bookings" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {t('nav.bookings')}
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  {t('nav.profile')}
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  {t('nav.register')}
                </Link>
              </>
            )}

            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link to="/services" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
              {t('nav.services')}
            </Link>
            {isAuthenticated ? (
              <>
                {getDashboardLink() && (
                  <Link to={getDashboardLink()} className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                    {getDashboardLabel()}
                  </Link>
                )}
                <Link to="/bookings" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.bookings')}
                </Link>
                <Link to="/profile" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.profile')}
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block py-2 text-red-600 w-full text-right">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="block py-2 text-primary-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.register')}
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}
