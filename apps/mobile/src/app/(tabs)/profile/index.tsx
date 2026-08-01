import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function ProfileScreen(): JSX.Element {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).users.getMe.query() as any).then((d: any) => { setData(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={3} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#7c3aed']} />}>
      <Text style={styles.t}>👤 حسابي</Text>
      {data && <View style={styles.card}><Text style={styles.nm}>{data.name as string}</Text><Text style={styles.em}>{data.email as string}</Text></View>}
      <View style={styles.links}>{[{l:'📅 حجوزاتي',h:'/(tabs)/bookings'},{l:'💰 المحفظة',h:'/(tabs)/wallet'},{l:'⭐ الولاء',h:'/customer/loyalty'}].map((item,i) => (<TouchableOpacity key={i} onPress={() => router.push(item.h as any)} style={styles.link}><Text style={styles.lt}>{item.l}</Text></TouchableOpacity>))}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  nm: { fontSize: 20, fontWeight: '700', color: '#111827' }, em: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  links: { gap: 8 }, link: { backgroundColor: '#fff', borderRadius: 14, padding: 16 }, lt: { fontSize: 15, fontWeight: '600', color: '#111827' },
});
