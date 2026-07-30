import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const STEPS = [
  { key: 'consultation', emoji: '💬', title: 'استشارة', desc: 'تحديد احتياجات العروس' },
  { key: 'trial', emoji: '🧪', title: 'تجربة', desc: 'تجربة المكياج والتسريحة' },
  { key: 'final', emoji: '👰', title: 'اليوم الكبير', desc: 'يوم الزفاف' },
];

export default function BridalConciergeScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).bridalConcierge.dashboard.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>👰 كونسيرج العروس</Text>
      <Text style={styles.sub}>خططي ليوم زفافك المثالي</Text>
      <View style={styles.progressCard}>
        <Text style={styles.progressEmoji}>💍</Text>
        <Text style={styles.progressTitle}>تقدم التحضيرات</Text>
        <View style={styles.progressBar}><View style={[styles.progressFill, {width: `${data?.completionPercent as number ?? 0}%`}]} /></View>
        <Text style={styles.progressPct}>{data?.completionPercent as number ?? 0}%</Text>
      </View>
      {STEPS.map((step) => {
        const stepData = data?.steps?.[step.key] as any;
        return (
          <View key={step.key} style={[styles.step, stepData?.completed && styles.stepDone]}>
            <Text style={styles.stepEmoji}>{step.emoji}</Text>
            <View style={{flex:1}}>
              <Text style={[styles.stepTitle, stepData?.completed && styles.stepTitleDone]}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
              {stepData?.date && <Text style={styles.stepDate}>📅 {new Date(stepData.date as string).toLocaleDateString('ar-SA')}</Text>}
            </View>
            <Text style={styles.stepStatus}>{stepData?.completed ? '✅' : '⏳'}</Text>
          </View>
        );
      })}
      {data?.weddingDate && (
        <View style={styles.countdown}>
          <Text style={styles.countdownEmoji}>⏳</Text>
          <Text style={styles.countdownText}>الأيام المتبقية: {data.daysUntil as number}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  progressCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#fbcfe8' },
  progressEmoji: { fontSize: 40 }, progressTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  progressBar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, width: '100%', marginTop: 12 },
  progressFill: { height: 8, backgroundColor: '#db2777', borderRadius: 4 },
  progressPct: { fontSize: 14, fontWeight: '700', color: '#db2777', marginTop: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  stepDone: { borderWidth: 2, borderColor: '#86efac' },
  stepEmoji: { fontSize: 30 }, stepTitle: { fontSize: 14, fontWeight: '600', color: '#111827' }, stepTitleDone: { color: '#059669' },
  stepDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 }, stepDate: { fontSize: 11, color: '#db2777', marginTop: 2 },
  stepStatus: { fontSize: 20 },
  countdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 8 },
  countdownEmoji: { fontSize: 24 }, countdownText: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
