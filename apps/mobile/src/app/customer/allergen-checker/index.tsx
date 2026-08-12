import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';

const COMMON_ALLERGENS = [
  {
    key: 'fragrance',
    emoji: '',
    name: 'العطور',
    risk: 'medium',
    desc: 'قد تسبب تهيج البشرة الحساسة',
  },
  { key: 'alcohol', emoji: '', name: 'الكحول', risk: 'high', desc: 'يجفف البشرة ويهيجها' },
  {
    key: 'parabens',
    emoji: '',
    name: 'البارابين',
    risk: 'medium',
    desc: 'مواد حافظة قد تسبب حساسية',
  },
  {
    key: 'sulfates',
    emoji: '',
    name: 'الكبريتات',
    risk: 'high',
    desc: 'منظفات قاسية على البشرة',
  },
  { key: 'silicones', emoji: '', name: 'السيليكون', risk: 'low', desc: 'يسد المسام عند البعض' },
  {
    key: 'essential_oils',
    emoji: '',
    name: 'زيوت عطرية',
    risk: 'medium',
    desc: 'قد تسبب حساسية للبشرة الحساسة',
  },
  {
    key: 'lanolin',
    emoji: '',
    name: 'اللانولين',
    risk: 'medium',
    desc: 'دهن صوفي قد يسبب حساسية',
  },
  {
    key: 'formaldehyde',
    emoji: '️',
    name: 'الفورمالديهايد',
    risk: 'high',
    desc: 'مادة حافظة ضارة',
  },
];

const MY_ALLERGIES = ['alcohol', 'sulfates', 'fragrance'];

export default function AllergenCheckerScreen(): JSX.Element {
  const [query, setQuery] = useState('');
  const [checked, setChecked] = useState<string[]>(MY_ALLERGIES);

  const toggleAllergy = (key: string) => {
    if (checked.includes(key)) setChecked(checked.filter((x) => x !== key));
    else setChecked([...checked, key]);
  };

  const highRisk = COMMON_ALLERGENS.filter((a) => checked.includes(a.key) && a.risk === 'high');
  const mediumRisk = COMMON_ALLERGENS.filter((a) => checked.includes(a.key) && a.risk === 'medium');

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> فاحص الحساسية</Text>
      <Text style={styles.sub}>تجنبي المكونات اللي تسبب حساسية لبشرتكِ</Text>

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ابحثي عن منتج أو مكون..."
          style={styles.inp}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.sb}>
          <Text style={styles.sbt}></Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.st}> مسببات الحساسية لديّ</Text>
      <View style={styles.grid}>
        {COMMON_ALLERGENS.map((a) => {
          const isChecked = checked.includes(a.key);
          return (
            <TouchableOpacity
              key={a.key}
              onPress={() => toggleAllergy(a.key)}
              style={[
                styles.ac,
                isChecked && styles.aca,
                {
                  borderColor: isChecked
                    ? a.risk === 'high'
                      ? '#dc2626'
                      : a.risk === 'medium'
                        ? '#f59e0b'
                        : '#059669'
                    : '#e5e7eb',
                },
              ]}
            >
              <Text style={styles.ae}>{a.emoji}</Text>
              <Text style={styles.an}>{a.name}</Text>
              <View
                style={[
                  styles.ark,
                  {
                    backgroundColor:
                      a.risk === 'high' ? '#fee2e2' : a.risk === 'medium' ? '#fef3c7' : '#dcfce7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.art,
                    {
                      color:
                        a.risk === 'high' ? '#dc2626' : a.risk === 'medium' ? '#d97706' : '#059669',
                    },
                  ]}
                >
                  {a.risk === 'high' ? 'عالي' : a.risk === 'medium' ? 'متوسط' : 'منخفض'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {highRisk.length > 0 && (
        <View style={styles.warning}>
          <Text style={styles.wt}> منتجات يجب تجنبها</Text>
          {highRisk.map((a) => (
            <Text key={a.key} style={styles.wi}>
              • {a.name}: {a.desc}
            </Text>
          ))}
        </View>
      )}

      {mediumRisk.length > 0 && (
        <View style={styles.caution}>
          <Text style={styles.ct}> الحذر مطلوب</Text>
          {mediumRisk.map((a) => (
            <Text key={a.key} style={styles.ci}>
              • {a.name}: {a.desc}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.st}> نصيحة</Text>
      <View style={styles.tip}>
        <Text style={styles.tipText}>
          اقرئي المكونات دائماً قبل شراء أي منتج. المكونات مرتبة تنازلياً حسب النسبة — أول 5 مكونات
          هي الأهم.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  inp: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  sb: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sbt: { fontSize: 18 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ac: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  aca: { backgroundColor: '#eff6ff' },
  ae: { fontSize: 24 },
  an: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 4 },
  ark: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  art: { fontSize: 10, fontWeight: '700' },
  warning: { backgroundColor: '#fee2e2', borderRadius: 14, padding: 14, marginTop: 16 },
  wt: { fontSize: 15, fontWeight: '700', color: '#dc2626', marginBottom: 8 },
  wi: { fontSize: 13, color: '#991b1b', marginBottom: 4 },
  caution: { backgroundColor: '#fef3c7', borderRadius: 14, padding: 14, marginTop: 12 },
  ct: { fontSize: 15, fontWeight: '700', color: '#d97706', marginBottom: 8 },
  ci: { fontSize: 13, color: '#92400e', marginBottom: 4 },
  tip: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  tipText: { fontSize: 13, color: '#374151', lineHeight: 20, textAlign: 'right' },
});
