import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store/uiStore';

/**
 * Language toggle button (AR ↔ EN).
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLanguage = useUIStore((s) => s.setLanguage);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium
                 text-gray-700 hover:bg-gray-100 transition-colors"
      aria-label={`Switch to ${i18n.language === 'ar' ? 'English' : 'العربية'}`}
    >
      {i18n.language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
}
