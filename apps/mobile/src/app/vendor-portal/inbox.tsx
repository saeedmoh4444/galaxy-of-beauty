import type { JSX } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { localize } from '@galaxy/shared';
import { inboxRoute } from '@/utils/vendorInbox';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  unread: '#f5f3ff',
};

interface AppNotification {
  id?: number;
  type?: string;
  titleJson?: { ar?: string; en?: string };
  titleAr?: string;
  bodyJson?: { ar?: string; en?: string };
  body?: string;
  createdAt?: string;
  isRead?: boolean;
}

/** E3 — the seller inbox over the F1 notifications domain: low-stock,
 *  SLA breaches, dispute escalations and payout notices all land here.
 *  Tapping marks read and deep-links vendor types to their portal screen. */
export default function VendorInboxScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isAuthed = useAuthState();
  const notifs = trpc.notifications.list.useQuery({}, { enabled: isAuthed });
  const markAll = trpc.notifications.markAllRead.useMutation();
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => notifs.refetch() });
  const data = notifs.data as { items?: AppNotification[] } | undefined;
  const items = data?.items ?? [];

  const onTap = (n: AppNotification) => {
    if (n.id) markRead.mutate({ id: n.id });
    const route = inboxRoute(n.type);
    if (route) router.push(route as never);
  };

  return (
    <ScreenState
      isLoading={notifs.isLoading}
      isError={notifs.isError}
      isEmpty={!notifs.isLoading && items.length === 0}
      errorMessage={t('mobile.notifications.load-error')}
      emptyTitle={t('mobile.notifications.empty-title')}
      emptyDescription={t('mobile.notifications.empty-desc')}
      onRetry={() => notifs.refetch()}
    >
      <ScrollView
        style={styles.c}
        contentContainerStyle={styles.i}
        refreshControl={
          <RefreshControl
            refreshing={notifs.isRefetching}
            onRefresh={() => void notifs.refetch()}
            colors={[COLORS.brand]}
            tintColor={COLORS.brand}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('mobile.notifications.title')}</Text>
          {items.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                markAll.mutateAsync({});
                notifs.refetch();
              }}
            >
              <Text style={styles.markAll}>{t('mobile.notifications.mark-all')}</Text>
            </TouchableOpacity>
          )}
        </View>
        {items.map((n, i) => (
          <TouchableOpacity
            key={n.id ?? i}
            onPress={() => onTap(n)}
            style={[styles.card, !n.isRead && styles.unread]}
          >
            <Text style={styles.notifTitle}>
              {localize(n.titleJson, locale) || n.titleAr || ''}
            </Text>
            <Text style={styles.notifBody}>{localize(n.bodyJson, locale) || n.body || ''}</Text>
            <Text style={styles.notifTime}>
              {n.createdAt
                ? new Date(n.createdAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')
                : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand },
  markAll: { fontSize: 13, color: COLORS.brand, fontWeight: '600' },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 6 },
  unread: { backgroundColor: COLORS.unread, borderLeftWidth: 3, borderLeftColor: COLORS.brand },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  notifBody: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  notifTime: { fontSize: 10, color: COLORS.gray400, marginTop: 8 },
});
