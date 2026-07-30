import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ApiDocsScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).apiDocs.reference.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📚 API Docs</Text>
      {data ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{data.title as string} v{data.version as string}</Text>
            <Text style={styles.meta}>{data.endpoints as number} routers · {data.procedures as string} procedures</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 Authentication</Text>
            <Text style={styles.code}>{(data.authentication as any)?.header as string}</Text>
          </View>
          <Text style={styles.sectionTitle}>📂 Categories</Text>
          {(data.categories as any[])?.map((cat: any, i: number) => (
            <View key={i} style={styles.cat}>
              <Text style={styles.catName}>{cat.name as string}</Text>
              {(cat.endpoints as any[])?.map((ep: any, j: number) => (
                <View key={j} style={styles.ep}>
                  <Text style={styles.epMethod}>{ep.method as string}</Text>
                  <Text style={styles.epPath}>{ep.path as string}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      ) : <Text style={styles.e}>لا توجد بيانات</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  header: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  code: { fontSize: 11, color: '#4f46e5', backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8, fontFamily: 'monospace' },
  cat: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  catName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  ep: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  epMethod: { fontSize: 11, fontWeight: '700', color: '#059669', width: 40, fontFamily: 'monospace' },
  epPath: { fontSize: 12, color: '#374151', fontFamily: 'monospace' },
});
