import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function VideoBookingScreen(): JSX.Element {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).video.getSession.query({ bookingId: parseInt(bookingId, 10) }) as any).then((d: any) => { setData(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, [bookingId]);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={3} />;
  if (!data) return <View style={styles.c}><Text style={styles.e}>الجلسة غير متاحة</Text></View>;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#7c3aed']} />}>
      <Text style={styles.t}>📹 جلسة فيديو</Text>
      <View style={styles.card}><Text style={styles.code}>{data.roomId as string ?? '—'}</Text><Text style={styles.stat}>{data.status as string}</Text></View>
      <TouchableOpacity onPress={() => router.push(`/customer/video/${bookingId}/room` as any)} style={styles.btn}><Text style={styles.bt}>🎥 دخول الغرفة</Text></TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  code: { fontSize: 18, fontWeight: '700', color: '#111827', fontFamily: 'monospace' }, stat: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  btn: { backgroundColor: '#7c3aed', borderRadius: 14, padding: 16, alignItems: 'center' }, bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
