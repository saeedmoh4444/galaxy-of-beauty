import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface BarberetteItem {
  id?: number;
  city?: string | null;
  ratingAvg?: unknown;
  user?: { id?: number; name?: string; avatarUrl?: string | null };
}

export default function BarberettesScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const listQ = trpc.technicians.barberettes.useQuery(undefined);

  const items: BarberetteItem[] = Array.isArray(listQ.data)
    ? (listQ.data as unknown as BarberetteItem[])
    : [];

  if (listQ.isLoading) return <SkeletonList count={6} />;
  if (listQ.isError)
    return (
      <ErrorAlert message={t('mobile.barberettes.load-error')} onRetry={() => listQ.refetch()} />
    );

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={listQ.isRefetching} onRefresh={() => listQ.refetch()} />
      }
    >
      <Text style={s.title}>{t('mobile.barberettes.title')}</Text>
      <Text style={s.sub}>{t('mobile.barberettes.subtitle')}</Text>
      {items.map((item) => {
        const user = item.user ?? {};
        return (
          <TouchableOpacity
            key={item.id}
            style={s.card}
            onPress={() => router.push(`/technicians/${user.id ?? ''}`)}
          >
            <View style={s.icon}>
              <Text style={s.iconText}>✂️</Text>
            </View>
            <View style={s.body}>
              <Text style={s.name}>{user.name ?? ''}</Text>
              <Text style={s.meta}>
                {item.city ?? ''} · ⭐ {Number(item.ratingAvg ?? 0).toFixed(1)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
      {items.length === 0 && <Text style={s.empty}>{t('mobile.barberettes.empty')}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 16 },
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
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
});
