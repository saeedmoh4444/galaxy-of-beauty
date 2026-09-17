import type { JSX } from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/components/Toast';
import { useHaptics } from '@/hooks/useHaptics';
import { useRouter } from 'expo-router';

interface FamilyMember {
  id?: number;
  name?: string;
  relation?: string;
  ageGroup?: string;
  emergencyContact?: string | null;
  allergies?: string | null;
}

export default function FamilyAccountScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { t } = useLocale();
  const { showToast } = useToast();
  const { trigger } = useHaptics();
  const router = useRouter();
  const q = trpc.familyAccount.list.useQuery(undefined, { enabled: isAuthed });
  const data: FamilyMember[] = (q.data as unknown as FamilyMember[] | undefined) ?? [];

  // K4 — inline editor for the babysitting safety fields.
  const [editing, setEditing] = useState<FamilyMember | null>(null);
  const [formEmergency, setFormEmergency] = useState('');
  const [formAllergies, setFormAllergies] = useState('');
  const updateMut = trpc.familyAccount.update.useMutation({
    onSuccess: () => {
      trigger('success');
      showToast('success', t('mobile.familyAccount.saved'));
      setEditing(null);
      void q.refetch();
    },
    onError: (e) => {
      trigger('error');
      showToast('error', e.message);
    },
  });

  const openEditor = (m: FamilyMember) => {
    setEditing(m);
    setFormEmergency(m.emergencyContact ?? '');
    setFormAllergies(m.allergies ?? '');
  };

  const save = () => {
    if (!editing?.id) return;
    updateMut.mutate({
      id: editing.id,
      emergencyContact: formEmergency.trim() || null,
      allergies: formAllergies.trim() || null,
    });
  };

  if (q.isLoading) return <SkeletonList count={4} />;

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
      <Text style={styles.t}>{t('familyAccount.title')}</Text>

      {editing && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{t('mobile.familyAccount.edit-safety')}</Text>
          <Text style={styles.formLabel}>{t('mobile.familyAccount.emergency-contact')}</Text>
          <TextInput
            value={formEmergency}
            onChangeText={setFormEmergency}
            placeholder={t('mobile.familyAccount.emergency-contact')}
            placeholderTextColor="#9ca3af"
            style={styles.inp}
            testID="family-edit-emergency"
          />
          <Text style={styles.formLabel}>{t('mobile.familyAccount.allergies')}</Text>
          <TextInput
            value={formAllergies}
            onChangeText={setFormAllergies}
            placeholder={t('mobile.familyAccount.allergies')}
            placeholderTextColor="#9ca3af"
            style={styles.inp}
            testID="family-edit-allergies"
          />
          <View style={styles.formRow}>
            <TouchableOpacity
              style={[styles.formBtn, styles.formBtnGhost]}
              onPress={() => setEditing(null)}
              testID="family-edit-cancel"
            >
              <Text style={styles.formBtnGhostText}>{t('mobile.familyAccount.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.formBtn}
              onPress={save}
              disabled={updateMut.isPending}
              testID="family-edit-save"
            >
              <Text style={styles.formBtnText}>
                {updateMut.isPending ? '…' : t('mobile.familyAccount.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {data.map((m, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() => openEditor(m)}
          testID={`family-member-${i}`}
        >
          <Text style={styles.avatar}>👤</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{m.name}</Text>
            <Text style={styles.relation}>{m.relation}</Text>
            {/* K4 — babysitting safety fields */}
            {m.emergencyContact ? (
              <Text style={styles.safety}>
                🚨 {t('mobile.familyAccount.emergency-contact')}: {m.emergencyContact}
              </Text>
            ) : null}
            {m.allergies ? (
              <Text style={styles.safety}>
                ⚠️ {t('mobile.familyAccount.allergies')}: {m.allergies}
              </Text>
            ) : null}
            {(m.ageGroup === 'child' || m.ageGroup === 'infant') && (
              <TouchableOpacity
                style={styles.kidsLink}
                onPress={() => router.push('/public/kids-services')}
                testID="family-kids-services"
              >
                <Text style={styles.kidsLinkText}>
                  👶 {t('mobile.familyAccount.kids-services')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  avatar: { fontSize: 32 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  relation: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  safety: { fontSize: 11, color: '#92400e', marginTop: 2 },
  kidsLink: { marginTop: 4, alignSelf: 'flex-start' },
  kidsLinkText: { fontSize: 12, fontWeight: '700', color: '#be185d' },
  form: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 6,
  },
  formTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  formLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  inp: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'right',
  },
  formRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  formBtn: {
    flex: 1,
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  formBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  formBtnGhost: {
    backgroundColor: '#fce7f3',
  },
  formBtnGhostText: { color: '#be185d', fontSize: 14, fontWeight: '700' },
});
