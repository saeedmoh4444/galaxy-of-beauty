import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState } from 'react';

export default function ProductScannerScreen() {
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const scan = () => { if (!barcode.trim()) return; setLoading(true); (trpc.productScanner.lookup.query({ barcode: barcode.trim() }) as any).then((d: any) => { setResult(d); setLoading(false); }).catch(() => setLoading(false)); };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔍 فحص المنتجات</Text>
      <View style={styles.inputRow}><TextInput style={styles.input} value={barcode} onChangeText={setBarcode} onSubmitEditing={scan} placeholder="أدخلي الباركود..." keyboardType="numeric" textAlign="center" /><TouchableOpacity style={styles.btn} onPress={scan}><Text style={styles.btnText}>فحص</Text></TouchableOpacity></View>
      {loading ? <ActivityIndicator color="#2563eb" style={{ marginTop: 20 }} /> : result?.found ? (
        <View style={styles.resultCard}>
          <Text style={styles.productName}>{result.product.nameAr}</Text><Text style={styles.brand}>{result.product.brand}</Text>
          <View style={styles.scoreRow}><View style={styles.scoreBar}><View style={[styles.scoreFill, { width: `${result.product.safetyScore}%`, backgroundColor: result.product.safetyScore >= 90 ? '#16a34a' : result.product.safetyScore >= 75 ? '#d97706' : '#dc2626' }]} /></View><Text style={styles.scoreText}>{result.product.safetyScore}% آمن</Text></View>
          {(result.product.safetyDetails as any[])?.map((d: any, i: number) => <Text key={i} style={styles.warning}>⚠️ {d.concern}: {d.tip}</Text>)}
          <Text style={styles.section}>🧪 المكونات</Text>
          <View style={styles.ingredients}>{(result.product.ingredients as string[]).map((ing: string) => <Text key={ing} style={styles.ing}>{ing}</Text>)}</View>
        </View>
      ) : result ? <Text style={styles.notFound}>{result.message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 8 }, input: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, fontSize: 16, fontFamily: 'monospace', letterSpacing: 2 },
  btn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' }, btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  resultCard: { marginTop: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  productName: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'right' }, brand: { fontSize: 14, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  scoreRow: { marginTop: 12 }, scoreBar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 4 }, scoreFill: { height: 8, borderRadius: 4 }, scoreText: { fontSize: 12, fontWeight: '700', textAlign: 'right' },
  warning: { fontSize: 12, color: '#dc2626', textAlign: 'right', marginTop: 6 }, section: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right', marginTop: 12, marginBottom: 8 },
  ingredients: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }, ing: { fontSize: 11, backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  notFound: { marginTop: 20, fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});
