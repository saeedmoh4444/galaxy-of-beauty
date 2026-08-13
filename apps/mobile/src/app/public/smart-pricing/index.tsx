import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function SmartPricingScreen(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().smartPricing.current.query() as any)
      .then((d: any) => {
        setItems(d || []);
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

  if (loading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> الأسعار الذكية</Text>
      <Text style={styles.sub}>أسعار متغيرة حسب الطلب — احجزي في الوقت المناسب ووفري!</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد خدمات</Text>
      ) : (
        items.map((s: any) => {
          const isDiscounted = (s.currentPrice as number) < (s.basePrice as number);
          return (
            <View key={s.service} style={styles.card}>
              <Text style={styles.svcEmoji}>{s.emoji as string}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.svcName}>{s.service as string}</Text>
                <Text style={styles.svcReason}>{s.reason as string}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {isDiscounted && (
                  <Text style={styles.basePrice}>
                    {(s.basePrice as number)?.toLocaleString()} ر.س
                  </Text>
                )}
                <Text
                  style={[
                    styles.currentPrice,
                    isDiscounted ? { color: '#059669' } : { color: '#d97706' },
                  ]}
                >
                  {(s.currentPrice as number)?.toLocaleString()} ر.س
                </Text>
                {(s.discount as number) > 0 && (
                  <Text style={styles.discountBadge}>-{s.discount as number}%</Text>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  svcEmoji: { fontSize: 34 },
  svcName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  svcReason: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  basePrice: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  currentPrice: { fontSize: 20, fontWeight: '800' },
  discountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
});
