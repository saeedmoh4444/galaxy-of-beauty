import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function WomensServicesScreen() {
  const [cats, setCats] = useState<Record<string, unknown>[]>([]);
  const [selectedCat, setSelectedCat] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.womensServices.categories.query() as any as Promise<Record<string, unknown>[]>)
      .then((data) => { setCats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchCategory = (key: string) => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.womensServices.byCategory.query({ category: key }) as any as Promise<Record<string, unknown>>)
      .then((data) => { setSelectedCat(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  if (selectedCat) {
    const services = (selectedCat.subServices as Record<string, unknown>[]) ?? [];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
        <TouchableOpacity onPress={() => setSelectedCat(null)} style={styles.backBtn}>
          <Text style={styles.backText}>← العودة للأقسام</Text>
        </TouchableOpacity>
        <View style={styles.catHeader}>
          <Text style={styles.catEmoji}>{selectedCat.emoji as string}</Text>
          <Text style={styles.catTitle}>{selectedCat.nameAr as string}</Text>
          <Text style={styles.catDesc}>{selectedCat.description as string}</Text>
        </View>
        {services.map((s: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.serviceCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{s.nameAr as string}</Text>
              <Text style={styles.serviceEN}>{s.nameEn as string}</Text>
              {(s.precautions as string) ? <Text style={styles.precautions}>⚠️ {s.precautions as string}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.servicePrice}>{s.price as number} ر.س</Text>
              <Text style={styles.serviceTime}>{s.durationMin as number} دقيقة</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.pageTitle}>🌸 خدمات نسائية</Text>
      <Text style={styles.pageSubtitle}>{cats.length} قسم — اختاري ما يناسبكِ</Text>
      <View style={styles.grid}>
        {cats.map((c: Record<string, unknown>, i: number) => (
          <TouchableOpacity key={i} style={styles.card} onPress={() => fetchCategory(c.key as string)} activeOpacity={0.8}>
            <Text style={styles.cardEmoji}>{c.emoji as string}</Text>
            <Text style={styles.cardTitle}>{c.nameAr as string}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{c.description as string}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{c.serviceCount as number} خدمات</Text></View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' },
  inner: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginTop: 8 },
  pageSubtitle: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardEmoji: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'center' },
  cardDesc: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  badge: { backgroundColor: '#fce7f3', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8, alignSelf: 'center' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#be185d' },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, color: '#be185d', fontWeight: '600' },
  catHeader: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
  catEmoji: { fontSize: 48 },
  catTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 8 },
  catDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  serviceCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, alignItems: 'center' },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  serviceEN: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 2 },
  precautions: { fontSize: 11, color: '#d97706', textAlign: 'right', marginTop: 4 },
  servicePrice: { fontSize: 16, fontWeight: '800', color: '#be185d' },
  serviceTime: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
