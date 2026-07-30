import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CorporateWellnessScreen() {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.corporateWellness.plans.query() as any).then((d: any) => { setPlans(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🏢 برنامج الشركات</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {plans.map((p: Record<string, unknown>, i: number) => (
          <TouchableOpacity key={i} style={styles.card} activeOpacity={0.8}>
            <Text style={styles.cardEmoji}>{p.emoji as string}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{p.nameAr as string}</Text>
              <Text style={styles.price}>{p.price as number} ر.س / شهرياً</Text>
              <Text style={styles.employees}>حتى {p.employees as number} موظفة</Text>
              {(p.services as string[]).map((s: string) => <Text key={s} style={styles.service}>✓ {s}</Text>)}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#dbeafe', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#2563eb', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, alignItems: 'center' },
  cardEmoji: { fontSize: 40 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right' },
  price: { fontSize: 18, fontWeight: '800', color: '#2563eb', textAlign: 'right', marginTop: 4 },
  employees: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  service: { fontSize: 12, color: '#059669', textAlign: 'right', marginTop: 2 },
});
