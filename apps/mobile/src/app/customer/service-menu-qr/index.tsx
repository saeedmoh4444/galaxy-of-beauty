import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ServiceMenuQRScreen(): JSX.Element {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    ((trpc as any).serviceMenuQr.list.query() as any).then((d: any) => { setTechs(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const generate = (technicianId: number) => {
    ((trpc as any).serviceMenuQr.generate.mutate({ technicianId }) as any).then((d: any) => setResult(d));
  };

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📋 QR قائمة الخدمات</Text>
      <Text style={styles.sub}>ولدي كود QR لقائمة خدمات الفنيات</Text>
      {techs.length === 0 ? <Text style={styles.e}>لا توجد فنيات</Text> :
        techs.map((t: any) => (
          <View key={t.id} style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.techName}>{t.name as string}</Text>
              <Text style={styles.techServices}>{t.services as string}</Text>
            </View>
            <TouchableOpacity onPress={() => generate(t.id as number)} style={styles.qrBtn}><Text style={styles.qrBtnText}>توليد QR</Text></TouchableOpacity>
          </View>
        ))
      }
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>📱</Text>
          <Text style={styles.resultTitle}>تم توليد QR!</Text>
          <Text style={styles.resultUrl}>{(result.qrUrl as string) ?? (result.url as string) ?? '—'}</Text>
          <Text style={styles.resultId}>المعرف: {result.id as string}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  techName: { fontSize: 15, fontWeight: '600', color: '#111827' }, techServices: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  qrBtn: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  qrBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 16, borderWidth: 2, borderColor: '#86efac' },
  resultEmoji: { fontSize: 40 }, resultTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  resultUrl: { fontSize: 12, color: '#059669', marginTop: 4 }, resultId: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
