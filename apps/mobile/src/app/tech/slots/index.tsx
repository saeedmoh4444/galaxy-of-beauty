import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function TechSlotsScreen(): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).slots.mySlots.query({}) as any).then((d: any) => { setData(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={6} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#059669']} />}>
      <Text style={styles.t}>⏰ مواعيدي</Text>
      {data.map((s: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.time}>{new Date(s.startAt as string).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'})}</Text>
          <View style={{flex:1}}><Text style={styles.date}>{new Date(s.startAt as string).toLocaleDateString('ar-SA',{month:'short',day:'numeric'})}</Text></View>
          <View style={[styles.badge, s.isBooked ? styles.booked : styles.free]}><Text style={styles.badgeText}>{s.isBooked ? 'محجوز' : 'متاح'}</Text></View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 6 },
  time: { fontSize: 14, fontWeight: '700', color: '#111827' }, date: { fontSize: 13, color: '#374151' },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }, booked: { backgroundColor: '#fee2e2' }, free: { backgroundColor: '#dcfce7' },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
