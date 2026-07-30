import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function TechOnboardingScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).techOnboarding.steps.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const submitDoc = (stepKey: string) => {
    ((trpc as any).techOnboarding.submitDoc.mutate({ stepKey, url: 'document-url' }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  const steps = (data?.steps ?? []) as any[];
  const completed = (data?.completed as number) ?? 0;
  const total = (data?.total as number) ?? 5;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📋 التسجيل كفنية</Text>
      <Text style={styles.sub}>أكملي الخطوات لتصبحي فنية معتمدة</Text>
      <View style={styles.progressCard}>
        <Text style={styles.progressEmoji}>📊</Text>
        <Text style={styles.progressText}>{completed}/{total} مكتملة</Text>
        <View style={styles.progressBar}><View style={[styles.progressFill, {width: `${(completed/total)*100}%`}]} /></View>
      </View>
      {steps.length === 0 ? <Text style={styles.e}>لا توجد خطوات</Text> :
        steps.map((s: any, i: number) => (
          <View key={s.key ?? i} style={[styles.step, s.completed && styles.stepDone]}>
            <Text style={styles.stepEmoji}>{s.completed ? '✅' : '⭕'}</Text>
            <View style={{flex:1}}>
              <Text style={[styles.stepTitle, s.completed && styles.stepTitleDone]}>{s.titleAr as string}</Text>
              <Text style={styles.stepDesc}>{s.descAr as string}</Text>
            </View>
            {!s.completed && (
              <TouchableOpacity onPress={() => submitDoc(s.key as string)} style={styles.uploadBtn}>
                <Text style={styles.uploadBtnText}>رفع</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  progressCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  progressEmoji: { fontSize: 40 }, progressText: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  progressBar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, width: '100%', marginTop: 12 },
  progressFill: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  stepDone: { opacity: 0.6 },
  stepEmoji: { fontSize: 24 }, stepTitle: { fontSize: 14, fontWeight: '600', color: '#111827' }, stepTitleDone: { textDecorationLine: 'line-through' },
  stepDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  uploadBtn: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  uploadBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
