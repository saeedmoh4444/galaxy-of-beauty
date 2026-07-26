import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Reusable empty state component for lists and screens.
 *
 * @param {object} props
 * @param {string} props.icon - Emoji icon
 * @param {string} props.title - Main title
 * @param {string} props.subtitle - Description text
 * @param {string} [props.actionLabel] - CTA button label
 * @param {() => void} [props.onAction] - CTA button handler
 */
export default function EmptyState({ icon = '📭', title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#374151', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  button: { backgroundColor: '#7C3AED', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
