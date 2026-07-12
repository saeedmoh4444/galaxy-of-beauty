import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function NotificationsScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.notifications.list as any).query({} as never)
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل الإشعارات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await (trpc.notifications.markRead as any).mutate({ id });
      fetch();
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await (trpc.notifications.markAllRead as any).mutate({});
      fetch();
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الإشعارات</Text>
        {data.length > 0 && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAll}>تحديد الكل كمقروء</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.empty}>لا توجد إشعارات</Text>
        </View>
       ) : (
        <ScrollView>
          {data.map((n: Record<string, unknown>) => (
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
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
