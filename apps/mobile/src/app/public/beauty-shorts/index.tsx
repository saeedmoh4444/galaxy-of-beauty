import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ShortItem {
  id?: number;
  type?: string;
  titleJson?: { ar?: string; en?: string };
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  beforeImageUrl?: string | null;
  durationSec?: number;
  views?: number;
  category?: string;
  faceBlurred?: boolean;
}

export default function BeautyShortsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const shortsQ = trpc.beautyShorts.feed.useQuery();
  const likeMut = trpc.beautyShorts.like.useMutation({ onSuccess: () => shortsQ.refetch() });
  const viewedMut = trpc.beautyShorts.viewed.useMutation({ onSuccess: () => shortsQ.refetch() });

  if (shortsQ.isLoading) return <SkeletonList count={4} />;
  if (shortsQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.beauty-shorts.load-error')}
        onRetry={() => shortsQ.refetch()}
      />
    );

  const items = (shortsQ.data ?? []) as ShortItem[];

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
      <Text style={styles.privacy}>{t('mobile.beautyShorts.privacy')}</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.beauty-shorts.empty')}</Text>
      ) : (
        items.map((s, i) => (
          <View key={s.id ?? i} style={styles.card}>
            {s.videoUrl || s.thumbnailUrl || s.beforeImageUrl ? (
              <Image
                source={{ uri: (s.thumbnailUrl ?? s.beforeImageUrl ?? s.videoUrl) as string }}
                style={styles.thumb}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.thumb}>
                <Text style={styles.thumbEmoji}>
                  {s.type === 'before_after' ? '✨' : s.category === 'makeup' ? '💄' : '💇‍♀️'}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.shortTitle}>
                {locale === 'en' ? s.titleJson?.en : s.titleJson?.ar}
              </Text>
              <Text style={styles.shortMeta}>
                👁️ {s.views ?? 0} · {s.category ?? ''}
                {s.faceBlurred ? ' · 🙈' : ''}
              </Text>
            </View>
            <TouchableOpacity
              disabled={!isAuthed || likeMut.isPending}
              onPress={() => {
                viewedMut.mutate({ shortId: s.id as number });
                likeMut.mutate({ shortId: s.id as number });
              }}
              style={styles.likeBtn}
            >
              <Text style={styles.playBtn}>❤️</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 6 },
  privacy: { fontSize: 11, color: '#be185d', textAlign: 'center', marginBottom: 16 },
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
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 28 },
  shortTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  shortMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  likeBtn: { padding: 4 },
  playBtn: { fontSize: 20 },
});
