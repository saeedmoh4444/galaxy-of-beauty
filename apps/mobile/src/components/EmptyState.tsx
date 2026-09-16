import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, themeColors } from '@/components/ThemeProvider';

/**
 * RN mirror of @galaxy/ui EmptyState — centered glyph + title +
 * optional description. Used as the `<items.length === 0>` branch in
 * every data-fetching screen.
 */
interface EmptyStateProps {
  /** Decorative glyph (mobile has no Icon system yet — real imagery comes
   *  via ServiceImage where data exists). */
  emoji?: string;
  title: string;
  description?: string;
}

export function EmptyState({ emoji, title, description }: EmptyStateProps): JSX.Element {
  const { isDark } = useTheme();
  const c = isDark ? themeColors.dark : themeColors.light;
  return (
    <View testID="empty-state" style={styles.wrap}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.desc, { color: c.textSecondary }]}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 30 },
  emoji: { fontSize: 40 },
  title: { marginTop: 8, fontWeight: '600', fontSize: 15, textAlign: 'center' },
  desc: { marginTop: 4, fontSize: 13, textAlign: 'center' },
});
