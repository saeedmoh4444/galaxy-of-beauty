import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827', unread: '#f5f3ff' };

export default function NotificationsScreen(): JSX.Element {
  const notifs = trpc.notifications.list.useQuery({});
  const markAll = trpc.notifications.markAllRead.useMutation();
  const data = notifs.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={notifs.isLoading}
      isError={notifs.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل الإشعارات"
      emptyTitle="لا توجد إشعارات"
      emptyDescription="لم تصلك أي إشعارات بعد"
      onRetry={() => notifs.refetch()}
      onRefresh={() => { notifs.refetch(); }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔔 الإشعارات</Text>
        {data && data.length > 0 && (
          <TouchableOpacity onPress={() => { markAll.mutateAsync(); notifs.refetch(); }}>
            <Text style={styles.markAll}>تحديد الكل كمقروء</Text>
          </TouchableOpacity>
        )}
      </View>
      {(data as Record<string, unknown>[])?.map((n: Record<string, unknown>, i: number) => (
        <TouchableOpacity key={i} style={[styles.card, !n.isRead && styles.unread]}>
          <Text style={styles.notifTitle}>{(n.titleJson as any)?.ar ?? n.titleAr as string ?? ''}</Text>
          <Text style={styles.notifBody}>{(n.bodyJson as any)?.ar ?? n.body as string ?? ''}</Text>
          <Text style={styles.notifTime}>{new Date(n.createdAt as string).toLocaleString('ar-SA')}</Text>
        </TouchableOpacity>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand },
  markAll: { fontSize: 13, color: COLORS.brand, fontWeight: '600' },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 6 },
  unread: { backgroundColor: COLORS.unread, borderLeftWidth: 3, borderLeftColor: COLORS.brand },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  notifBody: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  notifTime: { fontSize: 10, color: COLORS.gray400, marginTop: 8 },
});
