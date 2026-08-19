import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/components/LocaleProvider';

export default function VideoRoomScreen() {
  const { t } = useLocale();
  const { bookingId, room } = useLocalSearchParams<{ bookingId: string; room: string }>();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    setCopied(true);
    showToast('info', t('mobile.video.room-toast', { room: room || t('mobile.video.unknown') }));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('videoRoom.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.emoji}></Text>
        <Text style={styles.roomLabel}>{t('mobile.video.room-label')}</Text>
        <Text style={styles.roomId}>{room || t('mobile.video.unknown')}</Text>
        <Text style={styles.bookingLabel}>{t('mobile.video.booking-id', { id: bookingId })}</Text>

        <View style={styles.videoPlaceholder}>
          <Text style={styles.placeholderText}>{t('mobile.video.video-ui')}</Text>
          <Text style={styles.placeholderSub}>{t('mobile.video.integration-note')}</Text>
        </View>

        <TouchableOpacity style={styles.copyBtn} onPress={copyRoomId} activeOpacity={0.8}>
          <Text style={styles.copyText}>
            {copied ? t('mobile.video.copied') : t('videoRoom.copyRoomNumber')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 20,
  },
  card: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  roomLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 4 },
  roomId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  bookingLabel: { fontSize: 13, color: '#6b7280', marginBottom: 20 },
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: { fontSize: 14, color: '#9ca3af' },
  placeholderSub: { fontSize: 11, color: '#d1d5db', marginTop: 4 },
  copyBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  copyText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
