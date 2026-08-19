import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface VideoTestimonial {
  id?: number;
  emoji?: string;
  titleAr?: string;
  technician?: string;
  views?: number;
}

export default function VideoTestimonialsScreen(): JSX.Element {
  const { t } = useLocale();
  const videosQ = trpc.videoTestimonials.feed.useQuery({});

  if (videosQ.isLoading) return <SkeletonList count={4} />;

  const videos = ((videosQ.data as unknown as { items?: VideoTestimonial[] } | null)?.items ??
    []) as VideoTestimonial[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={videosQ.isRefetching}
          onRefresh={() => videosQ.refetch()}
          colors={['#dc2626']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.video-testimonials.title')}</Text>
      {videos.map((v, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.ve}>{v.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.vt}>{v.titleAr}</Text>
            <Text style={styles.vm}>
              ‍ {v.technician} · {v.views}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  ve: { fontSize: 32 },
  vt: { fontSize: 14, fontWeight: '600', color: '#111827' },
  vm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
