import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function WishlistScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.wishlist.list.query());

  const handleRemove = async (id: number) => {
    await (trpc.wishlist.remove as any).mutate({ wishlistItemId: id });
    refetch();
  };

  if (loading) return <View style={styles.container}><Text style={styles.title}>المفضلة</Text><SkeletonList count={4} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل المفضلة" onRetry={refetch} />;

  const items = ((data as any)?.items ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
      <Text style={styles.title}>المفضلة</Text>
      {items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>💝</Text>
          <Text style={styles.empty}>المفضلة فارغة</Text>
          <Text style={styles.hint}>لم تقم بإضافة أي عنصر إلى المفضلة بعد</Text>
        </View>
      ) : (
        items.map((item: Record<string, unknown>) => {
          const service = item.service as Record<string, unknown> | null;
          const technician = item.technician as Record<string, unknown> | null;
          const title = service ? (service.titleJson as Record<string, string>)?.ar ?? '' : (technician?.user as Record<string, unknown>)?.name as string ?? '';
          const subtitle = service ? `ر.س ${service.basePrice as number}` : (technician?.city as string) ?? '';
          return (
            <View key={item.id as number} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{title}</Text>
                <Text style={styles.itemSub}>{subtitle}</Text>
              </View>
              <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id as number)}>
                <Text style={styles.removeText}>إزالة</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  itemSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  removeBtn: { borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  removeText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
});
