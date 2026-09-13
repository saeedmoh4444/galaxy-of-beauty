import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

interface ExpoEvent {
  id?: number;
  nameJson?: { ar?: string; en?: string };
  descriptionJson?: { ar?: string; en?: string };
  startsAt?: string;
}

export default function BeautyExpoScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const expo = trpc.beautyExpo.booths.useQuery() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = expo.data as unknown as ExpoEvent[] | undefined;

  return (
    <ScreenState
      isLoading={expo.isLoading}
      isError={expo.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('mobile.public.beauty-expo.load-error')}
      emptyTitle={t('mobile.public.beauty-expo.empty')}
      onRetry={() => expo.refetch()}
    >
      <Text style={styles.title}>{t('mobile.public.beauty-expo.title')}</Text>
      {data?.map((e, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.name}>{localize(e.nameJson, locale)}</Text>
          <Text style={styles.desc}>{localize(e.descriptionJson, locale)}</Text>
          <Text style={styles.date}>
            {e.startsAt
              ? new Date(e.startsAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')
              : ''}
          </Text>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  desc: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
  date: { fontSize: 12, color: COLORS.gray400, marginTop: 6 },
});
