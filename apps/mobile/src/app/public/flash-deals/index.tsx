import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function FlashDealsScreen() {
  const [deals, setDeals] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.flashDeals.active.query() as any as Promise<Record<string, unknown>[]>)
      .then((data) => { setDeals(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ef4444" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>⚡ عروض فلاش</Text>
      <Text style={styles.subtitle}>عروض لفترة محدودة — الحقّيها!</Text>
      {deals.length === 0 ? (
        <Text style={styles.empty}>لا توجد عروض حالياً</Text>
      ) : (
        deals.map((d: Record<string, unknown>, i: number) => {
          const pct = ((d.currentRedemptions as number) / (d.maxRedemptions as number)) * 100;
          const soldOut = (d.currentRedemptions as number) >= (d.maxRedemptions as number);
          return (
            <View key={i} style={[styles.card, soldOut && styles.soldOut]}>
              <View style={styles.badge}><Text style={styles.badgeText}>{soldOut ? 'نفذ' : '⚡ فلاش'}</Text></View>
              <Text style={styles.dealTitle}>{d.titleAr as string || (d.serviceNameAr as string)}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.dealPrice}>{d.dealPrice as number} ر.س</Text>
                <Text style={styles.originalPrice}>{d.originalPrice as number} ر.س</Text>
                <Text style={styles.discount}>-{d.discountPercent as number}%</Text>
              </View>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${pct}%` }]} /></View>
              <Text style={styles.redemptions}>{d.currentRedemptions as number}/{d.maxRedemptions as number} تم الاستفادة</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef2f2' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  empty: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, position: 'relative', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  soldOut: { opacity: 0.6 },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#dc2626', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  dealTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 8, textAlign: 'right' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginBottom: 8 },
  dealPrice: { fontSize: 22, fontWeight: '800', color: '#dc2626' },
  originalPrice: { fontSize: 14, color: '#9ca3af', textDecorationLine: 'line-through' },
  discount: { fontSize: 12, fontWeight: '700', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  progressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: '#dc2626', borderRadius: 3 },
  redemptions: { fontSize: 11, color: '#9ca3af', textAlign: 'right' },
});
