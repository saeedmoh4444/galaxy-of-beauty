import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function ServiceMenuQRScreen(): JSX.Element {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().serviceMenuQr.list.query() as any)
      .then((d: any) => {
        setTechs(d || []);
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
  const generate = (technicianId: number) => {
    (typedTrpc().serviceMenuQr.generate.mutate({ technicianId }) as any).then((d: any) =>
      setResult(d),
    );
  };
  if (loading) return <SkeletonList count={4} />;
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
      <Text style={styles.t}> QR قائمة الخدمات</Text>
      {techs.map((t: any) => (
        <View key={t.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{t.name as string}</Text>
            <Text style={styles.ts}>{t.services as string}</Text>
          </View>
          <TouchableOpacity onPress={() => generate(t.id)} style={styles.qb}>
            <Text style={styles.qbt}>توليد QR</Text>
          </TouchableOpacity>
        </View>
      ))}
      {result && (
        <View style={styles.rc}>
          <Text style={styles.re}></Text>
          <Text style={styles.rt}>تم توليد QR!</Text>
          <Text style={styles.ru}>{(result.qrUrl ?? result.url) as string}</Text>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  tn: { fontSize: 15, fontWeight: '600', color: '#111827' },
  ts: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  qb: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  qbt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rc: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  re: { fontSize: 40 },
  rt: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  ru: { fontSize: 12, color: '#059669', marginTop: 4 },
});
