import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SurpriseMeScreen() {
  const router = useRouter();
  const [service, setService] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budget, setBudget] = useState<number | undefined>(undefined);

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.services.surpriseMe as any).query({ budget, categoryId: undefined })
      .then((d: Record<string, unknown> | null) => { setService(d); setLoading(false); })
      .catch(() => { setError('فشل تحميل التوصيات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, [budget]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>✨</Text>
        <Text style={styles.heroTitle}>فاجئيني!</Text>
        <Text style={styles.heroSub}>اختيار مميز لك من لايلى</Text>
      </View>

      <View style={styles.budgetRow}>
        {[undefined, 100, 200, 500].map((b) => (
          <TouchableOpacity key={String(b)} style={[styles.budgetBtn, budget === b && styles.budgetActive]} onPress={() => setBudget(b)}>
            <Text style={[styles.budgetText, budget === b && { color: '#fff' }]}>{b ? `حتى ${b} ر.س` : 'الكل'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>جرب مرة أخرى</Text></TouchableOpacity>
        </View>
       ) : !service ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.empty}>لا توجد خدمات متاحة</Text>
          <Text style={styles.hint}>جرب ميزانية مختلفة</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>جرب مرة أخرى</Text></TouchableOpacity>
        </View>
       ) : (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/services/${service.id}`)}>
          <View style={styles.cardImage}>
            <Text style={styles.cardEmoji}>💆‍♀️</Text>
          </View>
          <Text style={styles.serviceTitle}>{((service.titleJson as Record<string, string>)?.ar ?? '')}</Text>
          <Text style={styles.serviceDesc}>{((service.descriptionJson as Record<string, string>)?.ar ?? '').slice(0, 100)}</Text>
          <View style={styles.serviceMeta}>
            <Text style={styles.price}>{Number(service.basePrice ?? 0).toFixed(0)} ر.س</Text>
            <Text style={styles.duration}>{String(service.durationMin ?? 0)} دقيقة</Text>
          </View>
          {Boolean(service.isPopular) ? <View style={styles.popularBadge}><Text style={styles.popularText}>⭐ مشهور</Text></View> : null}
          <TouchableOpacity style={styles.cta} onPress={() => router.push(`/services/${service.id}`)}>
            <Text style={styles.ctaText}>عرض التفاصيل</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { backgroundColor: '#7c3aed', padding: 32, alignItems: 'center' },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 16, color: '#ede9fe', marginTop: 8 },
  budgetRow: { flexDirection: 'row', padding: 16, gap: 8, justifyContent: 'center' },
  budgetBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f3f4f6' },
  budgetActive: { backgroundColor: '#7c3aed' },
  budgetText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  card: { margin: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  cardImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardEmoji: { fontSize: 32 },
  serviceTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center' },
  serviceDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 },
  serviceMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  price: { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  duration: { fontSize: 14, color: '#6b7280' },
  popularBadge: { backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  popularText: { fontSize: 13, color: '#d97706', fontWeight: '600' },
  cta: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16, width: '100%' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centered: { alignItems: 'center', marginTop: 40, padding: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
