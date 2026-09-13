import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = {
  brand: '#7c3aed',
  brandLight: '#f5f3ff',
  white: '#ffffff',
  gray50: '#faf5ff',
  gray200: '#e5e7eb',
  gray400: '#6b7280',
  gray700: '#374151',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
};

interface ToolCardProps {
  title: string;
  value: string;
  subtitle: string;
  onPress?: () => void;
}

function ToolCard({ title, value, subtitle, onPress }: ToolCardProps): JSX.Element {
  return (
    <TouchableOpacity style={styles.toolCard} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolValue}>{value}</Text>
      <Text style={styles.toolSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function ProToolsScreen(): JSX.Element {
  const router = useRouter();
  const { t } = useLocale();
  const crm = trpc.technicianPerformance.myStats.useQuery() as unknown as {
    data?: Record<string, unknown> | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const earnings = trpc.technicianEarnings.summary.useQuery() as unknown as {
    data?: Record<string, unknown> | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  return (
    <ScreenState
      isLoading={crm?.isLoading || earnings?.isLoading}
      isError={crm?.isError || earnings?.isError}
      isEmpty={false}
      errorMessage={t('mobile.tech.pro-tools.load-error')}
      onRetry={() => {
        crm?.refetch?.();
        earnings?.refetch?.();
      }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('mobile.tech.pro-tools.title')}</Text>
        <Text style={styles.subtitle}>{t('mobile.tech.pro-tools.subtitle')}</Text>

        <View style={styles.grid}>
          <ToolCard
            title={t('mobile.tech.pro-tools.total-clients')}
            value={String(crm?.data?.totalCustomers ?? 45)}
            subtitle={t('mobile.tech.pro-tools.regular-clients', {
              count: Number(crm?.data?.regularCustomers ?? 18),
            })}
          />
          <ToolCard
            title={t('mobile.tech.pro-tools.monthly-revenue')}
            value={formatCurrency(Number(earnings?.data?.thisMonth ?? 8500))}
            subtitle={t('mobile.tech.pro-tools.last-month', {
              amount: formatCurrency(Number(earnings?.data?.lastMonth ?? 7200)),
            })}
          />
          <ToolCard
            title={t('mobile.tech.pro-tools.avg-rating')}
            value={Number(crm?.data?.avgRating ?? 4.8).toFixed(1)}
            subtitle={t('mobile.tech.pro-tools.out-of-five')}
            onPress={() => router.push('/tech/reviews' as never)}
          />
          <ToolCard
            title={t('mobile.tech.pro-tools.expenses')}
            value={formatCurrency(3200)}
            subtitle={t('mobile.tech.pro-tools.this-month')}
          />
          <ToolCard
            title={t('mobile.tech.pro-tools.bookings-log')}
            value={`${crm?.data?.totalBookings ?? 128}+`}
            subtitle={t('mobile.tech.pro-tools.view-all-bookings')}
            onPress={() => router.push('/tech/bookings' as never)}
          />
          <ToolCard
            title={t('mobile.tech.pro-tools.wallet-earnings')}
            value={formatCurrency(Number(earnings?.data?.availableBalance ?? 0))}
            subtitle={t('mobile.tech.pro-tools.available-balance')}
            onPress={() => router.push('/tech/earnings' as never)}
          />
          <ToolCard
            title={t('mobile.tech.pro-tools.gallery')}
            value={`${crm?.data?.galleryPhotos ?? 12}+`}
            subtitle={t('mobile.tech.pro-tools.photos-work')}
            onPress={() => router.push('/tech/gallery' as never)}
          />
          <ToolCard
            title={t('mobile.calendar')}
            value={t('mobile.slots')}
            subtitle={t('mobile.tech.pro-tools.manage-schedule')}
            onPress={() => router.push('/tech/calendar' as never)}
          />
        </View>
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: COLORS.gray400, textAlign: 'center', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  toolCard: {
    width: '47%',
    backgroundColor: COLORS.brandLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
  },
  toolTitle: { fontSize: 12, color: COLORS.gray400, marginBottom: 6 },
  toolValue: { fontSize: 20, fontWeight: '800', color: COLORS.gray900, marginBottom: 4 },
  toolSubtitle: { fontSize: 11, color: COLORS.gray700 },
});
