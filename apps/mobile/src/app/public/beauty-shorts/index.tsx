import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function BeautyShortsScreen(): JSX.Element {
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    ((trpc as any).beautyShorts.list.query() as any).then((d: any) => { setShorts(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📹 فيديوهات قصيرة</Text>
      <Text style={styles.sub}>أحدث فيديوهات التجميل القصيرة</Text>
      {shorts.length === 0 ? <Text style={styles.e}>لا توجد فيديوهات</Text> :
        shorts.map((s: any, i: number) => (
          <TouchableOpacity key={s.id ?? i} onPress={() => setActive(i)} style={[styles.card, i === active && styles.cardActive]}>
            <Text style={styles.shortEmoji}>{s.emoji as string ?? '🎬'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.shortTitle}>{s.titleAr as string ?? s.title as string}</Text>
              <Text style={styles.shortMeta}>{s.creator as string} · {s.duration as string} · 👁 {s.views as number}</Text>
            </View>
            <Text style={styles.playBtn}>▶️</Text>
          </TouchableOpacity>
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
  cardActive: { borderWidth: 2, borderColor: '#db2777' },
  shortEmoji: { fontSize: 32 }, shortTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  shortMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  playBtn: { fontSize: 24 },
});
