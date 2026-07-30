import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function RecommendationsScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    ((trpc as any).services.list.query({}) as any).then((d: any) => { setServices(d?.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const getRelated = (serviceId: number) => {
    setSelectedId(serviceId);
    setRelatedLoading(true);
    ((trpc as any).recommendations.frequentlyBookedTogether.query({ serviceId }) as any)
      .then((d: any) => { setRelated(d || []); setRelatedLoading(false); })
      .catch(() => setRelatedLoading(false));
  };

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💡 توصيات ذكية</Text>
      <Text style={styles.sub}>خدمات تُحجز معاً عادةً</Text>

      <Text style={styles.sectionTitle}>💆‍♀️ اختاري خدمة</Text>
      {services.slice(0, 10).map((s: any) => (
        <TouchableOpacity key={s.id} onPress={() => getRelated(s.id as number)} style={[styles.svcCard, selectedId === s.id && styles.svcCardActive]}>
          <Text style={styles.svcEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
          <Text style={styles.svcName}>{(s.titleJson as any)?.ar as string ?? s.nameAr as string}</Text>
        </TouchableOpacity>
      ))}

      {relatedLoading && <ActivityIndicator color="#ec4899" style={{ marginTop: 20 }} size="large" />}

      {related.length > 0 && !relatedLoading && (
        <>
          <Text style={styles.sectionTitle}>🔗 غالباً تُحجز مع:</Text>
          {related.map((r: any) => (
            <View key={r.id} style={styles.card}>
              <Text style={styles.relEmoji}>🔗</Text>
              <View style={{flex:1}}>
                <Text style={styles.relName}>{r.title as string}</Text>
                <Text style={styles.relMeta}>{(r.basePrice as number)?.toLocaleString()} ر.س · ⏱️ {r.durationMin as number} دقيقة</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{r.bookedTogether as number}x</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  svcCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 2, borderColor: '#e5e7eb' },
  svcCardActive: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  svcEmoji: { fontSize: 26 }, svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  relEmoji: { fontSize: 24 }, relName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  relMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  countBadge: { backgroundColor: '#fdf2f8', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { fontSize: 12, fontWeight: '700', color: '#db2777' },
});
