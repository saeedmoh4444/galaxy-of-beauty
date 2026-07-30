import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminGiftCardsScreen(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).giftCards.listAll.query({ page: 1, limit: 50 }) as any).then((d: any) => { setItems(d?.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎁 بطاقات الهدية</Text>
      <Text style={styles.sub}>إدارة بطاقات الهدايا</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد بطاقات</Text> :
        items.map((c: any) => (
          <View key={c.id} style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.code}>{c.code as string}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaItem}>القيمة: {(c.amount as number)?.toLocaleString()} ر.س</Text>
                <Text style={styles.metaItem}>الرصيد: {(c.balance as number)?.toLocaleString()} ر.س</Text>
              </View>
            </View>
            <View style={[styles.badge, c.status === 'ACTIVE' ? styles.activeBadge : styles.usedBadge]}>
              <Text style={[styles.badgeText, c.status === 'ACTIVE' ? {color:'#059669'} : {color:'#9ca3af'}]}>{c.status === 'ACTIVE' ? 'نشطة' : 'مستخدمة'}</Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  code: { fontSize: 14, fontWeight: '700', color: '#db2777', fontFamily: 'monospace' },
  meta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaItem: { fontSize: 12, color: '#6b7280' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadge: { backgroundColor: '#dcfce7' }, usedBadge: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
