import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TrendingScreen(): JSX.Element {
  const [trending, setTrending] = useState<any[]>([]);
  const [spotlight, setSpotlight] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).social.trending.query() as any),
      ((trpc as any).social.spotlight.query() as any),
    ]).then(([t, s]: any[]) => { setTrending(t || []); setSpotlight(s || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔥 الأكثر رواجاً</Text>
      <Text style={styles.sub}>الخدمات والفنيات الأكثر طلباً هذا الشهر</Text>

      {trending.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>💆‍♀️ الخدمات الرائجة</Text>
          {trending.map((s: any, i: number) => (
            <View key={s.id ?? i} style={styles.card}>
              <View style={styles.rank}><Text style={styles.rankText}>#{i + 1}</Text></View>
              <View style={{flex:1}}>
                <Text style={styles.svcName}>{(s.titleJson as any)?.ar as string ?? s.name as string}</Text>
                <Text style={styles.svcBookings}>{s.bookingCount as number} حجز</Text>
              </View>
              <Text style={styles.svcPrice}>{(s.basePrice as number)?.toLocaleString()} ر.س</Text>
            </View>
          ))}
        </>
      )}

      {spotlight.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>⭐ فنيات مميزات</Text>
          {spotlight.map((t: any, i: number) => (
            <View key={t.id ?? i} style={styles.card}>
              <Text style={styles.techEmoji}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👩‍🎨'}</Text>
              <View style={{flex:1}}>
                <Text style={styles.techName}>{t.name as string}</Text>
                <Text style={styles.techMeta}>📍 {t.city as string} · ⭐ {t.ratingAvg as number}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  rank: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fdf2f8', alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 12, fontWeight: '700', color: '#db2777' },
  svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  svcBookings: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  svcPrice: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  techEmoji: { fontSize: 28 }, techName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  techMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
