'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@galaxy/shared';

const adminLinks = [
  { href: '/admin/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: '📊' },
  { href: '/admin/users', labelAr: 'المستخدمين', labelEn: 'Users', icon: '👥' },
  { href: '/admin/technicians', labelAr: 'الفنيات', labelEn: 'Technicians', icon: '💅' },
  { href: '/admin/categories', labelAr: 'الأقسام', labelEn: 'Categories', icon: '📂' },
  { href: '/admin/services', labelAr: 'الخدمات', labelEn: 'Services', icon: '✨' },
  { href: '/admin/bookings', labelAr: 'الحجوزات', labelEn: 'Bookings', icon: '📅' },
  { href: '/admin/disputes', labelAr: 'النزاعات', labelEn: 'Disputes', icon: '⚖️' },
  { href: '/admin/finance', labelAr: 'المالية', labelEn: 'Finance', icon: '💰' },
  { href: '/admin/settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: '⚙️' },
  { href: '/admin/zatca', labelAr: 'الفاتورة الإلكترونية', labelEn: 'ZATCA', icon: '🧾' },
];

export default function AdminLayout({ children }: { children: ReactNode }): ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Redirect non-admins
  if (user && user.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-e border-gray-200 bg-white p-4 md:block dark:border-gray-800 dark:bg-gray-950">
        <Link href="/admin/dashboard" className="mb-6 block text-lg font-bold text-brand-600">
          لوحة الإدارة
        </Link>
        <nav className="space-y-0.5">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            🏠 العودة للمتجر
          </Link>
          <button
            onClick={async () => { await logout(); router.push('/login'); }}
            className="mt-1 w-full rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-6 dark:bg-gray-950">{children}</main>
    </div>
  );
}
