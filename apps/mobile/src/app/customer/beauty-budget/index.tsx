import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyBudgetScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.beautyBudget.get.query());
  if (loading) return <SkeletonList count={3} />;
  if (error) return <ErrorAlert message="فشل تحميل الميزانية" onRetry={refetch} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#059669']} />}>
      <Text style={styles.t}>💰 ميزانية الجمال</Text>
      {data ? (<View style={styles.card}><Text style={styles.budget}>{(data.budget as number)?.toLocaleString()} ر.س</Text><Text style={styles.spent}>تم الإنفاق: {(data.spent as number)?.toLocaleString()} ر.س</Text><View style={styles.bar}><View style={[styles.fill,{width:`${Math.min(100,((data.spent as number)/(data.budget as number||1))*100)}%`}]} /></View></View>) : <Text style={styles.e}>لا توجد بيانات</Text>}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  budget: { fontSize: 32, fontWeight: '800', color: '#059669' }, spent: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  bar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, width: '100%', marginTop: 12 },
  fill: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
});
