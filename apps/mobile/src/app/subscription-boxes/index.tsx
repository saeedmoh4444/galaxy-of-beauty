import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SubscriptionBoxesScreen() {
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [subscribed, setSubscribed] = useState<Set<number>>(new Set());

  useEffect(() => {
    (trpc.subscriptionBoxes.plans.query() as unknown as Promise<Record<string, unknown>[]>)
      .then((d) => { setPlans(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: number) => {
    setSubscribing(planId);
    try {
      await (trpc.subscriptionBoxes.subscribe.mutate({ planId }) as unknown as Promise<unknown>);
      setSubscribed((s) => new Set(s).add(planId));
    } catch {
      Alert.alert('خطأ', 'فشل الاشتراك. قد تكون مشتركاً بالفعل.');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  const intervalLabel = (i: string) => i === 'MONTHLY' ? 'شهرياً' : i === 'WEEKLY' ? 'أسبوعياً' : 'كل أسبوعين';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>📦 صناديق التجميل الشهرية</Text>
      <Text style={styles.subtitle}>اشتركي في باقة شهرية واحصلي على خدمات تجميل منتظمة بأسعار مخفضة</Text>

      {plans.map((plan) => (
        <View key={plan.id as number} style={styles.card}>
          {(plan.discountPercent as number) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{plan.discountPercent as number}% خصم</Text>
            </View>
          )}
          <View style={styles.cardHeader}>
            <Text style={styles.planIcon}>
              {((plan.nameJson as Record<string, string>)?.ar || '').includes('ذهبية') ? '🥇' :
               ((plan.nameJson as Record<string, string>)?.ar || '').includes('فضية') ? '🥈' : '🥉'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{((plan.nameJson as Record<string, string>)?.ar) || ''}</Text>
              <Text style={styles.planDesc}>{((plan.descriptionJson as Record<string, string>)?.ar) || ''}</Text>
            </View>
          </View>
          <View style={styles.planMeta}>
            <Text style={styles.planMetaText}>🗓 {plan.servicesPerMonth as number} حجز / شهر</Text>
            <Text style={styles.planMetaText}>📅 {intervalLabel(plan.interval as string)}</Text>
          </View>
          <View style={styles.planFooter}>
            <Text style={styles.price}>{Number(plan.price).toFixed(0)} ر.س<Text style={styles.priceUnit}> / {intervalLabel(plan.interval as string)}</Text></Text>
            {subscribed.has(plan.id as number) ? (
              <Text style={styles.subscribedText}>✅ تم الاشتراك</Text>
            ) : (
              <TouchableOpacity
                style={styles.subscribeBtn}
                onPress={() => handleSubscribe(plan.id as number)}
                disabled={subscribing === plan.id}
                activeOpacity={0.8}
              >
                {subscribing === plan.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.subscribeText}>اشتركي الآن</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <View style={styles.howItWorks}>
        <Text style={styles.howTitle}>كيف تعمل؟</Text>
        {[
          { e: '1️⃣', t: 'اختاري باقتك', d: 'اختاري الباقة المناسبة لميزانيتك' },
          { e: '2️⃣', t: 'احجزي خدماتك', d: 'احجزي خدماتك الشهرية من القائمة' },
          { e: '3️⃣', t: 'استمتعي', d: 'استمتعي بخدمات التجميل بأسعار مخفضة' },
        ].map((s, i) => (
          <View key={i} style={styles.step}>
            <Text style={styles.stepEmoji}>{s.e}</Text>
            <View>
              <Text style={styles.stepTitle}>{s.t}</Text>
              <Text style={styles.stepDesc}>{s.d}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'right', marginBottom: 24 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 16, marginBottom: 14, position: 'relative' },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#dc2626' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  planIcon: { fontSize: 32 },
  planName: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right' },
  planDesc: { fontSize: 13, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  planMeta: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  planMetaText: { fontSize: 12, color: '#9ca3af' },
  planFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  price: { fontSize: 22, fontWeight: '800', color: '#7c3aed' },
  priceUnit: { fontSize: 12, fontWeight: '400', color: '#9ca3af' },
  subscribeBtn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  subscribeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  subscribedText: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  howItWorks: { marginTop: 24, backgroundColor: '#f9fafb', borderRadius: 14, padding: 20 },
  howTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  stepEmoji: { fontSize: 24 },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'right' },
  stepDesc: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 2 },
});
