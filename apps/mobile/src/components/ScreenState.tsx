/**
 * ScreenState — Reusable 4-state pattern for mobile screens.
 *
 * Handles loading, error, empty, and success states with:
 *   - Loading: Animated skeleton shimmer
 *   - Error: Error message + retry button
 *   - Empty: Empty state with CTA
 *   - Success: Renders children
 *
 * Usage:
 *   <ScreenState
 *     isLoading={query.isLoading}
 *     isError={query.isError}
 *     isEmpty={!query.data?.length}
 *     errorMessage="فشل تحميل البيانات"
 *     emptyTitle="لا توجد بيانات"
 *     onRetry={() => query.refetch()}
 *   >
 *     <YourDataView />
 *   </ScreenState>
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';

interface ScreenStateProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onPress: () => void };
  onRetry?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
}

const COLORS = {
  brand: '#7c3aed',
  brandLight: '#f5f3ff',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  gray50: '#f9fafb',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray700: '#374151',
  gray900: '#111827',
  white: '#ffffff',
};

export function ScreenState({
  isLoading,
  isError,
  isEmpty,
  errorMessage = 'حدث خطأ ما',
  emptyTitle = 'لا توجد بيانات',
  emptyDescription,
  emptyAction,
  onRetry,
  refreshing = false,
  onRefresh,
  children,
}: ScreenStateProps): JSX.Element {
  // ── Loading ──
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.brand} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}></Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}> إعادة المحاولة</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Empty ──
  if (isEmpty) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}></Text>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        {emptyDescription && <Text style={styles.emptyDescription}>{emptyDescription}</Text>}
        {emptyAction && (
          <TouchableOpacity onPress={emptyAction.onPress} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>{emptyAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Success (with optional pull-to-refresh) ──
  if (onRefresh) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.brand]}
            tintColor={COLORS.brand}
          />
        }
      >
        {children}
      </ScrollView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.gray50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray400,
  },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  retryText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.gray400,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  scrollView: { flex: 1, backgroundColor: COLORS.gray50 },
  scrollContent: { padding: 16, paddingBottom: 40 },
});
