import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

// R5 — shoppable reel strip (REELS_SHOPPABLE_PLAN). Poster-first
// horizontal tiles from beautyShorts.surfaceShorts; tapping a tile opens
// an in-app player (expo-video). No eager video — posters only until tap.

type ReelRow = {
  id: number;
  titleJson: { ar?: string; en?: string };
  videoUrl: string | null;
  thumbnailUrl: string | null;
  beforeImageUrl: string | null;
  durationSec: number;
  views: number;
};

function formatDuration(totalSec: number): string {
  if (totalSec <= 0) return '';
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ReelStrip({ vendorId }: { vendorId?: number }): JSX.Element | null {
  const { t, locale } = useLocale();
  const q = trpc.beautyShorts.surfaceShorts.useQuery(
    { vendorId: vendorId ?? 0 },
    { enabled: Boolean(vendorId) },
  );
  const reels = (q.data ?? []) as unknown as ReelRow[];

  const [selected, setSelected] = useState<ReelRow | null>(null);
  const player = useVideoPlayer(selected?.videoUrl ?? '', (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (selected) player.play();
    else player.pause();
  }, [selected, player]);

  if (!vendorId || reels.length === 0) return null;

  const title = (r: ReelRow) => (locale === 'ar' ? r.titleJson.ar : r.titleJson.en) ?? '';

  return (
    <View style={styles.wrap} testID="mobile-store-reels">
      <Text style={styles.title}>{t('mobile.stores.reels.title')}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={reels}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tile}
            testID="mobile-reel-tile"
            onPress={() => setSelected(item)}
          >
            {item.thumbnailUrl || item.beforeImageUrl ? (
              <Image
                source={{ uri: (item.thumbnailUrl ?? item.beforeImageUrl) as string }}
                style={styles.poster}
              />
            ) : (
              <View style={styles.posterFallback}>
                <Text style={styles.posterEmoji}>🎬</Text>
              </View>
            )}
            {item.durationSec > 0 && (
              <Text style={styles.duration}>{formatDuration(item.durationSec)}</Text>
            )}
            <Text style={styles.tileTitle} numberOfLines={2}>
              {title(item)}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {selected ? title(selected) : ''}
            </Text>
            <VideoView player={player} style={styles.player} contentFit="contain" nativeControls />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
              testID="mobile-reel-close"
            >
              <Text style={styles.closeText}>{t('mobile.video.end-call')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 10,
  },
  row: { gap: 10, paddingEnd: 4 },
  tile: { width: 128 },
  poster: { width: 128, height: 200, borderRadius: 14, backgroundColor: '#fce7f3' },
  posterFallback: {
    width: 128,
    height: 200,
    borderRadius: 14,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterEmoji: { fontSize: 32 },
  duration: {
    position: 'absolute',
    bottom: 44,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tileTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
    marginTop: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 10,
  },
  player: { width: '100%', height: 380, borderRadius: 12, backgroundColor: '#000' },
  closeBtn: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#c2255c',
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  closeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
