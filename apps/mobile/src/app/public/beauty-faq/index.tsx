import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface FaqItem {
  id?: number;
  question?: string;
  answer?: string;
}

export default function BeautyFaqScreen(): JSX.Element {
  const { t } = useLocale();
  const faqsQ = trpc.beautyFaq.search.useQuery({});
  const faqs = (faqsQ.data as FaqItem[] | undefined) ?? [];
  if (faqsQ.isLoading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={faqsQ.isRefetching}
          onRefresh={() => faqsQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.beauty-faq.title')}</Text>
      {faqs.map((f, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.fq}>{f.question}</Text>
          <Text style={styles.fa}>{f.answer}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  fq: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  fa: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'right', lineHeight: 20 },
});
