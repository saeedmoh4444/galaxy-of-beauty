import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const SEASONS_COLORS = [
  {
    key: 'winter',
    emoji: '️',
    name: 'شتوية',
    desc: 'ألوان باردة وعميقة',
    colors: ['#1e1b4b', '#312e81', '#831843', '#ffffff', '#000000', '#dc2626', '#4c1d95'],
    skin: 'بشرة فاتحة أو زيتونية باردة',
    makeup: ['أحمر شفاه عنابي', 'ظلال عيون بنفسجية', 'أيلاينر أسود'],
    jewelry: 'الفضة',
  },
  {
    key: 'summer',
    emoji: '',
    name: 'صيفية',
    desc: 'ألوان ناعمة وباستيل',
    colors: ['#fbcfe8', '#ddd6fe', '#bfdbfe', '#d1d5db', '#ec4899', '#8b5cf6', '#93c5fd'],
    skin: 'بشرة فاتحة أو متوسطة باردة',
    makeup: ['أحمر شفاه وردي', 'ظلال عيون لافندر', 'ماسكارا بنية'],
    jewelry: 'الفضة',
  },
  {
    key: 'autumn',
    emoji: '',
    name: 'خريفية',
    desc: 'ألوان دافئة وغنية',
    colors: ['#fef3c7', '#fed7aa', '#fde68a', '#d97706', '#b45309', '#92400e', '#78350f'],
    skin: 'بشرة زيتونية دافئة أو ذهبية',
    makeup: ['أحمر شفاه برونزي', 'ظلال عيون ترابية', 'بلاشر خوخي'],
    jewelry: 'الذهب',
  },
  {
    key: 'spring',
    emoji: '',
    name: 'ربيعية',
    desc: 'ألوان مشرقة ودافئة',
    colors: ['#fef08a', '#fde047', '#86efac', '#fca5a5', '#fb923c', '#22c55e', '#fbbf24'],
    skin: 'بشرة فاتحة دافئة أو خوخية',
    makeup: ['أحمر شفاه مرجاني', 'ظلال عيون ذهبية', 'هايلايتر شمباني'],
    jewelry: 'الذهب',
  },
];

export default function ColorAnalysisScreen(): JSX.Element {
  const [season, setSeason] = useState('summer');
  const s = SEASONS_COLORS.find((x) => x.key === season)!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> تحليل الألوان</Text>
      <Text style={styles.sub}>اكتشفي الألوان اللي تناسب بشرتكِ</Text>

      <View style={styles.tabs}>
        {SEASONS_COLORS.map((sc) => (
          <TouchableOpacity
            key={sc.key}
            onPress={() => setSeason(sc.key)}
            style={[styles.tb, season === sc.key && styles.tbA]}
          >
            <Text style={styles.tbe}>{sc.emoji}</Text>
            <Text style={[styles.tbn, season === sc.key && styles.tbnA]}>{sc.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.ct}>
          {s.emoji} {s.name} — {s.desc}
        </Text>
        <Text style={styles.cs}> {s.skin}</Text>

        <Text style={styles.st}> لوحة الألوان</Text>
        <View style={styles.palette}>
          {s.colors.map((c, i) => (
            <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
          ))}
        </View>

        <Text style={styles.st}> المكياج المناسب</Text>
        {s.makeup.map((m, i) => (
          <View key={i} style={styles.makeupItem}>
            <Text style={styles.makeupEmoji}></Text>
            <Text style={styles.makeupText}>{m}</Text>
          </View>
        ))}

        <View style={styles.jewelryRow}>
          <Text style={styles.jewelryLabel}> المجوهرات</Text>
          <Text style={styles.jewelryValue}>{s.jewelry}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.bt}> حللي بشرتكِ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
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
  tbA: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  tbe: { fontSize: 20 },
  tbn: { fontSize: 10, fontWeight: '600', color: '#6b7280', marginTop: 2 },
  tbnA: { color: '#db2777' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  ct: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cs: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  st: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 12 },
  palette: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#e5e7eb' },
  makeupItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  makeupEmoji: { fontSize: 16 },
  makeupText: { fontSize: 13, color: '#374151' },
  jewelryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  jewelryLabel: { fontSize: 14, color: '#6b7280' },
  jewelryValue: { fontSize: 16, fontWeight: '700', color: '#f59e0b' },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
