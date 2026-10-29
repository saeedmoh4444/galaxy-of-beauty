import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';

// P3 — mobile swipe feed (REELS_SHOPPABLE_PLAN Phase 2). Full-screen
// paged FlatList over beautyShorts.feed; FlatList windowing keeps only
// nearby slides mounted (never N players for N reels), the active slide
// autoplays muted via one shared expo-video player, and watch events
// report on slide change.

type ShortRow = {
  id: number;
  type: string;
  titleJson: { ar?: string; en?: string };
  videoUrl: string | null;
  thumbnailUrl: string | null;
  beforeImageUrl: string | null;
  durationSec: number;
  views: number;
  category: string;
  faceBlurred: boolean;
};

export default function ShortsFeedScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const authed = useAuthState();

  const q = trpc.beautyShorts.feed.useQuery(undefined, { refetchOnWindowFocus: false });
  const shorts = (q.data ?? []) as unknown as ShortRow[];

  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const viewedMut = trpc.beautyShorts.viewed.useMutation();
  const watchedMut = trpc.beautyShorts.watched.useMutation();
  const likeMut = trpc.beautyShorts.like.useMutation({ onSuccess: () => q.refetch() });

  const activeShort = shorts[active] ?? null;
  const player = useVideoPlayer(activeShort?.videoUrl ?? '', (p) => {
    p.loop = true;
    p.muted = muted;
  });

  useEffect(() => {
    if (activeShort?.videoUrl) player.play();
    else player.pause();
  }, [activeShort?.videoUrl, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  // P2 parity — report watch seconds of the outgoing slide.
  const shortsRef = useRef<ShortRow[]>([]);
  shortsRef.current = shorts;
  const watchedMutRef = useRef(watchedMut.mutate);
  watchedMutRef.current = watchedMut.mutate;
  const viewedMutRef = useRef(viewedMut.mutate);
  viewedMutRef.current = viewedMut.mutate;

  const watchRef = useRef<{ shortId: number; startedAt: number } | null>(null);
  useEffect(() => {
    const prev = watchRef.current;
    const current = shortsRef.current[active];
    if (prev && prev.shortId !== current?.id) {
      const elapsed = Math.round((Date.now() - prev.startedAt) / 1000);
      const prevShort = shortsRef.current.find((s) => s.id === prev.shortId);
      if (elapsed >= 1 && prevShort) {
        watchedMutRef.current({
          shortId: prev.shortId,
          seconds: elapsed,
          completed: prevShort.durationSec > 0 && elapsed >= prevShort.durationSec * 0.8,
        });
      }
    }
    if (current) {
      viewedMutRef.current({ shortId: current.id });
      watchRef.current = { shortId: current.id, startedAt: Date.now() };
    } else {
      watchRef.current = null;
    }
    return () => {
      const last = watchRef.current;
      if (last) {
        const elapsed = Math.round((Date.now() - last.startedAt) / 1000);
        const lastShort = shortsRef.current.find((s) => s.id === last.shortId);
        if (elapsed >= 1 && lastShort) {
          watchedMutRef.current({
            shortId: last.shortId,
            seconds: elapsed,
            completed: lastShort.durationSec > 0 && elapsed >= lastShort.durationSec * 0.8,
          });
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.y / height);
      setActive((prev) => (prev === next ? prev : next));
    },
    [height],
  );

  const title = (s: ShortRow) => (locale === 'ar' ? s.titleJson.ar : s.titleJson.en) ?? '';

  if (q.isLoading) return <SkeletonList count={3} />;
  if (q.isError) {
    return <ErrorAlert message={t('state.error')} onRetry={() => q.refetch()} />;
  }

  return (
    <View style={styles.c} testID="mobile-reels-feed">
      <FlatList
        data={shorts}
        keyExtractor={(s) => String(s.id)}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        renderItem={({ item, index }) => {
          const near = Math.abs(index - active) <= 1;
          const isActive = index === active;
          return (
            <View style={[styles.slide, { height }]} testID="mobile-reel-slide">
              {item.videoUrl && near ? (
                isActive ? (
                  <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="cover"
                    nativeControls={false}
                  />
                ) : null
              ) : item.thumbnailUrl || item.beforeImageUrl ? (
                <Image
                  source={{ uri: (item.thumbnailUrl ?? item.beforeImageUrl) as string }}
                  style={styles.video}
                />
              ) : (
                <View style={styles.fallback}>
                  <Text style={styles.fallbackEmoji}>🎬</Text>
                  <Text style={styles.fallbackTitle}>{title(item)}</Text>
                </View>
              )}

              {isActive && (
                <View style={styles.overlay}>
                  <View style={styles.overlayRow}>
                    <View style={styles.overlayText}>
                      <Text style={styles.overlayTitle} numberOfLines={2}>
                        {title(item)}
                      </Text>
                      <Text style={styles.overlayMeta}>
                        👁️ {item.views.toLocaleString()}
                        {item.durationSec > 0 ? ` · ${item.durationSec}s` : ''}
                      </Text>
                    </View>
                    <View style={styles.overlayActions}>
                      <TouchableOpacity
                        testID="mobile-reel-mute"
                        style={styles.actionBtn}
                        onPress={() => setMuted((m) => !m)}
                      >
                        <Text style={styles.actionText}>{muted ? '🔇' : '🔊'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        disabled={!authed || likeMut.isPending}
                        onPress={() => likeMut.mutate({ shortId: item.id })}
                      >
                        <Text style={styles.actionText}>❤️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>{t('mobile.shorts.empty')}</Text>}
      />
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#000' },
  slide: { width: '100%', backgroundColor: '#111827', justifyContent: 'center' },
  video: { width: '100%', height: '100%', backgroundColor: '#000' },
  fallback: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  fallbackEmoji: { fontSize: 48 },
  fallbackTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 32 },
  overlayRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  overlayText: { flex: 1 },
  overlayTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  overlayMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  overlayActions: { gap: 8 },
  actionBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: { fontSize: 16 },
  empty: { color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  backBtn: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
