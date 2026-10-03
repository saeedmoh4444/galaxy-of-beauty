import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

// NO API: no tech-side gallery-list procedure — the gallery router only has
// upload/delete (technician) and byTechnician (public, keyed by technician
// profile id); the web gallery page is upload-only, and there is no likes
// data in the GalleryImage model. Left static.
interface GalleryPhoto {
  id: number;
  emoji: string;
  nameKey: TranslationKey;
  clientKey: TranslationKey;
  dateKey: TranslationKey;
  likes: number;
}

const PHOTOS: GalleryPhoto[] = [
  {
    id: 1,
    emoji: '💇',
    nameKey: 'mobile.tech.gallery.item.bridalUpdo',
    clientKey: 'marketing.home.testimonial-sara-name',
    dateKey: 'mobile.tech.gallery.date.jul15',
    likes: 24,
  },
  {
    id: 2,
    emoji: '💄',
    nameKey: 'marketing.beauty-quiz.svc-evening-makeup',
    clientKey: 'community.name.noura',
    dateKey: 'mobile.tech.gallery.date.jul20',
    likes: 18,
  },
  {
    id: 3,
    emoji: '💅',
    nameKey: 'mobile.tech.gallery.item.frenchNails',
    clientKey: 'community.name.maha',
    dateKey: 'mobile.tech.gallery.date.aug1',
    likes: 32,
  },
  {
    id: 4,
    emoji: '🎨',
    nameKey: 'postTreatment.treat.hairColor',
    clientKey: 'mobile.tech.gallery.client.reem',
    dateKey: 'mobile.tech.gallery.date.aug5',
    likes: 15,
  },
  {
    id: 5,
    emoji: '🧖',
    nameKey: 'marketing.beauty-quiz.svc-facial-cleanse',
    clientKey: 'marketing.home.testimonial-sara-name',
    dateKey: 'mobile.tech.gallery.date.aug10',
    likes: 28,
  },
  {
    id: 6,
    emoji: '💆',
    nameKey: 'seasonal.svc.autumn.relaxingMassage',
    clientKey: 'community.name.noura',
    dateKey: 'mobile.tech.gallery.date.aug12',
    likes: 20,
  },
];
export default function TechGalleryScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.tech.gallery.title')}</Text>
      <Text style={s.sub}>{t('mobile.tech.gallery.subtitle')}</Text>
      <View style={s.grid}>
        {PHOTOS.map((p) => (
          <View key={p.id} style={s.card}>
            <Text style={s.ce}>{p.emoji}</Text>
            <Text style={s.cn}>{t(p.nameKey)}</Text>
            <Text style={s.cd}>
              {t(p.clientKey)} · {t(p.dateKey)}
            </Text>
            <Text style={s.cl}>{t('mobile.tech.gallery.likes', { count: p.likes })}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    width: '48%',
    flexGrow: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  ce: { fontSize: 40 },
  cn: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 4 },
  cd: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  cl: { fontSize: 12, color: '#e11d48', marginTop: 4 },
});
const s = sc;
