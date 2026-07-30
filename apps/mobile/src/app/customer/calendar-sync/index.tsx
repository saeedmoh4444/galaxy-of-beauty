import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function CalendarSyncScreen(): JSX.Element {
  const [status, setStatus] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    Promise.all([
      ((trpc as any).calendarSync.status.query() as any),
      ((trpc as any).calendarSync.upcoming.query() as any),
    ]).then(([s, u]: any[]) => { setStatus(s); setUpcoming(u || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const connect = () => {
    ((trpc as any).calendarSync.connect.mutate({ authCode: 'google-auth-code' }) as any).then(() => fetch());
  };
  const disconnect = () => {
    ((trpc as any).calendarSync.disconnect.mutate({}) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  const connected = status?.connected as boolean;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🗓️ مزامنة التقويم</Text>
      <Text style={styles.sub}>اربطي تقويم قوقل لمزامنة مواعيدك</Text>
      <View style={styles.card}>
        <Text style={styles.statusEmoji}>{connected ? '✅' : '📅'}</Text>
        <Text style={styles.statusTitle}>{connected ? 'التقويم مربوط' : 'لم يتم ربط التقويم بعد'}</Text>
        {connected && <Text style={styles.lastSync}>آخر مزامنة: {status?.lastSynced ? new Date(status.lastSynced as string).toLocaleTimeString('ar-SA') : '—'}</Text>}
        <TouchableOpacity onPress={connected ? disconnect : connect} style={[styles.connectBtn, connected && styles.disconnectBtn]}>
          <Text style={[styles.connectBtnText, connected && styles.disconnectBtnText]}>{connected ? 'قطع الاتصال' : '🔗 ربط تقويم قوقل'}</Text>
        </TouchableOpacity>
      </View>
      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 مواعيد قادمة</Text>
          {upcoming.map((e: any) => (
            <View key={e.id} style={styles.event}>
              <Text style={styles.eventEmoji}>{e.emoji as string}</Text>
              <View style={{flex:1}}>
                <Text style={styles.eventTitle}>{e.title as string}</Text>
                <Text style={styles.eventTech}>👩‍🎨 {e.technician as string}</Text>
              </View>
              <Text style={styles.eventDate}>{new Date(e.date as string).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12 },
  statusEmoji: { fontSize: 56 }, statusTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  lastSync: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  connectBtn: { backgroundColor: '#0891b2', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12, width: '100%' },
  connectBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  disconnectBtn: { backgroundColor: '#fef2f2' }, disconnectBtnText: { color: '#ef4444' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  event: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 6 },
  eventEmoji: { fontSize: 24 }, eventTitle: { fontSize: 13, fontWeight: '600', color: '#111827' }, eventTech: { fontSize: 11, color: '#6b7280' },
  eventDate: { fontSize: 11, color: '#9ca3af' },
});
