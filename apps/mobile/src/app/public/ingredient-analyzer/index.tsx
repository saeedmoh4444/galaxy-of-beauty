import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc, typedTrpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
};

export default function IngredientAnalyzerScreen(): JSX.Element {
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');
  const result = typedTrpc().ingredientAnalyzer?.analyze?.useQuery?.(
    { ingredient: submitted },
    { enabled: submitted.length > 0 },
  ) ?? { data: null, isLoading: false, isError: false, refetch: () => {} };

  return (
    <ScreenState
      isLoading={submitted.length > 0 && result.isLoading}
      isError={result.isError}
      isEmpty={false}
      errorMessage="فشل تحليل المكون"
      onRetry={() => result.refetch()}
    >
      <Text style={styles.title}> تحليل المكونات</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="أدخلي اسم المكون..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.analyzeBtn} onPress={() => setSubmitted(search)}>
          <Text style={styles.analyzeText}>تحليل</Text>
        </TouchableOpacity>
      </View>
      {(result.data as any) ? (
        <View
          style={[
            styles.resultCard,
            {
              borderLeftColor:
                (result.data as any)?.safety === 'safe'
                  ? COLORS.success
                  : (result.data as any)?.safety === 'warning'
                    ? COLORS.warning
                    : COLORS.danger,
            },
          ]}
        >
          <Text style={styles.ingredientName}>{(result.data as any)?.name ?? submitted}</Text>
          <Text style={styles.ingredientDesc}>{(result.data as any)?.description ?? ''}</Text>
        </View>
      ) : null}
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
  analyzeBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  analyzeText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  resultCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, borderLeftWidth: 4 },
  ingredientName: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  ingredientDesc: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
});
