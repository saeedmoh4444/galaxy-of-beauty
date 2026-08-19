import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';

const SEASONS = [
  {
    key: 'winter',
    emoji: '️',
    name: 'الشتاء',
    months: 'ديسمبر - فبراير',
    color: '#3b82f6',
    tips: 'البشرة تميل للجفاف — ركزي على الترطيب العميق',
    services: [
      { emoji: '‍️', name: 'ترطيب عميق', why: 'لمكافحة جفاف الشتاء' },
      { emoji: '‍️', name: 'مساج بالزيوت', why: 'تنشيط الدورة الدموية' },
      { emoji: '‍️', name: 'علاج الشعر', why: 'حماية من التقصف' },
      { emoji: '', name: 'أظافر شتوية', why: 'ألوان داكنة للموسم' },
    ],
  },
  {
    key: 'spring',
    emoji: '',
    name: 'الربيع',
    months: 'مارس - مايو',
    color: '#ec4899',
    tips: 'وقت التجديد — بشرة متجددة بعد الشتاء',
    services: [
      { emoji: '', name: 'تقشير البشرة', why: 'إزالة خلايا الشتاء الميتة' },
      { emoji: '‍️', name: 'قص الشعر', why: 'تجديد بعد جفاف الشتاء' },
      { emoji: '', name: 'مكياج ربيعي', why: 'ألوان باستيل منعشة' },
      { emoji: '', name: 'علاجات طبيعية', why: 'موسم التجدد الطبيعي' },
    ],
  },
  {
    key: 'summer',
    emoji: '️',
    name: 'الصيف',
    months: 'يونيو - أغسطس',
    color: '#f59e0b',
    tips: 'حماية من الشمس أساسية — البشرة الدهنية تحتاج عناية',
    services: [
      { emoji: '', name: 'واقي شمس طبي', why: 'حماية من الأشعة الضارة' },
      { emoji: '', name: 'باديكير صيفي', why: 'أقدام جاهزة للصيف' },
      { emoji: '️', name: 'إزالة شعر', why: 'بشرة ناعمة للبحر' },
      { emoji: '‍️', name: 'تسريحات صيفية', why: 'شعر مريح للحر' },
    ],
  },
  {
    key: 'autumn',
    emoji: '',
    name: 'الخريف',
    months: 'سبتمبر - نوفمبر',
    color: '#d97706',
    tips: 'إصلاح أضرار الصيف — تحضير للشتاء',
    services: [
      { emoji: '', name: 'علاج التصبغات', why: 'إصلاح أضرار شمس الصيف' },
      { emoji: '‍️', name: 'مساج استرخاء', why: 'عودة للروتين بعد الإجازة' },
      { emoji: '‍️', name: 'علاج الشعر', why: 'ترميم بعد ملح البحر والكلور' },
      { emoji: '‍️', name: 'قناع مغذي', why: 'تحضير البشرة للشتاء' },
    ],
  },
];

export default function SeasonalCalendarScreen(): JSX.Element {
  const { t } = useLocale();
  const [season, setSeason] = useState('summer');
  const s = SEASONS.find((x) => x.key === season)!;

  return (
    <ScrollView
      style={[styles.c, { backgroundColor: s.color + '10' }]}
      contentContainerStyle={styles.i}
    >
      <Text style={[styles.t, { color: s.color }]}>{t('mobile.seasonalCalendar.title')}</Text>
      <Text style={styles.sub}>{t('mobile.seasonalCalendar.subtitle')}</Text>

      <View style={styles.tabs}>
        {SEASONS.map((se) => (
          <TouchableOpacity
            key={se.key}
            onPress={() => setSeason(se.key)}
            style={[styles.tb, season === se.key && { backgroundColor: se.color }]}
          >
            <Text style={[styles.tbe, season === se.key && { color: '#fff' }]}>{se.emoji}</Text>
            <Text style={[styles.tbn, season === se.key && { color: '#fff' }]}>{se.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.card, { borderLeftColor: s.color }]}>
        <Text style={styles.cardEmoji}>{s.emoji}</Text>
        <Text style={styles.cardTitle}>
          {s.name} — {s.months}
        </Text>
        <Text style={styles.cardTip}> {s.tips}</Text>
      </View>

      <Text style={styles.st}>{t('mobile.seasonalCalendar.season-services')}</Text>
      {s.services.map((sv, i) => (
        <View key={i} style={styles.svc}>
          <Text style={styles.se}>{sv.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{sv.name}</Text>
            <Text style={styles.sw}>{sv.why}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={[styles.btn, { backgroundColor: s.color }]}>
        <Text style={styles.bt}>{t('mobile.seasonalCalendar.book')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1 },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  tb: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tbe: { fontSize: 20 },
  tbn: { fontSize: 10, fontWeight: '600', color: '#6b7280', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  cardEmoji: { fontSize: 40 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  cardTip: { fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  svc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  se: { fontSize: 30 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sw: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12 },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
