import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface SurpriseService {
  emoji?: string;
  titleJson?: { ar?: string };
  basePrice?: number;
  reason?: string;
}

export default function SurpriseMeScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const surpriseQ = trpc.services.surpriseMe.useQuery({}, { enabled: false });
  const result = (surpriseQ.data as unknown as SurpriseService | null) ?? null;
  const surprise = () => {
    void surpriseQ.refetch();
  };
  if (surpriseQ.isLoading) return <SkeletonList count={3} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('mobile.public.surprise-me.title')}</Text>
      {!result ? (
        <View style={styles.centered}>
          <Text style={styles.emoji}></Text>
          <Text style={styles.hint}>{t('mobile.public.surprise-me.hint')}</Text>
          <TouchableOpacity onPress={surprise} style={styles.btn}>
            <Text style={styles.bt}>{t('mobile.public.surprise-me.choose')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.re}>{result.emoji ?? '‍️'}</Text>
          <Text style={styles.rn}>{localize(result.titleJson, locale)}</Text>
          <Text style={styles.rp}>
            {t('mobile.public.currency', { price: result.basePrice?.toLocaleString() ?? '' })}
          </Text>
          <Text style={styles.rd}>{result.reason}</Text>
          <TouchableOpacity onPress={surprise} style={styles.btn}>
            <Text style={styles.bt}>{t('mobile.public.surprise-me.again')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  centered: { alignItems: 'center', marginTop: 40 },
  emoji: { fontSize: 64, marginBottom: 12 },
  hint: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },
  btn: { backgroundColor: '#db2777', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  re: { fontSize: 48 },
  rn: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  rp: { fontSize: 22, fontWeight: '800', color: '#db2777', marginTop: 4 },
  rd: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'center' },
});
