import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { BULK_PAGE_SIZE } from '@galaxy/ui';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

interface GiftCardItem {
  code?: string;
  amount?: number;
  status?: string;
}

interface GiftCardListResponse {
  items?: GiftCardItem[];
}

export default function AdminGiftCardsScreen(): JSX.Element {
  const [data, setData] = useState<GiftCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    rawTrpc.giftCards.listAll
      .query({ page: 1, limit: BULK_PAGE_SIZE })
      .then((d: GiftCardListResponse) => {
        setData(d?.items || []);
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

  if (loading) return <SkeletonList count={5} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> بطاقات الهدية</Text>
      {data.map((c, i) => (
        <View key={i} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.code}>{c.code}</Text>
            <Text style={styles.meta}>{c.amount?.toLocaleString()} ر.س</Text>
          </View>
          <View style={[styles.badge, c.status === 'ACTIVE' ? styles.active : styles.used]}>
            <Text style={styles.badgeText}>{c.status === 'ACTIVE' ? 'نشطة' : 'مستخدمة'}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  code: { fontSize: 13, fontWeight: '700', color: '#db2777', fontFamily: 'monospace' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  active: { backgroundColor: '#dcfce7' },
  used: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
