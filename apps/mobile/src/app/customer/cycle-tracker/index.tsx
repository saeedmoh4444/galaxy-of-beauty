import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const CYCLE_PHASES = [
  {
    key: 'menstrual',
    emoji: '🩸',
    name: 'الدورة',
    days: '1-5',
    tips: ['تجنبي إزالة الشعر بالشمع', 'البشرة حساسة — رطبي بلطف', 'تجنبي العلاجات القوية'],
  },
  {
    key: 'follicular',
    emoji: '',
    name: 'الجريبي',
    days: '6-13',
    tips: [
      'أفضل وقت لتجربة منتجات جديدة',
      'البشرة متقبلة للعلاج',
      'الشعر ينمو أسرع — وقت مثالي للقص',
    ],
  },
  {
    key: 'ovulation',
    emoji: '',
    name: 'الإباضة',
    days: '14-16',
    tips: ['البشرة في أفضل حالاتها', 'مكياج خفيف يكفي', 'وقت مثالي للمناسبات'],
  },
  {
    key: 'luteal',
    emoji: '',
    name: 'الأصفري',
    days: '17-28',
    tips: [
      'البشرة دهنية — استخدمي التونر',
      'احتمالية ظهور حب الشباب',
      'قناع الطين مفيد لإزالة الزيوت',
    ],
  },
];

export default function CycleTrackerScreen(): JSX.Element {
  const [selectedDay, setSelectedDay] = useState(14);
  const currentPhase = CYCLE_PHASES.find((p) => {
    const [s, e] = p.days.split('-').map(Number);
    return selectedDay >= s! && selectedDay <= (e || s!);
  })!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> متعقب الدورة</Text>
      <Text style={styles.sub}>توصيات جمالية حسب يوم دورتكِ</Text>

      <View style={styles.daySelector}>
        <Text style={styles.dayLabel}>اليوم {selectedDay}</Text>
        <View style={styles.days}>
          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setSelectedDay(d)}
              style={[styles.day, selectedDay === d && styles.dayActive]}
            >
              <Text style={[styles.dayText, selectedDay === d && styles.dayTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.phaseCard,
          {
            borderColor:
              currentPhase!.key === 'menstrual'
                ? '#ec4899'
                : currentPhase!.key === 'follicular'
                  ? '#f59e0b'
                  : currentPhase!.key === 'ovulation'
                    ? '#8b5cf6'
                    : '#059669',
          },
        ]}
      >
        <Text style={styles.phaseEmoji}>{currentPhase!.emoji}</Text>
        <Text style={styles.phaseName}>{currentPhase!.name}</Text>
        <Text style={styles.phaseDays}>الأيام {currentPhase!.days}</Text>
      </View>

      <Text style={styles.tipsTitle}> توصيات الجمال</Text>
      {currentPhase!.tips.map((tip, i) => (
        <View key={i} style={styles.tip}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}

      <Text style={styles.tipsTitle}>‍️ الخدمات المناسبة</Text>
      {[
        currentPhase!.key === 'menstrual'
          ? ['مساج استرخاء', 'ترطيب عميق', 'حمام بخار']
          : currentPhase!.key === 'follicular'
            ? ['تقشير البشرة', 'علاج الشعر', 'تجربة مكياج جديد']
            : currentPhase!.key === 'ovulation'
              ? ['مكياج مناسبات', 'تصفيف شعر', 'مانيكير']
              : ['تنظيف البشرة', 'قناع الطين', 'إزالة الرؤوس السوداء'],
      ].map((s, i) => (
        <View key={i} style={styles.svc}>
          <Text style={styles.svcEmoji}>‍️</Text>
          <Text style={styles.svcName}>{s}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  daySelector: { marginBottom: 20 },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  day: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayActive: { backgroundColor: '#db2777', borderColor: '#db2777' },
  dayText: { fontSize: 12, color: '#6b7280' },
  dayTextActive: { color: '#fff' },
  phaseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
  },
  phaseEmoji: { fontSize: 56 },
  phaseName: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 8 },
  phaseDays: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  tipBullet: { fontSize: 16, color: '#db2777' },
  tipText: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
  svc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  svcEmoji: { fontSize: 20 },
  svcName: { fontSize: 13, color: '#374151' },
});
