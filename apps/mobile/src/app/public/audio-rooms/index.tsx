import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function AudioRoomsScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() =>
    typedTrpc().audioRooms.rooms.query(),
  );

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل الغرف الصوتية" onRetry={refetch} />;

  const live = ((data as any)?.live ?? []) as any[];
  const upcoming = ((data as any)?.upcoming ?? []) as any[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#dc2626']} />
      }
    >
      <Text style={styles.t}>️ الغرف الصوتية</Text>
      <Text style={styles.sub}>انضمي لنقاشات مباشرة مع خبراء التجميل</Text>
      {live.length > 0 && <Text style={styles.sectionTitle}> مباشر الآن</Text>}
      {live.map((r) => (
        <View key={r.id} style={[styles.card, styles.liveCard]}>
          <Text style={styles.roomEmoji}>️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.roomTitle}>{r.title as string}</Text>
            <Text style={styles.roomMeta}>
              {r.host as string} · {r.listeners as number} مستمعين
            </Text>
          </View>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>انضمام</Text>
          </TouchableOpacity>
        </View>
      ))}
      {upcoming.length > 0 && <Text style={styles.sectionTitle}> قادم</Text>}
      {upcoming.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.roomEmoji}>️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.roomTitle}>{r.title as string}</Text>
            <Text style={styles.roomMeta}>
              {r.host as string} ·{' '}
              {new Date(r.scheduledAt as string).toLocaleDateString('ar-SA', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.remindBadge}>
            <Text style={styles.remindText}> تذكير</Text>
          </View>
        </View>
      ))}
      {live.length === 0 && upcoming.length === 0 && <Text style={styles.e}>لا توجد غرف</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  liveCard: { borderWidth: 2, borderColor: '#fca5a5' },
  roomEmoji: { fontSize: 30 },
  roomTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  roomMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  joinBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  remindBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  remindText: { fontSize: 11, color: '#6b7280' },
});
