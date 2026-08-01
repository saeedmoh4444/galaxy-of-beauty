import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function SubscriptionsScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => (trpc.subscriptions as any).getMySubscription.query({}));
  const { data: plans } = useQuery(() => (trpc.subscriptions as any).getPlans.query({}));

  if (loading) return <View style={styles.container}><Text style={styles.title}>الاشتراكات</Text><SkeletonList count={4} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل الاشتراكات" onRetry={refetch} />;

  const handleCancel = async () => {
    await (trpc.subscriptions.cancelAutoRenew as any).mutate({});
    refetch();
  };

  const subData = data as Record<string, unknown> | null;
  const plansList = (plans ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
      <Text style={styles.title}>الاشتراكات</Text>
      {subData ? (
        <View style={styles.currentPlan}>
          <Text style={styles.currentLabel}>اشتراكي الحالي</Text>
          <Text style={styles.planName}>{subData.planName as string ?? 'غير مشترك'}</Text>
          <Text style={styles.planStatus}>{Boolean(subData.autoRenew) ? 'تجديد تلقائي' : 'بدون تجديد'}</Text>
          {Boolean(subData.autoRenew) && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>إلغاء التجديد التلقائي</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>💎</Text>
          <Text style={styles.empty}>لا يوجد اشتراك نشط</Text>
          <Text style={styles.hint}>اشتركي في إحدى الخطط للاستفادة من ميزات الذكاء الاصطناعي</Text>
        </View>
      )}
      <Text style={styles.sectionTitle}>الخطط المتاحة</Text>
      {plansList.length === 0 ? <Text style={styles.noData}>لا توجد خطط متاحة حالياً</Text> :
        plansList.map((p: Record<string, unknown>) => (
          <View key={p.id as number} style={styles.planCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>{p.nameAr as string ?? p.nameEn as string}</Text>
              <Text style={styles.planDesc}>{p.descriptionAr as string ?? ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.planPrice}>{Number(p.price ?? 0).toFixed(0)} ر.س</Text>
              <TouchableOpacity style={styles.subscribeBtn}><Text style={styles.subscribeText}>اشتراك</Text></TouchableOpacity>
            </View>
          </View>
        ))}
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
