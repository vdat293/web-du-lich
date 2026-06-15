import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '../theme';

export function LoadingState({ label }: { label?: string }) {
  const { t } = useTranslation();
  const resolvedLabel = label || t('screenState.loading');
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.label}>{resolvedLabel}</Text>
    </View>
  );
}

export function EmptyState({
  icon = 'bed-outline',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.surface,
  },
  label: { marginTop: 14, color: colors.textMuted, fontFamily: fonts.body },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
    marginBottom: 18,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 24,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    marginTop: 22,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
});
