import { Link } from 'react-router-dom';

/**
 * 404 Not Found page.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-8xl block mb-6">🔮</span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">٤٠٤</h1>
        <p className="text-xl text-gray-500 mb-8">عذراً، الصفحة التي تبحثين عنها غير موجودة</p>
        <Link to="/" className="btn-primary inline-block">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
