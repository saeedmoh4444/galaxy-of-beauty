import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const COLORS: any = { makeup: '#dc2626', skincare: '#059669', hair: '#7c3aed', nails: '#f59e0b', massage: '#3b82f6' };

export default function ServiceTrendsScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.serviceTrends.trends.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const trends = (data?.monthly ?? []) as Record<string, unknown>[];
  const top = (data?.top ?? []) as Record<string, unknown>[];

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>📊 توجهات الخدمات</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.section}>🔥 الأكثر طلباً</Text>
        {top.map((t: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.topItem}>
            <Text style={styles.topRank}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</Text>
            <Text style={styles.topEmoji}>{t.emoji as string}</Text>
            <Text style={styles.topName}>{t.nameAr as string}</Text>
            <Text style={styles.topGrowth}>{t.growth as string}</Text>
          </View>
        ))}
        <Text style={styles.section}>📈 الإقبال الشهري</Text>
        <View style={styles.chart}>
          {trends.map((m: Record<string, unknown>, i: number) => (
            <View key={i} style={styles.bar}>
              {['makeup','skincare','hair','nails','massage'].map((cat) => (
                <View key={cat} style={[styles.barSegment, { height: ((m[cat] as number) || 0) * 0.3, backgroundColor: COLORS[cat] }]} />
              ))}
              <Text style={styles.barLabel}>{m.month as string}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ede9fe', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#7c3aed', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  section: { fontSize: 17, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 10, marginTop: 8 },
  topItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, gap: 8 },
  topRank: { fontSize: 18, width: 32, textAlign: 'center' },
  topEmoji: { fontSize: 24 },
  topName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right' },
  topGrowth: { fontSize: 12, fontWeight: '700', color: '#059669' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 4, marginTop: 8 },
  bar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barSegment: { width: 8, marginBottom: 1, borderRadius: 2 },
  barLabel: { fontSize: 8, color: '#9ca3af', marginTop: 4 },
});
