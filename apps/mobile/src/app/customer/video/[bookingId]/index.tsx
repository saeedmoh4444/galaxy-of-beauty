import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function VideoSessionScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const bid = Number(bookingId);
  const [joining, setJoining] = useState(false);
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = () => {
    if (isNaN(bid)) { setLoading(false); return; }
    (trpc.video.getByBooking.query({ bookingId: bid }) as unknown as Promise<Record<string, unknown> | null>)
      .then((s) => { setSession(s); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchSession(); }, [bookingId]);

  const handleStart = async () => {
    setJoining(true);
    try {
      const result = await (trpc.video.startSession.mutate({ bookingId: bid }) as unknown as Promise<Record<string, unknown>>);
      const roomId = result.roomId as string;
      router.push(`/customer/video/${bookingId}/room?room=${roomId}`);
    } catch {
      Alert.alert('خطأ', 'فشل بدء الجلسة');
      setJoining(false);
    }
  };

  const handleEnd = async (roomId: string) => {
    await (trpc.video.endSession.mutate({ roomId }) as unknown as Promise<unknown>);
    fetchSession();
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>استشارة فيديو</Text>

      {!session ? (
        <View style={styles.card}>
          <Text style={styles.emoji}>📹</Text>
          <Text style={styles.cardTitle}>استشارة عبر الفيديو</Text>
          <Text style={styles.cardSub}>تواصلي مع الفنانه مباشرة عبر مكالمة فيديو آمنة</Text>
          <TouchableOpacity style={styles.btn} onPress={handleStart} disabled={joining} activeOpacity={0.8}>
            {joining ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>بدء الاستشارة</Text>}
          </TouchableOpacity>
        </View>
      ) : session.status === 'WAITING' ? (
        <View style={[styles.card, styles.waitingCard]}>
          <Text style={styles.emoji}>⏳</Text>
          <Text style={[styles.cardTitle, { color: '#7c3aed' }]}>في انتظار الطرف الآخر...</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push(`/customer/video/${bookingId}/room?room=${session.roomId as string}`)} activeOpacity={0.8}>
            <Text style={styles.btnText}>الانضمام للغرفة</Text>
          </TouchableOpacity>
        </View>
      ) : session.status === 'IN_PROGRESS' ? (
        <View style={styles.card}>
          <Text style={styles.emoji}>🟢</Text>
          <Text style={[styles.cardTitle, { color: '#16a34a' }]}>الجلسة نشطة</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btn} onPress={() => router.push(`/customer/video/${bookingId}/room?room=${session.roomId as string}`)} activeOpacity={0.8}>
              <Text style={styles.btnText}>العودة للغرفة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={() => handleEnd(session.roomId as string)} activeOpacity={0.8}>
              <Text style={styles.btnOutlineText}>إنهاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.emoji}>✅</Text>
          <Text style={[styles.cardTitle, { color: '#6b7280' }]}>انتهت الجلسة</Text>
          {session.durationSec ? (
            <Text style={styles.cardSub}>المدة: {Math.round((session.durationSec as number) / 60)} دقيقة</Text>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 20 },
  card: { alignItems: 'center', padding: 28, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16 },
  waitingCard: { borderColor: '#c4b5fd', backgroundColor: '#faf5ff' },
  emoji: { fontSize: 56, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 8 },
  cardSub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 12 },
  btnOutline: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnOutlineText: { color: '#6b7280', fontSize: 15, fontWeight: '600' },
});
