import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function PriceEstimatorScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [promo] = useState('');
  const [estimate, setEstimate] = useState<any>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).priceEstimator.services.query() as any)
      .then((d: any) => {
        setServices(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const getEstimate = () => {
    if (!selected) return;
    (
      (trpc as any).priceEstimator.estimate.query({
        serviceId: selected,
        promoCode: promo || undefined,
      }) as any
    )
      .then((d: any) => setEstimate(d))
      .catch(() => {});
  };
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>💰 مقدّر الأسعار</Text>
      {services.map((s: any) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => {
            setSelected(s.id);
            setEstimate(null);
          }}
          style={[styles.sr, selected === s.id && styles.sra]}
        >
          <Text style={styles.se}>{(s.emoji as string) ?? '💆‍♀️'}</Text>
          <Text style={styles.sn}>{s.nameAr as string}</Text>
          <Text style={styles.sp}>{(s.basePrice as number)?.toLocaleString()} ر.س</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={getEstimate}
        disabled={!selected}
        style={[styles.eb, !selected && { opacity: 0.5 }]}
      >
        <Text style={styles.et}>🧮 احسب التكلفة</Text>
      </TouchableOpacity>
      {estimate && (
        <View style={styles.ec}>
          <View style={styles.er}>
            <Text style={styles.el}>السعر الأساسي</Text>
            <Text style={styles.ev}>{(estimate.basePrice as number)?.toLocaleString()} ر.س</Text>
          </View>
          {estimate.discount > 0 && (
            <View style={styles.er}>
              <Text style={styles.el}>الخصم</Text>
              <Text style={[styles.ev, { color: '#059669' }]}>
                -{(estimate.discount as number)?.toLocaleString()} ر.س
              </Text>
            </View>
          )}
          <View style={styles.ed} />
          <View style={styles.er}>
            <Text style={[styles.el, { fontWeight: '700' }]}>الإجمالي</Text>
            <Text style={[styles.ev, { fontWeight: '800', fontSize: 20 }]}>
              {(estimate.total as number)?.toLocaleString()} ر.س
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  sr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  sra: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  se: { fontSize: 24 },
  sn: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  sp: { fontSize: 13, fontWeight: '700', color: '#059669' },
  eb: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  et: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ec: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  er: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  el: { fontSize: 14, color: '#374151' },
  ev: { fontSize: 14, fontWeight: '600', color: '#111827' },
  ed: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
});
