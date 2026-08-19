import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyPodcastScreen(): JSX.Element {
  const { t } = useLocale();
  const epsQ = trpc.beautyPodcast.episodes.useQuery();

  if (epsQ.isLoading) return <SkeletonList count={4} />;
  if (epsQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.beauty-podcast.load-error')}
        onRetry={() => epsQ.refetch()}
      />
    );

  const items = (epsQ.data ?? []) as Record<string, unknown>[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={epsQ.isRefetching}
          onRefresh={() => epsQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.beauty-podcast.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.beauty-podcast.subtitle')}</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.beauty-podcast.empty')}</Text>
      ) : (
        items.map((e: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.epEmoji}>{(e.emoji as string) ?? '️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.epTitle}>{e.titleAr as string}</Text>
              <Text style={styles.epHost}> {e.host as string}</Text>
              <Text style={styles.epDuration}>️ {e.duration as string}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  epEmoji: { fontSize: 32 },
  epTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  epHost: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  epDuration: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
