import { cookies } from 'next/headers';
import type { Locale } from '@galaxy/shared';
import { LOCALE_COOKIE } from '@/lib/locale';

export { LOCALE_COOKIE };

/** Server-side locale read (Next 15: cookies() is async). */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === 'en' ? 'en' : 'ar';
}
