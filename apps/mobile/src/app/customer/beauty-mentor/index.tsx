import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { typedTrpc } from '@/lib/trpc-react';

const MENTOR_LEVELS = [
  { key: 'beginner', emoji: '', name: 'مبتدئة', desc: 'اكتشفي أساسيات العناية' },
  { key: 'intermediate', emoji: '', name: 'متوسطة', desc: 'طوري روتينكِ' },
  { key: 'advanced', emoji: '', name: 'متقدمة', desc: 'أتقني فنون التجميل' },
];

const TOPICS = ['العناية بالبشرة', 'المكياج', 'العناية بالشعر', 'الأظافر', 'العطور', 'التغذية'];

export default function BeautyMentorScreen(): JSX.Element {
  const { data: mentorsData } = typedTrpc().beautyCircles?.list?.useQuery?.({ limit: 3 }) ?? {
    data: null,
  };
  const [level, setLevel] = useState('beginner');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const currentLevel = MENTOR_LEVELS.find((l) => l.key === level)!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>‍ مرشدة الجمال</Text>
      <Text style={styles.sub}>تعلمي من خبيرات التجميل</Text>

      <Text style={styles.st}> مستواكِ</Text>
      <View style={styles.levels}>
        {MENTOR_LEVELS.map((l) => (
          <TouchableOpacity
            key={l.key}
            onPress={() => setLevel(l.key)}
            style={[styles.lc, level === l.key && styles.lca]}
          >
            <Text style={styles.le}>{l.emoji}</Text>
            <Text style={[styles.ln, level === l.key && styles.lna]}>{l.name}</Text>
            <Text style={styles.ld}>{l.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.st}> المواضيع</Text>
      <View style={styles.topics}>
        {TOPICS.map((tp) => (
          <TouchableOpacity
            key={tp}
            onPress={() => setSelectedTopic(tp)}
            style={[styles.tp, selectedTopic === tp && styles.tpa]}
          >
            <Text style={[styles.tpt, selectedTopic === tp && styles.tpta]}>{tp}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.st}> خطة التعلم — {currentLevel.name}</Text>
      <View style={styles.plan}>
        {[
          {
            week: 'الأسبوع 1',
            title: 'أساسيات العناية',
            desc: 'تعرفي على نوع بشرتكِ والمنتجات المناسبة',
          },
          { week: 'الأسبوع 2', title: 'روتين يومي', desc: 'ابنِي روتين صباحي ومسائي متكامل' },
          { week: 'الأسبوع 3', title: 'المكونات', desc: 'تعلمي قراءة مكونات المنتجات' },
          { week: 'الأسبوع 4', title: 'تطبيق عملي', desc: 'جلسة تطبيقية مع مرشدة خبيرة' },
        ].map((w, i) => (
          <View key={i} style={styles.week}>
            <View style={styles.wn}>
              <Text style={styles.wnt}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.wt}>{w.title}</Text>
              <Text style={styles.wd}>{w.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.bt}>‍ ابدئي رحلة التعلم</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  levels: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  lc: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  lca: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  le: { fontSize: 28 },
  ln: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 4 },
  lna: { color: '#2563eb' },
  ld: { fontSize: 10, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  tp: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tpa: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tpt: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tpta: { color: '#fff' },
  plan: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  week: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  wn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wnt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  wt: { fontSize: 14, fontWeight: '600', color: '#111827' },
  wd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  btn: { backgroundColor: '#2563eb', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
