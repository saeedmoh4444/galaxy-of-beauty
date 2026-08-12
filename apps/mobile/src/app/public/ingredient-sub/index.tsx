import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

export default function IngredientSubScreen(): JSX.Element {
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');
  const result = (trpc as any).ingredientSub?.findSubstitutes?.useQuery?.(
    { ingredient: submitted },
    { enabled: submitted.length > 0 },
  ) ?? { data: null, isLoading: false, isError: false, refetch: () => {} };

  return (
    <ScreenState
      isLoading={submitted.length > 0 && result.isLoading}
      isError={result.isError}
      isEmpty={false}
      errorMessage="فشل البحث عن بدائل"
      onRetry={() => result.refetch()}
    >
      <Text style={styles.title}>🔄 بدائل المكونات</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="أدخلي اسم المكون..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => setSubmitted(search)}>
          <Text style={styles.searchText}>بحث</Text>
        </TouchableOpacity>
      </View>
      {((result.data as unknown[]) || []).map((alt: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.altName}>{alt.name ?? ''}</Text>
          <Text style={styles.altDesc}>{alt.description ?? ''}</Text>
        </View>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  searchBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  altName: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  altDesc: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
});
