import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TutorialsScreen(): JSX.Element {
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).tutorials.list.query() as any).then((d: any) => { setTutorials(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📹 دروس الجمال</Text>
      <Text style={styles.sub}>تعلمي أساسيات العناية والتجميل</Text>
      {tutorials.length === 0 ? <Text style={styles.e}>لا توجد دروس</Text> :
        tutorials.map((t: any) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.tutorialEmoji}>{t.emoji as string ?? '📹'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.tutorialTitle}>{t.titleAr as string}</Text>
              <Text style={styles.tutorialMeta}>{t.categoryAr as string} · {t.difficultyAr as string} · ⏱️ {t.duration as string}</Text>
              <Text style={styles.tutorialDesc}>{(t.descAr as string)?.substring(0, 80)}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.watchCount}>👁 {t.views as number}</Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  tutorialEmoji: { fontSize: 32 }, tutorialTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  tutorialMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  tutorialDesc: { fontSize: 12, color: '#9ca3af', marginTop: 4, lineHeight: 18 },
  watchCount: { fontSize: 11, color: '#9ca3af' },
});
