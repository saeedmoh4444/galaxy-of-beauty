import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useState } from 'react';

export default function WhatsAppBotScreen(): JSX.Element {
  const { t } = useLocale();
  // W4-2 — the connect button was a "coming soon" stub. The bot's command
  // engine is REAL (whatsappBot.webhook) — the screen now demos it in-app:
  // tap a command chip → the real engine replies. The WhatsApp deep link
  // activates when the live bot number lands (user-gated).
  const [demoReply, setDemoReply] = useState<string | null>(null);
  const demoMut = trpc.whatsappBot.webhook.useMutation({
    onSuccess: (res) => setDemoReply((res as { reply?: string })?.reply ?? ''),
  });
  // Data used for future WhatsApp integration status
  const q = trpc.whatsappBot.commands.useQuery();

  if (q.isLoading) return <SkeletonList count={3} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={async () => {
            await q.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.whatsapp-bot.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.whatsapp-bot.subtitle')}</Text>

      <View style={styles.card}>
        <Text style={styles.emoji}>💬</Text>
        <Text style={styles.ct}>{t('mobile.public.whatsapp-bot.card-title')}</Text>
        <Text style={styles.cd}>{t('mobile.public.whatsapp-bot.card-desc')}</Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.ft}>{t('mobile.public.whatsapp-bot.features')}</Text>
        {[
          { emoji: '📅', text: t('mobile.public.whatsapp-bot.feature-1') },
          { emoji: '⏰', text: t('mobile.public.whatsapp-bot.feature-2') },
          { emoji: '💬', text: t('mobile.public.whatsapp-bot.feature-3') },
          { emoji: '💰', text: t('mobile.public.whatsapp-bot.feature-4') },
        ].map((f, i) => (
          <View key={i} style={styles.fr}>
            <Text style={styles.fe}>{f.emoji}</Text>
            <Text style={styles.fx}>{f.text}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.ft}>{t('mobile.public.whatsapp-bot.try-here')}</Text>
      <View style={styles.chips}>
        {(q.data as string[] | undefined)?.map((cmd) => (
          <TouchableOpacity
            key={cmd}
            style={styles.chip}
            onPress={() => demoMut.mutate({ from: 'demo', message: cmd })}
          >
            <Text style={styles.chipText}>{cmd}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {demoReply ? (
        <View style={styles.card}>
          <Text style={styles.emoji}>🤖</Text>
          <Text style={styles.cd}>{demoReply}</Text>
        </View>
      ) : null}
      <TouchableOpacity style={styles.btn} disabled onPress={() => undefined}>
        <Text style={styles.bt}>{t('mobile.public.whatsapp-bot.connect-pending')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f0fdf4' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#25D366', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  emoji: { fontSize: 56 },
  ct: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 12, textAlign: 'center' },
  cd: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  features: { marginBottom: 20 },
  ft: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  fr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  fe: { fontSize: 22 },
  fx: { fontSize: 13, color: '#374151' },
  btn: {
    backgroundColor: '#25D366',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    opacity: 0.6,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    backgroundColor: '#fff',
    borderColor: '#bbf7d0',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#15803d' },
});
