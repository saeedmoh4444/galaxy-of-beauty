import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const STATUS_COLORS: Record<string, string> = { healthy: '#059669', warning: '#d97706', error: '#dc2626' };

export default function MonitoringScreen(): JSX.Element {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).monitoring.health.query() as any).then((d: any) => { setHealth(d || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  const h = health ?? {};
  const services = (h.services ?? {}) as Record<string, any>;
  const perf = h.performance as Record<string, any> ?? {};
  const activity = h.activity as Record<string, any> ?? {};

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📊 Monitoring</Text>
      <Text style={styles.sub}>صحة المنصة في الوقت الحقيقي</Text>

      <Text style={styles.sectionTitle}>🟢 الخدمات</Text>
      <View style={styles.grid}>
        {Object.entries(services).map(([key, svc]) => (
          <View key={key} style={[styles.svcCard, {borderColor: STATUS_COLORS[svc.status as string] ?? '#6b7280'}]}>
            <Text style={styles.svcEmoji}>{svc.status === 'healthy' ? '✅' : '⚠️'}</Text>
            <Text style={styles.svcKey}>{key}</Text>
            <Text style={styles.svcPing}>{svc.ping as number}ms</Text>
          </View>
        ))}
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>⚡</Text><Text style={styles.kpiVal}>{perf.avgResponseMs as number ?? 0}ms</Text><Text style={styles.kpiLabel}>الاستجابة</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>👥</Text><Text style={[styles.kpiVal, {color:'#2563eb'}]}>{activity.activeSessions as number ?? 0}</Text><Text style={styles.kpiLabel}>جلسات نشطة</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📅</Text><Text style={[styles.kpiVal, {color:'#059669'}]}>{activity.todayBookings as number ?? 0}</Text><Text style={styles.kpiLabel}>حجز اليوم</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  svcCard: { width: '30%', backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 2 },
  svcEmoji: { fontSize: 24 }, svcKey: { fontSize: 11, fontWeight: '600', color: '#111827', marginTop: 4 }, svcPing: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
});
