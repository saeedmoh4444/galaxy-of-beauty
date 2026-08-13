import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc, typedTrpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

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
  const crm = typedTrpc().technicians?.myStats?.useQuery?.();
  const earnings = typedTrpc().technicianEarnings?.summary?.useQuery?.();

  return (
    <ScreenState
      isLoading={crm?.isLoading || earnings?.isLoading}
      isError={crm?.isError || earnings?.isError}
      isEmpty={false}
      errorMessage="فشل تحميل الأدوات"
      onRetry={() => { crm?.refetch?.(); earnings?.refetch?.(); }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>أدوات المحترفات</Text>
        <Text style={styles.subtitle}>أدوات احترافية لإدارة أعمالكِ</Text>

        <View style={styles.grid}>
          <ToolCard
            title="إجمالي العملاء"
            value={String(crm?.data?.totalCustomers ?? 45)}
            subtitle={`${crm?.data?.regularCustomers ?? 18} عميلات دائمات`}
          />
          <ToolCard
            title="الإيرادات الشهرية"
            value={formatCurrency(Number(earnings?.data?.thisMonth ?? 8500))}
            subtitle={`الشهر الماضي: ${formatCurrency(Number(earnings?.data?.lastMonth ?? 7200))}`}
          />
          <ToolCard
            title="متوسط التقييم"
            value={Number(crm?.data?.avgRating ?? 4.8).toFixed(1)}
            subtitle="من 5 نجوم"
            onPress={() => router.push('/tech/reviews' as never)}
          />
          <ToolCard
            title="المصروفات"
            value={formatCurrency(3200)}
            subtitle="هذا الشهر"
          />
          <ToolCard
            title="سجل الحجوزات"
            value={`${crm?.data?.totalBookings ?? 128}+`}
            subtitle="عرض كل الحجوزات"
            onPress={() => router.push('/tech/bookings' as never)}
          />
          <ToolCard
            title="المحفظة والأرباح"
            value={formatCurrency(Number(earnings?.data?.availableBalance ?? 0))}
            subtitle="الرصيد المتاح للسحب"
            onPress={() => router.push('/tech/earnings' as never)}
          />
          <ToolCard
            title="المعرض"
            value={`${crm?.data?.galleryPhotos ?? 12}+`}
            subtitle="صور وأعمال"
            onPress={() => router.push('/tech/gallery' as never)}
          />
          <ToolCard
            title="التقويم"
            value="المواعيد"
            subtitle="إدارة جدول المواعيد"
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
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 8 },
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
