import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';
export default function TechPerformanceScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('tech.performance.title')}</Text>
      <Text style={s.sub}>{t('mobile.tech.performance.subtitle')}</Text>
      <View style={s.row}>
        <View style={s.stat}>
          <Text style={s.sv}>48</Text>
          <Text style={s.sl}>{t('mobile.tech.performance.bookings-this-month')}</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.sv}>4.8</Text>
          <Text style={s.sl}>{t('mobile.tech.performance.rating')}</Text>
        </View>
      </View>
      <View style={s.row}>
        <View style={s.stat}>
          <Text style={s.sv}>12,450</Text>
          <Text style={s.sl}>{t('mobile.tech.performance.revenue-sar')}</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.sv}>92%</Text>
          <Text style={s.sl}>{t('mobile.tech.performance.attendance-rate')}</Text>
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.ct}>{t('mobile.tech.performance.bookings-trend')}</Text>
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
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>
            {t('mobile.tech.performance.month-june')}
          </Text>
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>
            {t('mobile.tech.performance.month-august')}
          </Text>
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.ct}>{t('mobile.tech.performance.top-services')}</Text>
        {[
          { name: 'مكياج', count: 15, emoji: '' },
          { name: 'تسريحة شعر', count: 12, emoji: '' },
          { name: 'مانيكير', count: 8, emoji: '' },
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
