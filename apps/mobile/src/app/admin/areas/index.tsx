import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminAreasScreen(): JSX.Element {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).platform.listAreas.query({}) as any).then((d: any) => { setAreas(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const remove = (id: number) => {
    ((trpc as any).platform.deleteArea.mutate({ id }) as any).then(() => {
      setAreas(areas.filter(a => a.id !== id));
    });
  };

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📍 المناطق</Text>
      <Text style={styles.sub}>إدارة المناطق والمدن</Text>
      {areas.length === 0 ? <Text style={styles.e}>لا توجد مناطق</Text> :
        areas.map((a: any) => (
          <View key={a.id} style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.areaName}>{a.nameAr as string}</Text>
              <Text style={styles.areaMeta}>{a.nameEn as string} · المدينة: {a.cityId as number}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(a.id as number)}><Text style={styles.delBtn}>🗑️</Text></TouchableOpacity>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  areaName: { fontSize: 15, fontWeight: '600', color: '#111827' }, areaMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  delBtn: { fontSize: 20 },
});
