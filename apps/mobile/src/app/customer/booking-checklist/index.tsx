import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useState } from 'react';

export default function BookingChecklistScreen(): JSX.Element {
  const { data: cats, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.bookingChecklist.categories.query() as any);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { data: itemsData, loading: itemsLoading } = useQuery(() => selectedCat ? (trpc.bookingChecklist.get.query({ category: selectedCat }) as any) : Promise.resolve(null));
  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل قائمة التحضير" onRetry={refetch} />;
  const categories = (cats ?? []) as any[];
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#2563eb']} />}>
      <Text style={styles.t}>📋 قائمة التحضير</Text>
      <View style={styles.cr}>{categories.map((c: any) => (<TouchableOpacity key={c.key} onPress={() => setSelectedCat(c.key)} style={[styles.cc, selectedCat === c.key && styles.cca]}><Text style={[styles.ct, selectedCat === c.key && styles.cta]}>{c.emoji as string} {c.nameAr as string}</Text></TouchableOpacity>))}</View>
      {itemsLoading && <SkeletonList count={2} />}
      {(itemsData as any) && (<View style={styles.ic}><Text style={styles.it}>✅ المطلوب قبل الموعد</Text>
        {((itemsData as any).items ?? []).map((item: any, i: number) => (<View key={i} style={styles.item}><Text style={styles.chk}>☐</Text><Text style={styles.itx}>{item.textAr as string ?? item.text as string}</Text></View>))}</View>)}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 20 },
  cr: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  cc: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  cca: { backgroundColor: '#2563eb', borderColor: '#2563eb' }, ct: { fontSize: 12, fontWeight: '600', color: '#6b7280' }, cta: { color: '#fff' },
  ic: { backgroundColor: '#fff', borderRadius: 16, padding: 16 }, it: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  chk: { fontSize: 18, color: '#2563eb' }, itx: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
});
