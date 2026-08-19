import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface SkinEntry {
  id?: number;
  title?: string;
  createdAt?: string;
  hydration?: number;
  glow?: number;
}

export default function SkinTimelineScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const [compareMode, setCompareMode] = useState(false);
  const entriesQ = trpc.skinDiary.entries.useQuery();
  const entries: SkinEntry[] = (entriesQ.data as unknown as SkinEntry[] | undefined) ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={entriesQ.isRefetching}
          onRefresh={() => entriesQ.refetch()}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.skinTimeline.title')}</Text>
      <Text style={styles.sub}>{t('mobile.skinTimeline.subtitle')}</Text>

      <TouchableOpacity onPress={() => setCompareMode(!compareMode)} style={styles.compareBtn}>
        <Text style={styles.compareBt}>
          {compareMode
            ? t('mobile.skinTimeline.cancel-compare')
            : t('mobile.skinTimeline.weekly-compare')}
        </Text>
      </TouchableOpacity>

      {compareMode ? (
        <View style={styles.compareGrid}>
          <View style={[styles.compareCard, styles.before]}>
            <Text style={styles.compareLabel}>{t('mobile.skinTimeline.last-week')}</Text>
            <View style={styles.imgPlaceholder}>
              <Text style={{ fontSize: 40 }}></Text>
            </View>
          </View>
          <Text style={styles.compareVs}>VS</Text>
          <View style={[styles.compareCard, styles.after]}>
            <Text style={styles.compareLabel}>{t('mobile.skinTimeline.this-week')}</Text>
            <View style={styles.imgPlaceholder}>
              <Text style={{ fontSize: 40 }}></Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.timeline}>
          {entries.slice(0, 8).map((e, i) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryLine} />
              <View style={[styles.entryDot, i === 0 && styles.entryDotLatest]} />
              <View style={styles.entryCard}>
                <Text style={styles.entryDate}>
                  {new Date(e.createdAt ?? Date.now()).toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-GB',
                    {
                      month: 'short',
                      day: 'numeric',
                    },
                  )}
                </Text>
                <Text style={styles.entryTitle}>
                  {e.title ?? t('mobile.skinTimeline.skin-update')}
                </Text>
                <View style={styles.entryMetrics}>
                  {e.hydration && <Text style={styles.metric}> {e.hydration}%</Text>}
                  {e.glow && <Text style={styles.metric}> {e.glow}/10</Text>}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.stats}>
        <Text style={styles.st}>{t('mobile.skinTimeline.stats')}</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}></Text>
            <Text style={styles.statLabel}>{t('mobile.skinTimeline.hydration-improvement')}</Text>
            <Text style={styles.statPct}>+15%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}></Text>
            <Text style={styles.statLabel}>{t('mobile.skinTimeline.glow-improvement')}</Text>
            <Text style={styles.statPct}>+20%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}></Text>
            <Text style={styles.statLabel}>{t('mobile.skinTimeline.updates')}</Text>
            <Text style={styles.statPct}>{entries.length}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  compareBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  compareBt: { color: '#7c3aed', fontSize: 14, fontWeight: '600' },
  compareGrid: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  compareCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  before: { borderWidth: 2, borderColor: '#fca5a5' },
  after: { borderWidth: 2, borderColor: '#86efac' },
  compareLabel: { fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 8 },
  compareVs: { fontSize: 14, fontWeight: '800', color: '#7c3aed' },
  imgPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: { marginBottom: 20 },
  entry: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingLeft: 16 },
  entryLine: {
    position: 'absolute',
    left: 21,
    top: 0,
    bottom: -20,
    width: 2,
    backgroundColor: '#e5e7eb',
  },
  entryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#c4b5fd',
    marginTop: 12,
    zIndex: 1,
  },
  entryDotLatest: { backgroundColor: '#7c3aed', width: 16, height: 16, borderRadius: 8 },
  entryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  entryDate: { fontSize: 12, color: '#9ca3af' },
  entryTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 4 },
  entryMetrics: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metric: { fontSize: 12, color: '#7c3aed' },
  stats: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  statRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 24 },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  statPct: { fontSize: 14, fontWeight: '700', color: '#7c3aed', marginTop: 2 },
});
