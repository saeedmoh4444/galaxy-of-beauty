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
    title: 'برنامج She Leads',
    subtitle: 'تمكين المرأة في قطاع التجميل',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'تدريب: مهارات القيادة والإدارة' },
      { emoji: '', text: 'دعم: قروض صغيرة لبدء مشروعكِ' },
      { emoji: '', text: 'شبكة: تواصلي مع رائدات أعمال' },
      { emoji: '', text: 'شهادة: اعتماد مهني في القيادة' },
    ],
  },
  {
    emoji: '',
    title: 'رائدة أعمال',
    subtitle: 'ابدئي مشروعكِ في التجميل',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'خطة عمل — نساعدكِ في كتابتها' },
      { emoji: '', text: 'تمويل — حتى 100,000 ر.س' },
      { emoji: '', text: 'موقع — دعم إيجار أول 6 أشهر' },
      { emoji: '‍', text: 'إرشاد — مرشد شخصي لمدة سنة' },
    ],
  },
  {
    emoji: '',
    title: 'قصص نجاح',
    subtitle: 'نماذج ملهمة من مجتمعنا',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'نورة — افتتحت صالونها بعد 6 أشهر' },
      { emoji: '', text: 'مها — 3 فروع في سنتين' },
      { emoji: '', text: 'ريم — من عاملة لصاحبة علامة تجارية' },
      { emoji: '', text: 'أنتِ القصة القادمة!' },
    ],
  },
  {
    emoji: '',
    title: 'أهداف القيادة',
    subtitle: 'خططي لمستقبلكِ المهني',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'قصير المدى: دورة قيادة (3 أشهر)' },
      { emoji: '', text: 'متوسط المدى: مشروع صغير (سنة)' },
      { emoji: '', text: 'طويل المدى: 3 فروع (3 سنوات)' },
      { emoji: '', text: 'الرؤية: علامة تجارية سعودية عالمية' },
    ],
  },
];

export default function LeadershipScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.leadership.title')}</Text>
      <Text style={s.sub}>{t('mobile.leadership.subtitle')}</Text>
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

const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f5f3ff' },
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
const s = sc;
