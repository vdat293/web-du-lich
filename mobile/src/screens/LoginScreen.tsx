import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { BrandWordmark } from '../components/BrandLogo';
import { LoginForm } from '../components/LoginForm';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();

  // Entrance animations
  const brandFade = useRef(new Animated.Value(0)).current;
  const brandSlide = useRef(new Animated.Value(-20)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(brandFade, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(brandSlide, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.parallel([
        Animated.timing(formFade, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && { backgroundColor: colors.surfaceContainer },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('payment.login')}</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Section */}
        <Animated.View
          style={[
            styles.brandContainer,
            { opacity: brandFade, transform: [{ translateY: brandSlide }] },
          ]}
        >
          <BrandWordmark />
          <View style={styles.divider} />
          <Text style={styles.brandSubtitle}>{t('profile.welcomeBack')}</Text>
          <Text style={styles.brandDesc}>{t('profile.loginHint')}</Text>
        </Animated.View>

        {/* Login Form Card */}
        <Animated.View
          style={[
            styles.loginFormCard,
            { opacity: formFade, transform: [{ translateY: formSlide }] },
          ]}
        >
          <LoginForm onSuccess={() => navigation.goBack()} />
        </Animated.View>

        {/* Footer hint */}
        <View style={styles.footerHint}>
          <Ionicons name="lock-closed-outline" size={13} color={colors.outline} />
          <Text style={styles.footerText}>
            {t('profile.privacyHint', { defaultValue: 'Thông tin của bạn được bảo mật' })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.primary,
    letterSpacing: -0.2,
  },
  placeholderButton: { width: 40 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
    marginBottom: 14,
  },
  brandSubtitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.text,
    marginBottom: 6,
  },
  brandDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  loginFormCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    ...Platform.select({
      web: { boxShadow: '0 6px 16px rgba(1, 36, 37, 0.06)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      },
    }),
  },
  footerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.outline,
  },
});
