import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ShortVideo {
  id?: number;
  emoji?: string;
  titleAr?: string;
  title?: string;
  creator?: string;
  duration?: string;
  views?: number;
}

export default function BeautyShortsScreen(): JSX.Element {
  const { t } = useLocale();
  const shortsQ = trpc.beautyShorts.feed.useQuery();

  if (shortsQ.isLoading) return <SkeletonList count={4} />;
  if (shortsQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.beauty-shorts.load-error')}
        onRetry={() => shortsQ.refetch()}
      />
    );

  const items = (shortsQ.data ?? []) as ShortVideo[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={shortsQ.isRefetching}
          onRefresh={() => shortsQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.beauty-shorts.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.beauty-shorts.subtitle')}</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.beauty-shorts.empty')}</Text>
      ) : (
        items.map((s, i) => (
          <TouchableOpacity key={s.id ?? i} style={styles.card}>
            <Text style={styles.shortEmoji}>{(s.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.shortTitle}>{(s.titleAr as string) ?? (s.title as string)}</Text>
              <Text style={styles.shortMeta}>
                {s.creator as string} · {s.duration as string} · {s.views as number}
              </Text>
            </View>
            <Text style={styles.playBtn}>▶️</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
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
  shortEmoji: { fontSize: 32 },
  shortTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  shortMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  playBtn: { fontSize: 24 },
});
