import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function GroupBuyScreen() {
  const insets = useSafeAreaInsets();
  const [deals, setDeals] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.groupBuy.deals.query() as any).then((d: any) => { setDeals(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🛒 صفقات المجموعة</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {deals.map((d: Record<string, unknown>, i: number) => {
          const pct = ((d.currentBuyers as number) / (d.minBuyers as number)) * 100;
          return (
            <View key={i} style={styles.card}>
              <Text style={styles.emoji}>{d.emoji as string}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.service}>{d.service as string}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.oldPrice}>{d.originalPrice as number} ر.س</Text>
                  <Text style={styles.dealPrice}>{d.groupPrice as number} ر.س</Text>
                </View>
                <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${pct}%` }]} /></View>
                <Text style={styles.buyers}>{d.currentBuyers as number}/{d.minBuyers as number} مشتركة · ⏰ {d.endsIn as string}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#fde68a', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#d97706', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, alignItems: 'center' },
  emoji: { fontSize: 36 },
  service: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  priceRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 4 },
  oldPrice: { fontSize: 13, color: '#9ca3af', textDecorationLine: 'line-through' },
  dealPrice: { fontSize: 18, fontWeight: '800', color: '#059669' },
  progressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginTop: 8 },
  progressFill: { height: 6, backgroundColor: '#f59e0b', borderRadius: 3 },
  buyers: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
});
