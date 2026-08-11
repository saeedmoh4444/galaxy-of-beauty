import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function CalendarSyncScreen(): JSX.Element {
  const [status, setStatus] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      (trpc as any).calendarSync.status.query() as any,
      (trpc as any).calendarSync.upcoming.query() as any,
    ])
      .then(([s, u]: any[]) => {
        setStatus(s);
        setUpcoming(u || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const connect = () => {
    (
      (trpc as any).calendarSync.connect.mutate({ authCode: 'google-auth-code' /* TODO */ }) as any
    ).then(() => fetch());
  };
  const disconnect = () => {
    ((trpc as any).calendarSync.disconnect.mutate({}) as any).then(() => fetch());
  };
  if (loading) return <SkeletonList count={3} />;
  const connected = status?.connected as boolean;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}>🗓️ مزامنة التقويم</Text>
      <View style={styles.card}>
        <Text style={styles.se}>{connected ? '✅' : '📅'}</Text>
        <Text style={styles.st}>{connected ? 'التقويم مربوط' : 'لم يتم ربط التقويم بعد'}</Text>
        <TouchableOpacity
          onPress={connected ? disconnect : connect}
          style={[styles.cb, connected && styles.cbd]}
        >
          <Text style={[styles.cbt, connected && styles.cbdt]}>
            {connected ? 'قطع الاتصال' : '🔗 ربط تقويم قوقل'}
          </Text>
        </TouchableOpacity>
      </View>
      {upcoming.length > 0 && (
        <View style={styles.card}>
          {upcoming.map((e: any) => (
            <View key={e.id} style={styles.ev}>
              <Text style={styles.ee}>{e.emoji as string}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.et}>{e.title as string}</Text>
                <Text style={styles.em}>👩‍🎨 {e.technician as string}</Text>
              </View>
              <Text style={styles.ed}>
                {new Date(e.date as string).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  se: { fontSize: 56 },
  st: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  cb: {
    backgroundColor: '#0891b2',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  cbt: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cbd: { backgroundColor: '#fef2f2' },
  cbdt: { color: '#ef4444' },
  ev: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    width: '100%',
  },
  ee: { fontSize: 24 },
  et: { fontSize: 13, fontWeight: '600', color: '#111827' },
  em: { fontSize: 11, color: '#6b7280' },
  ed: { fontSize: 11, color: '#9ca3af' },
});
