import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { trpc as trpcReact } from '@/lib/trpc-react';
import { useState, useEffect, useCallback } from 'react';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { typedTrpc } from '@/lib/trpc-react';

const MOODS = ['', '', '', '', '', '', '', ''];

interface DiaryEntry {
  id?: number;
  title?: string;
  createdAt?: string;
}

export default function BeautyDiaryScreen(): JSX.Element {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayMood, setTodayMood] = useState('');
  const skinJournal = typedTrpc().skinDiary?.list?.useQuery?.({ limit: 7 });

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc().beautyJournal.list.query({ page: 1, limit: LARGE_PAGE_SIZE }).then(
      (d: DiaryEntry[] | undefined) => {
        setEntries(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}> يوميات الجمال</Text>
      <Text style={styles.sub}>اربطي مزاجكِ بروتين جمالكِ</Text>

      <View style={styles.moodCard}>
        <Text style={styles.moodQ}>كيف تشعرين اليوم؟</Text>
        <View style={styles.moods}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setTodayMood(m)}
              style={[styles.mood, todayMood === m && styles.moodA]}
            >
              <Text style={styles.moodEmoji}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.st}> إحصائيات المزاج</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}></Text>
            <Text style={styles.statPct}>45%</Text>
            <Text style={styles.statLabel}>سعيدة</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}></Text>
            <Text style={styles.statPct}>30%</Text>
            <Text style={styles.statLabel}>هادئة</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}></Text>
            <Text style={styles.statPct}>15%</Text>
            <Text style={styles.statLabel}>متحمسة</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}></Text>
            <Text style={styles.statPct}>10%</Text>
            <Text style={styles.statLabel}>متعب</Text>
          </View>
        </View>
      </View>

      <Text style={styles.st}> آخر المدخلات</Text>
      {entries.slice(0, 5).map((e, i) => (
        <View key={i} style={styles.entry}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryMood}></Text>
            <Text style={styles.entryDate}>
              {new Date(e.createdAt ?? Date.now()).toLocaleDateString('ar-SA', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Text style={styles.entryText}>{e.title ?? 'يوميات الجمال'}</Text>
          <View style={styles.entryMeta}>
            <Text style={styles.entryMetaItem}>‍️ خدمة اليوم</Text>
            <Text style={styles.entryMetaItem}> بشرة متألقة</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.bt}>️ تدوين اليوم</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  moodCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  moodQ: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 },
  moods: { flexDirection: 'row', gap: 10 },
  mood: { padding: 8, borderRadius: 12, backgroundColor: '#f3f4f6' },
  moodA: { backgroundColor: '#ede9fe', borderWidth: 2, borderColor: '#7c3aed' },
  moodEmoji: { fontSize: 28 },
  stats: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  statRow: { flexDirection: 'row', gap: 6 },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 10,
  },
  statVal: { fontSize: 20 },
  statPct: { fontSize: 15, fontWeight: '700', color: '#7c3aed', marginTop: 2 },
  statLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  entry: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  entryMood: { fontSize: 20 },
  entryDate: { fontSize: 12, color: '#9ca3af' },
  entryText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  entryMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  entryMetaItem: { fontSize: 11, color: '#6b7280' },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
