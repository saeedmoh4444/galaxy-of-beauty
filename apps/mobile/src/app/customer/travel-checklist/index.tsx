import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const DESTINATIONS = [
  {
    key: 'beach',
    emoji: '🏖️',
    name: 'شاطئ',
    color: '#0891b2',
    essentials: [
      { item: 'واقي شمس SPF50', checked: false },
      { item: 'شامبو بعد البحر', checked: false },
      { item: 'بلسم مرطب', checked: false },
      { item: 'ماسك شعر', checked: false },
      { item: 'مبرد أظافر', checked: false },
      { item: 'كريم ترطيب', checked: false },
      { item: 'بخاخ ملح بحري', checked: false },
      { item: 'مزيل مكياج مقاوم للماء', checked: false },
    ],
    tips: 'الشعر يحتاج عناية إضافية بعد السباحة — احضري علاج شعر مكثف',
  },
  {
    key: 'city',
    emoji: '🏙️',
    name: 'مدينة',
    color: '#6366f1',
    essentials: [
      { item: 'كريم أساس', checked: false },
      { item: 'أحمر شفاه', checked: false },
      { item: 'ماسكارا', checked: false },
      { item: 'مناديل مبللة', checked: false },
      { item: 'عطر صغير', checked: false },
      { item: 'مرطب وجه', checked: false },
      { item: 'جل حواجب', checked: false },
      { item: 'بخاخ مثبت مكياج', checked: false },
    ],
    tips: 'عبوات صغيرة الحجم — وفري مساحة في حقيبتكِ',
  },
  {
    key: 'mountain',
    emoji: '⛰️',
    name: 'جبال',
    color: '#059669',
    essentials: [
      { item: 'مرطب شفاه', checked: false },
      { item: 'كريم يدين', checked: false },
      { item: 'واقي شمس', checked: false },
      { item: 'لوشن جسم', checked: false },
      { item: 'زيت شعر', checked: false },
      { item: 'مصل وجه', checked: false },
      { item: 'بخاخ ماء', checked: false },
      { item: 'قناع ترطيب', checked: false },
    ],
    tips: 'الجو الجاف يحتاج ترطيب مكثف — ركزي على المنتجات المرطبة',
  },
];

export default function TravelChecklistScreen(): JSX.Element {
  const [dest, setDest] = useState('beach');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const d = DESTINATIONS.find((x) => x.key === dest)!;
  const toggle = (item: string) => {
    const n = new Set(checked);
    n.has(item) ? n.delete(item) : n.add(item);
    setChecked(n);
  };
  const progress = Math.round((checked.size / d.essentials.length) * 100);

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🧳 حقيبة السفر</Text>
      <Text style={styles.sub}>قائمة مستلزمات الجمال للسفر</Text>

      <View style={styles.tabs}>
        {DESTINATIONS.map((dx) => (
          <TouchableOpacity
            key={dx.key}
            onPress={() => {
              setDest(dx.key);
              setChecked(new Set());
            }}
            style={[styles.tb, dest === dx.key && { backgroundColor: dx.color }]}
          >
            <Text style={[styles.tbe, dest === dx.key && { color: '#fff' }]}>{dx.emoji}</Text>
            <Text style={[styles.tbn, dest === dx.key && { color: '#fff' }]}>{dx.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progress}>
        <Text style={styles.pt}>🎒 {progress}% جاهز</Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${progress}%`, backgroundColor: d.color }]} />
        </View>
      </View>

      <Text style={styles.st}>✅ القائمة</Text>
      {d.essentials.map((e, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => toggle(e.item)}
          style={[styles.item, checked.has(e.item) && styles.itemDone]}
        >
          <View
            style={[
              styles.check,
              checked.has(e.item) && { backgroundColor: d.color, borderColor: d.color },
            ]}
          >
            <Text style={styles.checkText}>{checked.has(e.item) ? '✓' : '○'}</Text>
          </View>
          <Text style={[styles.itemText, checked.has(e.item) && styles.itemTextDone]}>
            {e.item}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.tip}>
        <Text style={styles.tipEmoji}>💡</Text>
        <Text style={styles.tipText}>{d.tips}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 16 },
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
  progress: { marginBottom: 16 },
  pt: { fontSize: 14, fontWeight: '600', color: '#0891b2', marginBottom: 6 },
  bar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
  fill: { height: 8, borderRadius: 4 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  itemDone: { backgroundColor: '#f0fdf4' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 12, color: '#6b7280' },
  itemText: { fontSize: 14, color: '#111827' },
  itemTextDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  tip: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  tipEmoji: { fontSize: 20 },
  tipText: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right', lineHeight: 20 },
});
