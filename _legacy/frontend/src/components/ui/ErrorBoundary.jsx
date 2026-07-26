import { Component } from 'react';

/**
 * React Error Boundary - catches rendering errors and shows fallback UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // In production, send to Sentry
    if (import.meta.env.PROD && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="card max-w-md text-center">
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-gray-500 mb-4">
              حدث خطأ أثناء تحميل الصفحة. يرجى تحديث الصفحة أو المحاولة لاحقاً.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
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
