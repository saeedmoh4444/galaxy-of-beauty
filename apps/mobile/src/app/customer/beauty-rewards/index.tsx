import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';

interface Tip {
  emoji: string;
  text: string;
}
interface Card {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  tips: Tip[];
}

const CARDS: Card[] = [
  {
    emoji: '',
    title: 'مكافآت الجمال',
    subtitle: '1250 نقطة — المستوى الذهبي',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: '1250 نقطة — قابلة للاستبدال' },
      { emoji: '', text: 'المستوى: ذهبي — خصم 15%' },
      { emoji: '', text: 'الهدية القادمة: قناع وجه مجاني' },
      { emoji: '', text: 'تنتهي النقاط بعد 12 شهراً' },
    ],
  },
  {
    emoji: '',
    title: 'أرباح الولاء',
    subtitle: '4500 ر.س إنفاق سنوي',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'نسبة الاسترداد: 5% — 225 ر.س سنوياً' },
      { emoji: '', text: 'المستوى: ذهبي — نسبة أعلى' },
      { emoji: '', text: 'تضاف للمحفظة — تلقائياً' },
      { emoji: '', text: 'تصرف في أي وقت — لا حد أدنى' },
    ],
  },
  {
    emoji: '',
    title: 'ذكرى الانضمام',
    subtitle: 'سنتان — أغسطس 2024',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'عضوة منذ: أغسطس 2024' },
      { emoji: '', text: '48 حجز — في سنتين' },
      { emoji: '', text: 'هدية الذكرى: خصم 50 ر.س' },
      { emoji: '', text: 'شكراً لكونكِ جزءاً من عائلتنا' },
    ],
  },
  {
    emoji: '',
    title: 'لوحة الإحالات',
    subtitle: 'المركز الخامس — 3 إحالات',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'نورة: 12 إحالة — المركز الأول' },
      { emoji: '', text: 'مها: 8 إحالات — المركز الثاني' },
      { emoji: '', text: 'ريم: 5 إحالات — المركز الثالث' },
      { emoji: '', text: 'أنتِ: 3 إحالات — المركز الخامس' },
    ],
  },
  {
    emoji: '',
    title: 'خصم الطالبات',
    subtitle: '15% — للطالبات الجامعيات',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '', text: 'لطالبات الجامعة — undergraduate' },
      { emoji: '', text: 'خصم 15% — على جميع الخدمات' },
      { emoji: '', text: 'إثبات: البطاقة الجامعية' },
      { emoji: '', text: 'لا يدمج مع عروض أخرى' },
    ],
  },
  {
    emoji: '',
    title: 'خصم المجموعات',
    subtitle: 'احجزوا معاً — وفروا أكثر',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: '3+ أشخاص — خصم 10%' },
      { emoji: '', text: '5+ أشخاص — خصم 15%' },
      { emoji: '', text: '8+ أشخاص — خصم 20%' },
      { emoji: '', text: 'مناسبات خاصة — باقة VIP' },
    ],
  },
  {
    emoji: '',
    title: 'نقاط الطيبة',
    subtitle: 'أفعلي خيراً — اكسبي نقاطاً',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'ساعدي صديقة — 50 نقطة' },
      { emoji: '', text: 'اكتبي تقييماً — 25 نقطة' },
      { emoji: '', text: 'أحلي هدية — 100 نقطة' },
      { emoji: '', text: 'كوني لطيفة — الجمال في العطاء' },
    ],
  },
];

export default function BeautyRewardsScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('beautyRewards.title')}</Text>
      <Text style={s.sub}>{t('beautyRewards.subtitle')}</Text>
      <View style={s.grid}>
        {CARDS.map((c, i) => (
          <View key={i} style={[s.card, { borderColor: c.color + '30' }]}>
            <View style={s.ch}>
              <Text style={s.ce}>{c.emoji}</Text>
              <View style={s.cw}>
                <Text style={[s.ct, { color: c.color }]}>{c.title}</Text>
                <Text style={s.cs}>{c.subtitle}</Text>
              </View>
            </View>
            <View style={s.tl}>
              {c.tips.map((t, j) => (
                <View key={j} style={[s.tr, { backgroundColor: c.bg }]}>
                  <Text style={s.te}>{t.emoji}</Text>
                  <Text style={[s.tt, { color: c.color }]}>{t.text}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  grid: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 4 },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  ce: { fontSize: 28 },
  cw: { flex: 1 },
  ct: { fontSize: 15, fontWeight: '700' },
  cs: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tl: { gap: 6 },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  te: { fontSize: 14, width: 20, textAlign: 'center' },
  tt: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});
