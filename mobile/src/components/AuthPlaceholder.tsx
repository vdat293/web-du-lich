import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type AuthPlaceholderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

export function AuthPlaceholder({ icon, title, message }: AuthPlaceholderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.innerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
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
