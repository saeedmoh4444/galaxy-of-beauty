import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface CalendarSyncStatus {
  connected?: boolean;
}

interface CalendarEvent {
  id?: number;
  emoji?: string;
  title?: string;
  technician?: string;
  date: string;
}

export default function CalendarSyncScreen(): JSX.Element {
  const [status, setStatus] = useState<CalendarSyncStatus | null>(null);
  const [upcoming, setUpcoming] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      typedTrpc().calendarSync.status.query() as Promise<CalendarSyncStatus>,
      typedTrpc().calendarSync.upcoming.query() as Promise<CalendarEvent[]>,
    ])
      .then(([s, u]) => {
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
    // Google OAuth flow not wired on mobile yet — surface a clear message
    // instead of silently failing with a fake auth code.
    setError('مزامنة تقويم Google غير متوفرة في التطبيق حالياً');
  };
  const disconnect = () => {
    (typedTrpc().calendarSync.disconnect.mutate({})).then(() => fetch());
  };
  if (loading) return <SkeletonList count={3} />;
  const connected = status?.connected ?? false;
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
      <Text style={styles.t}> مزامنة التقويم</Text>
      {error ? <Text style={styles.errText}>{error}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.se}>{connected ? '' : ''}</Text>
        <Text style={styles.st}>{connected ? 'التقويم مربوط' : 'لم يتم ربط التقويم بعد'}</Text>
        <TouchableOpacity
          onPress={connected ? disconnect : connect}
          style={[styles.cb, connected && styles.cbd]}
        >
          <Text style={[styles.cbt, connected && styles.cbdt]}>
            {connected ? 'قطع الاتصال' : ' ربط تقويم قوقل'}
          </Text>
        </TouchableOpacity>
      </View>
      {upcoming.length > 0 && (
        <View style={styles.card}>
          {upcoming.map((e) => (
            <View key={e.id} style={styles.ev}>
              <Text style={styles.ee}>{e.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.et}>{e.title}</Text>
                <Text style={styles.em}>‍ {e.technician}</Text>
              </View>
              <Text style={styles.ed}>
                {new Date(e.date).toLocaleDateString('ar-SA', {
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
  errText: { color: '#dc2626', textAlign: 'center', fontSize: 13, marginBottom: 10 },
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
