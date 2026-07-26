import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const ar = {
  appName: 'جالكسي بيوتي',
  login: 'تسجيل الدخول',
  register: 'إنشاء حساب',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  name: 'الاسم',
  phone: 'رقم الجوال',
  services: 'الخدمات',
  bookings: 'حجوزاتي',
  wallet: 'المحفظة',
  profile: 'الملف الشخصي',
  home: 'الرئيسية',
  dashboard: 'لوحة التحكم',
  bookNow: 'احجزي الآن',
  search: 'بحث',
  save: 'حفظ',
  cancel: 'إلغاء',
  loading: 'جاري التحميل...',
  noResults: 'لا توجد نتائج',
  logout: 'تسجيل الخروج',
};

i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar } },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

export default i18n;
