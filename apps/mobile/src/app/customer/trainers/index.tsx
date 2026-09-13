import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface TrainerItem {
  id?: number;
  city?: string;
  ratingAvg?: number;
  user?: { id?: number; name?: string };
}

export default function TrainersScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const trainersQ = trpc.technicians.trainers.useQuery();

  const trainers = (trainersQ.data as unknown as TrainerItem[] | undefined) ?? [];

  if (trainersQ.isLoading) return <SkeletonList count={6} />;
  if (trainersQ.isError)
    return (
      <ErrorAlert message={t('mobile.trainers.load-error')} onRetry={() => trainersQ.refetch()} />
    );

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={trainersQ.isRefetching} onRefresh={() => trainersQ.refetch()} />
      }
    >
      <Text style={s.title}>{t('mobile.trainers.title')}</Text>
      {trainers.map((tr) => (
        <TouchableOpacity
          key={tr.id}
          style={s.card}
          onPress={() => router.push(`/technicians/${tr.user?.id ?? tr.id}`)}
        >
          <View style={s.icon}>
            <Text style={s.iconText}>💪</Text>
          </View>
          <View style={s.body}>
            <Text style={s.name}>{tr.user?.name ?? ''}</Text>
            <Text style={s.meta}>
              {tr.city ?? ''} · ⭐ {Number(tr.ratingAvg ?? 0).toFixed(1)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      {trainers.length === 0 && <Text style={s.empty}>{t('mobile.trainers.empty')}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
});
