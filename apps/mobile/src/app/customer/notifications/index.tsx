import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function NotificationsScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.notifications.list.query({}));

  const handleMarkRead = async (id: number) => {
    await (trpc.notifications.markRead as any).mutate({ id });
    refetch();
  };

  const handleMarkAll = async () => {
    await (trpc.notifications.markAllRead as any).mutate({});
    refetch();
  };

  if (loading) return <View style={styles.container}><View style={styles.header}><Text style={styles.title}>الإشعارات</Text></View><SkeletonList count={4} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل الإشعارات" onRetry={refetch} />;

  const items = (data ?? []) as Record<string, unknown>[];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الإشعارات</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAll}>تحديد الكل كمقروء</Text>
          </TouchableOpacity>
        )}
      </View>
      {items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.empty}>لا توجد إشعارات</Text>
          <Text style={styles.hint}>ستصلكِ إشعارات الحجوزات والعروض هنا</Text>
        </View>
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
          {items.map((n: Record<string, unknown>) => (
            <TouchableOpacity
              key={n.id as number}
              style={[styles.card, !n.readAt && styles.unread]}
              onPress={() => !n.readAt && handleMarkRead(n.id as number)}
            >
              <View style={styles.cardRow}>
                <Text style={styles.notifTitle}>{n.title as string}</Text>
                {!n.readAt && <View style={styles.dot} />}
              </View>
              <Text style={styles.notifBody}>{n.body as string}</Text>
              <Text style={styles.notifTime}>{new Date(n.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  markAll: { color: '#7c3aed', fontSize: 14, fontWeight: '600' },
  card: { padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  unread: { borderColor: '#c4b5fd', backgroundColor: '#faf5ff' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed' },
  notifBody: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  notifTime: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
});
