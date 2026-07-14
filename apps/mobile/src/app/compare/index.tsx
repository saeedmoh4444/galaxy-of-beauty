import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CompareScreen() {
  const { ids: idsParam } = useLocalSearchParams<{ ids: string }>();
  const ids = (idsParam || '')
    .split(',')
    .map(Number)
    .filter((n) => n > 0);

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (trpc.services.compare.query({ ids }) as unknown as Promise<Record<string, unknown>>)
      .then((d) => {
        setServices((d.services as Record<string, unknown>[]) || []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [idsParam]);

  if (ids.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>⚖️</Text>
        <Text style={styles.emptyTitle}>اختر خدمتين أو أكثر</Text>
        <Text style={styles.emptySub}>يمكنك مقارنة خدمتين إلى ثلاث خدمات</Text>
      </View>
    );
  }

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;
  if (error || services.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>❌</Text>
        <Text style={styles.emptyTitle}>فشل التحميل</Text>
      </View>
    );
  }

  const bestValue = [...services].sort(
    (a, b) =>
      (a.basePrice as number) / ((a.durationMin as number) || 1) -
      (b.basePrice as number) / ((b.durationMin as number) || 1),
  )[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>مقارنة الخدمات</Text>

      {/* Service headers */}
      <View style={styles.headerRow}>
        <View style={styles.labelCell} />
        {services.map((s) => (
          <View key={s.id as number} style={styles.serviceCell}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceEmoji}>💄</Text>
            </View>
            <Text style={styles.serviceName} numberOfLines={2}>
              {((s.titleJson as Record<string, string>)?.ar) || ''}
            </Text>
          </View>
        ))}
      </View>

      {/* Price */}
      <View style={styles.row}>
        <Text style={styles.label}>السعر</Text>
        {services.map((s) => (
          <Text key={s.id as number} style={styles.valueBold}>
            {Number(s.basePrice).toFixed(0)} ر.س
          </Text>
        ))}
      </View>

      {/* Duration */}
      <View style={styles.row}>
        <Text style={styles.label}>المدة</Text>
        {services.map((s) => (
          <Text key={s.id as number} style={styles.value}>
            {s.durationMin as number} دقيقة
          </Text>
        ))}
      </View>

      {/* Category */}
      <View style={styles.row}>
        <Text style={styles.label}>القسم</Text>
        {services.map((s) => (
          <Text key={s.id as number} style={styles.value}>
            {s.category as string}
          </Text>
        ))}
      </View>

      {/* Bookings */}
      <View style={styles.row}>
        <Text style={styles.label}>الحجوزات</Text>
        {services.map((s) => (
          <Text key={s.id as number} style={styles.value}>
            {s.bookingCount as number}
          </Text>
        ))}
      </View>

      {/* Tags */}
      <View style={styles.row}>
        <Text style={styles.label}>الوسوم</Text>
        {services.map((s) => (
          <View key={s.id as number} style={styles.tagCell}>
            {((s.tags as string[]) || []).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Variants */}
      <View style={styles.row}>
        <Text style={styles.label}>المتغيرات</Text>
        {services.map((s) => (
          <View key={s.id as number} style={styles.tagCell}>
            {((s.variants as Array<Record<string, unknown>>) || []).map((v, i) => (
              <Text key={i} style={styles.variantText}>
                {((v.nameJson as Record<string, string>)?.ar) || ''}
                {Number(v.priceDelta) > 0 ? ` (+${Number(v.priceDelta).toFixed(0)})` : ''}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {/* Best value */}
      {bestValue && (
        <View style={styles.bestValue}>
          <Text style={styles.bestText}>
            💡 الأفضل قيمة: {((bestValue.titleJson as Record<string, string>)?.ar) || ''}
          </Text>
          <Text style={styles.bestSub}>الأقل سعراً للدقيقة</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 20 },
  headerRow: { flexDirection: 'row', marginBottom: 16 },
  labelCell: { width: 80 },
  serviceCell: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  serviceIcon: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#f5f3ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  serviceEmoji: { fontSize: 22 },
  serviceName: { fontSize: 12, fontWeight: '700', color: '#111827', textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  label: { width: 80, fontSize: 13, fontWeight: '600', color: '#6b7280', textAlign: 'right', paddingRight: 8 },
  value: { flex: 1, fontSize: 13, color: '#374151', textAlign: 'center' },
  valueBold: { flex: 1, fontSize: 15, fontWeight: '700', color: '#7c3aed', textAlign: 'center' },
  tagCell: { flex: 1, alignItems: 'center' },
  tag: {
    backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, marginBottom: 3,
  },
  tagText: { fontSize: 11, color: '#7c3aed' },
  variantText: { fontSize: 11, color: '#9ca3af', marginBottom: 2, textAlign: 'center' },
  bestValue: {
    marginTop: 20, backgroundColor: '#faf5ff', borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e9d5ff',
  },
  bestText: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  bestSub: { fontSize: 12, color: '#a78bfa', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
  emptySub: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
});
