import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

interface BeautyPackage {
  id?: number;
  nameJson?: { ar?: string };
  discountPercent?: number;
  services?: unknown[];
  isActive?: boolean;
}

export default function AdminPackagesScreen(): JSX.Element {
  const q = trpc.beautyPackages.listAll.useQuery();
  const data = (q.data as unknown as BeautyPackage[] | null) ?? [];

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل الباقات" onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> الباقات</Text>
      {data.map((p, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.nameJson?.ar ?? ''}</Text>
            <Text style={styles.discount}>
              -{p.discountPercent ?? 0}% · {p.services?.length || 0} خدمات
            </Text>
          </View>
          <View style={[styles.badge, p.isActive ? styles.active : styles.inactive]}>
            <Text style={styles.badgeText}>{p.isActive ? 'نشط' : 'غير نشط'}</Text>
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
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  discount: { fontSize: 12, color: '#dc2626', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  active: { backgroundColor: '#dcfce7' },
  inactive: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
