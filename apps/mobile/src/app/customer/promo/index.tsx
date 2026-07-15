import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState } from 'react';

export default function PromoScreen() {
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    setError(''); setResult(null);
    if (!code || !amount) { setError('الرجاء إدخال الكود والمبلغ'); return; }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = await (trpc.promo.validate.query({ code: code.toUpperCase(), orderAmount: Number(amount) }) as any as Promise<Record<string, unknown>>);
      setResult(r);
    } catch { setError('الكود غير صالح أو منتهي الصلاحية'); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>كود الخصم</Text>

      <View style={styles.card}>
        <Text style={styles.label}>كود الخصم</Text>
        <TextInput style={styles.input} value={code} onChangeText={(t) => setCode(t.toUpperCase())} placeholder="مثال: WELCOME20" placeholderTextColor="#9ca3af" autoCapitalize="characters" />
        <Text style={styles.label}>قيمة الحجز (ر.س)</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="200" keyboardType="decimal-pad" placeholderTextColor="#9ca3af" />
        <TouchableOpacity style={styles.btn} onPress={handleValidate} activeOpacity={0.8}>
          <Text style={styles.btnText}>تحقق من الكود</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {result && result.valid ? (
        <View style={styles.resultCard}>
          <View style={styles.row}><Text style={styles.rowLabel}>الكود</Text><Text style={styles.rowValue}>{result.code as string}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>نوع الخصم</Text><Text style={styles.rowValue}>{result.discountType === 'percent' ? 'نسبة مئوية' : 'خصم ثابت'}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>قيمة الخصم</Text><Text style={styles.rowValueBold}>{result.discountValue as number}{result.discountType === 'percent' ? '%' : ' ر.س'}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>الخصم</Text><Text style={styles.rowValueBold}>-{Number(result.discountAmount).toFixed(2)} ر.س</Text></View>
          <View style={[styles.row, styles.totalRow]}><Text style={styles.totalLabel}>الإجمالي</Text><Text style={styles.totalValue}>{Number(result.finalAmount).toFixed(2)} ر.س</Text></View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 20 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', textAlign: 'right', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 15, textAlign: 'right', backgroundColor: '#f9fafb' },
  btn: { backgroundColor: '#7c3aed', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 12, textAlign: 'center' },
  resultCard: { marginTop: 16, borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 14, padding: 16, backgroundColor: '#f0fdf4' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#dcfce7' },
  rowLabel: { fontSize: 13, color: '#6b7280' },
  rowValue: { fontSize: 13, color: '#374151' },
  rowValueBold: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  totalRow: { borderBottomWidth: 0, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#16a34a' },
});
