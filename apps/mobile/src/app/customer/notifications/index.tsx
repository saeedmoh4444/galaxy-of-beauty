import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  unread: '#f5f3ff',
};

interface AppNotification {
  titleJson?: { ar?: string; en?: string };
  titleAr?: string;
  bodyJson?: { ar?: string; en?: string };
  body?: string;
  createdAt?: string;
  isRead?: boolean;
}

export default function NotificationsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const notifs = trpc.notifications.list.useQuery({});
  const markAll = trpc.notifications.markAllRead.useMutation();
  const data = notifs.data as AppNotification[] | undefined;

  return (
    <ScreenState
      isLoading={notifs.isLoading}
      isError={notifs.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('mobile.notifications.load-error')}
      emptyTitle={t('mobile.notifications.empty-title')}
      emptyDescription={t('mobile.notifications.empty-desc')}
      onRetry={() => notifs.refetch()}
      onRefresh={() => {
        notifs.refetch();
      }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('mobile.notifications.title')}</Text>
        {data && data.length > 0 && (
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
      {data?.map((n, i) => (
        <TouchableOpacity key={i} style={[styles.card, !n.isRead && styles.unread]}>
          <Text style={styles.notifTitle}>{localize(n.titleJson, locale) || n.titleAr || ''}</Text>
          <Text style={styles.notifBody}>{localize(n.bodyJson, locale) || n.body || ''}</Text>
          <Text style={styles.notifTime}>
            {n.createdAt
              ? new Date(n.createdAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')
              : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
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
