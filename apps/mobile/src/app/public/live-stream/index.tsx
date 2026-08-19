import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface LiveStreamItem {
  id?: number;
  titleAr?: string;
  title?: string;
  host?: string;
  viewers?: number;
  scheduledAt?: string;
}

export default function LiveStreamScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const upcomingQ = trpc.liveStream.upcoming.useQuery({});
  const items = (upcomingQ.data as unknown as LiveStreamItem[] | undefined) ?? [];
  if (upcomingQ.isLoading) return <SkeletonList count={4} />;
  const live = items;
  const upcoming = items;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={upcomingQ.isRefetching}
          onRefresh={() => upcomingQ.refetch()}
          colors={['#ef4444']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.live-stream.title')}</Text>
      {live.length > 0 && <Text style={styles.st}>{t('mobile.public.live-stream.live-now')}</Text>}
      {live.map((s) => (
        <View key={s.id} style={[styles.card, styles.lc]}>
          <Text style={styles.se}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{s.titleAr ?? s.title ?? ''}</Text>
            <Text style={styles.sm}>
              {s.host ?? ''} · {s.viewers ?? 0}
            </Text>
          </View>
          <TouchableOpacity style={styles.wb}>
            <Text style={styles.wt}>{t('mobile.public.live-stream.watch')}</Text>
          </TouchableOpacity>
        </View>
      ))}
      {upcoming.length > 0 && (
        <Text style={styles.st}>{t('mobile.public.live-stream.upcoming')}</Text>
      )}
      {upcoming.map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.se}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{s.titleAr ?? s.title ?? ''}</Text>
            <Text style={styles.sm}>
              {s.host ?? ''} ·{' '}
              {s.scheduledAt
                ? new Date(s.scheduledAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </Text>
          </View>
          <View style={styles.rb}>
            <Text style={styles.rt}></Text>
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
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  lc: { borderWidth: 2, borderColor: '#fca5a5' },
  se: { fontSize: 32 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  wb: { backgroundColor: '#dc2626', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  wt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rb: { backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  rt: { fontSize: 16 },
});
