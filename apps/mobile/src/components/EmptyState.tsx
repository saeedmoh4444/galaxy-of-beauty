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
   *  via ServiceImage where data exists). Wins over `mood`. */
  emoji?: string;
  /** 5.1 — mascot mood (emoji-based on mobile; no react-native-svg). */
  mood?: MascotMoodMobile;
  title: string;
  description?: string;
}

export type MascotMoodMobile = 'happy' | 'sparkle' | 'sad' | 'oops';

const MOOD_EMOJI: Record<MascotMoodMobile, string> = {
  happy: '✨',
  sparkle: '🌟',
  sad: '🌙',
  oops: '💫',
};

export function EmptyState({
  emoji,
  mood = 'happy',
  title,
  description,
}: EmptyStateProps): JSX.Element {
  const { isDark } = useTheme();
  const c = isDark ? themeColors.dark : themeColors.light;
  return (
    <View testID="empty-state" style={styles.wrap}>
      <Text style={styles.emoji}>{emoji ?? MOOD_EMOJI[mood]}</Text>
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
