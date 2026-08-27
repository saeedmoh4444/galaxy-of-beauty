import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { localize } from '@galaxy/shared';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useHaptics } from '@/hooks/useHaptics';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthToken } from '@/lib/authToken';
import { useTheme, themeColors } from '@/components/ThemeProvider';

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const { trigger } = useHaptics();
  const { t, locale } = useLocale();
  const { isDark } = useTheme();
  const c = isDark ? themeColors.dark : themeColors.light;
  const styles = makeStyles(c);
  const cats = trpc.categories.list.useQuery();
  // Auth-gated: the public home tab must not fire the authenticated
  // kindness query for guests (was surfacing "Authentication required").
  const kindness = trpc.kindnessPoints.getStatus.useQuery(undefined, {
    enabled: !!getAuthToken(),
  });
  const dailyTip = trpc.dailyBeautyTip.today.useQuery();
  const compliments = trpc.sisterhoodCompliments.count.useQuery();

  const data = cats.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={cats.isLoading}
      isError={cats.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('mobile.core.categoriesLoadError')}
      emptyTitle={t('marketing.home.no-categories')}
      onRetry={() => cats.refetch()}
    >
      <Text style={styles.title}>{t('common.brandName')}</Text>

      {/* Community Stats Bar */}
      <View style={styles.statsRow}>
        {kindness?.data?.points !== undefined && (
          <View style={styles.statBadge}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>K</Text>
            </View>
            <Text style={styles.statText}>
              {t('mobile.core.kindnessPoints', { points: kindness.data.points })}
            </Text>
          </View>
        )}
        {compliments?.data !== undefined && (
          <View style={styles.statBadge}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>M</Text>
            </View>
            <Text style={styles.statText}>
              {t('mobile.core.complimentMessages', { count: compliments.data })}
            </Text>
          </View>
        )}
        {dailyTip?.data && (
          <View style={styles.tipBar}>
            <View style={styles.tipIcon}>
              <Text style={styles.tipIconText}>!</Text>
            </View>
            <Text style={styles.tipText} numberOfLines={1}>
              {dailyTip.data.tip ?? ''}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.grid}>
        {(data as Record<string, unknown>[])?.map((cat: Record<string, unknown>, i: number) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
              trigger('light');
              router.push('/public/services' as never);
            }}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>
                {localize(cat.nameJson, locale).charAt(0) || 'B'}
              </Text>
            </View>
            <Text style={styles.name}>
              {localize(cat.nameJson, locale) || (cat.nameAr as string) || ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenState>
  );
}

const makeStyles = (c: typeof themeColors.light | typeof themeColors.dark) =>
  StyleSheet.create({
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: c.brand,
      textAlign: 'center',
      marginBottom: 20,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    card: {
      width: '30%',
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardIconText: { fontSize: 20, fontWeight: '700', color: c.brand },
    name: {
      fontSize: 11,
      fontWeight: '600',
      color: c.text,
      marginTop: 6,
      textAlign: 'center',
    },
    statsRow: { marginBottom: 16, gap: 8 },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 10,
      padding: 8,
      marginBottom: 4,
    },
    statIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    statIconText: { fontSize: 12, fontWeight: '700', color: c.brand },
    statText: { fontSize: 12, fontWeight: '600', color: c.text },
    tipBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fef3c7',
      borderRadius: 10,
      padding: 10,
      marginTop: 4,
    },
    tipIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#fde68a',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    tipIconText: { fontSize: 12, fontWeight: '700', color: '#92400e' },
    tipText: { fontSize: 11, color: '#92400e', flex: 1 },
  });
