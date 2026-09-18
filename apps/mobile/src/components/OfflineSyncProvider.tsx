import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc-react';
import { setOnlineStatus, syncQueue, onSyncComplete } from '@/utils/offlineQueue';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/components/LocaleProvider';

/**
 * Connectivity bridge (offline-first, 5.5) — side effects only, renders
 * nothing. Mount as a sibling of the navigator inside TRPCProvider +
 * ToastProvider + LocaleProvider:
 *
 * - Feeds NetInfo into both react-query's onlineManager (pause/refetch
 *   behaviour) and the offline action queue (auto-sync on reconnect)
 * - Drains leftover queued actions once at startup
 * - Toasts + invalidates the bookings list when queued actions sync
 */
export function OfflineSyncProvider() {
  const { showToast } = useToast();
  const { t } = useLocale();
  const utils = trpc.useUtils();

  useEffect(() => {
    // Initial state + any queue leftovers from a previous session.
    void NetInfo.fetch().then((state) => {
      const online = !!state.isConnected;
      setOnlineStatus(online);
      onlineManager.setOnline(online);
    });
    void syncQueue();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected;
      setOnlineStatus(online);
      onlineManager.setOnline(online);
    });

    const offSync = onSyncComplete((count) => {
      if (count <= 0) return;
      void utils.bookings.list.invalidate();
      showToast('success', t('mobile.offline.synced'));
    });

    return () => {
      unsubscribe();
      offSync();
    };
  }, [showToast, t, utils]);

  return null;
}
