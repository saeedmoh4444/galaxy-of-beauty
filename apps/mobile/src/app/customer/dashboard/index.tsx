import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    ((trpc as any).analytics.customerInsights.query() as any).then((d: any) => { setInsights(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  const quickLinks = [
    { href: '/(tabs)/bookings', label: '📅 حجوزاتي', color: '#7c3aed' },
    { href: '/customer/wallet', label: '💰 المحفظة', color: '#059669' },
    { href: '/customer/wishlist', label: '❤️ المفضلة', color: '#dc2626' },
    { href: '/customer/loyalty', label: '⭐ الولاء', color: '#d97706' },
    { href: '/customer/womens-services', label: '🌸 خدمات نسائية', color: '#be185d' },
    { href: '/customer/challenges', label: '🏆 التحديات', color: '#8b5cf6' },
  ];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>👋 مرحباً بكِ</Text>
      {insights && (
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statNum}>{insights.totalBookings || 0}</Text><Text style={styles.statLabel}>حجز</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>{insights.totalSpent || 0} ر.س</Text><Text style={styles.statLabel}>إنفاق</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>{insights.loyaltyPoints || 0}</Text><Text style={styles.statLabel}>نقطة</Text></View>
        </View>
      )}
      <Text style={styles.section}>⚡ وصول سريع</Text>
      <View style={styles.links}>
        {quickLinks.map((l, i) => (
          <TouchableOpacity key={i} style={styles.link} onPress={() => router.push(l.href as any)}><Text style={[styles.linkText, { color: l.color }]}>{l.label}</Text></TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
  stat: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 100 },
  statNum: { fontSize: 20, fontWeight: '800', color: '#7c3aed' }, statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  section: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 10 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: { backgroundColor: '#fff', borderRadius: 14, padding: 14, width: '48%', alignItems: 'center' },
  linkText: { fontSize: 14, fontWeight: '600' },
});
