import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { rawTrpc } from '@/lib/trpc-react';

const THEMES = [
  { key: 'spa', emoji: '‍️', name: 'سبا منزلي', desc: 'مساج وأقنعة واسترخاء' },
  { key: 'makeup', emoji: '', name: 'حفلة مكياج', desc: 'تجربة مكياج جماعي' },
  { key: 'nails', emoji: '', name: 'صالون أظافر', desc: 'مانيكير وباديكير جماعي' },
  { key: 'bridal', emoji: '', name: 'توديع عزوبية', desc: 'عناية متكاملة للعروس' },
  { key: 'skincare', emoji: '', name: 'روتين عناية', desc: 'أقنعة وعناية بالبشرة' },
];

interface PartyService {
  id?: number;
}

export default function BeautyPartyScreen(): JSX.Element {
  const [, setServices] = useState<PartyService[]>([]);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [theme, setTheme] = useState('spa');
  const [guests, setGuests] = useState(4);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (rawTrpc.services.list.query({}) as Promise<{ items?: PartyService[] }>)
      .then((d) => {
        setServices(d?.items || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);

  const estPerPerson = 150;
  const total = estPerPerson * guests;
  const discount = guests >= 6 ? 20 : guests >= 4 ? 10 : 0;
  const finalTotal = total - (total * discount) / 100;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> حفلة تجميل</Text>
      <Text style={styles.sub}>خططي لحفلة تجميل لكِ ولصديقاتكِ</Text>

      <Text style={styles.st}> اختاري الثيم</Text>
      <View style={styles.themes}>
        {THEMES.map((th) => (
          <TouchableOpacity
            key={th.key}
            onPress={() => setTheme(th.key)}
            style={[styles.th, theme === th.key && styles.tha]}
          >
            <Text style={styles.the}>{th.emoji}</Text>
            <Text style={[styles.thn, theme === th.key && styles.thna]}>{th.name}</Text>
            <Text style={[styles.thd, theme === th.key && styles.thda]}>{th.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.st}>‍️ عدد الصديقات: {guests}</Text>
      <View style={styles.guests}>
        {[2, 3, 4, 5, 6, 8, 10].map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setGuests(g)}
            style={[styles.gb, guests === g && styles.gba]}
          >
            <Text style={[styles.gt, guests === g && styles.gta]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.st}> التكلفة التقديرية</Text>
        <View style={styles.sr}>
          <Text style={styles.sl}>
            {guests} أشخاص × {estPerPerson} ر.س
          </Text>
          <Text style={styles.sv}>{total.toLocaleString()} ر.س</Text>
        </View>
        {discount > 0 && (
          <View style={styles.sr}>
            <Text style={[styles.sl, { color: '#059669' }]}> خصم المجموعة {discount}%</Text>
            <Text style={[styles.sv, { color: '#059669' }]}>
              -{((total * discount) / 100).toLocaleString()} ر.س
            </Text>
          </View>
        )}
        <View style={styles.sd} />
        <View style={styles.sr}>
          <Text style={[styles.sl, { fontWeight: '700' }]}>الإجمالي</Text>
          <Text style={[styles.sv, { fontWeight: '800', fontSize: 20 }]}>
            {finalTotal.toLocaleString()} ر.س
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.bt}> احجزي حفلتكِ الآن</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  themes: { gap: 8, marginBottom: 16 },
  th: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  tha: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  the: { fontSize: 32 },
  thn: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 4 },
  thna: { color: '#db2777' },
  thd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  thda: { color: '#be185d' },
  guests: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  gb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  gba: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  gt: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  gta: { color: '#db2777' },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  sr: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  sl: { fontSize: 14, color: '#374151' },
  sv: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sd: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  btn: { backgroundColor: '#db2777', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
