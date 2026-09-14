import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

/**
 * More — RN mirror of the web public header "More" dropdown (sprint 4 IA).
 * Grouped destinations: venues + discovery links. Entry points: home header
 * and the profile screen.
 */
interface MoreLink {
  href: string;
  key: TranslationKey;
  emoji: string;
}

const VENUE_LINKS: MoreLink[] = [
  { href: '/customer/stores', key: 'nav.stores', emoji: '🏬' },
  { href: '/customer/clinics', key: 'nav.clinics', emoji: '🏥' },
  { href: '/customer/gyms', key: 'nav.gyms', emoji: '🏋️' },
  { href: '/customer/trainers', key: 'nav.trainers', emoji: '🧘' },
  { href: '/customer/nail-bars', key: 'nav.nailBars', emoji: '💅' },
  { href: '/customer/barberettes', key: 'nav.barberettes', emoji: '💇' },
];

const MORE_LINKS: MoreLink[] = [
  { href: '/public/beauty-shorts', key: 'nav.reels', emoji: '🎬' },
  { href: '/technicians', key: 'nav.technicians', emoji: '👩' },
  { href: '/customer/skin-analysis', key: 'nav.skin-analysis', emoji: '🔬' },
  { href: '/customer/gift-cards', key: 'nav.giftCards', emoji: '🎁' },
  { href: '/public/search', key: 'nav.search', emoji: '🔍' },
  { href: '/public/mommy-and-me', key: 'nav.mommyAndMe', emoji: '👩‍👧' },
  { href: '/public/bundles', key: 'nav.bundles', emoji: '📦' },
  { href: '/public/lookbook', key: 'nav.lookbook', emoji: '👗' },
  { href: '/public/beauty-quiz', key: 'nav.beautyQuiz', emoji: '✨' },
  { href: '/public/beauty-packages', key: 'nav.beautyPackages', emoji: '🎀' },
  { href: '/public/bridal-concierge', key: 'nav.bridalConcierge', emoji: '💍' },
  { href: '/public/campaigns', key: 'nav.campaigns', emoji: '🏷️' },
  { href: '/public/events', key: 'nav.events', emoji: '🎉' },
  { href: '/public/blog', key: 'nav.blog', emoji: '📰' },
];

export default function MoreScreen(): JSX.Element {
  const router = useRouter();
  const { t } = useLocale();

  const renderLink = (link: MoreLink) => (
    <TouchableOpacity
      key={link.href}
      style={styles.row}
      onPress={() => router.push(link.href)}
      testID={`more-link-${link.href.replace(/\//g, '-')}`}
    >
      <Text style={styles.rowEmoji}>{link.emoji}</Text>
      <Text style={styles.rowLabel}>{t(link.key)}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.title}>{t('nav.more')}</Text>

      <Text style={styles.sectionTitle}>{t('nav.venues')}</Text>
      <View style={styles.section}>{VENUE_LINKS.map(renderLink)}</View>

      <Text style={styles.sectionTitle}>{t('mobile.public.more.explore')}</Text>
      <View style={styles.section}>{MORE_LINKS.map(renderLink)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  rowEmoji: { fontSize: 16 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
