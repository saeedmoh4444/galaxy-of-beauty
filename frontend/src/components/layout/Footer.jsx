import { useTranslation } from 'react-i18next';

/**
 * Site footer with links, contact info, and legal links.
 */
export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-white font-display">
                {t('common.appName')}
              </span>
            </div>
            <p className="text-gray-400 max-w-md">
              {t('common.appName')} - منصة آمنة وموثوقة لحجز خدمات التجميل والعناية الشخصية في المملكة العربية السعودية
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><a href="/services" className="hover:text-white transition-colors">الخدمات</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">تسجيل الدخول</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">إنشاء حساب</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-3">الدعم</h4>
            <ul className="space-y-2">
              <li><a href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">اتصل بنا</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} {t('common.appName')}. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-500">الامتثال لمعايير زاتكا</span>
            <span className="text-xs text-gray-500">ترخيص وزارة التجارة</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
