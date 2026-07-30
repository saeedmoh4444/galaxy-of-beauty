import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useState } from 'react';

export default function BookingChecklistScreen(): JSX.Element {
  const { data: cats, loading, error, refetch } = useQuery(() => trpc.bookingChecklist.categories.query() as any);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { data: itemsData, loading: itemsLoading } = useQuery(
    () => selectedCat ? (trpc.bookingChecklist.get.query({ category: selectedCat }) as any) : Promise.resolve(null),
  );

  if (loading) return <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} size="large" />;
  if (error) return <ErrorAlert message="فشل تحميل قائمة التحضير" onRetry={refetch} />;

  const categories = (cats ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📋 قائمة التحضير</Text>
      <Text style={styles.sub}>استعدادات ما قبل الموعد</Text>

      <View style={styles.catRow}>
        {(categories as any[]).map((c: any) => (
          <TouchableOpacity key={c.key as string} onPress={() => setSelectedCat(c.key as string)} style={[styles.catChip, selectedCat === c.key && styles.catChipActive]}>
            <Text style={[styles.catText, selectedCat === c.key && styles.catTextActive]}>{c.emoji as string} {c.nameAr as string}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {itemsLoading && <ActivityIndicator color="#2563eb" style={{ marginTop: 20 }} />}
      {(itemsData as any) && (
        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>✅ المطلوب قبل الموعد</Text>
          {((itemsData as any).items ?? []).map((item: any, i: number) => (
            <View key={i} style={styles.item}>
              <Text style={styles.check}>☐</Text>
              <Text style={styles.itemText}>{item.textAr as string ?? item.text as string}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  catChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  catText: { fontSize: 12, fontWeight: '600', color: '#6b7280' }, catTextActive: { color: '#fff' },
  itemsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  itemsTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  check: { fontSize: 18, color: '#2563eb' },
  itemText: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
});
