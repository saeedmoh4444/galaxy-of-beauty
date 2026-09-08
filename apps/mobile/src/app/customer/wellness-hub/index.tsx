import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface CyclePhase {
  color?: string;
  emoji?: string;
  name?: string;
}

interface CycleData {
  phase?: CyclePhase;
  currentDay?: number;
  cycleLength?: number;
  daysUntilNext?: number;
}

interface TodayMood {
  mood?: number;
  energy?: number;
  sleepHours?: number;
  waterGlasses?: number;
}

interface SkinData {
  skinType?: string;
  concerns?: string[];
}

interface WeeklyData {
  checkinCount?: number;
  avgMood?: number;
  avgEnergy?: number;
}

interface JournalEntry {
  id?: number;
  content?: string;
  date?: string;
}

interface WellnessDashboard {
  cycle?: CycleData;
  todayMood?: TodayMood;
  skin?: SkinData;
  weekly?: WeeklyData;
  recentJournals?: JournalEntry[];
}

export default function WellnessHubScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const dashQ = trpc.wellnessHub.dashboard.useQuery(undefined, { enabled: isAuthed });

  // E4b — mental wellness + nutrition content.
  const breatheQ = trpc.wellnessContent.breathing.useQuery(undefined, { enabled: isAuthed });
  const medsQ = trpc.wellnessContent.meditations.useQuery(undefined, { enabled: isAuthed });
  const goalsQ = trpc.wellnessContent.nutritionGoals.useQuery(undefined, { enabled: isAuthed });
  const [goalKey, setGoalKey] = useState('glow');
  const nutritionQ = trpc.wellnessContent.nutrition.useQuery(
    { goal: goalKey },
    { enabled: isAuthed },
  );
  const breathe = (breatheQ.data ?? []) as Array<any>;
  const meds = (medsQ.data ?? []) as Array<any>;
  const goals = (goalsQ.data ?? []) as Array<any>;
  const nutrition = nutritionQ.data as any;

  if (dashQ.isLoading) return <SkeletonList count={4} />;
  if (dashQ.isError)
    return (
      <ErrorAlert message={t('mobile.wellnessHub.load-error')} onRetry={() => dashQ.refetch()} />
    );

  const d = dashQ.data as unknown as WellnessDashboard | null;
  const weekly = d?.weekly;
  const recentJournals = d?.recentJournals ?? [];

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={dashQ.isRefetching}
          onRefresh={() => dashQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={s.title}>{t('mobile.wellnessHub.title')}</Text>
      <Text style={s.sub}>{t('mobile.wellnessHub.subtitle')}</Text>

      {d?.cycle && (
        <View style={[s.cycleCard, { borderColor: d.cycle.phase?.color ?? '#ec4899' }]}>
          <Text style={{ fontSize: 40, textAlign: 'center' }}>{d.cycle.phase?.emoji}</Text>
          <Text
            style={{
              fontWeight: '800',
              fontSize: 18,
              textAlign: 'center',
              color: d.cycle.phase?.color,
              marginTop: 4,
            }}
          >
            {d.cycle.phase?.name}
          </Text>
          <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 2 }}>
            {t('mobile.wellnessHub.cycle-day', {
              day: d.cycle.currentDay ?? '',
              length: d.cycle.cycleLength ?? '',
            })}
          </Text>
          <Text style={{ textAlign: 'center', color: '#db2777', fontSize: 12, marginTop: 4 }}>
            {t('mobile.wellnessHub.next-cycle', { days: d.cycle.daysUntilNext ?? '' })}
          </Text>
        </View>
      )}

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statNum}>{d?.todayMood?.mood ?? '—'}/5</Text>
          <Text style={s.statLabel}>{t('mobile.wellnessHub.mood')}</Text>
        </View>
        <View style={s.stat}>
          <Text style={[s.statNum, { color: '#3b82f6' }]}>{d?.todayMood?.energy ?? '—'}/10</Text>
          <Text style={s.statLabel}>{t('mobile.wellnessHub.energy')}</Text>
        </View>
        <View style={s.stat}>
          <Text style={[s.statNum, { color: '#7c3aed' }]}>{d?.todayMood?.sleepHours ?? '—'}h</Text>
          <Text style={s.statLabel}>{t('mobile.wellnessHub.sleep')}</Text>
        </View>
        <View style={s.stat}>
          <Text style={[s.statNum, { color: '#06b6d4' }]}>{d?.todayMood?.waterGlasses ?? '—'}</Text>
          <Text style={s.statLabel}>{t('mobile.wellnessHub.water')}</Text>
        </View>
      </View>

      {d?.skin && (
        <View style={s.card}>
          <Text style={s.st}>{t('mobile.wellnessHub.skin-analysis')}</Text>
          <Text style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>
            {t('mobile.wellnessHub.skin-type-label')}
            <Text style={{ fontWeight: '700' }}>{d.skin.skinType}</Text>
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {(d.skin.concerns ?? []).map((c, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#f3e8ff',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 11, color: '#7c3aed' }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {(weekly?.checkinCount ?? 0) > 0 && (
        <View style={s.card}>
          <Text style={s.st}>{t('mobile.wellnessHub.weekly-summary')}</Text>
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              {t('mobile.wellnessHub.avg-mood', { avg: weekly?.avgMood ?? 0 })}
            </Text>
            <View style={s.bar}>
              <View
                style={[
                  s.barFill,
                  { width: `${((weekly?.avgMood ?? 0) / 5) * 100}%`, backgroundColor: '#f59e0b' },
                ]}
              />
            </View>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              {t('mobile.wellnessHub.avg-energy', { avg: weekly?.avgEnergy ?? 0 })}
            </Text>
            <View style={s.bar}>
              <View
                style={[
                  s.barFill,
                  {
                    width: `${((weekly?.avgEnergy ?? 0) / 10) * 100}%`,
                    backgroundColor: '#3b82f6',
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* E4b — breathing exercises + short meditations */}
      {(breathe.length > 0 || meds.length > 0) && (
        <View style={s.card}>
          <Text style={s.st}>{t('mobile.wellnessContent.breatheTitle')}</Text>
          {breathe.map((e) => (
            <View
              key={e.key}
              style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>
                {e.emoji} {locale === 'en' ? e.nameEn : e.nameAr}
                <Text style={{ fontWeight: '400', color: '#9ca3af' }}>
                  {' '}
                  · {t('mobile.wellnessContent.minutes', { min: e.minutes })}
                </Text>
              </Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                {t('mobile.wellnessContent.pattern', {
                  inhale: e.inhale,
                  hold: e.hold,
                  exhale: e.exhale,
                  cycles: e.cycles,
                })}
              </Text>
            </View>
          ))}
          <Text style={[s.st, { marginTop: 12 }]}>
            {t('mobile.wellnessContent.meditationTitle')}
          </Text>
          {meds.map((m) => (
            <View
              key={m.key}
              style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>
                {m.emoji} {locale === 'en' ? m.titleEn : m.titleAr}
                <Text style={{ fontWeight: '400', color: '#9ca3af' }}>
                  {' '}
                  · {t('mobile.wellnessContent.minutes', { min: m.minutes })}
                </Text>
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* E4b — nutrition for beauty goals */}
      {nutrition && (
        <View style={s.card}>
          <Text style={s.st}>{t('mobile.wellnessContent.nutritionTitle')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {goals.map((g) => (
              <TouchableOpacity
                key={g.key}
                onPress={() => setGoalKey(g.key)}
                style={{
                  backgroundColor: goalKey === g.key ? '#db2777' : '#f3f4f6',
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ fontSize: 12, color: goalKey === g.key ? '#fff' : '#6b7280' }}>
                  {g.emoji} {locale === 'en' ? g.nameEn : g.nameAr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {(nutrition.foods ?? []).slice(0, 4).map((f: any, i: number) => (
            <Text key={i} style={{ fontSize: 13, color: '#374151', marginTop: 6 }}>
              {f.emoji} {locale === 'en' ? f.en : f.ar}
            </Text>
          ))}
        </View>
      )}

      {recentJournals.length > 0 && (
        <View style={s.card}>
          <Text style={s.st}>{t('mobile.wellnessHub.recent-journals')}</Text>
          {recentJournals.map((j, i) => (
            <View
              key={j.id ?? i}
              style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 13, color: '#374151' }}>{j.content?.slice(0, 120)}</Text>
              <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                {j.date
                  ? new Date(j.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB')
                  : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.actions}>
        <TouchableOpacity style={s.actBtn}>
          <Text style={{ fontSize: 24 }}></Text>
          <Text style={s.actLabel}>{t('mobile.wellnessHub.action-checkin')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actBtn}>
          <Text style={{ fontSize: 24 }}></Text>
          <Text style={s.actLabel}>{t('mobile.wellnessHub.action-cycle')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actBtn}>
          <Text style={{ fontSize: 24 }}></Text>
          <Text style={s.actLabel}>{t('mobile.wellnessHub.action-skin')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actBtn}>
          <Text style={{ fontSize: 24 }}></Text>
          <Text style={s.actLabel}>{t('mobile.wellnessHub.action-wellness')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  cycleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14 },
  st: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  bar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginTop: 4 },
  barFill: { height: 6, borderRadius: 3 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  actLabel: { fontSize: 11, color: '#6b7280', marginTop: 4 },
});
