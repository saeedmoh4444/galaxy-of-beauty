import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function BookingConfirmScreen(): JSX.Element {
  const { code, date } = useLocalSearchParams<{ code?: string; date?: string }>();
  const bookingCode = code || '———';
  const bookingDate = date || new Date().toISOString();

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}></Text>
      </View>
      <Text style={styles.t}>تم الحجز بنجاح!</Text>
      <Text style={styles.sub}>تم إنشاء حجزكِ بنجاح. سيتم تأكيد الموعد من قبل الفنية قريباً.</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>رمز الحجز</Text>
          <Text style={styles.code}>{bookingCode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>التاريخ</Text>
          <Text style={styles.value}>
            {new Date(bookingDate).toLocaleDateString('ar-SA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>الوقت</Text>
          <Text style={styles.value}>
            {new Date(bookingDate).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewBtn}>
        <Text style={styles.viewBtnText}> عرض حجوزاتي</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookBtnText}>‍️ احجزي خدمة أخرى</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f0fdf4' },
  i: { padding: 30, paddingTop: 60, alignItems: 'center', paddingBottom: 60 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconEmoji: { fontSize: 48 },
  t: { fontSize: 28, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 13, color: '#6b7280' },
  value: { fontSize: 13, fontWeight: '600', color: '#111827' },
  code: { fontSize: 14, fontWeight: '700', color: '#059669', fontFamily: 'monospace' },
  viewBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  viewBtnText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  bookBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  bookBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
