import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

const PAYMENT_METHODS = [
  { key: 'wallet', emoji: '👛', label: 'المحفظة' },
  { key: 'card', emoji: '💳', label: 'بطاقة' },
  { key: 'apple_pay', emoji: '🍎', label: 'Apple Pay' },
  { key: 'bnpl', emoji: '🏦', label: 'تقسيط' },
];

export default function CheckoutScreen(): JSX.Element {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [method, setMethod] = useState('wallet');

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).wallet.getBalance.query() as any).then((d: any) => { setBalance(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={4} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#059669']} />}>
      <Text style={styles.t}>💳 الدفع</Text>

      <View style={styles.bc}>
        <Text style={styles.bl}>رصيد المحفظة</Text>
        <Text style={styles.ba}>{((balance?.balance as number) ?? 0).toLocaleString()} ر.س</Text>
      </View>

      <Text style={styles.st}>طريقة الدفع</Text>
      <View style={styles.pms}>
        {PAYMENT_METHODS.map((p) => (
          <TouchableOpacity key={p.key} onPress={() => setMethod(p.key)} style={[styles.pm, method === p.key && styles.pma]}>
            <Text style={styles.pe}>{p.emoji}</Text>
            <Text style={[styles.pl, method === p.key && styles.pla]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.st}>ملخص الدفع</Text>
        <View style={styles.sr}><Text style={styles.sl}>المبلغ</Text><Text style={styles.sv}>200 ر.س</Text></View>
        <View style={styles.sr}><Text style={styles.sl}>الضريبة</Text><Text style={styles.sv}>30 ر.س</Text></View>
        <View style={styles.sd} />
        <View style={styles.sr}><Text style={[styles.sl, {fontWeight:'700'}]}>الإجمالي</Text><Text style={[styles.sv, {fontWeight:'800',fontSize:20}]}>230 ر.س</Text></View>
      </View>

      <TouchableOpacity style={styles.btn}><Text style={styles.bt}>💳 ادفع الآن 230 ر.س</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  bc: { backgroundColor: '#059669', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  bl: { fontSize: 13, color: '#a7f3d0' }, ba: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  pms: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  pm: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  pma: { borderColor: '#059669', backgroundColor: '#ecfdf5' }, pe: { fontSize: 24 }, pl: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4 }, pla: { color: '#059669' },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  sr: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }, sl: { fontSize: 14, color: '#374151' }, sv: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sd: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  btn: { backgroundColor: '#059669', borderRadius: 14, padding: 16, alignItems: 'center' }, bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
