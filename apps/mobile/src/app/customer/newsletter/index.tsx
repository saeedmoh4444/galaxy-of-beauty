import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function NewsletterScreen(): JSX.Element {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    ((trpc as any).newsletter.issues.query() as any).then((d: any) => { setIssues(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const subscribe = () => {
    if (!email.includes('@')) return;
    setSubscribing(true);
    ((trpc as any).newsletter.subscribe.mutate({ email }) as any)
      .then(() => { setSubscribed(true); setSubscribing(false); })
      .catch(() => setSubscribing(false));
  };

  if (loading) return <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📰 النشرة البريدية</Text>
      <Text style={styles.sub}>آخر العروض والنصائح في بريدك</Text>

      {subscribed ? (
        <View style={[styles.card, styles.successCard]}>
          <Text style={{fontSize:48}}>🎉</Text>
          <Text style={styles.successTitle}>تم الاشتراك!</Text>
          <Text style={styles.successSub}>شكراً لاشتراككِ في نشرتنا البريدية</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.subRow}>
            <TextInput value={email} onChangeText={setEmail} placeholder="بريدكِ الإلكتروني" keyboardType="email-address" style={styles.input} placeholderTextColor="#9ca3af" />
            <TouchableOpacity onPress={subscribe} disabled={subscribing} style={styles.subBtn}>
              <Text style={styles.subBtnText}>{subscribing ? '...' : 'اشتراك'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>📬 أحدث الأعداد</Text>
      {issues.length === 0 ? <Text style={styles.e}>لا توجد أعداد</Text> :
        issues.map((i: any, idx: number) => (
          <View key={i.id ?? idx} style={styles.issue}>
            <Text style={styles.issueTitle}>{i.title as string}</Text>
            <Text style={styles.issueDate}>{new Date(i.date as string).toLocaleDateString('ar-SA')}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  successCard: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  successTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  successSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  subRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
  subBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  subBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  issue: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  issueTitle: { fontSize: 14, fontWeight: '600', color: '#111827' }, issueDate: { fontSize: 11, color: '#9ca3af' },
});
