import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function FavoritesScreen(): JSX.Element {
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).favorites.list.query() as any).then((d: any) => { setFavs(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = (id: number) => {
    ((trpc as any).favorites.remove.mutate({ id }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>❤️ المفضلة</Text>
      <Text style={styles.sub}>خدماتكِ وفنياتكِ المفضلة</Text>
      {favs.length === 0 ? <Text style={styles.e}>لا توجد مفضلات</Text> :
        favs.map((f: any) => (
          <View key={f.id} style={styles.card}>
            <Text style={styles.favEmoji}>❤️</Text>
            <View style={{flex:1}}>
              <Text style={styles.favLabel}>{f.label as string ?? 'مفضل'}</Text>
              <Text style={styles.favMeta}>خدمة #{f.serviceId as number}{f.technicianId ? ` · فنية #${f.technicianId}` : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(f.id as number)}><Text style={styles.delBtn}>🗑️</Text></TouchableOpacity>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  favEmoji: { fontSize: 24 }, favLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  favMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  delBtn: { fontSize: 18 },
});
