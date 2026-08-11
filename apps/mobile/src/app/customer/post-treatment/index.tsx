import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const TREATMENTS: Record<
  string,
  { emoji: string; aftercare: string[]; timeline: { day: string; action: string }[] }
> = {
  facial: {
    emoji: '✨',
    aftercare: ['لا تلمسي وجهكِ', 'تجنبي المكياج ٢٤ ساعة', 'استخدمي واقي شمس', 'اشربي ماء بكثرة'],
    timeline: [
      { day: 'اليوم 1', action: 'لا تغسلي وجهكِ — اتركي المنتجات' },
      { day: 'اليوم 2-3', action: 'غسول لطيف + مرطب' },
      { day: 'اليوم 4-7', action: 'عودي لروتينك الطبيعي' },
    ],
  },
  waxing: {
    emoji: '🕯️',
    aftercare: ['تجنبي الشمس ٤٨ ساعة', 'لا تستخدمي مقشر', 'ارتدي ملابس قطنية', 'رطبي المنطقة'],
    timeline: [
      { day: 'اليوم 1', action: 'لا تلمسي المنطقة — تجنبي الحرارة' },
      { day: 'اليوم 2-3', action: 'ترطيب خفيف + ملابس فضفاضة' },
      { day: 'اليوم 4+', action: 'تقشير لطيف لمنع الشعر تحت الجلد' },
    ],
  },
  hair_color: {
    emoji: '💇‍♀️',
    aftercare: [
      'لا تغسلي شعركِ ٤٨ ساعة',
      'استخدمي شامبو خالي من الكبريتات',
      'تجنبي الحرارة',
      'استخدمي بلسم مرطب',
    ],
    timeline: [
      { day: 'اليوم 1-2', action: 'لا تغسلي — ثبتي اللون' },
      { day: 'اليوم 3-5', action: 'غسيل بماء بارد + بلسم' },
      { day: 'اليوم 6+', action: 'روتين طبيعي مع حماية من الحرارة' },
    ],
  },
  nails: {
    emoji: '💅',
    aftercare: [
      'تجنبي الماء الساخن',
      'استخدمي كريم يدين',
      'لا تستخدمي أظافركِ كأدوات',
      'زيوت للأظافر',
    ],
    timeline: [
      { day: 'اليوم 1', action: 'حافظي على جفاف الأظافر' },
      { day: 'اليوم 2-7', action: 'رطبي يومياً + زيت للأظافر' },
      { day: 'الأسبوع 2+', action: 'لمسات تصحيحية عند الحاجة' },
    ],
  },
};

export default function PostTreatmentScreen(): JSX.Element {
  const [selected, setSelected] = useState('facial');
  const [completed, setCompleted] = useState<string[]>([]);

  const t = TREATMENTS[selected]!;
  const progress = Math.round((completed.length / t.timeline.length) * 100);

  const toggleDay = (day: string) => {
    if (completed.includes(day)) setCompleted(completed.filter((x) => x !== day));
    else setCompleted([...completed, day]);
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💆‍♀️ متابعة ما بعد العلاج</Text>
      <Text style={styles.sub}>تعليمات العناية بعد كل خدمة</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {Object.entries(TREATMENTS).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              onPress={() => {
                setSelected(key);
                setCompleted([]);
              }}
              style={[styles.tab, selected === key && styles.tabA]}
            >
              <Text style={styles.te}>{val.emoji}</Text>
              <Text style={[styles.tn, selected === key && styles.tnA]}>
                {key === 'facial'
                  ? 'عناية بالبشرة'
                  : key === 'waxing'
                    ? 'إزالة شعر'
                    : key === 'hair_color'
                      ? 'صبغ شعر'
                      : 'أظافر'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.progress}>
        <Text style={styles.progressText}>تقدم المتابعة: {progress}%</Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </View>

      <Text style={styles.st}>📋 التعليمات</Text>
      <View style={styles.card}>
        {t.aftercare.map((a, i) => (
          <View key={i} style={styles.ac}>
            <Text style={styles.acb}>✓</Text>
            <Text style={styles.act}>{a}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.st}>📅 الجدول الزمني</Text>
      {t.timeline.map((tl) => {
        const isDone = completed.includes(tl.day);
        return (
          <TouchableOpacity
            key={tl.day}
            onPress={() => toggleDay(tl.day)}
            style={[styles.tl, isDone && styles.tlDone]}
          >
            <View style={[styles.tlc, isDone && styles.tlcDone]}>
              <Text style={styles.tlct}>{isDone ? '✓' : '○'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tld, isDone && styles.tldDone]}>{tl.day}</Text>
              <Text style={styles.tla}>{tl.action}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  tab: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  tabA: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  te: { fontSize: 28 },
  tn: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4 },
  tnA: { color: '#059669' },
  progress: { marginBottom: 16 },
  progressText: { fontSize: 13, fontWeight: '600', color: '#059669', marginBottom: 6 },
  bar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
  fill: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  ac: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  acb: { fontSize: 14, color: '#059669' },
  act: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
  tl: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  tlDone: { opacity: 0.6 },
  tlc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlcDone: { backgroundColor: '#059669', borderColor: '#059669' },
  tlct: { fontSize: 12, color: '#6b7280' },
  tld: { fontSize: 12, fontWeight: '700', color: '#111827' },
  tldDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  tla: { fontSize: 13, color: '#374151', marginTop: 2 },
});
