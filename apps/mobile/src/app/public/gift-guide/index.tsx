import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function GiftGuideScreen(): JSX.Element {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).giftGuide.list.query() as any).then((d: any) => { setGuides(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎁 دليل الهدايا</Text>
      <Text style={styles.sub}>أفكار هدايا لكل المناسبات</Text>
      {guides.length === 0 ? <Text style={styles.e}>لا توجد أدلة</Text> :
        guides.map((g: any) => (
          <View key={g.id} style={styles.card}>
            <Text style={styles.guideEmoji}>{g.emoji as string ?? '🎁'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.guideTitle}>{g.titleAr as string}</Text>
              <Text style={styles.guideOccasion}>{g.occasionAr as string}</Text>
              <Text style={styles.guidePrice}>من {(g.priceRange as string) ?? (g.minPrice as number)?.toLocaleString() + ' ر.س'}</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn}><Text style={styles.viewBtnText}>عرض</Text></TouchableOpacity>
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
  guideEmoji: { fontSize: 32 }, guideTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  guideOccasion: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  guidePrice: { fontSize: 13, fontWeight: '700', color: '#db2777', marginTop: 4 },
  viewBtn: { backgroundColor: '#db2777', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  viewBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
