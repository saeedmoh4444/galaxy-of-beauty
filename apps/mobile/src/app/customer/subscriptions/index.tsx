import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SubscriptionsScreen() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    Promise.all([
      (trpc.subscriptions.getMySubscription as any).query({} as never),
      (trpc.subscriptions.getPlans as any).query({} as never),
    ])
      .then(([sub, p]: [Record<string, unknown>, Record<string, unknown>[]]) => {
        setData(sub);
        setPlans(p ?? []);
        setLoading(false);
      })
      .catch(() => { setError('فشل تحميل الاشتراكات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleCancel = async () => {
    try { await (trpc.subscriptions.cancelAutoRenew as any).mutate({}); fetch(); } catch {}
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>الاشتراكات</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : (
        <View>
          {data ? (
            <View style={styles.currentPlan}>
              <Text style={styles.currentLabel}>اشتراكي الحالي</Text>
              <Text style={styles.planName}>{data.planName as string ?? 'غير مشترك'}</Text>
              <Text style={styles.planStatus}>{Boolean(data?.autoRenew) ? 'تجديد تلقائي' : 'بدون تجديد'}</Text>
              {Boolean(data.autoRenew) && (
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelText}>إلغاء التجديد التلقائي</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>💎</Text>
              <Text style={styles.empty}>لا يوجد اشتراك نشط</Text>
              <Text style={styles.hint}>اشتركي في إحدى خطط لايلى للاستفادة من ميزات الذكاء الاصطناعي</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>الخطط المتاحة</Text>
          {plans.length === 0 ? (
            <Text style={styles.noData}>لا توجد خطط متاحة حالياً</Text>
          ) : (
            plans.map((p: Record<string, unknown>) => (
              <View key={p.id as number} style={styles.planCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>{p.nameAr as string ?? p.nameEn as string}</Text>
                  <Text style={styles.planDesc}>{p.descriptionAr as string ?? ''}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.planPrice}>{Number(p.price ?? 0).toFixed(0)} ر.س</Text>
                  <TouchableOpacity style={styles.subscribeBtn}>
                    <Text style={styles.subscribeText}>اشتراك</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  centered: { alignItems: 'center', marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center', paddingHorizontal: 24 },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  currentPlan: { backgroundColor: '#f5f3ff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24 },
  currentLabel: { fontSize: 13, color: '#7c3aed' },
  planName: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 4 },
  planStatus: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  cancelBtn: { marginTop: 12, borderWidth: 1, borderColor: '#ef4444', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  cancelText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  noData: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  planCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  planTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  planDesc: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  planPrice: { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  subscribeBtn: { backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 },
  subscribeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
