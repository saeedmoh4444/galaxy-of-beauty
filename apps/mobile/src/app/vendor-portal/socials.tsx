import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { SOCIAL_NETWORKS, socialLinksPatch } from '@/utils/vendorSocials';

const NETWORK_LABELS: Record<(typeof SOCIAL_NETWORKS)[number], string> = {
  snapchat: 'Snapchat',
  tiktok: 'TikTok',
  x: 'X',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

/** E4b — social links editable from the phone (B6 fields). Partial-merge
 *  semantics: only changed networks are sent, an emptied field removes
 *  the link; URLs are zod-validated server-side. */
export default function VendorSocialsScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const storeQ = trpc.vendorPortal.myStore.useQuery(undefined, { enabled: isAuthed });
  const saveMut = trpc.vendorPortal.updateSocialLinks.useMutation({
    onSuccess: () => {
      Alert.alert(t('mobile.vendorPortal.socials.saved'));
      void storeQ.refetch();
    },
    onError: () => Alert.alert(t('mobile.vendorPortal.socials.saveError')),
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [seeded, setSeeded] = useState(false);

  // Seed the form once from the server; after that the user's edits win.
  useEffect(() => {
    if (seeded || !storeQ.data) return;
    setForm((storeQ.data.socialLinks as Record<string, string> | null) ?? {});
    setSeeded(true);
  }, [storeQ.data, seeded]);

  const existing = (storeQ.data?.socialLinks as Record<string, string> | null) ?? null;
  const patch = socialLinksPatch(existing, form);

  return (
    <ScreenState
      isLoading={storeQ.isLoading}
      isError={storeQ.isError}
      isEmpty={false}
      errorMessage={t('mobile.vendorPortal.socials.loadError')}
      onRetry={() => void storeQ.refetch()}
    >
      <ScrollView
        style={styles.c}
        contentContainerStyle={styles.i}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={storeQ.isRefetching}
            onRefresh={() => void storeQ.refetch()}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
        <Text style={styles.title}>{t('mobile.vendorPortal.socials.title')}</Text>
        <Text style={styles.hint}>{t('mobile.vendorPortal.socials.hint')}</Text>

        {SOCIAL_NETWORKS.map((network) => (
          <View key={network} style={styles.field}>
            <Text style={styles.label}>{NETWORK_LABELS[network]}</Text>
            <TextInput
              style={styles.input}
              value={form[network] ?? ''}
              onChangeText={(v) => setForm((prev) => ({ ...prev, [network]: v }))}
              placeholder="https://..."
              placeholderTextColor="#9ca3af"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        ))}

        <TouchableOpacity
          disabled={!patch || saveMut.isPending}
          onPress={() => patch && saveMut.mutate(patch)}
          style={[styles.saveBtn, (!patch || saveMut.isPending) && styles.saveBtnDisabled]}
        >
          <Text style={styles.saveText}>{t('mobile.vendorPortal.socials.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 18 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#c4b5fd' },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
