import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function PersonalizedFeedScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).personalizedFeed.feed.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  const items = (data?.items ?? []) as any[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎯 خلاصتي</Text>
      <Text style={styles.sub}>محتوى مخصص لكِ بناءً على اهتماماتكِ</Text>
      {items.length === 0 ? <Text style={styles.e}>لا يوجد محتوى</Text> :
        items.map((item: any) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.itemEmoji}>{item.emoji as string}</Text>
            <View style={{flex:1}}>
              <Text style={styles.itemTitle}>{item.title as string}</Text>
              <Text style={styles.itemMeta}>
                {item.technician ? `👩‍🎨 ${item.technician}` : item.brand ? `🏷️ ${item.brand}` : `💰 ${item.price as number} ر.س`}
              </Text>
            </View>
            <View style={styles.relevanceBadge}><Text style={styles.relevanceText}>{item.relevance as number}%</Text></View>
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
  itemEmoji: { fontSize: 30 }, itemTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  relevanceBadge: { backgroundColor: '#fdf2f8', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  relevanceText: { fontSize: 11, fontWeight: '700', color: '#db2777' },
});
