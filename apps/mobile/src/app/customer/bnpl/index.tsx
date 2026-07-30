import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BnplScreen(): JSX.Element {
  const [providers, setProviders] = useState<any[]>([]);
  const [, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState('tabby');
  const [amount] = useState(500);
  const [inst] = useState(4);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      ((trpc as any).bnpl.providers.query() as any),
      ((trpc as any).bnpl.eligibility.query() as any),
    ]).then(([p, e]: any[]) => { setProviders(p || []); setEligibility(e); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const submit = () => {
    setLoading(true);
    ((trpc as any).bnpl.createPlan.mutate({ amount, provider, installments: inst }) as any)
      .then((d: any) => { setResult(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>🏦 تقسيط المدفوعات</Text>
        <View style={[styles.card, styles.successCard]}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>تمت الموافقة!</Text>
          <Text style={styles.totalAmount}>{(result.totalAmount as number)?.toLocaleString()} ر.س</Text>
          <Text style={styles.monthly}>{result.installments as number} دفعات شهرية بـ {(result.monthlyPayment as number)?.toLocaleString()} ر.س</Text>
          {(result.schedule as any[])?.map((m: any, i: number) => (
            <Text key={i} style={styles.scheduleItem}>الدفعة {i + 1}: {(m.amount as number)?.toLocaleString()} — {m.dueDate as string}</Text>
          ))}
          <TouchableOpacity onPress={() => setResult(null)} style={styles.resetBtn}><Text style={styles.resetBtnText}>🔄 إعادة</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🏦 تقسيط المدفوعات</Text>
      <Text style={styles.sub}>ادفعي خدماتكِ على أقساط مريحة بدون فوائد</Text>
      <View style={styles.provRow}>
        {providers.map((p: any) => (
          <TouchableOpacity key={p.key} onPress={() => setProvider(p.key)} style={[styles.provBtn, provider === p.key && styles.provBtnActive]}>
            <Text style={styles.provEmoji}>{p.emoji as string}</Text>
            <Text style={[styles.provName, provider === p.key && styles.provNameActive]}>{p.nameAr as string}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.sliderLabel}>المبلغ: {(amount as number)?.toLocaleString()} ر.س</Text>
        <Text style={styles.sliderLabel}>عدد الدفعات: {inst}</Text>
        <Text style={styles.monthlyEstimate}>{Math.round(amount / inst).toLocaleString()} ر.س / شهرياً</Text>
        <TouchableOpacity onPress={submit} style={styles.submitBtn}><Text style={styles.submitBtnText}>تقديم الطلب</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  provRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  provBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  provBtnActive: { borderColor: '#0891b2', backgroundColor: '#ecfeff' },
  provEmoji: { fontSize: 28 }, provName: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginTop: 4 },
  provNameActive: { color: '#0891b2' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  successCard: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  successEmoji: { fontSize: 56 }, successTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  totalAmount: { fontSize: 28, fontWeight: '800', color: '#0891b2', marginTop: 8 },
  monthly: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  scheduleItem: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  sliderLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8, marginTop: 8 },
  monthlyEstimate: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
  submitBtn: { backgroundColor: '#0891b2', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resetBtn: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12, width: '100%' },
  resetBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
