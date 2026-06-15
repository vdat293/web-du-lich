import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type AuthPlaceholderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

export function AuthPlaceholder({ icon, title, message }: AuthPlaceholderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { locked } = useAuth();

  if (locked) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockedCard}>
          <View style={styles.lockedTopRow}>
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.success} />
              <Text style={styles.securityBadgeText}>{t('appLock.protected')}</Text>
            </View>
            <View style={styles.lockedIcon}>
              <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.lockedEyebrow}>{title}</Text>
          <Text style={styles.lockedTitle}>{t('appLock.unlockSection')}</Text>
          <Text style={styles.lockedMessage}>{t('appLock.privateMessage')}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.unlockButton,
              pressed && styles.unlockButtonPressed,
            ]}
            onPress={() => navigation.navigate('Unlock')}
          >
            <View style={styles.scanIcon}>
              <Ionicons name="scan-outline" size={20} color={colors.white} />
            </View>
            <Text style={styles.unlockButtonText}>{t('appLock.continue')}</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.72)" />
          </Pressable>

          <View style={styles.sessionNote}>
            <Ionicons name="lock-closed-outline" size={15} color={colors.textMuted} />
            <Text style={styles.sessionNoteText}>{t('appLock.sessionSafe')}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Decorative ring behind icon */}
        <View style={styles.iconOuter}>
          <View style={styles.iconRing}>
            <View style={styles.iconCircle}>
              <Ionicons name={icon} size={36} color={colors.primary} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="log-in-outline" size={20} color={colors.white} />
          <Text style={styles.buttonText}>{t('payment.login')}</Text>
        </Pressable>

        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 70,
    backgroundColor: colors.surface,
  },
  lockedCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 22,
    ...Platform.select({
      web: { boxShadow: '0 12px 28px rgba(1, 36, 37, 0.08)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 28,
        elevation: 4,
      },
    }),
  },
  lockedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#eef7f1',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  securityBadgeText: {
    color: colors.success,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  lockedIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.surfaceContainer,
  },
  lockedEyebrow: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 9,
  },
  lockedTitle: {
    maxWidth: 290,
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  lockedMessage: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  unlockButton: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    marginTop: 26,
  },
  unlockButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  scanIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  unlockButtonText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
    paddingLeft: 12,
  },
  sessionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 17,
  },
  sessionNoteText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.surface,
  },
  innerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconOuter: {
    marginBottom: 28,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
    borderStyle: 'dashed',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: -0.3,
  },
  button: {
    width: '80%',
    maxWidth: 260,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      web: { boxShadow: '0 8px 16px rgba(1, 36, 37, 0.2)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  message: {
    marginTop: 20,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
