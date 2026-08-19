import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface AdminService {
  id?: number;
  emoji?: string;
  titleJson?: { ar?: string };
  basePrice?: number;
}

export default function AdminServicesScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.services.list.useQuery({});
  const data = (q.data as unknown as { items?: AdminService[] } | null)?.items ?? [];

  if (q.isLoading) return <SkeletonList count={6} />;
  if (q.isError)
    return <ErrorAlert message={t('admin.services.load-error')} onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.admin.services.title')}</Text>
      {data.map((s, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{s.emoji ?? '‍️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{localize(s.titleJson, locale)}</Text>
            <Text style={styles.price}>
              {(s.basePrice ?? 0).toLocaleString()} {t('misc.sar')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
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
  price: { fontSize: 13, fontWeight: '700', color: '#059669', marginTop: 2 },
});
