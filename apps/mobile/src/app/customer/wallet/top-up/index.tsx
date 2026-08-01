import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

const PRESET_AMOUNTS = [100, 200, 500, 1000];

export default function WalletTopUpScreen(): JSX.Element {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).wallet.getBalance.query() as any).then((d: any) => { setBalance(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={3} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#7c3aed']} />}>
      <Text style={styles.t}>💳 شحن المحفظة</Text>
      <View style={styles.bc}><Text style={styles.bl}>الرصيد الحالي</Text><Text style={styles.ba}>{(balance?.balance as number ?? 0)?.toLocaleString()} ر.س</Text>
        <Text style={styles.bb}>+ {(balance?.bonusBalance as number ?? 0)?.toLocaleString()} ر.س رصيد مكافآت</Text></View>
      <View style={styles.card}><Text style={styles.st}>اختر المبلغ</Text>
        <View style={styles.pr}>{PRESET_AMOUNTS.map(a => <TouchableOpacity key={a} onPress={() => { setSelected(a); setAmount(''); }} style={[styles.pb, selected === a && styles.pba]}><Text style={[styles.pt, selected === a && styles.pta]}>{(a as number)?.toLocaleString()} ر.س</Text></TouchableOpacity>)}</View>
        <TextInput value={amount} onChangeText={(t) => { setAmount(t); setSelected(null); }} placeholder="أدخل المبلغ" keyboardType="numeric" style={styles.inp} placeholderTextColor="#9ca3af" />
        <TouchableOpacity style={styles.sb}><Text style={styles.sbt}>💳 شحن {(selected || Number(amount) || 0)?.toLocaleString()} ر.س</Text></TouchableOpacity></View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  bc: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#c4b5fd' },
  bl: { fontSize: 13, color: '#6b7280' }, ba: { fontSize: 36, fontWeight: '800', color: '#7c3aed', marginTop: 4 },
  bb: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  pr: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  pb: { flex: 1, minWidth: '45%', backgroundColor: '#f3f4f6', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  pba: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' }, pt: { fontSize: 14, fontWeight: '600', color: '#6b7280' }, pta: { color: '#7c3aed' },
  inp: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', textAlign: 'center', marginBottom: 12 },
  sb: { backgroundColor: '#7c3aed', borderRadius: 14, padding: 16, alignItems: 'center' }, sbt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
