import type { JSX } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';
import type { SellerHomeSummary, HealthTone } from '@/utils/vendorHome';

const TONE_BG: Record<HealthTone, string> = {
  good: '#ecfdf5',
  fair: '#fffbeb',
  poor: '#fef2f2',
};
const TONE_FG: Record<HealthTone, string> = {
  good: '#059669',
  fair: '#d97706',
  poor: '#dc2626',
};

/** E1 — seller home: the store's own profile card (brand identity glance)
 *  + "view my storefront" deep link. Mirrors the web VenueProfileCard. */
export function SellerHomeCard({
  summary,
  onViewStorefront,
}: {
  summary: SellerHomeSummary;
  onViewStorefront: () => void;
}): JSX.Element {
  const { t } = useLocale();

  return (
    <View style={styles.card}>
      {summary.bannerUrl ? (
        <Image source={{ uri: summary.bannerUrl }} style={styles.banner} resizeMode="cover" />
      ) : null}
      <View style={styles.body}>
        <View style={styles.row}>
          {summary.logoUrl ? (
            <Image source={{ uri: summary.logoUrl }} style={styles.logo} resizeMode="cover" />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackEmoji}>🏪</Text>
            </View>
          )}
          <View style={styles.identity}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} style={styles.name}>
                {summary.name}
              </Text>
              {summary.isVerified ? (
                <Text style={styles.verified}>✓ {t('mobile.vendorPortal.verified')}</Text>
              ) : null}
            </View>
            {summary.rating > 0 && summary.reviewCount > 0 ? (
              <Text style={styles.rating}>
                ★ {summary.rating.toFixed(1)} ·{' '}
                {t('mobile.vendorPortal.reviews', { count: summary.reviewCount })}
              </Text>
            ) : null}
          </View>
          <View style={[styles.healthChip, { backgroundColor: TONE_BG[summary.healthTone] }]}>
            <Text style={[styles.healthScore, { color: TONE_FG[summary.healthTone] }]}>
              {summary.healthScore}
            </Text>
            <Text style={styles.healthLabel}>{t('mobile.vendorPortal.health')}</Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.bio}>
          {summary.bio || t('mobile.vendorPortal.noBio')}
        </Text>
        <TouchableOpacity style={styles.storefrontBtn} onPress={onViewStorefront}>
          <Text style={styles.storefrontText}>{t('mobile.vendorPortal.viewStorefront')} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  banner: { width: '100%', height: 110 },
  body: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 52, height: 52, borderRadius: 12 },
  logoFallback: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackEmoji: { fontSize: 26 },
  identity: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '800', color: '#111827', flexShrink: 1 },
  verified: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  rating: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  healthChip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  healthScore: { fontSize: 16, fontWeight: '800' },
  healthLabel: { fontSize: 9, color: '#9ca3af' },
  bio: { fontSize: 13, color: '#6b7280', marginTop: 10 },
  storefrontBtn: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#faf5ff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  storefrontText: { fontSize: 13, fontWeight: '700', color: '#7c3aed' },
});
