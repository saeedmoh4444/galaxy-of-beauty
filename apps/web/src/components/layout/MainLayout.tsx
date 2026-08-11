'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { BackToTop } from '@/components/BackToTop';
import { NotificationBadge } from '@/components/NotificationBadge';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

const navLinks = [
  { href: '/discover', labelAr: '🧭 اكتشفي', labelEn: 'Discover' },
  { href: '/search', labelAr: '🔍', labelEn: 'Search' },
  { href: '/marketplace', labelAr: 'المتجر', labelEn: 'Marketplace' },
  { href: '/mommy-and-me', labelAr: 'أم وابنتها', labelEn: 'Mommy & Me' },
  { href: '/lookbook', labelAr: 'لوك بوك', labelEn: 'Lookbook' },
  { href: '/bundles', labelAr: 'اصنعي باقتكِ', labelEn: 'Bundles' },
  { href: '/beauty-quiz', labelAr: 'اختبار الجمال', labelEn: 'Quiz' },
  { href: '/beauty-packages', labelAr: 'الباقات', labelEn: 'Packages' },
  { href: '/bridal-concierge', labelAr: 'تخطيط الزفاف', labelEn: 'Bridal' },
  { href: '/campaigns', labelAr: 'العروض', labelEn: 'Deals' },
  { href: '/events', labelAr: 'الفعاليات', labelEn: 'Events' },
  { href: '/blog', labelAr: 'المدونة', labelEn: 'Blog' },
];

export function MainLayout({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="جالكسي بيوتي" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-bold text-brand-600">جالكسي بيوتي</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-600 ${
                  pathname.startsWith(link.href)
                    ? 'text-brand-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {link.labelAr}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBadge />
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              دخول
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
      <BackToTop />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="جالكسي بيوتي"
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span className="text-lg font-bold text-brand-600">جالكسي بيوتي</span>
              </Link>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                منصتكِ للجمال والعناية — احجزي خدمات التجميل المنزلية بكل سهولة
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">تصفحي</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/services" className="block hover:text-brand-600">
                  الخدمات
                </Link>
                <Link href="/technicians" className="block hover:text-brand-600">
                  الفنيات
                </Link>
                <Link href="/marketplace" className="block hover:text-brand-600">
                  المتجر
                </Link>
                <Link href="/blog" className="block hover:text-brand-600">
                  المدونة
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">المساعدة</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/ai-chat" className="block hover:text-brand-600">
                  تحدثي مع ليلى
                </Link>
                <Link href="/bookings/create" className="block hover:text-brand-600">
                  احجزي الآن
                </Link>
                <Link href="/subscription-boxes" className="block hover:text-brand-600">
                  الصناديق الشهرية
                </Link>
                <Link href="/services/surprise-me" className="block hover:text-brand-600">
                  🎲 فاجئيني
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                روابط سريعة
              </h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/login" className="block hover:text-brand-600">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="block hover:text-brand-600">
                  إنشاء حساب
                </Link>
                <Link href="/dashboard" className="block hover:text-brand-600">
                  لوحة التحكم
                </Link>
                <Link href="/gift-cards" className="block hover:text-brand-600">
                  بطاقات الهدية
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-400 dark:border-gray-800">
            © {new Date().getFullYear()} Galaxy of Beauty — جالكسي بيوتي. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
      <PWAInstallPrompt />
    </div>
  );
}
