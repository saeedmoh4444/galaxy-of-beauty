import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function InspirationScreen(): JSX.Element {
  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).inspiration.list.query() as any).then((d: any) => { setPins(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = (id: number) => {
    ((trpc as any).inspiration.delete.mutate({ id }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📌 لوحة الإلهام</Text>
      <Text style={styles.sub}>احفظي الصور والأفكار لموعدكِ القادم</Text>
      {pins.length === 0 ? <Text style={styles.e}>لا توجد دبابيس</Text> :
        <View style={styles.grid}>
          {pins.map((p: any) => (
            <View key={p.id} style={styles.card}>
              {p.imageUrl ? <Image source={{uri: p.imageUrl as string}} style={styles.image} /> : <View style={styles.imagePlaceholder}><Text style={{fontSize:36}}>🖼️</Text></View>}
              <View style={styles.cardBody}>
                <Text style={styles.pinTitle}>{p.title as string}</Text>
                {p.notes ? <Text style={styles.pinNotes}>{p.notes as string}</Text> : null}
                <TouchableOpacity onPress={() => remove(p.id as number)} style={styles.deleteBtn}><Text style={styles.deleteText}>🗑️</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: 120 }, imagePlaceholder: { width: '100%', height: 120, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 10 },
  pinTitle: { fontSize: 13, fontWeight: '600', color: '#111827' }, pinNotes: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  deleteBtn: { alignSelf: 'flex-end', marginTop: 4 }, deleteText: { fontSize: 14 },
});
