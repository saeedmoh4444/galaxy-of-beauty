import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const PRESET_AMOUNTS = [100, 200, 500, 1000];

export default function WalletTopUpScreen(): JSX.Element {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    ((trpc as any).wallet.getBalance.query() as any).then((d: any) => { setBalance(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const topUp = () => {
    const a = selected || Number(amount);
    if (a < 50) return;
    // Navigate to payment gateway
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💳 شحن المحفظة</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
        <Text style={styles.balanceAmount}>{(balance?.balance as number ?? 0)?.toLocaleString()} ر.س</Text>
        <Text style={styles.bonusText}>+ {(balance?.bonusBalance as number ?? 0)?.toLocaleString()} ر.س رصيد مكافآت</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>اختر المبلغ</Text>
        <View style={styles.presets}>
          {PRESET_AMOUNTS.map(a => (
            <TouchableOpacity key={a} onPress={() => { setSelected(a); setAmount(''); }} style={[styles.presetBtn, selected === a && styles.presetBtnActive]}>
              <Text style={[styles.presetText, selected === a && styles.presetTextActive]}>{(a as number)?.toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput value={amount} onChangeText={(t) => { setAmount(t); setSelected(null); }} placeholder="أدخل المبلغ" keyboardType="numeric" style={styles.input} placeholderTextColor="#9ca3af" />
        <TouchableOpacity onPress={topUp} style={styles.topUpBtn}>
          <Text style={styles.topUpBtnText}>💳 شحن {(selected || Number(amount) || 0)?.toLocaleString()} ر.س</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  balanceCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#c4b5fd' },
  balanceLabel: { fontSize: 13, color: '#6b7280' },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: '#7c3aed', marginTop: 4 },
  bonusText: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  presetBtn: { flex: 1, minWidth: '45%', backgroundColor: '#f3f4f6', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  presetBtnActive: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
  presetText: { fontSize: 14, fontWeight: '600', color: '#6b7280' }, presetTextActive: { color: '#7c3aed' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', textAlign: 'center', marginBottom: 12 },
  topUpBtn: { backgroundColor: '#7c3aed', borderRadius: 14, padding: 16, alignItems: 'center' },
  topUpBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
