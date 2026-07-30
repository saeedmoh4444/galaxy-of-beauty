import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const TF_ICONS: any = { '24h':'🔴','48h':'🟡','1w':'🟢','ongoing':'🔵' };

export default function PostCareScreen() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => { setLoading(true); (trpc.postCare.myPlan.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const plans = (data?.plans ?? []) as Record<string, unknown>[];
  const timeframes = (data?.timeframes ?? []) as Record<string, unknown>[];

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>💆‍♀️ العناية بعد الخدمة</Text>
      {plans.length === 0 ? <Text style={styles.empty}>لا توجد خدمات مكتملة بعد</Text> :
        plans.map((p: Record<string, unknown>, i: number) => (
          <View key={i}>
            <Text style={styles.serviceName}>{p.serviceName as string}</Text>
            {timeframes.map((tf: Record<string, unknown>) => {
              const tips = ((p.tips || []) as Record<string, unknown>[]).filter((t: Record<string, unknown>) => t.timeframe === tf.key);
              if (tips.length === 0) return null;
              return (
                <View key={tf.key as string} style={styles.tfCard}>
                  <Text style={styles.tfTitle}>{(TF_ICONS[tf.key as string] || '⏰')} {tf.labelAr as string}</Text>
                  {tips.map((t: Record<string, unknown>, j: number) => (
                    <View key={j} style={styles.tip}><Text style={styles.tipEmoji}>{t.emoji as string}</Text><View style={{flex:1}}><Text style={styles.tipTitle}>{t.titleAr as string}</Text><Text style={styles.tipBody}>{t.bodyAr as string}</Text></View></View>
                  ))}
                </View>
              );
            })}
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' },
  inner: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginBottom: 20 },
  empty: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  serviceName: { fontSize: 17, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 8 },
  tfCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  tfTitle: { fontSize: 13, fontWeight: '700', color: '#be185d', marginBottom: 8 },
  tip: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'flex-start' },
  tipEmoji: { fontSize: 20, marginTop: 2 },
  tipTitle: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'right' },
  tipBody: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 2, lineHeight: 18 },
});
