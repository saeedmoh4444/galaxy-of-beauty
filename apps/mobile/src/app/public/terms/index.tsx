import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface TermsSection {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}

const SECTIONS: TermsSection[] = [
  {
    titleKey: 'mobile.public.terms.intro.title',
    bodyKey: 'mobile.public.terms.intro.body',
  },
  {
    titleKey: 'mobile.public.terms.accounts.title',
    bodyKey: 'mobile.public.terms.accounts.body',
  },
  {
    titleKey: 'mobile.bookings',
    bodyKey: 'mobile.public.terms.bookings.body',
  },
  {
    titleKey: 'mobile.payments.title',
    bodyKey: 'mobile.public.terms.payments.body',
  },
  {
    titleKey: 'mobile.public.terms.cancellation.title',
    bodyKey: 'mobile.public.terms.cancellation.body',
  },
  {
    titleKey: 'mobile.public.terms.privacy.title',
    bodyKey: 'mobile.public.terms.privacy.body',
  },
  {
    titleKey: 'mobile.public.terms.liability.title',
    bodyKey: 'mobile.public.terms.liability.body',
  },
  {
    titleKey: 'mobile.public.terms.contact.title',
    bodyKey: 'mobile.public.terms.contact.body',
  },
];

export default function TermsScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.public.terms.title')}</Text>
      <Text style={s.d}>{t('mobile.public.terms.updated')}</Text>
      {SECTIONS.map((section) => (
        <View key={section.titleKey}>
          <View style={{ marginTop: 20, marginBottom: 4 }}>
            <Text style={s.st}>{t(section.titleKey)}</Text>
          </View>
          <Text style={s.sb}>{t(section.bodyKey)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 24, paddingTop: 50, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  d: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sb: { fontSize: 14, lineHeight: 24, color: '#374151', textAlign: 'right' },
});
const s = sc;
