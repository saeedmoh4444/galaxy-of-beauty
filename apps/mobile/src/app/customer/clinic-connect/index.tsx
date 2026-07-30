import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ClinicConnectScreen(): JSX.Element {
  const [clinics, setClinics] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).clinicConnect.clinics.query() as any),
      ((trpc as any).clinicConnect.myReferrals.query() as any),
    ]).then(([c, r]: any[]) => { setClinics(c || []); setReferrals(r || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const refer = (clinicId: number) => {
    ((trpc as any).clinicConnect.refer.mutate({ clinicId, reason: 'استشارة جلدية', urgency: 'routine' }) as any);
  };

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🏥 Clinic Connect</Text>
      <Text style={styles.sub}>إحالة طبية من فنيات التجميل للعيادات المتخصصة</Text>

      <Text style={styles.sectionTitle}>🏥 العيادات المتخصصة</Text>
      {clinics.length === 0 ? <Text style={styles.e}>لا توجد عيادات</Text> :
        clinics.map((c: any) => (
          <View key={c.id} style={styles.card}>
            <Text style={styles.clinicEmoji}>{c.emoji as string}</Text>
            <View style={{flex:1}}>
              <Text style={styles.clinicName}>{c.name as string}</Text>
              <Text style={styles.clinicMeta}>📍 {c.city as string} · {c.specialty as string} · ⭐ {c.rating as number}</Text>
            </View>
            <TouchableOpacity onPress={() => refer(c.id as number)} style={styles.referBtn}><Text style={styles.referBtnText}>إحالة</Text></TouchableOpacity>
          </View>
        ))
      }

      {referrals.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📋 إحالاتي</Text>
          {referrals.map((r: any) => (
            <View key={r.id} style={styles.refCard}>
              <Text style={styles.refReason}>{r.reason as string}</Text>
              <View style={[styles.refBadge, r.status === 'PENDING' ? styles.refPending : styles.refDone]}>
                <Text style={[styles.refBadgeText, r.status === 'PENDING' ? {color:'#d97706'} : {color:'#059669'}]}>{r.status === 'PENDING' ? 'معلقة' : 'مكتملة'}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  clinicEmoji: { fontSize: 32 }, clinicName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  clinicMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  referBtn: { backgroundColor: '#0891b2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  referBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  refCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 4 },
  refReason: { fontSize: 13, fontWeight: '600', color: '#111827' },
  refBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  refPending: { backgroundColor: '#fef3c7' }, refDone: { backgroundColor: '#dcfce7' },
  refBadgeText: { fontSize: 11, fontWeight: '600' },
});
