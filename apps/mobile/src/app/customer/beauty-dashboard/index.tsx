import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyDashboardScreen(): JSX.Element {
  const [loyalty, setLoyalty] = useState<any>(null);
  const [cashback, setCashback] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).loyalty.status.query() as any).catch(() => null),
      ((trpc as any).cashback.info.query() as any).catch(() => null),
      ((trpc as any).bookings.list.query({ status: undefined, page: 1, limit: 3 }) as any).catch(() => ({ bookings: [] })),
    ]).then(([l, c, b]: any[]) => {
      setLoyalty(l); setCashback(c); setBookings(b?.bookings || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>👑 لوحة الجمال</Text>
      <Text style={styles.sub}>نظرة شاملة على رحلتكِ الجمالية</Text>

      <View style={styles.kpiRow}>
        <View style={[styles.kpi, {backgroundColor: '#fef3c7'}]}>
          <Text style={styles.kpiEmoji}>⭐</Text>
          <Text style={styles.kpiVal}>{loyalty?.points as number ?? 0}</Text>
          <Text style={styles.kpiLabel}>نقاط الولاء</Text>
        </View>
        <View style={[styles.kpi, {backgroundColor: '#dcfce7'}]}>
          <Text style={styles.kpiEmoji}>💰</Text>
          <Text style={[styles.kpiVal, {color:'#059669'}]}>{(cashback?.balance as number ?? 0)?.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>كاش باك</Text>
        </View>
        <View style={[styles.kpi, {backgroundColor: '#dbeafe'}]}>
          <Text style={styles.kpiEmoji}>📅</Text>
          <Text style={[styles.kpiVal, {color:'#2563eb'}]}>{bookings.length}</Text>
          <Text style={styles.kpiLabel}>حجوزات قادمة</Text>
        </View>
      </View>

      {loyalty?.tier && (
        <View style={styles.tierCard}>
          <Text style={styles.tierEmoji}>{loyalty.tier === 'PLATINUM' ? '💎' : loyalty.tier === 'GOLD' ? '🥇' : '🥈'}</Text>
          <Text style={styles.tierText}>فئة {loyalty.tier === 'PLATINUM' ? 'البلاتينية' : loyalty.tier === 'GOLD' ? 'الذهبية' : 'الفضية'}</Text>
        </View>
      )}

      {bookings.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📅 أقرب الحجوزات</Text>
          {bookings.map((b: any) => (
            <View key={b.id} style={styles.bkCard}>
              <Text style={styles.bkCode}>{b.bookingCode as string}</Text>
              <Text style={styles.bkDate}>{new Date(b.startAt as string).toLocaleDateString('ar-SA', { month:'short', day:'numeric' })}</Text>
              <View style={[styles.bkBadge, {backgroundColor: b.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7'}]}>
                <Text style={{fontSize:11,fontWeight:'600'}}>{b.status as string}</Text>
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
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpi: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 20, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 10, color: '#6b7280' },
  tierCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  tierEmoji: { fontSize: 36 }, tierText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  bkCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 4 },
  bkCode: { fontSize: 13, fontWeight: '600', color: '#111827', fontFamily: 'monospace' },
  bkDate: { flex: 1, fontSize: 12, color: '#6b7280' },
  bkBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
});
