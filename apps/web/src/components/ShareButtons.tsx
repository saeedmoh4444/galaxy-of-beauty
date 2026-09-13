'use client';

import { SHARE_URLS } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps): JSX.Element {
  const { t } = useLocale();
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const share = (platform: string) => {
    const encoded = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const urls: Record<string, string> = {
      whatsapp: `${SHARE_URLS.whatsapp}${encodedTitle}%20${encoded}`,
      twitter: `${SHARE_URLS.twitter}${encodedTitle}&url=${encoded}`,
      facebook: `${SHARE_URLS.facebook}${encoded}`,
      copy: shareUrl,
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      return;
    }
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => share('whatsapp')}
        className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors"
        title={t('share.via-whatsapp')}
      >
        {t('share.whatsapp')}
      </button>
      <button
        onClick={() => share('twitter')}
        className="rounded-lg bg-blue-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
        title={t('share.via-twitter')}
      >
        {t('share.twitter')}
      </button>
      <button
        onClick={() => share('copy')}
        className="rounded-lg border border-edge px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-muted dark:border-gray-700 dark:text-text-tertiary transition-colors"
        title={t('share.copy-link')}
      >
        {t('share.copy')}
      </button>
    </div>
  );
}
