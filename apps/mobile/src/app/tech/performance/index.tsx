import { View, Text, ScrollView, StyleSheet } from 'react-native';
export default function TechPerformanceScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>📊 أدائي</Text>
      <Text style={s.sub}>تحليلات وإحصائيات</Text>
      <View style={s.row}>
        <View style={s.stat}>
          <Text style={s.sv}>48</Text>
          <Text style={s.sl}>حجز هذا الشهر</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.sv}>4.8</Text>
          <Text style={s.sl}>⭐ التقييم</Text>
        </View>
      </View>
      <View style={s.row}>
        <View style={s.stat}>
          <Text style={s.sv}>12,450</Text>
          <Text style={s.sl}>ر.س الإيرادات</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.sv}>92%</Text>
          <Text style={s.sl}>نسبة الحضور</Text>
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.ct}>📈 اتجاه الحجوزات</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
            height: 80,
            marginTop: 12,
          }}
        >
          {[12, 18, 15, 22, 28, 35, 48].map((v, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: '#8b5cf6',
                borderRadius: 6,
                height: `${(v / 50) * 100}%`,
                opacity: 0.5 + i * 0.08,
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>يونيو</Text>
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>أغسطس</Text>
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.ct}>🏆 خدماتي الأكثر طلباً</Text>
        {[
          { name: 'مكياج', count: 15, emoji: '💄' },
          { name: 'تسريحة شعر', count: 12, emoji: '💇' },
          { name: 'مانيكير', count: 8, emoji: '💅' },
        ].map((sv, i) => (
          <View
            key={i}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}
          >
            <Text>{sv.emoji}</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600' }}>{sv.name}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#7c3aed' }}>{sv.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center' },
  sv: { fontSize: 28, fontWeight: '800', color: '#7c3aed' },
  sl: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  ct: { fontSize: 16, fontWeight: '700', color: '#111827' },
});
const s = sc;
