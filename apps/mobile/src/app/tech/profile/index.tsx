import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

export default function TechProfileScreen(): JSX.Element {
  const { t } = useLocale();
  const profile = trpc.users.getMe.useQuery() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = profile.data as unknown as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={profile.isLoading}
      isError={profile.isError}
      isEmpty={!data}
      errorMessage={t('tech.profile.load-error')}
      onRetry={() => profile.refetch()}
    >
      <Text style={styles.title}>{t('mobile.tech.profile.title')}</Text>
      {(data
        ? [
            { label: t('tech.profile.city'), value: data.city as string },
            { label: t('tech.dashboard.rating'), value: ` ${String(data.ratingAvg ?? 0)}` },
            {
              label: t('mobile.tech.profile.completed-bookings'),
              value: String(data.completedBookings ?? 0),
            },
            { label: t('tech.dashboard.kyc-status'), value: data.kycStatus as string },
            {
              label: t('mobile.tech.profile.eco-friendly-products'),
              value: data.isEcoFriendly
                ? t('mobile.tech.profile.yes')
                : t('mobile.tech.profile.no'),
            },
          ]
        : []
      ).map((row, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value ?? '—'}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editText}>{t('mobile.tech.profile.edit-profile')}</Text>
      </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 14, color: COLORS.gray400 },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  editBtn: { marginTop: 24, alignItems: 'center', padding: 16 },
  editText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
});
