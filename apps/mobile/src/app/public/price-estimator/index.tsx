import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function PriceEstimatorScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [promo, setPromo] = useState('');
  const [estimate, setEstimate] = useState<any>(null);

  useEffect(() => {
    ((trpc as any).priceEstimator.services.query() as any).then((d: any) => { setServices(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const getEstimate = () => {
    if (!selected) return;
    ((trpc as any).priceEstimator.estimate.query({ serviceId: selected, promoCode: promo || undefined }) as any)
      .then((d: any) => setEstimate(d)).catch(() => {});
  };

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💰 مقدّر الأسعار</Text>
      <Text style={styles.sub}>احسبي تكلفة الخدمة قبل الحجز</Text>

      <Text style={styles.sectionTitle}>اختاري خدمة</Text>
      {services.map((s: any) => (
        <TouchableOpacity key={s.id} onPress={() => { setSelected(s.id as number); setEstimate(null); }} style={[styles.serviceRow, selected === s.id && styles.serviceRowActive]}>
          <Text style={styles.svcEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
          <Text style={styles.svcName}>{s.nameAr as string}</Text>
          <Text style={styles.svcPrice}>{(s.basePrice as number)?.toLocaleString()} ر.س</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.promoRow}>
        <Text style={styles.promoLabel}>كود الخصم:</Text>
        <View style={styles.promoInput}><Text style={styles.promoValue}>{promo || '—'}</Text></View>
      </View>

      <TouchableOpacity onPress={getEstimate} style={[styles.estBtn, !selected && styles.estBtnDisabled]} disabled={!selected}>
        <Text style={styles.estBtnText}>🧮 احسب التكلفة</Text>
      </TouchableOpacity>

      {estimate && (
        <View style={styles.estimateCard}>
          <Text style={styles.estEmoji}>📊</Text>
          <View style={styles.estRow}><Text style={styles.estLabel}>السعر الأساسي</Text><Text style={styles.estValue}>{(estimate.basePrice as number)?.toLocaleString()} ر.س</Text></View>
          {estimate.discount > 0 && <View style={styles.estRow}><Text style={styles.estLabel}>الخصم ({estimate.promoCode as string})</Text><Text style={[styles.estValue, {color:'#059669'}]}>-{(estimate.discount as number)?.toLocaleString()} ر.س</Text></View>}
          <View style={styles.estDivider} />
          <View style={styles.estRow}><Text style={[styles.estLabel, {fontWeight:'700'}]}>الإجمالي</Text><Text style={[styles.estValue, {fontWeight:'800', fontSize:20}]}>{(estimate.total as number)?.toLocaleString()} ر.س</Text></View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 10 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 2, borderColor: '#e5e7eb' },
  serviceRowActive: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  svcEmoji: { fontSize: 24 }, svcName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  svcPrice: { fontSize: 13, fontWeight: '700', color: '#059669' },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 12 },
  promoLabel: { fontSize: 13, color: '#6b7280' }, promoInput: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }, promoValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  estBtn: { backgroundColor: '#059669', borderRadius: 14, padding: 16, alignItems: 'center' },
  estBtnDisabled: { opacity: 0.5 },
  estBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  estimateCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 2, borderColor: '#86efac' },
  estEmoji: { fontSize: 36, textAlign: 'center', marginBottom: 12 },
  estRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  estLabel: { fontSize: 14, color: '#374151' }, estValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  estDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
});
