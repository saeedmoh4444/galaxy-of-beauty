import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface BnplProvider {
  key: string;
  emoji?: string;
  nameAr?: string;
}

interface BnplEligibility {
  eligible?: boolean;
  provider?: string;
}

interface BnplPlanResult {
  totalAmount?: number;
}

export default function BnplScreen(): JSX.Element {
  const [providers, setProviders] = useState<BnplProvider[]>([]);
  const [, setEligibility] = useState<BnplEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [provider, setProvider] = useState('tabby');
  const [amount] = useState(500);
  const [inst] = useState(4);
  const [result, setResult] = useState<BnplPlanResult | null>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      typedTrpc().bnpl.providers.query() as Promise<BnplProvider[]>,
      typedTrpc().bnpl.eligibility.query() as Promise<BnplEligibility>,
    ])
      .then(([p, e]) => {
        setProviders(p || []);
        setEligibility(e);
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
  const submit = () => {
    setLoading(true);
    (
      typedTrpc().bnpl.createPlan.mutate({ amount, provider, installments: inst }) as Promise<BnplPlanResult>
    )
      .then((d: BnplPlanResult) => {
        setResult(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  if (loading) return <SkeletonList count={3} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}> تقسيط المدفوعات</Text>
        <View style={[styles.card, styles.sc]}>
          <Text style={styles.se}></Text>
          <Text style={styles.stt}>تمت الموافقة!</Text>
          <Text style={styles.ta}>{result.totalAmount?.toLocaleString()} ر.س</Text>
          <TouchableOpacity onPress={() => setResult(null)} style={styles.rst}>
            <Text style={styles.rstt}> إعادة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}> تقسيط المدفوعات</Text>
      <View style={styles.pr}>
        {providers.map((p) => (
          <TouchableOpacity
            key={p.key}
            onPress={() => setProvider(p.key)}
            style={[styles.pb, provider === p.key && styles.pba]}
          >
            <Text style={styles.pe}>{p.emoji}</Text>
            <Text style={[styles.pn, provider === p.key && styles.pna]}>{p.nameAr}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.me}>{Math.round(amount / inst).toLocaleString()} ر.س / شهرياً</Text>
        <TouchableOpacity onPress={submit} style={styles.sb}>
          <Text style={styles.sbt}>تقديم الطلب</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  pr: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pb: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  pba: { borderColor: '#0891b2', backgroundColor: '#ecfeff' },
  pe: { fontSize: 28 },
  pn: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginTop: 4 },
  pna: { color: '#0891b2' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  sc: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  se: { fontSize: 56 },
  stt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  ta: { fontSize: 28, fontWeight: '800', color: '#0891b2', marginTop: 8 },
  me: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
  sb: {
    backgroundColor: '#0891b2',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  sbt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rst: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  rstt: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
