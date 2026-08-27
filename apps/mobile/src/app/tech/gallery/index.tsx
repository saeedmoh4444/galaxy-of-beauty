import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';

// NO API: no tech-side gallery-list procedure — the gallery router only has
// upload/delete (technician) and byTechnician (public, keyed by technician
// profile id); the web gallery page is upload-only, and there is no likes
// data in the GalleryImage model. Left static.
const PHOTOS = [
  { id: 1, emoji: '', name: 'تسريحة عروس', client: 'سارة', date: '15 يوليو', likes: 24 },
  { id: 2, emoji: '', name: 'مكياج سهرة', client: 'نورة', date: '20 يوليو', likes: 18 },
  { id: 3, emoji: '', name: 'أظافر فرنسي', client: 'مها', date: '1 أغسطس', likes: 32 },
  { id: 4, emoji: '', name: 'صبغ شعر', client: 'ريم', date: '5 أغسطس', likes: 15 },
  { id: 5, emoji: '', name: 'تنظيف بشرة', client: 'سارة', date: '10 أغسطس', likes: 28 },
  { id: 6, emoji: '', name: 'مساج استرخاء', client: 'نورة', date: '12 أغسطس', likes: 20 },
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
            <Text style={s.cn}>{p.name}</Text>
            <Text style={s.cd}>
              {p.client} · {p.date}
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
