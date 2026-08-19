import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface TechnicianDetail {
  id?: number;
  name?: string;
  specialtyAr?: string;
  specialty?: string;
  rating?: number;
  city?: string;
}

export default function TechnicianDetailScreen(): JSX.Element {
  const { t } = useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = trpc.technicians.getById.useQuery({ userId: parseInt(id, 10) });
  const data = (q.data as unknown as TechnicianDetail | null) ?? null;
  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.technician-detail.load-error')}
        onRetry={() => q.refetch()}
      />
    );
  if (!data)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>{t('mobile.public.technician-detail.not-found')}</Text>
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
      <Text style={styles.t}>‍ {data.name}</Text>
      <View style={styles.card}>
        <Text style={styles.spec}>{data.specialtyAr ?? data.specialty}</Text>
        <Text style={styles.rating}> {data.rating ?? 0}</Text>
        <Text style={styles.city}> {data.city}</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  spec: { fontSize: 16, fontWeight: '600', color: '#111827' },
  rating: { fontSize: 18, fontWeight: '700', color: '#f59e0b', marginTop: 8 },
  city: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
