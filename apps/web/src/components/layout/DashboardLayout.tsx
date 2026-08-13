'use client';

/* eslint-disable jsx-a11y/aria-role */ // 'role' prop is a user role, not an ARIA attribute

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@galaxy/ui';

const customerLinks = [
  { href: '/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: '' },
  { href: '/bookings', labelAr: 'حجوزاتي', labelEn: 'My Bookings', icon: '' },
  { href: '/bookings/create', labelAr: 'حجز جديد', labelEn: 'New Booking', icon: '' },
  { href: '/wallet', labelAr: 'المحفظة', labelEn: 'Wallet', icon: '' },
  { href: '/wishlist', labelAr: 'المفضلة', labelEn: 'Wishlist', icon: '️' },
  { href: '/womens-services', labelAr: 'خدمات نسائية', labelEn: 'Women', icon: '' },
  { href: '/dna-beauty', labelAr: 'تحليل الجينات', labelEn: 'DNA Beauty', icon: '' },
  { href: '/ride-hailing', labelAr: 'توصيل للموعد', labelEn: 'Ride', icon: '' },
  { href: '/last-mile', labelAr: 'توصيل سريع', labelEn: 'Delivery', icon: '' },
  { href: '/calendar-sync', labelAr: 'مزامنة التقويم', labelEn: 'Calendar', icon: '️' },
  { href: '/bnpl', labelAr: 'تقسيط', labelEn: 'BNPL', icon: '' },
  { href: '/tech-onboarding', labelAr: 'تسجيل فنية', labelEn: 'Onboarding', icon: '' },
  { href: '/ai-assistant', labelAr: 'المساعدة الذكية', labelEn: 'AI Assistant', icon: '' },
  { href: '/beauty-bingo', labelAr: 'Beauty Bingo', labelEn: 'Bingo', icon: '' },
  { href: '/service-wishlist', labelAr: 'متابعة الأسعار', labelEn: 'Wishlist', icon: '' },
  { href: '/gift-card-market', labelAr: 'سوق البطاقات', labelEn: 'Gift Market', icon: '' },
  { href: '/live-chat', labelAr: 'الدعم المباشر', labelEn: 'Live Chat', icon: '' },
  { href: '/vendor-portal', labelAr: 'بوابة البائعين', labelEn: 'Vendor', icon: '' },
  { href: '/certification-quiz', labelAr: 'الشهادات', labelEn: 'Certification', icon: '' },
  { href: '/tech-waitlist', labelAr: 'قائمة الانتظار', labelEn: 'Waitlist', icon: '' },
  { href: '/night-mode', labelAr: 'روتين ليلي', labelEn: 'Night Mode', icon: '' },
  { href: '/travel-kit', labelAr: 'حقيبة السفر', labelEn: 'Travel Kit', icon: '' },
  { href: '/expiry-tracker', labelAr: 'صلاحية المنتجات', labelEn: 'Expiry', icon: '️' },
  { href: '/price-drop-alerts', labelAr: 'تنبيهات الأسعار', labelEn: 'Price Drops', icon: '' },
  { href: '/loyalty-punch-card', labelAr: 'بطاقة الولاء', labelEn: 'Punch Card', icon: '' },
  { href: '/routine-scheduler', labelAr: 'جدول الروتين', labelEn: 'Routine', icon: '' },
  { href: '/booking-checklist', labelAr: 'قائمة التحضير', labelEn: 'Checklist', icon: '' },
  { href: '/hair-color-sim', labelAr: 'محاكي الشعر', labelEn: 'Hair Color', icon: '‍️' },
  { href: '/spa-planner', labelAr: 'مخطط سبا', labelEn: 'Spa Planner', icon: '️' },
  { href: '/restock-reminder', labelAr: 'تجديد المنتجات', labelEn: 'Restock', icon: '' },
  { href: '/skin-diary', labelAr: 'يوميات البشرة', labelEn: 'Skin Diary', icon: '' },
  { href: '/pen-pal', labelAr: 'Beauty Pen Pal', labelEn: 'Pen Pal', icon: '' },
  { href: '/sale-alerts', labelAr: 'تنبيهات العروض', labelEn: 'Sale Alerts', icon: '' },
  { href: '/style-match', labelAr: 'Style Match', labelEn: 'Style Match', icon: '' },
  { href: '/product-scanner', labelAr: 'فحص المنتجات', labelEn: 'Scanner', icon: '' },
  { href: '/vip-membership', labelAr: 'عضوية VIP', labelEn: 'VIP', icon: '' },
  { href: '/ai-routine', labelAr: 'روتين ذكي', labelEn: 'AI Routine', icon: '' },
  { href: '/box-builder', labelAr: 'صندوق التجميل', labelEn: 'Box Builder', icon: '' },
  { href: '/service-warranty', labelAr: 'ضمان الخدمة', labelEn: 'Warranty', icon: '️' },
  { href: '/wellness-tracker', labelAr: 'متعقب العافية', labelEn: 'Wellness', icon: '' },
  { href: '/home-service', labelAr: 'خدمة منزلية', labelEn: 'Home Service', icon: '' },
  { href: '/beauty-analytics', labelAr: 'تحليلاتي', labelEn: 'Analytics', icon: '' },
  { href: '/birthday-rewards', labelAr: 'هدية الميلاد', labelEn: 'Birthday', icon: '' },
  { href: '/post-care', labelAr: 'العناية بعد الخدمة', labelEn: 'Aftercare', icon: '‍️' },
  { href: '/mood-board', labelAr: 'لوحة الإلهام', labelEn: 'Mood Board', icon: '' },
  { href: '/family-account', labelAr: 'حساب العائلة', labelEn: 'Family', icon: '‍‍' },
  { href: '/virtual-try-on', labelAr: 'تجربة افتراضية', labelEn: 'Try-On AR', icon: '' },
  { href: '/bridal-concierge', labelAr: 'تخطيط الزفاف', labelEn: 'Bridal', icon: '' },
  { href: '/group-bookings', labelAr: 'مجموعات', labelEn: 'Groups', icon: '‍️' },
  { href: '/challenges', labelAr: 'التحديات', labelEn: 'Challenges', icon: '' },
  { href: '/loyalty', labelAr: 'الولاء', labelEn: 'Loyalty', icon: '' },
  { href: '/promo', labelAr: 'كود الخصم', labelEn: 'Promo Code', icon: '️' },
  { href: '/saved-cards', labelAr: 'البطاقات', labelEn: 'Cards', icon: '' },
  { href: '/notifications', labelAr: 'الإشعارات', labelEn: 'Notifications', icon: '' },
  { href: '/skin-analysis', labelAr: 'تحليل البشرة', labelEn: 'Skin Analysis', icon: '' },
  { href: '/ai-chat', labelAr: 'لايلى', labelEn: 'Layla AI', icon: '' },
  { href: '/subscriptions', labelAr: 'الاشتراكات', labelEn: 'Subscriptions', icon: '' },
  { href: '/marketplace', labelAr: 'المتجر', labelEn: 'Marketplace', icon: '️' },
  { href: '/subscription-boxes', labelAr: 'الصناديق الشهرية', labelEn: 'Boxes', icon: '' },
  { href: '/cart', labelAr: 'سلة التسوق', labelEn: 'Cart', icon: '' },
  { href: '/cashback', labelAr: 'استرداد نقدي', labelEn: 'Cashback', icon: '' },
  { href: '/social', labelAr: 'مجتمع الجمال', labelEn: 'Community', icon: '' },
  { href: '/video', labelAr: 'استشارات فيديو', labelEn: 'Video', icon: '' },
  { href: '/smart-schedule', labelAr: 'جدولة ذكية', labelEn: 'Smart Schedule', icon: '' },
  { href: '/profile', labelAr: 'الملف الشخصي', labelEn: 'Profile', icon: '' },
  { href: '/addresses', labelAr: 'العناوين', labelEn: 'Addresses', icon: '' },
];

const technicianLinks = [
  { href: '/tech/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: '' },
  { href: '/tech/slots', labelAr: 'المواعيد المتاحة', labelEn: 'Availability', icon: '' },
  { href: '/tech/bookings', labelAr: 'الحجوزات', labelEn: 'Bookings', icon: '' },
  { href: '/tech/earnings', labelAr: 'الأرباح', labelEn: 'Earnings', icon: '' },
  { href: '/tech/performance', labelAr: 'أدائي', labelEn: 'Performance', icon: '' },
  { href: '/tech/wallet', labelAr: 'المحفظة', labelEn: 'Wallet', icon: '' },
  { href: '/tech/waitlist', labelAr: 'الطلبات المعلقة', labelEn: 'Pending', icon: '' },
  { href: '/tech/gallery', labelAr: 'معرض الأعمال', labelEn: 'Gallery', icon: '️' },
  { href: '/tech/calendar', labelAr: 'تقويم قوقل', labelEn: 'Calendar', icon: '' },
  { href: '/tech/profile', labelAr: 'ملفي الشخصي', labelEn: 'Profile', icon: '' },
];

const adminLinks = [
  { href: '/admin/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: '' },
  { href: '/admin/users', labelAr: 'المستخدمين', labelEn: 'Users', icon: '' },
  { href: '/admin/technicians', labelAr: 'الفنيات', labelEn: 'Technicians', icon: '‍' },
  { href: '/admin/services', labelAr: 'الخدمات', labelEn: 'Services', icon: '' },
  { href: '/admin/categories', labelAr: 'الأقسام', labelEn: 'Categories', icon: '' },
  { href: '/admin/areas', labelAr: 'المناطق', labelEn: 'Areas', icon: '' },
  { href: '/admin/bookings', labelAr: 'الحجوزات', labelEn: 'Bookings', icon: '' },
  { href: '/admin/finance', labelAr: 'المالية', labelEn: 'Finance', icon: '' },
  { href: '/admin/flash-deals', labelAr: 'عروض فلاش', labelEn: 'Flash Deals', icon: '' },
  { href: '/admin/beauty-events', labelAr: 'الفعاليات', labelEn: 'Events', icon: '' },
  { href: '/admin/loyalty', labelAr: 'برامج الولاء', labelEn: 'Loyalty', icon: '' },
  { href: '/admin/cms', labelAr: 'إدارة المحتوى', labelEn: 'CMS', icon: '' },
  { href: '/admin/admin-tools', labelAr: 'أدوات المشرف', labelEn: 'Tools', icon: '️' },
  { href: '/admin/group-bookings', labelAr: 'حجوزات جماعية', labelEn: 'Groups', icon: '' },
  { href: '/admin/disputes', labelAr: 'النزاعات', labelEn: 'Disputes', icon: '' },
  { href: '/admin/analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: '' },
  { href: '/admin/zatca', labelAr: 'زاتكا', labelEn: 'ZATCA', icon: '' },
  { href: '/admin/settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: '️' },
];

export function DashboardLayout({
  children,
  userRole = 'CUSTOMER',
}: {
  children: ReactNode;
  /** User role for navigation items — not an ARIA attribute */
  userRole?: string;
}): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const links =
    userRole === 'ADMIN' ? adminLinks : userRole === 'TECHNICIAN' ? technicianLinks : customerLinks;

  const handleLogout = async () => {
    if (!window.confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-e border-gray-200 bg-white p-4 md:block dark:border-gray-800 dark:bg-gray-950">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <img src="/logo.png" alt="جالكسي بيوتي" className="h-10 w-10 rounded-lg object-cover" />
          <span className="text-xl font-bold text-brand-600">جالكسي بيوتي</span>
        </Link>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
              }`}
            >
              <span>{link.icon}</span>
              {link.labelAr}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 w-full rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          تسجيل الخروج
        </button>
      </aside>

      {/* Content */}
      <main
        data-testid="dashboard-content"
        className="flex-1 overflow-auto bg-gray-50 p-4 pb-20 md:p-6 md:pb-6 dark:bg-gray-950 animate-fade-in"
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:hidden">
        <div className="flex overflow-x-auto">
          {links.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-[64px] flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors ${
                pathname.startsWith(link.href) ? 'text-brand-600' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="truncate max-w-[56px]">{link.labelAr}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
