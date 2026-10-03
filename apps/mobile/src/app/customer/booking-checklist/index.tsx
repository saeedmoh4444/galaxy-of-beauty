import type { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  checked: '#10b981',
};
const CHECKLIST: TranslationKey[] = [
  'mobile.bookingChecklist.item-confirm-booking',
  'mobile.bookingChecklist.item-prepare-space',
  'mobile.bookingChecklist.item-remove-old-makeup',
  'mobile.bookingChecklist.item-drink-water',
  'mobile.bookingChecklist.item-relax-before',
];

export default function BookingChecklistScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { t } = useLocale();
  const list = trpc.bookingChecklist.get.useQuery(
    { category: 'makeup' },
    { enabled: isAuthed },
  ) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };

  return (
    <ScreenState
      isLoading={list.isLoading}
      isError={list.isError}
      isEmpty={false}
      errorMessage={t('bookingChecklist.load-error')}
      onRetry={() => list.refetch()}
    >
      <Text style={styles.title}>{t('bookingChecklist.title')}</Text>
      {CHECKLIST.map((itemKey, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.check}>⬜</Text>
          <Text style={styles.text}>{t(itemKey)}</Text>
        </View>
      ))}
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
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
  },
  check: { fontSize: 20, marginRight: 12 },
  text: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
});
