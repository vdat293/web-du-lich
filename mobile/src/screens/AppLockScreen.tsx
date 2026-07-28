import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BrandLogo } from '../components/BrandLogo';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, shadow } from '../theme';
import type { RootStackParamList } from '../navigation/types';

export function AppLockScreen() {
  const { biometricAvailable, biometricsEnabled, locked, unlockWithBiometrics } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const attemptedAutomatically = useRef(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [showLogin, setShowLogin] = useState(!biometricsEnabled || !biometricAvailable);
  const [error, setError] = useState('');

  async function unlock() {
    if (authenticating) return;
    setAuthenticating(true);
    setError('');
    try {
      const success = await unlockWithBiometrics();
      if (!success) setError(t('appLock.failed'));
    } catch {
      setError(t('appLock.failed'));
    } finally {
      setAuthenticating(false);
    }
  }

  useEffect(() => {
    if (!attemptedAutomatically.current && biometricsEnabled && biometricAvailable) {
      attemptedAutomatically.current = true;
      void unlock();
    }
  }, [biometricAvailable, biometricsEnabled]);

  useEffect(() => {
    if (!locked && navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [locked, navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={colors.primary} />
        </Pressable>
        <BrandLogo size={54} nameSize={26} />

        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={36} color={colors.primary} />
        </View>
        <Text style={styles.title}>{t('appLock.title')}</Text>
        <Text style={styles.subtitle}>{t('appLock.subtitle')}</Text>

        {!showLogin ? (
          <View style={styles.actions}>
            <Pressable
              disabled={authenticating || !biometricAvailable}
              onPress={() => void unlock()}
              style={({ pressed }) => [
                styles.primaryButton,
                (!biometricAvailable || authenticating) && styles.disabledButton,
                pressed && styles.pressedButton,
              ]}
            >
              {authenticating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Ionicons name="scan-outline" size={22} color={colors.white} />
              )}
              <Text style={styles.primaryButtonText}>{t('appLock.unlock')}</Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable onPress={() => setShowLogin(true)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t('appLock.otherMethod')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.loginCard}>
            <LoginForm allowAccountActions={false} />
            <Pressable onPress={() => setShowLogin(false)} style={styles.backToBiometrics}>
              <Ionicons name="scan-outline" size={17} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>{t('appLock.backToBiometrics')}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.surfaceContainer,
  },
  lockIcon: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: colors.surfaceContainer,
    marginTop: 44,
    marginBottom: 20,
  },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.primary, textAlign: 'center' },
  subtitle: {
    maxWidth: 310,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: { width: '100%', maxWidth: 360, marginTop: 32 },
  primaryButton: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  disabledButton: { opacity: 0.55 },
  pressedButton: { opacity: 0.85 },
  primaryButtonText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  secondaryButton: { alignItems: 'center', padding: 16 },
  secondaryButtonText: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
  },
  loginCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    marginTop: 28,
    ...shadow,
  },
  backToBiometrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 20,
  },
});
