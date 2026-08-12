import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function StyleMatchScreen(): JSX.Element {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const match = useCallback(() => {
    setLoading(true);
    ((trpc as any).styleMatch.analyze.query() as any)
      .then((d: any) => {
        setResult(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  if (loading) return <SkeletonList count={3} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> مطابقة الأسلوب</Text>
      {!result ? (
        <View style={styles.centered}>
          <Text style={styles.emoji}></Text>
          <Text style={styles.hint}>اكتشفي أسلوبكِ المثالي</Text>
          <TouchableOpacity onPress={match} style={styles.btn}>
            <Text style={styles.bt}> حللي أسلوبي</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.se}>{(result.styleEmoji as string) ?? ''}</Text>
          <Text style={styles.sn}>{result.styleNameAr as string}</Text>
          <Text style={styles.sd}>{result.descriptionAr as string}</Text>
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
  se: { fontSize: 48 },
  sn: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  sd: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'center' },
});
