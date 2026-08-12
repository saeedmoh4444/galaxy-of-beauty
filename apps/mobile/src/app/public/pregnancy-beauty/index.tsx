import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const TRIMESTERS = [
  {
    key: 'first',
    emoji: '',
    name: 'الأول',
    weeks: '1-13',
    color: '#10b981',
    tips: ['تجنبي الصبغات الكيميائية', 'استخدمي منتجات طبيعية', 'الحناء بديل آمن للشعر'],
    safe: ['ترطيب البشرة', 'مساج لطيف', 'مانيكير طبيعي', 'عناية بالأقدام'],
    avoid: ['صبغات الشعر', 'علاجات كيميائية', 'الساونا', 'المساج القوي'],
  },
  {
    key: 'second',
    emoji: '',
    name: 'الثاني',
    weeks: '14-26',
    color: '#8b5cf6',
    tips: ['البشرة متألقة — استمتعي!', 'وقت مناسب للمانيكير', 'ترطيب مكثف لمنع علامات التمدد'],
    safe: ['مانيكير وباديكير', 'قص وتصفيف شعر', 'مكياج خفيف', 'مساج ظهر لطيف'],
    avoid: ['الاستلقاء على الظهر طويلاً', 'منتجات الريتينول', 'الزيوت العطرية القوية'],
  },
  {
    key: 'third',
    emoji: '',
    name: 'الثالث',
    weeks: '27-40',
    color: '#ec4899',
    tips: [
      'قد تظهر الكلف — استخدمي واقي شمس',
      'رفع القدمين لتقليل التورم',
      'العناية بالبشرة الجافة',
    ],
    safe: ['باديكير', 'ترطيب عميق', 'قص شعر', 'مساج قدمين'],
    avoid: ['الاستلقاء على الظهر', 'العلاجات الطويلة', 'أي منتجات برائحة قوية'],
  },
];

export default function PregnancyBeautyScreen(): JSX.Element {
  const [trimester, setTrimester] = useState('second');

  const t = TRIMESTERS.find((x) => x.key === trimester)!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> جمال الحامل</Text>
      <Text style={styles.sub}>خدمات آمنة لكل مرحلة من الحمل</Text>

      <View style={styles.tabs}>
        {TRIMESTERS.map((tr) => (
          <TouchableOpacity
            key={tr.key}
            onPress={() => setTrimester(tr.key)}
            style={[styles.tab, trimester === tr.key && { backgroundColor: tr.color }]}
          >
            <Text style={[styles.tabText, trimester === tr.key && { color: '#fff' }]}>
              {tr.emoji} {tr.name}
            </Text>
            <Text style={[styles.tabWeeks, trimester === tr.key && { color: '#fff' }]}>
              أسبوع {tr.weeks}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.card, { borderColor: t.color }]}>
        <Text style={styles.cardTitle}> نصائح</Text>
        {t.tips.map((tip, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>{tip}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: '#059669' }]}> آمن</Text>
        <View style={styles.grid}>
          {t.safe.map((s, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}> {s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: '#dc2626' }]}> تجنبي</Text>
        <View style={styles.grid}>
          {t.avoid.map((s, i) => (
            <View key={i} style={[styles.chip, styles.chipAvoid]}>
              <Text style={[styles.chipText, { color: '#dc2626' }]}> {s}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f0fdf4' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  tabText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  tabWeeks: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  bullet: { fontSize: 16, color: '#059669' },
  text: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#dcfce7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  chipAvoid: { backgroundColor: '#fee2e2' },
  chipText: { fontSize: 12, fontWeight: '600' },
});
