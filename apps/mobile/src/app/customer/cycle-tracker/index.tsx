import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

/**
 * E4a — the cycle-tracker screen is now live (was fully static): real
 * predictions, fertile window, PMS tips, pregnancy mode, and symptom
 * logging through the upgraded cycleTracker router.
 */
export default function CycleTrackerScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();

  const todayQ = trpc.cycleTracker.today.useQuery(undefined, { enabled: isAuthed });
  const entriesQ = trpc.cycleTracker.myEntries.useQuery(undefined, { enabled: isAuthed });
  const settingsQ = trpc.cycleTracker.settings.useQuery(undefined, { enabled: isAuthed });
  const logMut = trpc.cycleTracker.logDay.useMutation({
    onSuccess: () => {
      entriesQ.refetch();
      todayQ.refetch();
    },
  });
  const settingsMut = trpc.cycleTracker.updateSettings.useMutation({
    onSuccess: () => {
      settingsQ.refetch();
      todayQ.refetch();
    },
  });

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [flow, setFlow] = useState('');
  const [pregnancyMode, setPregnancyMode] = useState(false);

  const today = todayQ.data as unknown as Record<string, unknown> | null;
  const phase = today?.phase as Record<string, unknown> | null | undefined;
  const fertileWindow = today?.fertileWindow as Record<string, unknown> | null | undefined;
  const pmsTips = (today?.pmsTips as Array<{ ar: string; emoji: string }>) ?? [];
  const entries = ((entriesQ.data as { entries?: unknown[] } | null)?.entries ?? []) as Array<
    Record<string, unknown>
  >;
  const settings = settingsQ.data as unknown as Record<string, unknown> | null | undefined;

  if (!isAuthed) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('cycleTracker.title')}</Text>
        <Text style={styles.sub}>{t('cycleTracker.subtitle')}</Text>
        <Text style={styles.empty}>{t('mobile.gyms.login-to-book')}</Text>
      </ScrollView>
    );
  }

  if (todayQ.isLoading) return <SkeletonList count={4} />;
  if (todayQ.isError)
    return <ErrorAlert message={t('cycleTracker.title')} onRetry={() => todayQ.refetch()} />;

  const SYMPTOMS = [
    { slug: 'cramps', label: t('cycleTracker.symptom.cramps' as never) },
    { slug: 'headache', label: t('cycleTracker.symptom.headache' as never) },
    { slug: 'fatigue', label: t('cycleTracker.symptom.fatigue' as never) },
    { slug: 'bloating', label: t('cycleTracker.symptom.bloating' as never) },
    { slug: 'nausea', label: t('cycleTracker.symptom.nausea' as never) },
    { slug: 'moodSwings', label: t('cycleTracker.symptom.moodSwings' as never) },
  ];
  const FLOWS = [
    { key: 'light', label: t('cycleTracker.flow.light' as never) },
    { key: 'medium', label: t('cycleTracker.flow.medium' as never) },
    { key: 'heavy', label: t('cycleTracker.flow.heavy' as never) },
    { key: 'spotting', label: t('cycleTracker.flow.spotting' as never) },
  ];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={todayQ.isRefetching}
          onRefresh={() => {
            todayQ.refetch();
            entriesQ.refetch();
          }}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('cycleTracker.title')}</Text>
      <Text style={styles.sub}>{t('cycleTracker.subtitle')}</Text>

      {today?.pregnancyMode ? (
        /* E4a — pregnancy timeline */
        <View style={[styles.phaseCard, { borderColor: '#ec4899' }]}>
          <Text style={styles.phaseEmoji}>🤰</Text>
          <Text style={styles.phaseName}>{t('cycleTracker.pregnancyMode')}</Text>
          <Text style={styles.phaseDays}>
            {t('cycleTracker.pregnancyWeeks', { weeks: Number(today.weeksPregnant ?? 0) })}
          </Text>
        </View>
      ) : (
        <>
          {/* Today phase card */}
          <View style={[styles.phaseCard, { borderColor: (phase?.color as string) ?? '#ec4899' }]}>
            <Text style={styles.phaseEmoji}>{(phase?.emoji as string) ?? ''}</Text>
            <Text style={styles.phaseName}>{phase?.name as string}</Text>
            <Text style={styles.phaseDays}>
              {t('cycleTracker.day', { day: Number(today?.currentDay ?? 0) })}
            </Text>
            {fertileWindow?.ovulationDate ? (
              <View style={styles.fertileBox}>
                <Text style={styles.fertileText}>
                  {t('cycleTracker.fertileWindow')}:{' '}
                  {new Date(fertileWindow.fertileStart as string).toLocaleDateString('ar-SA')} —{' '}
                  {new Date(fertileWindow.fertileEnd as string).toLocaleDateString('ar-SA')}
                </Text>
                {(fertileWindow.isFertileToday as boolean) && (
                  <Text style={styles.fertileToday}>{t('cycleTracker.fertileToday')}</Text>
                )}
              </View>
            ) : null}
          </View>

          {/* PMS tips */}
          {pmsTips.length > 0 && (
            <>
              <Text style={styles.tipsTitle}>{t('cycleTracker.pmsTips')}</Text>
              {pmsTips.map((tip, i) => (
                <View key={i} style={styles.tip}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip.ar}</Text>
                </View>
              ))}
            </>
          )}

          {/* Phase tips */}
          <Text style={styles.tipsTitle}>{t('cycleTracker.tips')}</Text>
          {((phase?.tips as string[]) ?? []).map((tip, i) => (
            <View key={i} style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

          {/* Symptom logging (E4a — now persisted) */}
          <Text style={styles.tipsTitle}>{t('cycleTracker.logToday' as never)}</Text>
          <View style={styles.flowRow}>
            {FLOWS.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFlow(flow === f.key ? '' : f.key)}
                style={[styles.chip, flow === f.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, flow === f.key && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.flowRow}>
            {SYMPTOMS.map((s) => (
              <TouchableOpacity
                key={s.slug}
                onPress={() =>
                  setSymptoms((prev) =>
                    prev.includes(s.slug) ? prev.filter((x) => x !== s.slug) : [...prev, s.slug],
                  )
                }
                style={[styles.chip, symptoms.includes(s.slug) && styles.chipActive]}
              >
                <Text style={[styles.chipText, symptoms.includes(s.slug) && styles.chipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              if (!today) return;
              logMut.mutate({
                dayNumber: Number(today.currentDay ?? 1),
                flowIntensity: (flow || undefined) as never,
                symptoms: symptoms.length > 0 ? symptoms : undefined,
              });
              setSymptoms([]);
              setFlow('');
            }}
          >
            <Text style={styles.saveBtnText}>{t('cycleTracker.saveDay' as never)}</Text>
          </TouchableOpacity>

          {/* Pregnancy mode toggle */}
          <TouchableOpacity
            style={styles.pregToggle}
            onPress={() => {
              const next = !pregnancyMode;
              setPregnancyMode(next);
              settingsMut.mutate({
                pregnancyMode: next,
                // Default to a 40-week due date when none is set yet.
                dueDate: next
                  ? ((settings?.dueDate as string | undefined) ??
                    new Date(Date.now() + 40 * 7 * 86_400_000).toISOString())
                  : undefined,
              });
            }}
          >
            <Text style={styles.pregToggleText}>{t('cycleTracker.pregnancyMode')}</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Logged entries dots */}
      {entries.length > 0 && (
        <Text style={styles.tipsTitle}>
          {entries.length} {t('cycleTracker.days', { days: '' })}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  empty: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 20 },
  phaseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
  },
  phaseEmoji: { fontSize: 56 },
  phaseName: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 8 },
  phaseDays: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  fertileBox: { marginTop: 12, alignItems: 'center', gap: 4 },
  fertileText: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  fertileToday: { fontSize: 12, fontWeight: '700', color: '#8b5cf6' },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  tipBullet: { fontSize: 16, color: '#db2777' },
  tipText: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
  flowRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#db2777', borderColor: '#db2777' },
  chipText: { fontSize: 12, color: '#6b7280' },
  chipTextActive: { color: '#fff' },
  saveBtn: {
    backgroundColor: '#db2777',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  pregToggle: {
    borderWidth: 1,
    borderColor: '#f9a8d4',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pregToggleText: { color: '#be185d', fontSize: 13, fontWeight: '600' },
});
