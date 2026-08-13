import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useState } from 'react';
import { typedTrpc } from '@/lib/trpc-react';

interface KidsServiceItem {
  nameAr?: string;
  ageGroup?: string;
  price?: number;
}

export default function KidsServicesScreen(): JSX.Element {
  const {
    data: cats,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => typedTrpc().kidsServices.categories.query());
  const [selectedCat, setSelectedCat] = useState<Record<string, unknown> | null>(null);

  if (loading) return <SkeletonList count={5} />;
  if (error) return <ErrorAlert message="فشل تحميل الخدمات" onRetry={refetch} />;

  const categories = (cats ?? []) as Record<string, unknown>[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#f59e0b']} />
      }
    >
      <Text style={styles.t}> خدمات الأطفال</Text>
      <Text style={styles.sub}>خدمات تجميل للأطفال والصغار</Text>
      <View style={styles.catGrid}>
        {categories.map((cat: Record<string, unknown>) => (
          <TouchableOpacity
            key={cat.key as string}
            onPress={() => setSelectedCat(cat)}
            style={[styles.catCard, selectedCat?.key === cat.key && styles.catActive]}
          >
            <Text style={styles.catEmoji}>{cat.emoji as string}</Text>
            <Text style={styles.catLabel}>{cat.nameAr as string}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedCat && (
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>
            {selectedCat.emoji as string} {selectedCat.nameAr as string}
          </Text>
          {((selectedCat.services as KidsServiceItem[]) ?? []).map((s, i) => (
            <View key={i} style={styles.svcCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.svcName}>{s.nameAr as string}</Text>
                <Text style={styles.svcAge}>{s.ageGroup as string}</Text>
              </View>
              <Text style={styles.svcPrice}>{(s.price as number)?.toLocaleString()} ر.س</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  catActive: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  catEmoji: { fontSize: 30 },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    marginTop: 6,
    textAlign: 'center',
  },
  servicesSection: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  svcCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  svcName: { fontSize: 13, color: '#374151' },
  svcAge: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  svcPrice: { fontSize: 13, fontWeight: '600', color: '#d97706' },
});
