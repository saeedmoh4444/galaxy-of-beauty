import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

interface ServiceDetail {
  emoji?: string;
  titleJson?: { ar?: string; en?: string };
  descriptionJson?: { ar?: string; en?: string };
  basePrice?: number;
  durationMin?: number;
}

export default function ServiceDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = trpc.services.getById.useQuery({ id: parseInt(id, 10) });
  const data = (q.data as unknown as ServiceDetail | null) ?? null;
  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل الخدمة" onRetry={() => q.refetch()} />;
  if (!data)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>الخدمة غير موجودة</Text>
      </View>
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>
        {data.emoji ?? '‍️'} {data.titleJson?.ar}
      </Text>
      <View style={styles.card}>
        <Text style={styles.price}>{data.basePrice?.toLocaleString()} ر.س</Text>
        <Text style={styles.dur}>️ {data.durationMin} دقيقة</Text>
      </View>
      {data.descriptionJson && <Text style={styles.desc}>{data.descriptionJson?.ar}</Text>}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 16 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  price: { fontSize: 24, fontWeight: '800', color: '#db2777' },
  dur: { fontSize: 14, color: '#6b7280' },
  desc: { fontSize: 14, color: '#374151', lineHeight: 24, textAlign: 'right' },
});
