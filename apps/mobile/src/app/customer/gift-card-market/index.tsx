import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function GiftCardMarketScreen(): JSX.Element {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).giftCardMarket.listings.query() as any).then((d: any) => { setListings(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const buy = (listingId: number) => {
    ((trpc as any).giftCardMarket.buy.mutate({ listingId }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💳 سوق البطاقات</Text>
      <Text style={styles.sub}>اشتري وببيعي بطاقات الهدايا</Text>
      {listings.length === 0 ? <Text style={styles.e}>لا توجد بطاقات حالياً</Text> :
        <View style={styles.grid}>
          {listings.map((l: any) => (
            <View key={l.id} style={styles.card}>
              <Text style={styles.cardEmoji}>🎁</Text>
              <Text style={styles.cardValue}>بطاقة {(l.value as number)?.toLocaleString()} ر.س</Text>
              <Text style={styles.originalPrice}>{(l.value as number)?.toLocaleString()} ر.س</Text>
              <Text style={styles.sellingPrice}>{(l.sellingPrice as number)?.toLocaleString()} ر.س</Text>
              <Text style={styles.discountBadge}>وفر {l.discount as number}%</Text>
              <Text style={styles.seller}>{l.sellerName as string}</Text>
              <TouchableOpacity onPress={() => buy(l.id as number)} style={styles.buyBtn}><Text style={styles.buyBtnText}>💳 شراء</Text></TouchableOpacity>
            </View>
          ))}
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center' },
  cardEmoji: { fontSize: 36 }, cardValue: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 6 },
  originalPrice: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 2 },
  sellingPrice: { fontSize: 20, fontWeight: '800', color: '#7c3aed', marginTop: 2 },
  discountBadge: { fontSize: 11, fontWeight: '700', color: '#059669', backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  seller: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  buyBtn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 20, marginTop: 8 },
  buyBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
