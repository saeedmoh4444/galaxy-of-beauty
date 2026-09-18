import { useState } from 'react';
import type { JSX } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/Toast';

/**
 * NPS post-booking survey card (quick win #6) — shown on COMPLETED
 * bookings. One response per booking (the API enforces it); the card
 * switches between rate / thanks / already-rated states.
 */
export function NpsCard({ bookingId }: { bookingId: number }): JSX.Element {
  const { t } = useLocale();
  const { showToast } = useToast();
  const utils = trpc.useUtils();
  const mineQ = trpc.nps.mine.useQuery(undefined, { enabled: bookingId > 0 });
  const mine = (mineQ.data as { bookingId?: number; score?: number }[] | undefined) ?? [];
  const existing = mine.find((r) => r.bookingId === bookingId);

  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  const submitMut = trpc.nps.submit.useMutation({
    onSuccess: () => {
      setDone(true);
      void utils.nps.mine.invalidate();
    },
    onError: () => showToast('error', t('mobile.failed')),
  });

  if (existing) {
    return (
      <View style={styles.card}>
        <Text style={styles.thanks}>{t('nps.already', { score: existing.score ?? 0 })}</Text>
      </View>
    );
  }
  if (done) {
    return (
      <View style={styles.card}>
        <Text style={styles.thanks}>{t('nps.thanks')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('nps.title')}</Text>
      <Text style={styles.q}>{t('nps.question')}</Text>
      <View style={styles.scores}>
        {Array.from({ length: 11 }, (_, i) => i).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.scoreBtn, score === s && styles.scoreBtnOn]}
            onPress={() => setScore(s)}
          >
            <Text style={[styles.scoreText, score === s && styles.scoreTextOn]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        placeholder={t('nps.comment-placeholder')}
        multiline
      />
      <TouchableOpacity
        style={[styles.submit, score === null && styles.submitOff]}
        disabled={score === null || submitMut.isPending}
        onPress={() =>
          submitMut.mutate({ bookingId, score: score as number, comment: comment || undefined })
        }
      >
        <Text style={styles.submitText}>{t('nps.submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f0e4e8',
  },
  title: { fontSize: 16, fontWeight: '800', color: '#c2255c', marginBottom: 6 },
  q: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  scores: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  scoreBtn: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  scoreBtnOn: { backgroundColor: '#c2255c', borderColor: '#c2255c' },
  scoreText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  scoreTextOn: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#f0e4e8',
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
    fontSize: 13,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submit: { backgroundColor: '#c2255c', borderRadius: 12, padding: 12, alignItems: 'center' },
  submitOff: { opacity: 0.4 },
  submitText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  thanks: { fontSize: 14, fontWeight: '700', color: '#059669', textAlign: 'center' },
});
