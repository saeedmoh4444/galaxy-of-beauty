import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function ServiceWishlistScreen(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).serviceWishlist.myWishlist.query() as any).then((d: any) => { setItems(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = (id: number) => {
    ((trpc as any).serviceWishlist.remove.mutate({ id }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📝 قائمة الخدمات</Text>
      <Text style={styles.sub}>تابعي أسعار الخدمات اللي تبينها</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد خدمات</Text> :
        items.map((i: any) => (
          <View key={i.id} style={styles.card}>
            <Text style={styles.itemEmoji}>{i.emoji as string}</Text>
            <View style={{flex:1}}>
              <Text style={styles.itemName}>{i.serviceName as string}</Text>
              <Text style={styles.lowestPrice}>أقل سعر: {(i.lowestPrice as number)?.toLocaleString()} ر.س</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.currentPrice}>{(i.currentPrice as number)?.toLocaleString()} ر.س</Text>
              {(i.droppedBy as number) > 0 && <Text style={styles.dropBadge}>▼ {(i.droppedBy as number)?.toLocaleString()} ر.س</Text>}
              <TouchableOpacity onPress={() => remove(i.id as number)}><Text style={styles.deleteBtn}>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  itemEmoji: { fontSize: 28 }, itemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  lowestPrice: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  currentPrice: { fontSize: 16, fontWeight: '700', color: '#7c3aed' },
  dropBadge: { fontSize: 11, fontWeight: '700', color: '#059669', backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  deleteBtn: { fontSize: 16, marginTop: 4 },
});
