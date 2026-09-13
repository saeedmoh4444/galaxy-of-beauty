import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

interface DailyTip {
  emoji?: string;
  tip?: string;
  category?: string;
}

export default function BeautyFortuneScreen(): JSX.Element {
  const { t } = useLocale();
  const tipQ = trpc.dailyBeautyTip.today.useQuery();
  const tip = tipQ.data as unknown as DailyTip | undefined;

  return (
    <ScreenState
      isLoading={tipQ.isLoading}
      isError={tipQ.isError}
      isEmpty={!tip}
      onRetry={() => tipQ.refetch()}
    >
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('mobile.public.beauty-fortune.title')}</Text>
        <View style={styles.card}>
          <Text style={styles.fortuneEmoji}>{tip?.emoji}</Text>
          <Text style={styles.fortuneText}>{tip?.tip}</Text>
          <Text style={styles.tip}> {tip?.category}</Text>
          <TouchableOpacity onPress={() => tipQ.refetch()} style={styles.btn}>
            <Text style={styles.btnText}>{t('mobile.public.beauty-fortune.try')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf4ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40, alignItems: 'center' },
  t: { fontSize: 24, fontWeight: '800', color: '#a21caf', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#f0abfc',
  },
  fortuneEmoji: { fontSize: 64, marginBottom: 16 },
  fortuneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 28,
  },
  tip: { fontSize: 13, color: '#a21caf', marginTop: 16, textAlign: 'center' },
  btn: {
    backgroundColor: '#a21caf',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
