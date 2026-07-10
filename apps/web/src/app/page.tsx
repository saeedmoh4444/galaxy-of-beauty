import Link from 'next/link';

import type { ReactElement } from 'react';

export default function HomePage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-brand-600">Galaxy of Beauty</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">جالكسي بيوتي</p>
      <p className="mt-2 text-sm text-gray-500">
        Monorepo scaffold — Phase 1. Features coming in Phase 4.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/login" className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Login
        </Link>
        <Link href="/register" className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
          Register
        </Link>
      </div>
    </main>
  );
}
