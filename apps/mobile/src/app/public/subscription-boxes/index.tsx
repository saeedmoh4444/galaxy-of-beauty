import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function SubscriptionBoxesScreen(): JSX.Element {
  const { data: boxes, loading, error, refreshing, refetch, refresh } = useQuery(() => (trpc as any).subscriptionBoxes.list.query());

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل الصناديق" onRetry={refetch} />;

  const items = (boxes ?? []) as any[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
      <Text style={styles.t}>📦 الصناديق الشهرية</Text>
      <Text style={styles.sub}>صندوق جمال شهري لباب بيتكِ</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد صناديق</Text> :
        items.map((b: any) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.boxEmoji}>{b.emoji as string ?? '📦'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.boxName}>{b.nameAr as string}</Text>
              <Text style={styles.boxDesc}>{(b.descAr as string)?.substring(0, 80)}</Text>
              <Text style={styles.boxItems}>📦 {b.itemCount as number} منتجات</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.boxPrice}>{(b.price as number)?.toLocaleString()} ر.س</Text>
              <Text style={styles.boxPeriod}>/شهرياً</Text>
              <TouchableOpacity style={styles.subBtn}><Text style={styles.subBtnText}>اشتراك</Text></TouchableOpacity>
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
  boxEmoji: { fontSize: 36 }, boxName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  boxDesc: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  boxItems: { fontSize: 12, color: '#7c3aed', marginTop: 4 },
  boxPrice: { fontSize: 18, fontWeight: '800', color: '#7c3aed' }, boxPeriod: { fontSize: 11, color: '#9ca3af' },
  subBtn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 6 },
  subBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
