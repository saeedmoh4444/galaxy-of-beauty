import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { trpc } from '@/lib/trpc-react';

interface PlatformStats {
  totalBookings: number;
  totalServices: number;
  totalTechnicians: number;
  totalReviews: number;
  avgRating: number;
  citiesCount: number;
  happyCustomers: number;
}

const DEFAULT_STATS: PlatformStats = {
  totalBookings: 254000,
  totalServices: 850,
  totalTechnicians: 3200,
  totalReviews: 89000,
  avgRating: 4.8,
  citiesCount: 16,
  happyCustomers: 180000,
};

export default function BeautyStatsScreen(): JSX.Element {
  const statsQ = trpc.beautyStats.platform.useQuery();
  const stats = statsQ.data ?? DEFAULT_STATS;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.b}></Text>
      <Text style={s.h}>جالكسي بيوتي في أرقام</Text>
      <Text style={s.sub}>المنصة الأولى لحجز خدمات التجميل في المملكة</Text>
      <View style={s.grid}>
        <View style={s.card}>
          <Text style={s.ce}></Text>
          <Text style={s.cv}>{stats.totalBookings.toLocaleString('ar-SA')}+</Text>
          <Text style={s.cl}>حجز مكتمل</Text>
        </View>
        <View style={s.card}>
          <Text style={s.ce}>‍</Text>
          <Text style={s.cv}>{stats.totalTechnicians.toLocaleString('ar-SA')}+</Text>
          <Text style={s.cl}>فنية معتمدة</Text>
        </View>
        <View style={s.card}>
          <Text style={s.ce}></Text>
          <Text style={s.cv}>{stats.totalServices.toLocaleString('ar-SA')}+</Text>
          <Text style={s.cl}>خدمة تجميل</Text>
        </View>
        <View style={s.card}>
          <Text style={s.ce}></Text>
          <Text style={s.cv}>{stats.happyCustomers.toLocaleString('ar-SA')}+</Text>
          <Text style={s.cl}>عميلة سعيدة</Text>
        </View>
      </View>
      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.ce}></Text>
        <Text style={s.cv}>{stats.avgRating}</Text>
        <Text style={s.cl}>
          متوسط التقييمات — من {stats.totalReviews.toLocaleString('ar-SA')}+ تقييم
        </Text>
      </View>
      <View style={[s.card, { marginTop: 8 }]}>
        <Text style={s.ce}></Text>
        <Text style={s.cv}>{stats.citiesCount}+</Text>
        <Text style={s.cl}>مدينة سعودية</Text>
      </View>
    </ScrollView>
  );
}

const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 24, paddingTop: 50, paddingBottom: 60 },
  b: { fontSize: 64, textAlign: 'center' },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginTop: 12 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    flexGrow: 1,
    minWidth: '45%',
  },
  ce: { fontSize: 36 },
  cv: { fontSize: 28, fontWeight: '800', color: '#db2777', marginTop: 8 },
  cl: { fontSize: 12, color: '#6b7280', marginTop: 4, textAlign: 'center' },
});
const s = sc;
