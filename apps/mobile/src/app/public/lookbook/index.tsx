import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const SEASONS = [
  { id: 'summer', nameAr: 'صيف ٢٠٢٦', emoji: '️', color: '#f59e0b' },
  { id: 'eid', nameAr: 'أناقة العيد', emoji: '', color: '#10b981' },
  { id: 'wedding', nameAr: 'موسم الأعراس', emoji: '', color: '#ec4899' },
  { id: 'ramadan', nameAr: 'رمضان كريم', emoji: '', color: '#7c3aed' },
];

const LOOKS: Record<string, { title: string; desc: string; emoji: string; tags: string[] }[]> = {
  summer: [
    {
      title: 'إطلالة شاطئية منعشة',
      desc: 'مكياج خفيف مقاوم للماء مع تسريحة شاطئية',
      emoji: '',
      tags: ['مكياج', 'شعر', 'عناية'],
    },
    {
      title: 'عناية بالبشرة قبل الصيف',
      desc: 'تقشير وترطيب عميق لبشرة متألقة',
      emoji: '',
      tags: ['بشرة', 'عناية'],
    },
    {
      title: 'ألوان الصيف الجريئة',
      desc: 'مانيكير وباديكير بألوان الموسم',
      emoji: '',
      tags: ['أظافر', 'مانيكير'],
    },
  ],
  eid: [
    {
      title: 'إطلالة العيد الفاخرة',
      desc: 'مكياج سهرة مع تسريحة أنيقة',
      emoji: '',
      tags: ['مكياج', 'شعر'],
    },
    {
      title: 'حناء العيد',
      desc: 'نقوش حناء عصرية للمناسبات',
      emoji: '',
      tags: ['حناء', 'مناسبات'],
    },
    {
      title: 'بشرة متألقة للعيد',
      desc: 'جلسة عناية متكاملة قبل العيد',
      emoji: '',
      tags: ['بشرة', 'عناية'],
    },
  ],
  wedding: [
    {
      title: 'إطلالة العروس الكاملة',
      desc: 'مكياج، شعر، وأظافر ليومكِ الكبير',
      emoji: '',
      tags: ['عرايس', 'مكياج', 'شعر'],
    },
    {
      title: 'جلسة تصوير العروس',
      desc: 'مكياج احترافي يدوم طوال اليوم',
      emoji: '',
      tags: ['مكياج', 'تصوير'],
    },
    {
      title: 'إطلالة أم العروس',
      desc: 'مكياج ناعم وأنيق لأم العروس',
      emoji: '',
      tags: ['مكياج', 'مناسبات'],
    },
  ],
  ramadan: [
    {
      title: 'إطلالة رمضانية راقية',
      desc: 'مكياج ناعم للسهرات الرمضانية',
      emoji: '',
      tags: ['مكياج', 'سهرة'],
    },
    {
      title: 'عناية رمضانية',
      desc: 'روتين عناية ليلي للصائمات',
      emoji: '',
      tags: ['بشرة', 'عناية'],
    },
    { title: 'تسريحة السحور', desc: 'تسريحة سريعة وأنيقة', emoji: '‍️', tags: ['شعر', 'تسريحة'] },
  ],
};

export default function LookbookScreen(): JSX.Element {
  const [season, setSeason] = useState('summer');
  const currentLooks = LOOKS[season] ?? [];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> لوك بوك</Text>
      <Text style={styles.sub}>أحدث إطلالات وصيحات الجمال</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {SEASONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSeason(s.id)}
              style={[styles.seasonChip, season === s.id && { backgroundColor: s.color }]}
            >
              <Text style={[styles.seasonText, season === s.id && { color: '#fff' }]}>
                {s.emoji} {s.nameAr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {currentLooks.map((look, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.lookEmoji}>{look.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.lookTitle}>{look.title}</Text>
            <Text style={styles.lookDesc}>{look.desc}</Text>
            <View style={styles.tags}>
              {look.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  seasonChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  seasonText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  lookEmoji: { fontSize: 36 },
  lookTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  lookDesc: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    fontSize: 11,
    color: '#db2777',
    backgroundColor: '#fdf2f8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
