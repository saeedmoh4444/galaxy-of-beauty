import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useTheme, themeColors } from '@/components/ThemeProvider';

interface ServiceRow {
  id?: number;
  emoji?: string;
  name?: string;
  price?: number;
}

interface FlashDeal {
  id?: number;
  title?: string;
  originalPrice?: number;
  dealPrice?: number;
}

interface DiscoveryEvent {
  id?: number;
  name?: string;
  type?: string;
  location?: string;
}

interface FeaturedData {
  popularServices?: ServiceRow[];
  flashDeals?: FlashDeal[];
  events?: DiscoveryEvent[];
}

interface ForYouData {
  profile?: { skinType?: string; hairType?: string; concerns?: string[] };
  suggestions?: ServiceRow[];
}

export default function BeautyDiscoveryScreen(): JSX.Element {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const c = isDark ? themeColors.dark : themeColors.light;
  const s = makeStyles(c);
  const featuredQ = trpc.beautyDiscovery.featured.useQuery();
  const forYouQ = trpc.beautyDiscovery.forYou.useQuery();

  if (featuredQ.isLoading) return <SkeletonList count={5} />;

  const f = featuredQ.data as FeaturedData | null;
  const fy = forYouQ.data as ForYouData | null;

  return (
    <ScreenState
      // Loading is handled by the skeleton early-return above; ScreenState
      // covers the error/retry state for the content below.
      isLoading={false}
      isError={featuredQ.isError}
      isEmpty={false}
      errorMessage={t('beautyDiscovery.load-error')}
      onRetry={() => featuredQ.refetch()}
    >
      <ScrollView
        style={s.c}
        contentContainerStyle={s.i}
        refreshControl={
          <RefreshControl
            refreshing={featuredQ.isRefetching || forYouQ.isRefetching}
            onRefresh={() => {
              void featuredQ.refetch();
              void forYouQ.refetch();
            }}
            colors={['#db2777']}
          />
        }
      >
        <Text style={s.t}>{t('beautyDiscovery.title')}</Text>
        <Text style={s.sub}>{t('beautyDiscovery.subtitle')}</Text>

        {fy?.profile && (
          <View
            style={{ backgroundColor: c.surface, borderRadius: 12, padding: 14, marginBottom: 16 }}
          >
            <Text style={{ fontWeight: '700', color: c.brand, fontSize: 15 }}>
              {t('beautyDiscovery.your-profile')}
            </Text>
            <Text style={{ color: c.brand, fontSize: 13, marginTop: 4 }}>
              {fy.profile.skinType} · {fy.profile.hairType} ·{' '}
              {(fy.profile.concerns as string[])?.join('، ')}
            </Text>
          </View>
        )}

        {(f?.popularServices ?? []).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.st}>{t('beautyDiscovery.popular')}</Text>
            {(f?.popularServices ?? []).slice(0, 6).map((svc, i) => (
              <View key={svc.id ?? i} style={s.row}>
                <Text style={{ fontSize: 14, color: c.text }}>
                  {svc.emoji} {svc.name}
                </Text>
                <Text style={{ fontWeight: '700', color: '#db2777' }}>
                  {t('beautyDiscovery.price', { price: svc.price ?? 0 })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {(f?.flashDeals ?? []).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.st}>{t('beautyDiscovery.flash-deals')}</Text>
            {(f?.flashDeals ?? []).slice(0, 4).map((d, i) => (
              <View key={d.id ?? i} style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, color: c.text }}>{d.title}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: c.textSecondary,
                      textDecorationLine: 'line-through',
                    }}
                  >
                    {t('beautyDiscovery.price', { price: d.originalPrice ?? 0 })}
                  </Text>
                </View>
                <Text style={{ fontWeight: '800', color: c.danger }}>
                  {t('beautyDiscovery.price', { price: d.dealPrice ?? 0 })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {(fy?.suggestions ?? []).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.st}>{t('beautyDiscovery.for-you')}</Text>
            {(fy?.suggestions ?? []).map((sug, i) => (
              <View key={sug.id ?? i} style={s.row}>
                <Text style={{ fontSize: 14, color: c.text }}>
                  {sug.emoji} {sug.name}
                </Text>
                <Text style={{ fontWeight: '700', color: '#db2777' }}>
                  {t('beautyDiscovery.price', { price: sug.price ?? 0 })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {(f?.events ?? []).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.st}>{t('beautyDiscovery.upcoming-events')}</Text>
            {(f?.events ?? []).map((e, i) => (
              <View key={e.id ?? i} style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, color: c.text }}>{e.name}</Text>
                  <Text style={{ fontSize: 11, color: c.textSecondary }}>
                    {e.type} · {e.location}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenState>
  );
}

const makeStyles = (c: typeof themeColors.light | typeof themeColors.dark) =>
  StyleSheet.create({
    c: { flex: 1, backgroundColor: c.bg },
    i: { padding: 16, paddingBottom: 40 },
    t: { fontSize: 24, fontWeight: '800', color: c.text, textAlign: 'center', marginBottom: 8 },
    sub: { fontSize: 14, color: c.textSecondary, textAlign: 'center', marginBottom: 20 },
    st: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 10 },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 10,
      padding: 12,
      marginBottom: 6,
    },
  });
