import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

interface SurpriseService {
  emoji?: string;
  titleJson?: { ar?: string };
  basePrice?: number;
  reason?: string;
}

export default function SurpriseMeScreen(): JSX.Element {
  const [result, setResult] = useState<SurpriseService | null>(null);
  const [loading, setLoading] = useState(false);
  const surprise = useCallback(() => {
    setLoading(true);
    rawTrpc.services.surpriseMe
      .query({})
      .then((d) => {
        setResult(d as unknown as SurpriseService);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  if (loading) return <SkeletonList count={3} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> فاجئيني</Text>
      {!result ? (
        <View style={styles.centered}>
          <Text style={styles.emoji}></Text>
          <Text style={styles.hint}>اضغطي للاستكشاف!</Text>
          <TouchableOpacity onPress={surprise} style={styles.btn}>
            <Text style={styles.bt}> اختر لي</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.re}>{result.emoji ?? '‍️'}</Text>
          <Text style={styles.rn}>{result.titleJson?.ar}</Text>
          <Text style={styles.rp}>{result.basePrice?.toLocaleString()} ر.س</Text>
          <Text style={styles.rd}>{result.reason}</Text>
          <TouchableOpacity onPress={surprise} style={styles.btn}>
            <Text style={styles.bt}> جربي مرة أخرى</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  centered: { alignItems: 'center', marginTop: 40 },
  emoji: { fontSize: 64, marginBottom: 12 },
  hint: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },
  btn: { backgroundColor: '#db2777', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  re: { fontSize: 48 },
  rn: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  rp: { fontSize: 22, fontWeight: '800', color: '#db2777', marginTop: 4 },
  rd: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'center' },
});
