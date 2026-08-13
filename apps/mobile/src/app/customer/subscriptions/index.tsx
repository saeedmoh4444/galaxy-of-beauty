import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc, typedTrpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

interface SubscriptionPlan {
  nameJson?: { ar?: string; en?: string };
  priceMonthly?: number;
}

interface SubscriptionDetail {
  plan?: SubscriptionPlan;
  status?: string;
  currentPeriodEnd?: string;
}

interface SubscriptionQueryResult {
  data?: SubscriptionDetail | null;
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
}

interface PlansQueryResult {
  data?: SubscriptionPlan[] | null;
}

export default function SubscriptionsScreen(): JSX.Element {
  const sub: SubscriptionQueryResult =
    (typedTrpc().subscriptions.getMySubscription?.useQuery?.({}) as SubscriptionQueryResult | undefined) ?? {
      data: null,
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  const plansQ: PlansQueryResult =
    (typedTrpc().subscriptions.getPlans?.useQuery?.({}) as PlansQueryResult | undefined) ?? { data: null };

  const subscription = sub.data ?? undefined;
  const plans = plansQ.data ?? [];

  return (
    <ScreenState
      isLoading={sub.isLoading ?? false}
      isError={sub.isError ?? false}
      isEmpty={false}
      errorMessage="فشل تحميل الاشتراكات"
      onRetry={() => sub.refetch?.()}
    >
      <Text style={styles.title}> اشتراكاتي</Text>
      {subscription ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeLabel}>الاشتراك الحالي</Text>
          <Text style={styles.planName}>{subscription.plan?.nameJson?.ar ?? 'خطة'}</Text>
          <Text style={styles.status}>
            {subscription.status === 'ACTIVE' ? ' نشط' : ' متوقف'}
          </Text>
          <Text style={styles.date}>
            ينتهي: {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ar-SA') : ''}
          </Text>
        </View>
      ) : (
        <View style={styles.activeCard}>
          <Text style={styles.activeLabel}>لا يوجد اشتراك نشط</Text>
        </View>
      )}
      {plans && plans.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>الباقات المتاحة</Text>
          {plans.map((p, i) => (
            <View key={i} style={styles.planCard}>
              <Text style={styles.planTitle}>{p.nameJson?.ar ?? ''}</Text>
              <Text style={styles.planPrice}>{formatCurrency(Number(p.priceMonthly))} / شهر</Text>
              <TouchableOpacity style={styles.subscribeBtn}>
                <Text style={styles.subscribeText}>اشتركي الآن</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  activeCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  activeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  planName: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  status: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, marginBottom: 12 },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planTitle: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  planPrice: { fontSize: 16, fontWeight: '800', color: COLORS.brand, marginTop: 4 },
  subscribeBtn: {
    marginTop: 12,
    backgroundColor: COLORS.brand,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  subscribeText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
});
