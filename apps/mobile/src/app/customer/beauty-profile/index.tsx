import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/components/Toast';
import { trpc } from '@/lib/trpc-react';
import { BEAUTY_PROFILE_OPTIONS, buildBeautyProfileInput } from '@galaxy/shared';

interface BeautyProfileData {
  skinType?: string | null;
  hairType?: string | null;
  hairLength?: string | null;
  skinTone?: string | null;
  makeupStyle?: string | null;
  concerns?: string[];
  preferredScents?: string[];
  notes?: string | null;
  measurements?: { heightCm?: number; weightKg?: number; waistCm?: number } | null;
  fitnessGoals?: string[];
}

/**
 * Beauty DNA profile (ENHANCEMENT_PLAN 3.1) — mobile editor parity with
 * the web form: read-only card + chip-based edit mode writing through
 * beautyProfile.upsert via the shared input builder.
 */
export default function BeautyProfileScreen(): JSX.Element {
  const { t } = useLocale();
  const { showToast } = useToast();
  const isAuthed = useAuthState();
  const [editing, setEditing] = useState(false);
  const q = trpc.beautyProfile.get.useQuery(undefined, { enabled: isAuthed });

  // Form state — seeded from the fetched profile when entering edit mode.
  const [skinType, setSkinType] = useState('');
  const [hairType, setHairType] = useState('');
  const [hairLength, setHairLength] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [makeupStyle, setMakeupStyle] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [scents, setScents] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const data = q.data as unknown as BeautyProfileData | null;
  const m = data?.measurements ?? {};

  const upsertMut = trpc.beautyProfile.upsert.useMutation({
    onSuccess: () => {
      setEditing(false);
      showToast('success', t('beautyProfile.savedToast'));
      void q.refetch();
    },
    onError: () => showToast('error', t('beautyProfile.loadError')),
  });

  const enterEdit = () => {
    setSkinType(data?.skinType ?? '');
    setHairType(data?.hairType ?? '');
    setHairLength(data?.hairLength ?? '');
    setSkinTone(data?.skinTone ?? '');
    setMakeupStyle(data?.makeupStyle ?? '');
    setConcerns(data?.concerns ?? []);
    setScents(data?.preferredScents ?? []);
    setNotes(data?.notes ?? '');
    setEditing(true);
  };

  const toggleIn = (arr: string[], set: (a: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSave = () => {
    upsertMut.mutate(
      buildBeautyProfileInput({
        skinType,
        hairType,
        hairLength,
        skinTone,
        makeupStyle,
        concerns,
        scents,
        notes,
        heightCm: '',
        weightKg: '',
        waistCm: '',
        fitnessGoals: [],
      }),
    );
  };

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
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('beautyProfile.title')}</Text>

      {!editing ? (
        <>
          {data && (
            <View style={styles.card}>
              <Text style={styles.label}>
                {t('beautyProfile.skin-type', { type: String(data.skinType ?? '') })}
              </Text>
              <Text style={styles.label}>
                {t('beautyProfile.hair-type', { type: String(data.hairType ?? '') })}
              </Text>
              {(m.heightCm || m.weightKg || m.waistCm) && (
                <Text style={styles.label}>
                  {t('profile.measurements.title')}: {m.heightCm ? `${m.heightCm}cm` : ''}{' '}
                  {m.weightKg ? `${m.weightKg}kg` : ''} {m.waistCm ? `${m.waistCm}cm` : ''}
                </Text>
              )}
              {(data.fitnessGoals ?? []).length > 0 && (
                <Text style={styles.label}>
                  {t('profile.measurements.goals')}: {(data.fitnessGoals ?? []).join('، ')}
                </Text>
              )}
            </View>
          )}
          <TouchableOpacity style={styles.editBtn} onPress={enterEdit}>
            <Text style={styles.editBtnText}>{t('beautyProfile.editButton')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.card}>
          <ChipRow
            title={t('beautyProfile.sectionSkinType')}
            options={BEAUTY_PROFILE_OPTIONS.skinTypes}
            selected={skinType}
            onSelect={setSkinType}
            labelFor={labelFor}
          />
          <ChipRow
            title={t('beautyProfile.sectionHairType')}
            options={BEAUTY_PROFILE_OPTIONS.hairTypes}
            selected={hairType}
            onSelect={setHairType}
            labelFor={labelFor}
          />
          <ChipRow
            title={t('beautyProfile.sectionHairLength')}
            options={BEAUTY_PROFILE_OPTIONS.hairLengths}
            selected={hairLength}
            onSelect={setHairLength}
            labelFor={labelFor}
          />
          <ChipRow
            title={t('beautyProfile.sectionSkinTone')}
            options={BEAUTY_PROFILE_OPTIONS.skinTones}
            selected={skinTone}
            onSelect={setSkinTone}
            labelFor={labelFor}
          />
          <ChipRow
            title={t('beautyProfile.sectionMakeupStyle')}
            options={BEAUTY_PROFILE_OPTIONS.makeupStyles}
            selected={makeupStyle}
            onSelect={setMakeupStyle}
            labelFor={labelFor}
          />
          <ChipRow
            title={t('beautyProfile.concernsTitle')}
            options={BEAUTY_PROFILE_OPTIONS.concerns}
            multi
            selectedList={concerns}
            onToggle={(o) => toggleIn(concerns, setConcerns, o)}
            labelFor={labelFor}
          />
          <ChipRow
            title={t('beautyProfile.scentsTitle')}
            options={BEAUTY_PROFILE_OPTIONS.scents}
            multi
            selectedList={scents}
            onToggle={(o) => toggleIn(scents, setScents, o)}
            labelFor={labelFor}
          />

          <Text style={styles.sectionTitle}>{t('beautyProfile.notesTitle')}</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('beautyProfile.notesPlaceholder')}
            multiline
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={upsertMut.isPending}
          >
            <Text style={styles.saveBtnText}>{t('beautyProfile.saveButton')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
            <Text style={styles.cancelBtnText}>{t('beautyProfile.cancelButton')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/** Raw option → i18n label (mirrors the web page's LABELS fallback). */
function labelFor(o: string): string {
  return `beautyProfile.opt.${o}`;
}

function ChipRow(props: {
  title: string;
  options: readonly string[];
  selected?: string;
  onSelect?: (v: string) => void;
  selectedList?: string[];
  onToggle?: (v: string) => void;
  multi?: boolean;
  labelFor: (o: string) => string;
}): JSX.Element {
  const { t } = useLocale();
  const isOn = (o: string) =>
    props.multi ? (props.selectedList ?? []).includes(o) : props.selected === o;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      <View style={styles.chips}>
        {props.options.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.chip, isOn(o) && styles.chipOn]}
            onPress={() =>
              props.multi ? props.onToggle?.(o) : props.onSelect?.(o === props.selected ? '' : o)
            }
          >
            <Text style={[styles.chipText, isOn(o) && styles.chipTextOn]}>
              {t(props.labelFor(o) as never)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  label: { fontSize: 15, color: '#374151', paddingVertical: 6 },
  editBtn: {
    marginTop: 16,
    backgroundColor: '#db2777',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  editBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#f3f4f6',
  },
  chipOn: { backgroundColor: '#db2777' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  chipTextOn: { color: '#fff' },
  notesInput: {
    borderWidth: 1,
    borderColor: '#f0e4e8',
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    fontSize: 13,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  saveBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  cancelBtn: { padding: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
});
