import { useState, useEffect } from 'react';

/**
 * Shows a banner when the user goes offline.
 * Auto-hides when connection is restored.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-40 bg-yellow-500 text-white text-center py-2 text-sm font-medium">
      ⚠️ أنت غير متصل بالإنترنت — بعض الميزات قد لا تعمل
    </div>
  );
}
