import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

/**
 * Minimal auth-group layout: exposes the language + theme toggles on the
 * login/register/2FA funnel pages, which had no layout before.
 */
export default function AuthLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-end gap-2 px-4 py-3">
        <LanguageToggle />
        <ThemeToggle />
      </header>
      {children}
    </div>
  );
}
