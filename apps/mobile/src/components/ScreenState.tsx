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

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useLocale } from '@/components/LocaleProvider';
import { themeColors, useTheme } from '@/components/ThemeProvider';

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

// Light-mode values below are today's exact colors; only the dark palette
// swaps them. Colors outside the theme palette (screen bg #f9fafb, secondary
// #9ca3af, danger tint #fef2f2/#fecaca) stay hardcoded so light renders
// pixel-identical.
function createStyles(isDark: boolean) {
  const C = isDark ? themeColors.dark : themeColors.light;
  return StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: isDark ? C.bg : '#f9fafb',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: isDark ? C.textSecondary : '#9ca3af',
    },
    errorEmoji: { fontSize: 48, marginBottom: 12 },
    errorMessage: {
      fontSize: 15,
      fontWeight: '600',
      color: C.danger,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryBtn: {
      backgroundColor: isDark ? C.surface : '#fef2f2',
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: isDark ? C.border : '#fecaca',
    },
    retryText: { fontSize: 14, fontWeight: '600', color: C.danger },
    emptyEmoji: { fontSize: 64, marginBottom: 16 },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: C.text,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 14,
      color: isDark ? C.textSecondary : '#9ca3af',
      textAlign: 'center',
      maxWidth: 280,
      marginBottom: 20,
    },
    emptyBtn: {
      backgroundColor: C.brand,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 14,
    },
    emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
    scrollView: { flex: 1, backgroundColor: isDark ? C.bg : '#f9fafb' },
    scrollContent: { padding: 16, paddingBottom: 40 },
  });
}

export function ScreenState({
  isLoading,
  isError,
  isEmpty,
  errorMessage,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRetry,
  refreshing = false,
  onRefresh,
  children,
}: ScreenStateProps): JSX.Element {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const C = isDark ? themeColors.dark : themeColors.light;
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const errMsg = errorMessage ?? t('state.error');
  const emptyT = emptyTitle ?? t('state.empty');

  // ── Loading ──
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.brand} />
        <Text style={styles.loadingText}>{t('state.loading')}</Text>
      </View>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}></Text>
        <Text style={styles.errorMessage}>{errMsg}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t('mobile.core.retryButton')}</Text>
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
        <Text style={styles.emptyTitle}>{emptyT}</Text>
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
            colors={[C.brand]}
            tintColor={C.brand}
          />
        }
      >
        {children}
      </ScrollView>
    );
  }

  return <>{children}</>;
}
