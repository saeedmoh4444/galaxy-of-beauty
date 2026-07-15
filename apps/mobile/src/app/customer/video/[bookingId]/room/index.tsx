import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function VideoRoomScreen() {
  const { bookingId, room } = useLocalSearchParams<{ bookingId: string; room: string }>();
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    setCopied(true);
    Alert.alert('رقم الغرفة', room || 'غير معروف');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>غرفة الفيديو</Text>

      <View style={styles.card}>
        <Text style={styles.emoji}>📹</Text>
        <Text style={styles.roomLabel}>رقم الغرفة</Text>
        <Text style={styles.roomId}>{room || 'غير معروف'}</Text>
        <Text style={styles.bookingLabel}>الحجز: {bookingId}</Text>

        <View style={styles.videoPlaceholder}>
          <Text style={styles.placeholderText}>واجهة الفيديو</Text>
          <Text style={styles.placeholderSub}>يتم التكامل مع Daily.co أو Whereby</Text>
        </View>

        <TouchableOpacity style={styles.copyBtn} onPress={copyRoomId} activeOpacity={0.8}>
          <Text style={styles.copyText}>{copied ? '✅ تم النسخ' : 'نسخ رقم الغرفة'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 20 },
  card: { alignItems: 'center', padding: 24, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16 },
  emoji: { fontSize: 56, marginBottom: 16 },
  roomLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 4 },
  roomId: { fontSize: 18, fontWeight: '700', color: '#111827', fontFamily: 'monospace', marginBottom: 8 },
  bookingLabel: { fontSize: 13, color: '#6b7280', marginBottom: 20 },
  videoPlaceholder: {
    width: '100%', aspectRatio: 4/3, borderRadius: 12, borderWidth: 2,
    borderColor: '#e5e7eb', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  placeholderText: { fontSize: 14, color: '#9ca3af' },
  placeholderSub: { fontSize: 11, color: '#d1d5db', marginTop: 4 },
  copyBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  copyText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
