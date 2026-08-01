import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useRouter } from 'expo-router';

export default function DashboardScreen(): JSX.Element {
  const { data: insights, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.analytics.customerInsights.query());
  const router = useRouter();
  if (loading) return <SkeletonList count={5} />;
  if (error) return <ErrorAlert message="فشل تحميل لوحة التحكم" onRetry={refetch} />;
  const quickLinks = [
    { href: '/(tabs)/bookings', label: '📅 حجوزاتي', color: '#7c3aed' }, { href: '/customer/wallet', label: '💰 المحفظة', color: '#059669' },
    { href: '/customer/wishlist', label: '❤️ المفضلة', color: '#dc2626' }, { href: '/customer/loyalty', label: '⭐ الولاء', color: '#d97706' },
    { href: '/customer/womens-services', label: '🌸 خدمات نسائية', color: '#be185d' }, { href: '/customer/challenges', label: '🏆 التحديات', color: '#8b5cf6' },
  ];
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
      <Text style={styles.t}>👋 مرحباً بكِ</Text>
      {insights && (<View style={styles.stats}><View style={styles.stat}><Text style={styles.sn}>{insights.bookingCount || 0}</Text><Text style={styles.sl}>حجز</Text></View>
        <View style={styles.stat}><Text style={styles.sn}>{(insights.totalSpent as number)?.toLocaleString() || 0} ر.س</Text><Text style={styles.sl}>إنفاق</Text></View>
        <View style={styles.stat}><Text style={styles.sn}>{insights.completedBookings || 0}</Text><Text style={styles.sl}>مكتمل</Text></View></View>)}
      <Text style={styles.st}>⚡ وصول سريع</Text>
      <View style={styles.links}>{quickLinks.map((l, i) => (<TouchableOpacity key={i} style={styles.link} onPress={() => router.push(l.href as any)}><Text style={[styles.lt,{color:l.color}]}>{l.label}</Text></TouchableOpacity>))}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
  stat: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 100 },
  sn: { fontSize: 20, fontWeight: '800', color: '#7c3aed' }, sl: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 10 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: { backgroundColor: '#fff', borderRadius: 14, padding: 14, width: '48%', alignItems: 'center' }, lt: { fontSize: 14, fontWeight: '600' },
});
