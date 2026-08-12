import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

export default function ProductScannerScreen(): JSX.Element {
  const [barcode, setBarcode] = useState('');
  const [scanned, setScanned] = useState(false);
  const result = (trpc as any).productScanner?.scan?.useQuery?.(
    { barcode },
    { enabled: scanned && barcode.length > 0 },
  ) ?? { data: null, isLoading: false, isError: false, refetch: () => {} };

  return (
    <ScreenState
      isLoading={scanned && result.isLoading}
      isError={scanned && result.isError}
      isEmpty={false}
      errorMessage="لم يتم العثور على المنتج"
      onRetry={() => result.refetch()}
    >
      <Text style={styles.title}> فحص المنتجات</Text>
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => {
          setScanned(true);
        }}
      >
        <Text style={styles.scanText}> مسح الباركود</Text>
      </TouchableOpacity>
      {(result.data as any) ? (
        <View style={styles.result}>
          <Text style={styles.productName}>
            {(result.data as any)?.nameJson?.ar ?? (result.data as any)?.name ?? ''}
          </Text>
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
  scanBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanText: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  result: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginTop: 12 },
  productName: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
});
