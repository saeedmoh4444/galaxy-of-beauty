'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@galaxy/shared';

const customerLinks = [
  { href: '/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: '📊' },
  { href: '/bookings', labelAr: 'حجوزاتي', labelEn: 'My Bookings', icon: '📅' },
  { href: '/wallet', labelAr: 'المحفظة', labelEn: 'Wallet', icon: '💰' },
  { href: '/wishlist', labelAr: 'المفضلة', labelEn: 'Wishlist', icon: '❤️' },
  { href: '/loyalty', labelAr: 'الولاء', labelEn: 'Loyalty', icon: '⭐' },
  { href: '/promo', labelAr: 'كود الخصم', labelEn: 'Promo Code', icon: '🏷️' },
  { href: '/saved-cards', labelAr: 'البطاقات', labelEn: 'Cards', icon: '💳' },
  { href: '/notifications', labelAr: 'الإشعارات', labelEn: 'Notifications', icon: '🔔' },
  { href: '/skin-analysis', labelAr: 'تحليل البشرة', labelEn: 'Skin Analysis', icon: '🔬' },
  { href: '/ai-chat', labelAr: 'لايلى', labelEn: 'Layla AI', icon: '🤖' },
  { href: '/subscriptions', labelAr: 'الاشتراكات', labelEn: 'Subscriptions', icon: '📦' },
  { href: '/profile', labelAr: 'الملف الشخصي', labelEn: 'Profile', icon: '👤' },
  { href: '/addresses', labelAr: 'العناوين', labelEn: 'Addresses', icon: '📍' },
];

const technicianLinks = [
  { href: '/tech/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: '📊' },
  { href: '/tech/slots', labelAr: 'المواعيد المتاحة', labelEn: 'Availability', icon: '⏰' },
  { href: '/tech/bookings', labelAr: 'الحجوزات', labelEn: 'Bookings', icon: '📅' },
  { href: '/tech/earnings', labelAr: 'الأرباح', labelEn: 'Earnings', icon: '💰' },
  { href: '/tech/calendar', labelAr: 'تقويم قوقل', labelEn: 'Calendar', icon: '📆' },
  { href: '/tech/profile', labelAr: 'ملفي الشخصي', labelEn: 'Profile', icon: '👤' },
];

const adminLinks = [
  { href: '/admin/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: '📊' },
  { href: '/admin/users', labelAr: 'المستخدمين', labelEn: 'Users', icon: '👥' },
  { href: '/admin/technicians', labelAr: 'الفنيات', labelEn: 'Technicians', icon: '👩‍🎨' },
  { href: '/admin/services', labelAr: 'الخدمات', labelEn: 'Services', icon: '💄' },
  { href: '/admin/categories', labelAr: 'الأقسام', labelEn: 'Categories', icon: '📂' },
  { href: '/admin/areas', labelAr: 'المناطق', labelEn: 'Areas', icon: '📍' },
  { href: '/admin/bookings', labelAr: 'الحجوزات', labelEn: 'Bookings', icon: '📅' },
  { href: '/admin/finance', labelAr: 'المالية', labelEn: 'Finance', icon: '💰' },
  { href: '/admin/disputes', labelAr: 'النزاعات', labelEn: 'Disputes', icon: '⚡' },
  { href: '/admin/analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: '📈' },
  { href: '/admin/zatca', labelAr: 'زاتكا', labelEn: 'ZATCA', icon: '🧾' },
  { href: '/admin/settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: '⚙️' },
];

export function DashboardLayout({ children, role = 'CUSTOMER' }: { children: ReactNode; role?: string }): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const links = role === 'ADMIN' ? adminLinks : role === 'TECHNICIAN' ? technicianLinks : customerLinks;

  const handleLogout = async () => {
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
      <main className="flex-1 overflow-auto bg-gray-50 p-6 dark:bg-gray-950">{children}</main>
    </div>
  );
}
