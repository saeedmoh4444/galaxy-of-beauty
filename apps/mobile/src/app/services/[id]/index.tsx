import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc as any).services.getById.query({ id: Number(id) })
      .then((d: unknown) => { setData(d as Record<string, unknown>); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />;
  if (!data) return <Text style={styles.error}>لم يتم العثور على الخدمة</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero} />
      <Text style={styles.title}>{(data.titleJson as Record<string, string>)?.ar ?? ''}</Text>
      {(data.descriptionJson as Record<string, string>)?.ar ? <Text style={styles.desc}>{(data.descriptionJson as Record<string, string>).ar}</Text> : null}
      <View style={styles.row}>
        <View style={styles.stat}><Text style={styles.statLabel}>السعر</Text><Text style={styles.statValue}>{data.basePrice as number} ر.س</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>المدة</Text><Text style={styles.statValue}>{data.durationMin as number} دقيقة</Text></View>
      </View>
      <Text style={styles.sectionTitle}>الفنيات المتاحات</Text>
      {((data.technicianServices as Record<string, unknown>[]) ?? []).map((ts: Record<string, unknown>, i: number) => {
        const tech = (ts.technician as Record<string, unknown>) ?? {};
        return (
          <View key={i} style={styles.techCard}>
            <Text style={styles.techName}>{(tech.user as Record<string, string>)?.name ?? ''}</Text>
            <Text style={styles.techCity}>{tech.city as string} ⭐ {Number(tech.ratingAvg ?? 0).toFixed(1)}</Text>
          </View>
        );
      })}
      {((data.technicianServices as unknown[]) ?? []).length === 0 && <Text style={styles.empty}>لا توجد فنيات متاحة حالياً</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { height: 200, backgroundColor: '#ede9fe' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', padding: 16, paddingBottom: 4 },
  desc: { fontSize: 14, color: '#6b7280', paddingHorizontal: 16, marginBottom: 8 },
  row: { flexDirection: 'row', padding: 16, gap: 16 },
  stat: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#7c3aed', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', padding: 16, paddingBottom: 8 },
  techCard: { padding: 12, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  techName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  techCity: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  error: { textAlign: 'center', color: '#ef4444', marginTop: 40, fontSize: 16 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
});
