import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ServiceWarrantyScreen() {
  const [claims, setClaims] = useState<Record<string, unknown>[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([((trpc as any).serviceWarranty.myClaims.query() as any), ((trpc as any).serviceWarranty.policy.query() as any)])
      .then(([c, p]) => { setClaims(c || []); setPolicy(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  const STATUS: any = { PENDING: '⏳ قيد المراجعة', APPROVED: '✅ موافق', REJECTED: '❌ مرفوض', COMPENSATED: '💰 تم التعويض' };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🛡️ ضمان الخدمة</Text>
      {policy?.coverage ? (policy.coverage as Record<string, unknown>[]).map((c: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.coverage}><Text style={styles.covEmoji}>{c.emoji as string}</Text><View style={{flex:1}}><Text style={styles.covTitle}>{c.titleAr as string}</Text><Text style={styles.covDesc}>{c.descAr as string}</Text></View></View>
      )) : null}
      <Text style={styles.section}>📋 مطالباتي</Text>
      {claims.length === 0 ? <Text style={styles.e}>لا توجد مطالبات</Text> :
        claims.map((c: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.claim}><Text>حجز #{c.bookingId as number}</Text><Text>{(STATUS as any)[c.status as string] || c.status}</Text><Text>{(c.compensation as number) > 0 ? `${c.compensation} ر.س` : ''}</Text></View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  section: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginTop: 16, marginBottom: 8 },
  coverage: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, gap: 10, alignItems: 'center' },
  covEmoji: { fontSize: 28 }, covTitle: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right' }, covDesc: { fontSize: 11, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  claim: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 4 },
});
