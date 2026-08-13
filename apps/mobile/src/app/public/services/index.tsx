import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useState } from 'react';
import { typedTrpc } from '@/lib/trpc-react';

export default function ServicesScreen(): JSX.Element {
  const {
    data: categories,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => typedTrpc().services.categories.query());
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const { data: services } = useQuery(() =>
    activeCat
      ? typedTrpc().services.byCategory.query({ category: activeCat })
      : Promise.resolve(null),
  );

  if (loading) return <SkeletonList count={6} />;
  if (error) return <ErrorAlert message="فشل تحميل الخدمات" onRetry={refetch} />;

  const catItems = (categories ?? []) as any[];
  const svcItems = (services ?? []) as any[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={styles.t}>‍️ الخدمات</Text>
      <Text style={styles.sub}>اكتشفي جميع خدمات التجميل والعناية</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {catItems.map((cat) => {
            const isActive = activeCat === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setActiveCat(cat.key as string)}
                style={[styles.catChip, isActive && styles.catChipActive]}
              >
                <Text style={styles.catEmoji}>{(cat.emoji as string) ?? ''}</Text>
                <Text style={[styles.catName, isActive && styles.catNameActive]}>
                  {cat.nameAr as string}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      {activeCat && (
        <>
          <Text style={styles.sectionTitle}>{svcItems.length} خدمات</Text>
          {svcItems.length === 0 ? (
            <Text style={styles.e}>لا توجد خدمات في هذه الفئة</Text>
          ) : (
            svcItems.map((s) => (
              <View key={s.id} style={styles.card}>
                <Text style={styles.svcEmoji}>{(s.emoji as string) ?? '‍️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.svcName}>{s.nameAr as string}</Text>
                  <Text style={styles.svcDesc}>{(s.descAr as string)?.substring(0, 80)}</Text>
                  <View style={styles.svcMeta}>
                    <Text style={styles.svcPrice}>{(s.price as number)?.toLocaleString()} ر.س</Text>
                    <Text style={styles.svcDuration}>️ {s.duration as string}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  catChip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  catChipActive: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  catEmoji: { fontSize: 28 },
  catName: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 6 },
  catNameActive: { color: '#db2777' },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  svcEmoji: { fontSize: 30 },
  svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  svcDesc: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  svcMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  svcPrice: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  svcDuration: { fontSize: 12, color: '#9ca3af' },
});
