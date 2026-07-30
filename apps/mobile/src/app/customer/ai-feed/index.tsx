import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AIFeedScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).aiFeatures.personalizedFeed.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  const recommendations = (data?.recommendations ?? []) as any[];
  const wishlistItems = (data?.wishlistItems ?? []) as any[];
  const skinProfile = data?.skinProfile as any;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🤖 خلاصتي الذكية</Text>
      <Text style={styles.sub}>{data?.message as string ?? 'محتويات مخصصة لكِ'}</Text>

      {skinProfile && (
        <View style={styles.skinCard}>
          <Text style={styles.skinTitle}>🧬 ملف بشرتكِ</Text>
          <Text style={styles.skinType}>نوع البشرة: {skinProfile.skinType as string}</Text>
          {skinProfile.concerns && <Text style={styles.skinConcerns}>الاهتمامات: {(skinProfile.concerns as string[]).join(' · ')}</Text>}
        </View>
      )}

      {recommendations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>💫 موصى به لكِ</Text>
          {recommendations.map((r: any) => (
            <View key={r.id} style={styles.card}>
              <Text style={styles.cardEmoji}>✨</Text>
              <View style={{flex:1}}>
                <Text style={styles.cardTitle}>{(r.titleJson as any)?.ar as string ?? r.nameAr as string}</Text>
                <Text style={styles.cardMeta}>{(r.basePrice as number)?.toLocaleString()} ر.س</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {wishlistItems.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>❤️ من قائمة أمنياتكِ</Text>
          {wishlistItems.map((w: any) => (
            <View key={w.id} style={styles.card}>
              <Text style={styles.cardEmoji}>❤️</Text>
              <View style={{flex:1}}>
                <Text style={styles.cardTitle}>{(w.titleJson as any)?.ar as string ?? w.nameAr as string}</Text>
                <Text style={styles.cardMeta}>{(w.basePrice as number)?.toLocaleString()} ر.س</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  skinCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: '#c4b5fd' },
  skinTitle: { fontSize: 16, fontWeight: '700', color: '#7c3aed', marginBottom: 8 },
  skinType: { fontSize: 14, color: '#374151' }, skinConcerns: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  cardEmoji: { fontSize: 28 }, cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
