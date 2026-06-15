import { useState } from 'react';
import { 
  Alert, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Switch, 
  Text, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Security'>;

export function SecurityScreen({ navigation }: Props) {
  const {
    biometricsEnabled,
    setBiometricsEnabled,
    user,
  } = useAuth();
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updatingBiometrics, setUpdatingBiometrics] = useState(false);

  async function updateBiometrics(enabled: boolean) {
    if (updatingBiometrics) return;
    setUpdatingBiometrics(true);
    try {
      await setBiometricsEnabled(enabled);
      Alert.alert(
        t('security.biometric'),
        enabled ? t('security.biometricEnabled') : t('security.biometricDisabled'),
      );
    } catch (reason) {
      Alert.alert(
        t('security.biometricUnavailableTitle'),
        reason instanceof Error ? reason.message : t('security.biometricUnavailable'),
      );
    } finally {
      setUpdatingBiometrics(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('security.header')}</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.securityScoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.securityTitle}>{t('security.score')}</Text>
            <View style={styles.safeBadge}>
              <Text style={styles.safeBadgeText}>{t('security.safe')}</Text>
            </View>
          </View>
          <Text style={styles.securityDesc}>{t('security.description')}</Text>
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.sectionHeader}>{t('security.signInMethods')}</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>{t('security.biometric')}</Text>
              <Text style={styles.settingSublabel}>{t('security.biometricHint')}</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              disabled={updatingBiometrics}
              onValueChange={(enabled) => void updateBiometrics(enabled)}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>{t('security.twoFactor')}</Text>
              <Text style={styles.settingSublabel}>{t('security.twoFactorHint')}</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.sectionHeader}>{t('security.transactionSecurity')}</Text>
          
          <Pressable 
            style={styles.actionRow}
            onPress={() => navigation.navigate('SetupPin')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>{t('security.transactionPin')}</Text>
              <Text style={styles.settingSublabel}>
                {t('security.transactionPinDesc')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: user?.transaction_pin_enabled ? colors.success : colors.error }}>
                {user?.transaction_pin_enabled ? t('security.pinSet') : t('security.pinNotSet')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.outline} />
            </View>
          </Pressable>
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.sectionHeader}>{t('security.loginInfo')}</Text>
          
          <Pressable 
            style={styles.actionRow} 
            onPress={() => Alert.alert(t('security.alertTitle'), t('security.alertMessage'))}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>{t('security.changePassword')}</Text>
              <Text style={styles.settingSublabel}>{t('security.passwordHint')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
          </Pressable>
          
          <View style={[styles.actionRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>{t('security.registeredEmail')}</Text>
              <Text style={styles.settingSublabel}>{user?.email}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedText}>{t('security.verified')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.primary },
  placeholderButton: { width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  securityScoreCard: { padding: 18, borderRadius: 16, backgroundColor: colors.primary, marginBottom: 24 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  securityTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  safeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.success },
  safeBadgeText: { fontFamily: fonts.bold, fontSize: 9, color: colors.white, letterSpacing: 1 },
  securityDesc: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 18 },
  settingSection: { marginBottom: 26 },
  sectionHeader: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingTextContainer: { flex: 1, paddingRight: 15 },
  settingLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  settingSublabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontFamily: fonts.bold, fontSize: 12, color: colors.success },
});
