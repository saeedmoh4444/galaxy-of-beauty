import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const THEMES = [
  { key: 'spa', emoji: '‍️', name: 'سبا منزلي', desc: 'مساج وأقنعة واسترخاء' },
  { key: 'makeup', emoji: '', name: 'حفلة مكياج', desc: 'تجربة مكياج جماعي' },
  { key: 'nails', emoji: '', name: 'صالون أظافر', desc: 'مانيكير وباديكير جماعي' },
  { key: 'bridal', emoji: '', name: 'توديع عزوبية', desc: 'عناية متكاملة للعروس' },
  { key: 'skincare', emoji: '', name: 'روتين عناية', desc: 'أقنعة وعناية بالبشرة' },
];

export default function BeautyPartyScreen(): JSX.Element {
  const { t } = useLocale();
  const [theme, setTheme] = useState('spa');
  const [guests, setGuests] = useState(4);
  const themeNames: Record<string, string> = {
    spa: t('beautyParty.theme-spa'),
    makeup: t('beautyParty.theme-makeup'),
    nails: t('beautyParty.theme-nails'),
    bridal: t('beautyParty.theme-bridal'),
    skincare: t('beautyParty.theme-skincare'),
  };
  const themeDescs: Record<string, string> = {
    spa: t('beautyParty.theme-spa-desc'),
    makeup: t('beautyParty.theme-makeup-desc'),
    nails: t('beautyParty.theme-nails-desc'),
    bridal: t('beautyParty.theme-bridal-desc'),
    skincare: t('beautyParty.theme-skincare-desc'),
  };

  const q = trpc.services.list.useQuery({});

  const estPerPerson = 150;
  const total = estPerPerson * guests;
  const discount = guests >= 6 ? 20 : guests >= 4 ? 10 : 0;
  const finalTotal = total - (total * discount) / 100;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('beautyParty.title')}</Text>
      <Text style={styles.sub}>{t('beautyParty.subtitle')}</Text>

      <Text style={styles.st}>{t('beautyParty.choose-theme')}</Text>
      <View style={styles.themes}>
        {THEMES.map((th) => (
          <TouchableOpacity
            key={th.key}
            onPress={() => setTheme(th.key)}
            style={[styles.th, theme === th.key && styles.tha]}
          >
            <Text style={styles.the}>{th.emoji}</Text>
            <Text style={[styles.thn, theme === th.key && styles.thna]}>
              {themeNames[th.key] ?? th.name}
            </Text>
            <Text style={[styles.thd, theme === th.key && styles.thda]}>
              {themeDescs[th.key] ?? th.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.st}>{t('beautyParty.guests-count', { count: guests })}</Text>
      <View style={styles.guests}>
        {[2, 3, 4, 5, 6, 8, 10].map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setGuests(g)}
            style={[styles.gb, guests === g && styles.gba]}
          >
            <Text style={[styles.gt, guests === g && styles.gta]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.st}>{t('beautyParty.estimated-cost')}</Text>
        <View style={styles.sr}>
          <Text style={styles.sl}>
            {t('beautyParty.per-person', { guests, price: estPerPerson })}
          </Text>
          <Text style={styles.sv}>
            {t('beautyParty.amount', { value: total.toLocaleString() })}
          </Text>
        </View>
        {discount > 0 && (
          <View style={styles.sr}>
            <Text style={[styles.sl, { color: '#059669' }]}>
              {t('beautyParty.group-discount', { pct: discount })}
            </Text>
            <Text style={[styles.sv, { color: '#059669' }]}>
              {t('beautyParty.amount', {
                value: '-' + ((total * discount) / 100).toLocaleString(),
              })}
            </Text>
          </View>
        )}
        <View style={styles.sd} />
        <View style={styles.sr}>
          <Text style={[styles.sl, { fontWeight: '700' }]}>{t('beautyParty.total')}</Text>
          <Text style={[styles.sv, { fontWeight: '800', fontSize: 20 }]}>
            {t('beautyParty.amount', { value: finalTotal.toLocaleString() })}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.bt}>{t('beautyParty.book-now')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  themes: { gap: 8, marginBottom: 16 },
  th: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  tha: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  the: { fontSize: 32 },
  thn: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 4 },
  thna: { color: '#db2777' },
  thd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  thda: { color: '#be185d' },
  guests: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  gb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  gba: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  gt: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  gta: { color: '#db2777' },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  sr: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  sl: { fontSize: 14, color: '#374151' },
  sv: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sd: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  btn: { backgroundColor: '#db2777', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
