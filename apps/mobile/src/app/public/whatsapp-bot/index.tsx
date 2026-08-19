import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

export default function WhatsAppBotScreen(): JSX.Element {
  const { t } = useLocale();
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
          onRefresh={() => q.refetch()}
          colors={['#25D366']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.whatsapp-bot.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.whatsapp-bot.subtitle')}</Text>

      <View style={styles.card}>
        <Text style={styles.emoji}></Text>
        <Text style={styles.ct}>{t('mobile.public.whatsapp-bot.card-title')}</Text>
        <Text style={styles.cd}>{t('mobile.public.whatsapp-bot.card-desc')}</Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.ft}>{t('mobile.public.whatsapp-bot.features')}</Text>
        {[
          { emoji: '', text: t('mobile.public.whatsapp-bot.feature-1') },
          { emoji: '', text: t('mobile.public.whatsapp-bot.feature-2') },
          { emoji: '', text: t('mobile.public.whatsapp-bot.feature-3') },
          { emoji: '', text: t('mobile.public.whatsapp-bot.feature-4') },
        ].map((f, i) => (
          <View key={i} style={styles.fr}>
            <Text style={styles.fe}>{f.emoji}</Text>
            <Text style={styles.fx}>{f.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.bt}>{t('mobile.public.whatsapp-bot.connect')}</Text>
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
  btn: { backgroundColor: '#25D366', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
